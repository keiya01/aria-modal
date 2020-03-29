export default class AriaModalElement extends HTMLElement {
  open: boolean;
  display: string;
}

declare global {
  interface Window {
    AriaModalElement: typeof AriaModalElement
  }
  interface HTMLElementTagNameMap {
    'aria-modal': AriaModalElement
  }
}
