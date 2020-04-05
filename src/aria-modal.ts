const roles = ['dialog', 'alertdialog'];

type ModalNode = HTMLElement & { firstFocus?: () => HTMLElement };

export interface AriaModalProps {
  open: boolean;
  node: ModalNode;
  shadow: boolean;
  firstFocus?: HTMLElement;
  active: string;
  animation: boolean;
  duration: number;
}

export default class AriaModalElement extends HTMLElement {
  public props: AriaModalProps;
  private focusAfterClose: HTMLElement | null;
  private shadowNode?: HTMLElement;

  constructor() {
    super();
    
    this.focusAfterClose = null;

    this.props = {
      open: this.getAttribute('open') === 'true',
      node: this.getElementByAttribute('node') as ModalNode,
      shadow: this.getAttribute('shadow') === 'true',
      active: this.getAttribute('active') || '',
      animation: this.getAttribute('animation') === 'true',
      duration: Number(this.getAttribute('duration')) || 300,
    }

    if(this.props.shadow) {
      window.addEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
    } else {
      this.props.firstFocus = this.getElementByAttribute('first-focus');
    }
    
    this.validateAriaAttrs(['aria-label', 'aria-labelledby']);

    const role = this.getAttribute('role') || 'dialog';
    if(!roles.includes(role)) {
      throw new Error(`role attribution is assigned invalid value. assignable value are ${roles.join(' or ')}.`);
    }

    const ariaModal = this.getAttribute('aria-modal');
    if(!ariaModal) {
      this.setAttribute('aria-modal', 'true');
    }

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.appendChild(this.template().content.cloneNode(true));

    document.addEventListener('keyup', this.handleOnKeyup);
    shadowRoot.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    shadowRoot.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if(name === 'open') {
      this.props.open = newValue === 'true';
      this.changeStyle();
      this.setTabIndex();
      this.trapFocus();
    }
  }

  disconnectedCallback() {
    this.shadowRoot?.getElementById('first-descendant')?.removeEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.removeEventListener('focus', this.moveFocusToFirst, true);
    window.removeEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
  }
  
  adoptedCallback() {
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  private template() {
    const template = document.createElement('template');

    template.innerHTML = `
      <style>
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .backdrop {
          display: none;
          background-color: var(--backdrop-color);
          position: var(--backdrop-position);
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: var(--backdrop-z-index);
          ${this.props.animation ? 'opacity: 0;' : ''}
        }
        .backdrop.active {
          display: var(--backdrop-display);
          ${this.props.animation
            ?
            `animation: fade-in ${this.props.duration}ms var(--animation-function) forwards;`
            :
            ''
          }
        }
        .backdrop.hide {
          ${this.props.animation
            ?
            `animation: fade-out ${this.props.duration}ms var(--animation-function) forwards;`
            :
            ''
          }
        }
      </style>
      <div id="aria-modal-backdrop" class="backdrop">
        <div id="first-descendant"></div>
          <slot name="modal"></slot>
        <div id="last-descendant"></div>
      </div>
    `;
  
    return template;
  }

  private getActiveElement(target: HTMLElement) {
    if(target.shadowRoot) {
      this.getActiveElement(target.shadowRoot.activeElement as HTMLElement);
    } else {
      this.focusAfterClose = target;
    }
  }

  private trapFocus() {
    if(this.props.open) {
      this.focusAfterClose = document.activeElement as HTMLElement;
      if(this.focusAfterClose.shadowRoot) {
        this.getActiveElement(this.focusAfterClose.shadowRoot!.activeElement as HTMLElement);
      }
      if(!this.props.firstFocus) {
        // TODO: Fix error message to describe more detail
        throw new Error('firstFocus could not find.');
      }
      this.props.firstFocus.focus();
    } else {
      this.focusAfterClose?.focus();
    }
  }

  private setTabIndex() {
    const modal = this.shadowRoot?.querySelector('slot');
    const prevSibling = modal?.previousElementSibling;
    const nextSibling = modal?.nextElementSibling;
    if(prevSibling) {
      prevSibling.setAttribute('tabindex', '0');
    }
    if(nextSibling) {
      nextSibling.setAttribute('tabindex', '0');
    }
  }

  private changeModalClassList(method: 'add' | 'remove') {
    const { node, shadow, active } = this.props;
    if(shadow) {
      if(!this.shadowNode) {
        throw new Error('shadowNode could not find. Make sure that `node` property element is custom element.');
      }
      this.shadowNode.classList[method](active);
    } else {
      node.classList[method](active);
    }
  }
  
  private setHideStyle(backdrop: HTMLElement) {
    const { animation, duration } = this.props;
    if(animation) {
      backdrop.classList.add('hide');
      setTimeout(() => {
        backdrop.classList.remove('active');
        backdrop.classList.remove('hide');
        this.changeModalClassList('remove');
      }, duration);
    } else {
      backdrop.classList.remove('active');
      this.changeModalClassList('remove');
    }
  }

  private changeStyle() {
    const { open } = this.props;
    
    const backdrop = this.shadowRoot?.getElementById("aria-modal-backdrop");
    if(!backdrop) {
      throw new Error('Could not find aria-modal-backdrop id');
    }

    if(open) {
      backdrop.classList.add('active');
      this.changeModalClassList('add');
    } else {
      this.setHideStyle(backdrop);
    }
  }

  private validateAriaAttrs(arr: string[]) {
    const validArr: string[] = [];
    arr.map(val => {
      if(this.getAttribute(val)) {
        validArr.push(val);
      }
    });
    if(validArr.length === 0) {
      throw new Error(`${arr.join(' or ')} must be included on aria-modal.`);
    }
    if(validArr.length >= 2) {
      throw new Error(`${arr.join(' or ')} can include just one on aria-modal.`);
    }
    return validArr[0];
  }

  private getElementByAttribute(name: string) {
    const id = this.getAttribute(name);
    if(!id) {
      throw new Error(`${name} is not assigned`);
    }
    const element = document.getElementById(id);
    if(!element) {
      throw new Error(`${name} could not find. ${name} must be assigned id name.`);
    }
    return element;
  }

  private setShadowNode() {
    if(!this.props.node.shadowRoot) {
      throw new Error('node property is not custom element.')
    }
    const children = this.props.node.shadowRoot.children;
    if(children.length !== 1) {
      throw new Error('Element that is specified by node property can contain just 1 child element.');
    }
    this.shadowNode = children[0] as HTMLElement;
  }

  private setFirstFocus() {
    if(!this.props.node.firstFocus) {
      throw new Error('firstFocus function could not find. If you use shadow dom, please define firstFocus function.')
    }
    this.props.firstFocus = this.props.node.firstFocus();
  }

  private handleOnDOMContentLoaded = () => {
    this.setShadowNode();
    this.setFirstFocus();
  }

  private isFocusable(target: HTMLElement, element: HTMLElement) {
    let activeElement = null;
    if(this.props.shadow) {
      activeElement = this.props.node.shadowRoot?.activeElement;
    } else {
      activeElement = document.activeElement;
    }
    return activeElement !== target && activeElement === element;
  }

  private focusFirstElement(target: HTMLElement, node: HTMLElement) {
    const children = node.children;
    for(let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      child.focus();
      if(this.isFocusable(target, child) || this.focusFirstElement(target, child)) {
        return true;
      }
    }
    return false;
  }

  private focusLastElement(target: HTMLElement, node: HTMLElement) {
    const children = node.children;
    for(let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as HTMLElement;
      child.focus();
      if(this.isFocusable(target, child) || this.focusLastElement(target, child)) {
        return true;
      }
      return false;
    }
  }
  
  private moveFocusToFirst = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    let node = this.props.node;
    if(this.props.shadow && this.shadowNode) {
      node = this.shadowNode;
    }
    this.focusFirstElement(target, node);
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    let node = this.props.node;
    if(this.props.shadow && this.shadowNode) {
      node = this.shadowNode;
    }
    this.focusLastElement(target, node);
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    const key = e.keyCode;
    if(key === 27 && this.props.open) {
      this.setAttribute('open', 'false');
      e.stopPropagation();
    }
  }
}
