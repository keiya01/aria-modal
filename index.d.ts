export class AriaModalElement extends HTMLElement {}

export interface AriaModalElementProps {
  app: string;
  'first-focus': string;
  open?: boolean;
  animation?: boolean;
  fade?: string;
  active?: string;
  hide?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    AriaModalElement: typeof AriaModalElement
  }
  interface HTMLElementTagNameMap {
    'aria-modal': AriaModalElement
  }
}
