type ModalNode = HTMLElement & { firstFocus?: () => HTMLElement };
export default class AriaModalElement extends HTMLElement {
  private focusAfterClose: HTMLElement | null;
  private loaded?: boolean;

  get styles() {
    return `
      <style>
        :host {
          display: var(--backdrop-display, block);
          background-color: var(--backdrop-color, rgba(0, 0, 0, 0.3));
          position: var(--backdrop-position, fixed);
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: var(--backdrop-z-index);
          overflow-y: auto;
          opacity: 0;
        }

        :host([animation="true"]) {
          will-change: opacity;
        }

        :host([open="true"]) {
          opacity: 1;
        }
      </style>
    `;
  }

  get template() {
    const template = document.createElement('template');

    template.innerHTML = `
      ${this.styles}
      <div id="first-descendant"></div>
      <slot name="modal"></slot>
      <div id="last-descendant"></div>
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
    if(name === 'open' && this.loaded) {
      return this.handleOnOpen();
    }
    this.loaded = true;
  }

  connectedCallback() {
    if(this.open) {
      window.addEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
    } else {
      this.open = false;
      this.style.visibility = 'hidden';
    }

    document.addEventListener('keyup', this.handleOnKeyup);
    this.addEventListener('click', this.handleOnClickBackdrop);
    this.addEventListener('transitionend', this.handleOnTransitionEnd);
    this.shadowRoot!.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot!.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }
  
  disconnectedCallback() {
    if(this.open) {
      window.removeEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
    }
    document.removeEventListener('keyup', this.handleOnKeyup);
    this.removeEventListener('click', this.handleOnClickBackdrop);
    this.removeEventListener('transitionend', this.handleOnTransitionEnd);
    this.shadowRoot?.getElementById('first-descendant')?.removeEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.removeEventListener('focus', this.moveFocusToFirst, true);
  }
  
  get open() {
    return this.getAttribute('open') === 'true';
  }

  set open(newValue: boolean) {
    this.setAttribute('open', `${newValue}`);
  }

  get app() {
    return this.getElementByAttribute('app');
  }

  get node() {
    const elm = this.shadowRoot!.querySelector('slot')!.assignedElements()[0];
    if(!elm) {
      throw new Error('Could not find element to be specified to slot element.');
    }
    return elm as ModalNode;
  }

  get animation() {
    return this.getAttribute('animation') === 'true';
  }

  get active() {
    return this.getAttribute('active') || '';
  }

  get hide() {
    return this.getAttribute('hide') || '';
  }

  get fade() {
    return this.getAttribute('fade') !== 'false';
  }

  get disabled() {
    return this.getAttribute('disabled') === 'true';
  }

  get shadowNode() {
    if(!this.node.shadowRoot) {
      throw new Error('node property is not custom element.');
    }
    const child = this.node.shadowRoot.children.item(0);
    if(!child) {
      throw new Error('Element that is specified as slot can contain only 1 child element.');
    }
    return child as ModalNode;
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

  private getActiveElement(target: HTMLElement) {
    let result = target;
    if(target.shadowRoot) {
      result = this.getActiveElement(target.shadowRoot.activeElement as HTMLElement);
    }
    return result;
  }

  private focusFirst = () => {
    this.focusAfterClose = document.activeElement as HTMLElement;
    
    if(this.focusAfterClose.shadowRoot) {
      this.focusAfterClose = this.getActiveElement(this.focusAfterClose.shadowRoot!.activeElement as HTMLElement);
    }
    let firstFocus: HTMLElement | null = null;
    if(this.node.shadowRoot) {
      if(!this.node.firstFocus) {
        throw new Error('firstFocus function could not find. If you use shadow dom, please define firstFocus function.')
      }
      firstFocus = this.node.firstFocus();
    } else {
      firstFocus = this.getElementByAttribute('first-focus');
    }
    setTimeout(() => firstFocus!.focus());
  }

  // Schedule the focusBack method to run after all process have been finished.
  private focusBack() {
    setTimeout(() => {
      if(this.focusAfterClose) {
        setTimeout(() => this.focusAfterClose!.focus());
      }
    });
  }

  private changeModalClassList(method: 'add' | 'remove', props: 'active' | 'hide') {
    if(!this[props]) {
      return;
    }
    
    if(this.node.shadowRoot) {
      this.shadowNode.classList[method](this[props]);
    } else {
      this.node.classList[method](this[props]);
    }
  }

  private setActiveStyle() {
    document.body.style.overflow = 'hidden';
    this.changeModalClassList('add', 'active');
  }
  
  private setHideStyle() {
    document.body.style.overflow = 'auto';
    if(this.animation) {
      this.changeModalClassList('add', 'hide');
    } else {
      this.changeModalClassList('remove', 'active');
      this.style.visibility = 'hidden';
    }
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

  private handleOnOpen() {
    if(this.animation && this.fade && !this.style.transition) {
      this.style.transition = `opacity var(--animation-duration, 0.2s) var(--animation-function, linear) var(--animation-delay, 0s)`;
    }

    if(this.open) {
      if(!this.fade) {
        this.style.transition = '';
      }
      this.style.visibility = 'visible';
      this.app.setAttribute('aria-hidden', 'true');
      this.setActiveStyle();
      if(
        !this.animation 
        || document.readyState === 'interactive'
        || !this.fade
      ) {
        this.focusFirst();
      }
    } else {
      if(!this.fade) {
        this.style.transition = 'opacity 0s var(--animation-delay)';
      }
      this.app.setAttribute('aria-hidden', 'false');
      this.setHideStyle();
      if(!this.animation) {
        this.focusBack();
      }
    }
    this.setTabIndex();
  }

  // TODO: Fix any type
  private handleOnTransitionEnd = (e: any) => {
    if(e.target !== this) {
      return;
    }
    if(this.open) {
      this.focusFirst();
    } else {
      this.changeModalClassList('remove', 'active');
      this.changeModalClassList('remove', 'hide');
      this.style.visibility = 'hidden';
      this.focusBack();
    }
  }

  private isFocusable(target: HTMLElement, element: HTMLElement) {
    let activeElement = null;
    if(this.node.shadowRoot) {
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
  
  private moveFocus(e: FocusEvent,callback: (target: HTMLElement, node: ModalNode) => void) {
    const target = e.target as HTMLElement;
    let node = this.node;
    if(this.node.shadowRoot) {
      node = this.shadowNode;
    }
    callback(target, node);
  }

  private moveFocusToFirst = (e: FocusEvent) => {
    this.moveFocus(e, this.focusFirstElement.bind(this));
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    this.moveFocus(e, this.focusLastElement.bind(this));
  }

  private handleOnClickBackdrop = (e: MouseEvent) => {
    if(this.disabled) {
      return;
    }
    if(e.target === this) {
      this.open = false;
    }
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    if(this.disabled) {
      return;
    }
    const key = e.keyCode;
    if(key === 27 && this.open) {
      this.open = false;
      e.stopPropagation();
    }
  }

  private handleOnDOMContentLoaded = () => {
    this.handleOnOpen();
  }
}
