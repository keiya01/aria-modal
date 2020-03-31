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
              this.focusFirstElement(target, this.props.node);
          };
          this.moveFocusToLast = (e) => {
              const target = e.target;
              this.focusLastElement(target, this.props.node);
          };
          this.handleOnKeyup = (e) => {
              const key = e.keyCode;
              if (key === 27 && this.props.open) {
                  this.setAttribute('open', 'false');
                  e.stopPropagation();
              }
          };
          this.focusAfterClose = null;
          this.props = {
              open: this.getAttribute('open') === 'true',
              node: this.getElementByAttribute('node'),
              firstFocus: this.getElementByAttribute('first-focus'),
              animation: this.getAttribute('animation') === 'true',
              duration: Number(this.getAttribute('duration')) || 300,
          };
          this.validateAriaAttrs(['aria-label', 'aria-labelledby']);
          this.validateAriaAttrs(['aria-describedby']);
          const role = this.getAttribute('role') || 'dialog';
          if (!roles.includes(role)) {
              throw new Error(`role attribution is assigned invalid value. assignable value are ${roles.join(' or ')}.`);
          }
          const ariaModal = this.getAttribute('aria-modal');
          if (!ariaModal) {
              this.setAttribute('aria-modal', 'true');
          }
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.appendChild(this.template().content.cloneNode(true));
          document.addEventListener('keyup', this.handleOnKeyup);
          (_a = shadowRoot.getElementById('first-descendant')) === null || _a === void 0 ? void 0 : _a.addEventListener('focus', this.moveFocusToLast, true);
          (_b = shadowRoot.getElementById('last-descendant')) === null || _b === void 0 ? void 0 : _b.addEventListener('focus', this.moveFocusToFirst, true);
      }
      static get observedAttributes() {
          return ['open'];
      }
      attributeChangedCallback(name, _, newValue) {
          if (name === 'open') {
              this.props.open = newValue === 'true';
              this.changeStyle();
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
          if (this.props.open) {
              this.focusAfterClose = document.activeElement;
              this.props.firstFocus.focus();
          }
          else {
              (_a = this.focusAfterClose) === null || _a === void 0 ? void 0 : _a.focus();
          }
      }
      setTabIndex() {
          var _a;
          const modal = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('slot');
          const prevSibling = modal === null || modal === void 0 ? void 0 : modal.previousElementSibling;
          const nextSibling = modal === null || modal === void 0 ? void 0 : modal.nextElementSibling;
          if (prevSibling) {
              prevSibling.setAttribute('tabindex', '0');
          }
          if (nextSibling) {
              nextSibling.setAttribute('tabindex', '0');
          }
      }
      setHideStyle(backdrop) {
          if (this.props.animation) {
              backdrop.classList.add('hide');
              setTimeout(() => {
                  backdrop.classList.remove('active');
                  backdrop.classList.remove('hide');
              }, this.props.duration);
          }
          else {
              backdrop.classList.remove('active');
          }
      }
      changeStyle() {
          var _a;
          const backdrop = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById("aria-modal-backdrop");
          if (!backdrop) {
              throw new Error('Could not find aria-modal-backdrop id');
          }
          if (this.props.open) {
              backdrop.classList.add('active');
          }
          else {
              this.setHideStyle(backdrop);
          }
      }
      template() {
          const template = document.createElement('template');
          document.body.appendChild(template);
          template.innerHTML = `
      <style>
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
          background-color: var(--backdrop-color, rgba(0, 0, 0, 0.6));
          position: var(--backdrop-position, absolute);
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          ${this.props.animation ? 'opacity: 0;' : ''}
        }
        .backdrop.active {
          display: var(--backdrop-display, block);
          ${this.props.animation
            ?
                `animation: fade-in ${this.props.duration}ms var(--animation-function, ease-in) forwards;`
            :
                ''}
        }
        .backdrop.hide {
          ${this.props.animation
            ?
                `animation: fade-out ${this.props.duration}ms var(--animation-function, ease-in) forwards;`
            :
                ''}
        }
      </style>
      <div id="aria-modal-backdrop" class="backdrop">
        <div id="first-descendant"></div>
          <slot name="modal"></slot>
        <div id="last-descendant"></div>
      </div>
    `;
          return template;
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
