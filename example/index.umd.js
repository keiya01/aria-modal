(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AriaModalElement = factory());
}(this, (function () { 'use strict';

  class AriaModalElement extends HTMLElement {
      constructor() {
          super();
          this.lastFocus = null;
          this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
          this.validateAriaAttrs(['aria-describedby']);
          const isAlert = this.getAttribute('alert');
          let role = 'dialog';
          if (Boolean(isAlert)) {
              role = 'alertdialog';
          }
          const modalID = this.getAttribute('id') || 'aria-modal';
          const modalClass = this.getAttribute('class');
          const firstFocus = document.getElementById(this.getAttribute('first-focus') || modalID);
          if (!firstFocus) {
              throw new Error('Could not find first focus element');
          }
          this.firstFocus = firstFocus;
          const backdropClass = this.getAttribute('backdrop-class') || 'aria-modal-backdrop';
          const template = this.template `
      <div class="${backdropClass}">
        <div tabindex=0></div>
        <div id="${modalID}" class="${modalClass}" role="${role}" aria-modal="true" >
          <slot name="modal"></slot>
        </div>
        <div tabindex=0></div>
      </div>
    `;
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.appendChild(template.content.cloneNode(true));
      }
      static get observedAttributes() {
          return ['open'];
      }
      attributeChangedCallback(name, _, newValue) {
          if (name === 'open') {
              this.trapFocus(Boolean(newValue));
          }
      }
      trapFocus(open) {
          var _a;
          if (open) {
              this.lastFocus = document.activeElement;
              this.firstFocus.focus();
          }
          else {
              (_a = this.lastFocus) === null || _a === void 0 ? void 0 : _a.focus();
          }
      }
      validateAriaAttrs(arr) {
          const validArr = [];
          arr.map(val => {
              if (this.getAttribute(val)) {
                  validArr.push(val);
              }
          });
          if (validArr.length === 0) {
              throw new Error(`${arr.join('or ')} must be included on aria-modal.`);
          }
          if (validArr.length >= 2) {
              throw new Error(`${arr.join('or ')} can include just one on aria-modal.`);
          }
      }
      join(template, values) {
          const length = template.length;
          let result = [];
          for (let i = 0; i < length; i++) {
              result = [...template.slice(0, i + 1), values[i], ...template.slice(i + 1)];
          }
          return result.join('');
      }
      template(html, ...values) {
          const template = document.createElement('template');
          document.appendChild(template);
          template.innerHTML = this.join(html, values);
          return template;
      }
  }

  if (!window.customElements.get('aria-modal')) {
      window.AriaModalElement = AriaModalElement;
      window.customElements.define('aria-modal', AriaModalElement);
  }

  return AriaModalElement;

})));
