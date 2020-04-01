import AriaModalElement from './aria-modal';

export { AriaModalProps } from './aria-modal';
export default AriaModalElement;

if(!window.customElements.get('aria-modal')) {
  window.AriaModalElement = AriaModalElement;
  window.customElements.define('aria-modal', AriaModalElement);
}
