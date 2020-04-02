const roles = ['dialog', 'alertdialog'];

export interface AriaModalProps {
  open: boolean;
  node: HTMLElement;
  firstFocus: HTMLElement;
  active: string;
  animation: boolean;
  duration: number;
}

export default class AriaModalElement extends HTMLElement {
  public props: AriaModalProps;
  private focusAfterClose: HTMLElement | null;
  constructor() {
    super();
    
    this.focusAfterClose = null;

    this.props = {
      open: this.getAttribute('open') === 'true',
      node: this.getElementByAttribute('node'),
      firstFocus: this.getElementByAttribute('first-focus'),
      active: this.getAttribute('active') || '',
      animation: this.getAttribute('animation') === 'true',
      duration: Number(this.getAttribute('duration')) || 300,
    }

    this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
    this.validateAriaAttrs(['aria-describedby']);

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
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }
  
  adoptedCallback() {
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  private trapFocus() {
    if(this.props.open) {
      this.focusAfterClose = document.activeElement as HTMLElement;
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

  private setHideStyle(backdrop: HTMLElement) {
    const { node, animation, duration, active } = this.props;
    if(animation) {
      backdrop.classList.add('hide');
      setTimeout(() => {
        backdrop.classList.remove('active');
        backdrop.classList.remove('hide');
        node.classList.remove(active);
      }, duration);
    } else {
      backdrop.classList.remove('active');
      node.classList.remove(active);
    }
  }

  private changeStyle() {
    const backdrop = this.shadowRoot?.getElementById("aria-modal-backdrop");
    if(!backdrop) {
      throw new Error('Could not find aria-modal-backdrop id');
    }

    if(this.props.open) {
      backdrop.classList.add('active');
      this.props.node.classList.add(this.props.active);
    } else {
      this.setHideStyle(backdrop);
    }
  }

  private template() {
    const template = document.createElement('template');
    document.body.appendChild(template);

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
      throw new Error(`${name} could not find. first-focus must be assigned id name.`);
    }
    return element;
  }

  private isFocusable(target: HTMLElement, element: HTMLElement) {
    return document.activeElement !== target && document.activeElement === element;
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
    this.focusFirstElement(target, this.props.node);
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    this.focusLastElement(target, this.props.node);
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    const key = e.keyCode;
    if(key === 27 && this.props.open) {
      this.setAttribute('open', 'false');
      e.stopPropagation();
    }
  }
}
