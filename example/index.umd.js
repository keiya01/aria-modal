(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AriaModalElement = factory());
}(this, (function () { 'use strict';

  class AriaModalElement extends HTMLElement {
      constructor() {
          var _a, _b;
          super();
          this.focusFirstDescendant = (element) => {
              for (var i = 0; i < element.childNodes.length; i++) {
                  var child = element.childNodes[i];
                  if (this.attemptFocus(child) ||
                      this.focusFirstDescendant(child)) {
                      return true;
                  }
              }
              return false;
          };
          this.focusLastDescendant = (element) => {
              for (var i = element.childNodes.length - 1; i >= 0; i--) {
                  var child = element.childNodes[i];
                  if (this.attemptFocus(child) ||
                      this.focusLastDescendant(child)) {
                      return true;
                  }
              }
              return false;
          };
          this.moveFocusToFirst = () => {
              var _a;
              const modal = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('aria-modal');
              if (modal) {
                  modal.focus();
              }
          };
          this.moveFocusToLast = () => {
              var _a;
              const modal = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('aria-modal');
              if (modal) {
                  modal.focus();
              }
          };
          this.lastFocus = null;
          this.ignoreFocusChanges = false;
          this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
          this.validateAriaAttrs(['aria-describedby']);
          const role = this.getAttribute('role');
          if (!role || !['dialog', 'alertdialog'].includes(role)) {
              throw new Error('role attribution is assigned invalid value');
          }
          this.display = this.getAttribute('display') || 'block';
          this.open = this.getAttribute('open') === 'block';
          const template = this.template `
      <div id="aria-modal-backdrop" class="backdrop" style="display:${this.open ? this.display : 'none'};">
        <div id="first-descendant" ${this.open ? 'tabindex=0' : ''}></div>
        <div id="aria-modal" class="modal" role="${role}" aria-modal="true" tabindex="-1">
          <slot name="modal"></slot>
        </div>
        <div id="last-descendant" ${this.open ? 'tabindex=0' : ''}></div>
      </div>
    `;
          const shadowRoot = this.attachShadow({ mode: 'open' });
          if (this.open) {
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
          (_a = shadowRoot.getElementById('first-descendant')) === null || _a === void 0 ? void 0 : _a.addEventListener('focus', this.moveFocusToLast, true);
          (_b = shadowRoot.getElementById('last-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToFirst, true);
      }
      static get observedAttributes() {
          return ['open'];
      }
      attributeChangedCallback(name, _, newValue) {
          if (name === 'open') {
              this.open = newValue === 'true';
              this.setStyle();
              this.setTabIndex();
              this.trapFocus();
          }
      }
      disconnectedCallback() {
          var _a, _b, _c, _d;
          console.log('disconnected');
          (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('first-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToLast, true);
          (_d = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.getElementById('last-descendant')) === null || _d === void 0 ? void 0 : _d.addEventListener('focus', this.moveFocusToFirst, true);
      }
      adoptedCallback() {
          var _a, _b, _c, _d;
          console.log('adopted');
          (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('first-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToLast, true);
          (_d = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.getElementById('last-descendant')) === null || _d === void 0 ? void 0 : _d.addEventListener('focus', this.moveFocusToFirst, true);
      }
      trapFocus() {
          var _a, _b;
          if (this.ignoreFocusChanges) {
              return;
          }
          const id = this.getAttribute('first-focus');
          let firstFocus = null;
          if (id) {
              firstFocus = document.getElementById(this.getAttribute('first-focus') || '');
          }
          else {
              firstFocus = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('aria-modal');
          }
          if (this.open) {
              this.lastFocus = document.activeElement;
              firstFocus === null || firstFocus === void 0 ? void 0 : firstFocus.focus();
          }
          else {
              (_b = this.lastFocus) === null || _b === void 0 ? void 0 : _b.focus();
          }
      }
      setTabIndex() {
          var _a;
          const modal = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById("aria-modal");
          const prevSibling = modal === null || modal === void 0 ? void 0 : modal.previousElementSibling;
          const nextSibling = modal === null || modal === void 0 ? void 0 : modal.nextElementSibling;
          if (prevSibling) {
              prevSibling.setAttribute('tabindex', '0');
          }
          if (nextSibling) {
              nextSibling.setAttribute('tabindex', '0');
          }
      }
      setStyle() {
          var _a;
          const backdrop = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById("aria-modal-backdrop");
          if (!backdrop) {
              throw new Error('Could not find aria-modal-backdrop id');
          }
          backdrop.style.display = this.open ? this.display : 'none';
      }
      validateAriaAttrs(arr) {
          const validArr = [];
          arr.map(val => {
              if (this.getAttribute(val)) {
                  validArr.push(val);
              }
          });
          if (validArr.length === 0) {
              throw new Error(`${arr.join(' or ')} must be included on aria-modal.`);
          }
          if (validArr.length >= 2) {
              throw new Error(`${arr.join(' or ')} can include just one on aria-modal.`);
          }
      }
      join(template, values) {
          const length = template.length;
          let result = [];
          for (let i = 0; i < length; i++) {
              let html = template[i];
              if (values[i]) {
                  html += values[i];
              }
              result.push(html);
          }
          return result.join('');
      }
      template(html, ...values) {
          const template = document.createElement('template');
          document.body.appendChild(template);
          template.innerHTML = this.join(html, values);
          return template;
      }
      attemptFocus(element) {
          if (!element.focus) {
              return false;
          }
          this.ignoreFocusChanges = true;
          try {
              element.focus();
          }
          catch (e) {
          }
          this.ignoreFocusChanges = false;
          return document.activeElement === element;
      }
  }

  if (!window.customElements.get('aria-modal')) {
      window.AriaModalElement = AriaModalElement;
      window.customElements.define('aria-modal', AriaModalElement);
  }

  return AriaModalElement;

})));
