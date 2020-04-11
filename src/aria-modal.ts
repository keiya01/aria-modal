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
        :host {
          display: var(--backdrop-display);
          background-color: var(--backdrop-color);
          position: var(--backdrop-position);
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: var(--backdrop-z-index);
          overflow-y: auto;
          opacity: 0;
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
    if(name === 'open' && this.firstFocus) {
      this.handleOnOpen();
    }
  }

  connectedCallback() {
    if(!this.open) {
      this.open = false;
      this.style.visibility = 'hidden';
    }

    document.addEventListener('keyup', this.handleOnKeyup);
    this.addEventListener('click', this.handleOnClickBackdrop);
    this.addEventListener('transitionend', this.handleOnTransitionEnd);
    this.shadowRoot!.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot!.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
    window.addEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
    window.addEventListener('load', this.handleOnLoad);
  }
  
  disconnectedCallback() {
    document.removeEventListener('keyup', this.handleOnKeyup);
    this.removeEventListener('click', this.handleOnClickBackdrop);
    this.removeEventListener('transitionend', this.handleOnTransitionEnd);
    this.shadowRoot?.getElementById('first-descendant')?.removeEventListener('focus', this.moveFocusToLast, true);
    this.shadowRoot?.getElementById('last-descendant')?.removeEventListener('focus', this.moveFocusToFirst, true);
    window.removeEventListener('DOMContentLoaded', this.handleOnDOMContentLoaded);
    window.removeEventListener('load', this.handleOnLoad);
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
    return this.getElementByAttribute('node') as ModalNode;
  }

  get shadow() {
    return this.getAttribute('shadow') === 'true';
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
    if(!this.firstFocus) {
      // TODO: Fix error message to describe more detail
      throw new Error('firstFocus could not find.');
    }
    this.firstFocus.focus();
  }

  // Schedule the focusBack method to run after all process have been finished.
  private focusBack() {
    setTimeout(() => this.focusAfterClose?.focus());
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
    if(this.open) {
      this.style.visibility = 'visible';
      this.app.setAttribute('aria-hidden', 'true');
      this.setActiveStyle();
      if(!this.animation) {
        this.focusFirst();
      }
    } else {
      this.app.setAttribute('aria-hidden', 'false');
      this.setHideStyle();
      if(!this.animation) {
        this.focusBack();
      }
    }
    this.setTabIndex();
  }

  private handleOnTransitionEnd = () => {
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
      this.open = false;
    }
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    const key = e.keyCode;
    if(key === 27 && this.open) {
      this.open = false;
      e.stopPropagation();
    }
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

  private handleOnLoad = () => {
    if(this.animation) {
      this.style.transition = `opacity var(--animation-duration) var(--animation-function)`;
      this.style.willChange = `opacity`;
    }
  }
}
