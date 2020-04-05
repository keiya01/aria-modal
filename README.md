[![npm](https://img.shields.io/npm/v/aria-modal.svg)](https://npmjs.org/package/aria-modal) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/aria-modal)

# aria-modal

Accessible modal with Web Components

## Install

Using npm:

```bash
$ npm install aria-modal
```

## Usage

```js

import 'aria-modal';

/**
 * do something
*/

```

### Append Your Modal

You can append your modal inside aria-modal with `slot`. If you use `slot`, you can use accessible feature for modal.  
Please see following example.

```html

<aria-modal>
  <div name="modal">
    <!-- ... -->
  </div>
</aria-modal>

```

### Style

Using css variables, you can apply your style to `<aria-modal>`.

```css

aria-modal {
  --backdrop-display: block; /* or flex, inline-block, etc... */
  --backdrop-color: rgba(0, 0, 0, 0.3); /* background-color for backdrop */
  --backdrop-position: absolute; /* or fixed */
  --backdrop-z-index: 0;
}

```

### Props

| name | required | default | value | description |
| :--: | :------: | :-----: | :---: | :---------- |
| `open` | `false` | `false` | `true` or `false` | It is used to show modal. You can set `true` if you want to open modal. |
| `first-focus` | `true` | *none* | `class-name` or `function firstFocus(): HTMLElement` | It is used to focus to first element when modal is opened. You should assign `id` name. You must implement `firstFocus` function to your `node` element, if you `first-focus` element is a custom element or inside a custom element.(See [firstFocus function](#firstFocus-function)) | 
| `node` | `true` | *none* | `class-name` | It is used to move focus inside modal. You should set modal id name. |
| `shadow` | `false` | `false` | `true` or `false` | You must specify this property to `true`, if you use custom element as `node` element. |
| `animation` | `false`| `false` | `true` or `false` | Fade animation will run if `animation` flag is `true`. |
| `duration` | `false` | `300` | `Number` | animation duration time(ms) |
| `active` | `false` | *none* | `class-name` | active is class that is added when `open` props is changed `true`. |
| `aria-label` or `aria-labelledby` | `true` | *none* | `String` | See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-labelledby_attribute |
| `aria-describedby` | `false` | *none* | `String` | See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-describedby_attribute |
| `role` | `true` | *none* | `String` | Assignable value are `dialog` or `alertdialog`. See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles |
| `aria-modal` | `false` | `true` | `true` or `false` | See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role

#### firstFocus

```js

class SampleModal extends HTMLElement {
  constructor() {
    super();

    const button = document.createElement('button');
    button.setAttribute('id', 'first-element');
    const div = document.createElement('div');
    div.appendChild(button)

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(div);
  }

  /**
   * Do something
  */

 // You must implement `firstFocus()`, if you use custom element.
 firstFocus() {
   return this.shadowRoot.getElementById('first-element');
 }
}

```

#### Warning

If the active class is not set to `aria-modal`, it may flicker when reloaded on browser. When you set active class, you should set your modal to `display: none;` and you should set your active class to `display: block; /* or flex, inline-block, etc... */`.  
This problem is occurred by rendering process for Web Components. Your modal is assigned to `slot` element in `aria-modal`, and `slot` is rendered after JavaScript file(and Web Components) have loaded. That is, this problem is occurred by your modal is rendered without your modal is assigned to slot.

### Example

https://github.com/keiya01/aria-modal/tree/master/example

## License

[MIT License](https://github.com/keiya01/aria-modal/blob/master/LICENSE)
