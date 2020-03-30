const roles = ['dialog', 'alertdialog'];

export default class AriaModalElement extends HTMLElement {
  public open: boolean;
  public display: string;
  private focusAfterClose: HTMLElement | null;
  private firstFocus: HTMLElement;
  private node: HTMLElement;
  constructor() {
    super();

    this.focusAfterClose = null;
    this.firstFocus = this.getElementByAttribute('first-focus');
    this.node = this.getElementByAttribute('node');

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

    this.display = this.getAttribute('display') || 'block';

    this.open = this.getAttribute('open') === 'true';

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.appendChild(this.createTemplate().content.cloneNode(true));

    document.addEventListener('keyup', this.handleOnKeyup);
    shadowRoot.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    shadowRoot.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if(name === 'open') {
      this.open = newValue === 'true';
      this.toggleDisplay();
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
    if(this.open) {
      this.focusAfterClose = document.activeElement as HTMLElement;
      this.firstFocus.focus();
    } else {
      this.focusAfterClose?.focus();
    }
  }

  private setTabIndex() {
    const modal = this.shadowRoot?.getElementById("aria-modal");
    const prevSibling = modal?.previousElementSibling;
    const nextSibling = modal?.nextElementSibling;
    if(prevSibling) {
      prevSibling.setAttribute('tabindex', '0');
    }
    if(nextSibling) {
      nextSibling.setAttribute('tabindex', '0');
    }
  }

  private toggleDisplay() {
    const backdrop = this.shadowRoot?.getElementById("aria-modal-backdrop");
    if(!backdrop) {
      throw new Error('Could not find aria-modal-backdrop id');
    }
    backdrop.style.display = this.open ? this.display : 'none';
  }

  private createTemplate() {
    const template = document.createElement('template');
    document.body.appendChild(template);

    template.innerHTML = `
      <style>
        .backdrop {
          background-color: var(--backdrop-color, rgba(0, 0, 0, 0.6));
          position: var(--backdrop-position, absolute);
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        .modal {
          margin: var(--modal-margin, auto);
          background-color: var(--modal-color, #FFFFFF);
          padding: var(--modal-padding, 20px 10px);
          width: var(--modal-width, 80%);
          height: var(--modal-height, auto);
          max-width: var(--modal-max-width, 500px);
          border-radius: var(--modal-border-radius, 5px);
        }
      </style>
      <div id="aria-modal-backdrop" class="backdrop" style="display:${this.open ? this.display : 'none'};">
        <div id="first-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
        <div id="aria-modal" class="modal">
          <slot name="modal"></slot>
        </div>
        <div id="last-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
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
    this.focusFirstElement(target, this.node);
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    this.focusLastElement(target, this.node);
  }

  private handleOnKeyup = (e: KeyboardEvent) => {
    const key = e.keyCode;
    if(key === 27 && this.open) {
      this.setAttribute('open', 'false');
      e.stopPropagation();
    }
  }
}
