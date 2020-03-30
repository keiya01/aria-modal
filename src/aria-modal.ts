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

    const labelAttr = this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
    const describeAttr = this.validateAriaAttrs(['aria-describedby']);

    const label = this.getAttribute(labelAttr);
    const describe = this.getAttribute(describeAttr);

    const role = this.getAttribute('role') || 'dialog';
    if(!roles.includes(role)) {
      throw new Error(`role attribution is assigned invalid value. assignable value are ${roles.join(', ')}.`);
    }

    this.display = this.getAttribute('display') || 'block';

    this.open = this.getAttribute('open') === 'true';

    const template = this.template`
      <div id="aria-modal-backdrop" class="backdrop" style="display:${this.open ? this.display : 'none'};">
        <div id="first-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
        <div id="aria-modal" class="modal" role="${role}" aria-modal="true" ${labelAttr}=${label} ${describeAttr}=${describe}>
          <slot name="modal"></slot>
        </div>
        <div id="last-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
      </div>
    `;
    const shadowRoot = this.attachShadow({ mode: 'open' });

    if(this.open) {
      template.focus();
    }

    const style = document.createElement('style');
    style.textContent = `
      .backdrop {
        background-color: rgba(0, 0, 0, 0.6);
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      .modal {
        margin: 0 auto;
        margin-top: 80px;
        background-color: #fff;
        padding: 20px 10px;
        width: 90%;
        max-width: 500px;
        border-radius: 10px;
      }
    `;
    shadowRoot.appendChild(style);

    shadowRoot.appendChild(template.content.cloneNode(true));

    shadowRoot.getElementById('first-descendant')?.addEventListener('focus', this.moveFocusToLast, true);
    shadowRoot.getElementById('last-descendant')?.addEventListener('focus', this.moveFocusToFirst, true);
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if(name === 'open') {
      this.open = newValue === 'true';
      this.setStyle();
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

  private setStyle() {
    const backdrop = this.shadowRoot?.getElementById("aria-modal-backdrop");
    if(!backdrop) {
      throw new Error('Could not find aria-modal-backdrop id');
    }
    backdrop.style.display = this.open ? this.display : 'none';
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

  private join(template: TemplateStringsArray, values: any[]) {
    const length = template.length;
    let result: string[] = [];
    for(let i = 0; i < length; i++) {
      let html = template[i];
      if(values[i]) {
        html += values[i];
      }
      result.push(html);
    }
    return result.join('');
  }

  private template(html: TemplateStringsArray, ...values: any[]) {
    const template = document.createElement('template');
    document.body.appendChild(template);

    template.innerHTML = this.join(html, values);
    return template;
  }

  private isFocusable(target: HTMLElement, element: HTMLElement) {
    return document.activeElement !== target && document.activeElement === element;
  }

  focusFirstElement(target: HTMLElement, node: HTMLElement) {
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

  focusLastElement(target: HTMLElement, node: HTMLElement) {
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
    // this.firstFocus.focus();
    const target = e.target as HTMLElement;
    this.focusFirstElement(target, this.node);
  }
  
  private moveFocusToLast = (e: FocusEvent) => {
    // this.lastFocus.focus();
    const target = e.target as HTMLElement;
    this.focusLastElement(target, this.node);
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
}
