type ModalNode = HTMLElement & { firstFocus?: () => HTMLElement };

/**
 * TODO
 * - `scroll` property to accept scroll
 * - `disable` property to make disable when click backdrop
 */

export default class AriaModalElement extends HTMLElement {
  private firstFocus?: HTMLElement;
  private focusAfterClose: HTMLElement | null;
  private shadowNode?: HTMLElement;

  get styles() {
    return `
      <style>
        :host([open="true"]) {
          display: block;
        }
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
          overflow-y: auto;
          ${this.animation ? 'opacity: 0;' : ''}
        }
        .backdrop.active {
          display: var(--backdrop-display);
          ${this.animation
            ?
            `animation: fade-in ${this.duration}ms var(--animation-function) forwards;`
            :
            ''
          }
        }
        .backdrop.hide {
          ${this.animation
            ?
            `animation: fade-out ${this.duration}ms var(--animation-function) forwards;`
            :
            ''
          }
        }
      </style>
    `;
  }

  get template() {
    const template = document.createElement('template');

    template.innerHTML = `
      ${this.styles}
      <div id="aria-modal-backdrop" class="backdrop">
        <div id="first-descendant"></div>
          <slot name="modal"></slot>
        <div id="last-descendant"></div>
      </div>
    `;
  
    return template;
  }

  constructor() {
    super();
    
    this.focusAfterClose = null;

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(name: string) {
    if(name === 'open' && this.firstFocus) {
      this.handleOnOpen();
    }
  }

  connectedCallback() {
    if(this.ariaModal) {
      this.ariaModal = true;
    }
    document.addEventListener('keyup', this.handleOnKeyup);
    this.shadowRoot!.getElementById('aria-modal-backdrop')?.addEventListener('click', this.handleOnClickBackdrop, true);
    this.shadowRoot!.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot!.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
    window.addEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
  }

  disconnectedCallback() {
    this.shadowRoot?.getElementById('aria-modal-backdrop')?.removeEventListener('click', this.handleOnClickBackdrop, true);
    this.shadowRoot?.getElementById('first-descendant')?.removeEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.removeEventListener('focus', this.moveFocusToFirst, true);
    window.removeEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
  }
  
  adoptedCallback() {
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  get open() {
    return this.getAttribute('open') === 'true';
  }

  set open(newValue: boolean) {
    this.setAttribute('open', `${newValue}`);
  }

  get node() {
    return this.getElementByAttribute('node') as ModalNode;
  }

  get shadow() {
    return this.getAttribute('shadow') === 'true';
  }

  get animation() {
    return this.getAttribute('animation') === 'true';
  }

  get duration() {
    return Number(this.getAttribute('duration')) || 300;
  }

  get active() {
    return this.getAttribute('active') || '';
  }

  get hide() {
    return this.getAttribute('hide') || '';
  }

  get ariaModal() {
    return this.getAttribute('aria-modal') !== 'false';
  }

  set ariaModal(newValue: boolean) {
    this.setAttribute('aria-modal', `${newValue}`);
  }

  private getActiveElement(target: HTMLElement) {
    let result = target;
    if(target.shadowRoot) {
      result = this.getActiveElement(target.shadowRoot.activeElement as HTMLElement);
    }
    return result;
  }

  private focusFirst() {
    this.focusAfterClose = document.activeElement as HTMLElement;
    
    if(this.focusAfterClose.shadowRoot) {
      this.focusAfterClose = this.getActiveElement(this.focusAfterClose.shadowRoot!.activeElement as HTMLElement);
    }
    if(!this.firstFocus) {
      // TODO: Fix error message to describe more detail
      throw new Error('firstFocus could not find.');
    }
    this.firstFocus.focus();
  }

  private focusBack() {
    this.focusAfterClose?.focus();
  }

  private setTabIndex() {
    const modal = this.shadowRoot?.querySelector('slot');
    const prevSibling = modal?.previousElementSibling;
    const nextSibling = modal?.nextElementSibling;
    if(!prevSibling || !nextSibling) {
      return;
    }
    if(this.open) {
      prevSibling.setAttribute('tabindex', '0');
      nextSibling.setAttribute('tabindex', '0');
    } else {
      prevSibling.removeAttribute('tabindex');
      nextSibling.removeAttribute('tabindex');
    }
  }

  private changeModalClassList(method: 'add' | 'remove', className: 'active' | 'hide') {
    if(!this[className]) {
      return;
    }
    
    if(this.shadow) {
      if(!this.shadowNode) {
        throw new Error('shadowNode could not find. Make sure that `node` property element is custom element.');
      }
      this.shadowNode.classList[method](this[className]);
    } else {
      this.node.classList[method](this[className]);
    }
  }

  private setActiveStyle(backdrop: HTMLElement) {
    document.body.style.overflow = 'hidden';
    backdrop.classList.add('active');
    this.changeModalClassList('add', 'active');
  }
  
  private setHideStyle(backdrop: HTMLElement) {
    document.body.style.overflow = 'auto';
    if(this.animation) {
      backdrop.classList.add('hide');
      this.changeModalClassList('add', 'hide');
      setTimeout(() => {
        backdrop.classList.remove('active');
        backdrop.classList.remove('hide');
        this.changeModalClassList('remove', 'active');
        this.changeModalClassList('remove', 'hide');
        this.focusBack();
      }, this.duration);
    } else {
      backdrop.classList.remove('active');
      this.changeModalClassList('remove', 'active');
      this.changeModalClassList('remove', 'hide');
      this.focusBack();
    }
  }

  private handleOnOpen() {
    const backdrop = this.shadowRoot?.getElementById("aria-modal-backdrop");
    if(!backdrop) {
      throw new Error('Could not find aria-modal-backdrop id');
    }

    if(this.open) {
      this.setActiveStyle(backdrop);
      this.focusFirst();
    } else {
      this.setHideStyle(backdrop);
    }
    this.setTabIndex();
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
    if(!this.node.shadowRoot) {
      throw new Error('node property is not custom element.');
    }
    const child = this.node.shadowRoot.children.item(0);
    if(!child) {
      throw new Error('Element that is specified by node property can contain just 1 child element.');
    }
    this.shadowNode = child as HTMLElement;
  }

  private setFirstFocus() {
    if(!this.node.firstFocus) {
      throw new Error('firstFocus function could not find. If you use shadow dom, please define firstFocus function.')
    }
    this.firstFocus = this.node.firstFocus();
  }

  private handleOnDOMContentLoaded = () => {
    if(this.shadow) {
      this.setShadowNode();
      this.setFirstFocus();
    } else {
      this.firstFocus = this.getElementByAttribute('first-focus');
    }

    if(this.open) {
      this.handleOnOpen();
    }
  }

  private isFocusable(target: HTMLElement, element: HTMLElement) {
    let activeElement = null;
    if(this.shadow) {
      activeElement = this.node.shadowRoot?.activeElement;
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
    let node = this.node;
    if(this.shadow && this.shadowNode) {
      node = this.shadowNode;
    }
    this.focusFirstElement(target, node);
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    let node = this.node;
    if(this.shadow && this.shadowNode) {
      node = this.shadowNode;
    }
    this.focusLastElement(target, node);
  }

  // TODO: Fix any type
  private handleOnClickBackdrop = (e: any) => {
    const id = `#${this.node.getAttribute('id')}`;
    if(!e.target.closest(id)) {
      this.setAttribute('open', 'false');
    }
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    const key = e.keyCode;
    if(key === 27 && this.open) {
      this.setAttribute('open', 'false');
      e.stopPropagation();
    }
  }
}
