export class AriaModal extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({
      mode: 'open'
    });
    shadowRoot.appendChild(this.template().content.cloneNode(true));
  }

  template() {
    const template = document.createElement('template');
    template.innerHTML = `
      <div aria-label="test">
        <slot name="test"></slot>
      </div>
    `;
    return template;
  }

}
customElements.define('aria-modal', AriaModal);