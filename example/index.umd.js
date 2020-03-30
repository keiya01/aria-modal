(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AriaModalElement = factory());
}(this, (function () { 'use strict';

  const roles = ['dialog', 'alertdialog'];
  class AriaModalElement extends HTMLElement {
      constructor() {
          var _a, _b;
          super();
          this.moveFocusToFirst = (e) => {
              const target = e.target;
              this.focusFirstElement(target, this.node);
          };
          this.moveFocusToLast = (e) => {
              const target = e.target;
              this.focusLastElement(target, this.node);
          };
          this.handleOnKeyup = (e) => {
              const key = e.keyCode;
              if (key === 27 && this.open) {
                  this.setAttribute('open', 'false');
                  e.stopPropagation();
              }
          };
          this.focusAfterClose = null;
          this.firstFocus = this.getElementByAttribute('first-focus');
          this.node = this.getElementByAttribute('node');
          this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
          this.validateAriaAttrs(['aria-describedby']);
          const role = this.getAttribute('role') || 'dialog';
          if (!roles.includes(role)) {
              throw new Error(`role attribution is assigned invalid value. assignable value are ${roles.join(' or ')}.`);
          }
          const ariaModal = this.getAttribute('aria-modal');
          if (!ariaModal || ariaModal === 'false') {
              this.setAttribute('aria-modal', 'true');
          }
          this.display = this.getAttribute('display') || 'block';
          this.open = this.getAttribute('open') === 'true';
          const template = this.template `
      <div id="aria-modal-backdrop" class="backdrop" style="display:${this.open ? this.display : 'none'};">
        <div id="first-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
        <div id="aria-modal" class="modal">
          <slot name="modal"></slot>
        </div>
        <div id="last-descendant" ${this.open ? 'tabindex="0"' : ''}></div>
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
        border-radius: 5px;
      }
    `;
          shadowRoot.appendChild(style);
          shadowRoot.appendChild(template.content.cloneNode(true));
          document.addEventListener('keyup', this.handleOnKeyup);
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
          (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('first-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToLast, true);
          (_d = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.getElementById('last-descendant')) === null || _d === void 0 ? void 0 : _d.addEventListener('focus', this.moveFocusToFirst, true);
      }
      adoptedCallback() {
          var _a, _b, _c, _d;
          (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('first-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToLast, true);
          (_d = (_c = this.shadowRoot) === null || _c === void 0 ? void 0 : _c.getElementById('last-descendant')) === null || _d === void 0 ? void 0 : _d.addEventListener('focus', this.moveFocusToFirst, true);
      }
      trapFocus() {
          var _a;
          if (this.open) {
              this.focusAfterClose = document.activeElement;
              this.firstFocus.focus();
          }
          else {
              (_a = this.focusAfterClose) === null || _a === void 0 ? void 0 : _a.focus();
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
          return validArr[0];
      }
      getElementByAttribute(name) {
          const id = this.getAttribute(name);
          if (!id) {
              throw new Error(`${name} is not assigned`);
          }
          const element = document.getElementById(id);
          if (!element) {
              throw new Error(`${name} could not find. first-focus must be assigned id name.`);
          }
          return element;
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
      isFocusable(target, element) {
          return document.activeElement !== target && document.activeElement === element;
      }
      focusFirstElement(target, node) {
          const children = node.children;
          for (let i = 0; i < children.length; i++) {
              const child = children[i];
              child.focus();
              if (this.isFocusable(target, child) || this.focusFirstElement(target, child)) {
                  return true;
              }
          }
          return false;
      }
      focusLastElement(target, node) {
          const children = node.children;
          for (let i = children.length - 1; i >= 0; i--) {
              const child = children[i];
              child.focus();
              if (this.isFocusable(target, child) || this.focusLastElement(target, child)) {
                  return true;
              }
              return false;
          }
      }
  }

  if (!window.customElements.get('aria-modal')) {
      window.AriaModalElement = AriaModalElement;
      window.customElements.define('aria-modal', AriaModalElement);
  }

  return AriaModalElement;

})));
