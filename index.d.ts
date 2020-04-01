import { AriaModalProps } from "./src/index";

export default class AriaModalElement extends HTMLElement {
  props: AriaModalProps;
}

declare global {
  interface Window {
    AriaModalElement: typeof AriaModalElement
  }
  interface HTMLElementTagNameMap {
    'aria-modal': AriaModalElement
  }
}
