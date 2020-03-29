export default class AriaModalElement extends HTMLElement {
  public open: boolean;
  public display: string;
  private lastFocus: HTMLElement | null;
  private ignoreFocusChanges: boolean;
  constructor() {
    super();

    this.lastFocus = null;
    this.ignoreFocusChanges = false;

    this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
    this.validateAriaAttrs(['aria-describedby']);

    const role = this.getAttribute('role');
    if(!role || !['dialog', 'alertdialog'].includes(role)) {
      throw new Error('role attribution is assigned invalid value');
    }

    this.display = this.getAttribute('display') || 'block';

    this.open = this.getAttribute('open') === 'block';

    const template = this.template`
      <div id="aria-modal-backdrop" class="backdrop" style="display:${this.open ? this.display : 'none'};">
        <div id="first-descendant" ${this.open ? 'tabindex=0' : ''}></div>
        <div id="aria-modal" class="modal" role="${role}" aria-modal="true" tabindex="-1">
          <slot name="modal"></slot>
        </div>
        <div id="last-descendant" ${this.open ? 'tabindex=0' : ''}></div>
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

    shadowRoot.getElementById('first-descendant')?.addEventListener('focus', this.moveFocus, true);
    shadowRoot.getElementById('last-descendant')?.addEventListener('focus', this.moveFocus, true);
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
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocus, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocus, true);
  }

  adoptedCallback() {
    this.shadowRoot?.getElementById('first-descendant')?.addEventListener('focus', this.moveFocus, true);
    this.shadowRoot?.getElementById('last-descendant')?.addEventListener('focus', this.moveFocus, true);
  }

  private trapFocus() {
    if(this.ignoreFocusChanges) {
      return;
    }
    const id = this.getAttribute('first-focus')
    let firstFocus = null;
    if(id) {
      firstFocus = document.getElementById(this.getAttribute('first-focus') || '');
    } else {
      firstFocus = this.shadowRoot?.getElementById('aria-modal');
    }
    if(this.open) {
      this.lastFocus = document.activeElement as HTMLElement;
      firstFocus?.focus();
    } else {
      this.lastFocus?.focus();
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
    const validArr = [];
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

  private moveFocus = () => {
    const modal = this.shadowRoot?.getElementById('aria-modal');
    if(modal) {
      modal.focus();
    }
  }
}
