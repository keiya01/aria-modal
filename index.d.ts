export default class AriaModalElement extends HTMLElement {
  firstFocus: HTMLElement;
  lastFocus: HTMLElement | null;
}

declare global {
  interface Window {
    AriaModalElement: typeof AriaModalElement
  }
  interface HTMLElementTagNameMap {
    'aria-modal': AriaModalElement
  }
}
