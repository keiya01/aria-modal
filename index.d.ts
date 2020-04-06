export default class AriaModalElement extends HTMLElement {}

declare global {
  interface Window {
    AriaModalElement: typeof AriaModalElement
  }
  interface HTMLElementTagNameMap {
    'aria-modal': AriaModalElement
  }
}
