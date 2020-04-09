[![npm](https://img.shields.io/npm/v/aria-modal.svg)](https://npmjs.org/package/aria-modal) [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/aria-modal)

# aria-modal

Accessible modal with Web Components

## About

aria-modal that is a fully accessible is built according to [WAI-ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices/#dialog_modal). And it provide the only simple features. It makes be easy to implement accessible modal. If you use polyfill, you can use [@webcomponents/webcomponentsjs](https://github.com/webcomponents/polyfills/tree/master/packages/webcomponentsjs).

## Features

- Focus is moved to first-focus element. Tab and Shift+Tab keys will cycle through the modal's focusable nodes.
- ESC key closes the modal.
- Scrolling is frozen on the document.body.
- When the modal closes, focus returns to the element that was focused before the modal are shown.
- The dialog element has an ARIA role of dialog by default(You can change role).
- The dialog element must has either aria-label or aria-labelledby.
- If clicking the backdrop, the modal is closed.
- If animation property is true, the modal can use the fade-in(out) animation.

## DEMO

https://keiya01.github.io/aria-modal-doc/top/

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

<aria-modal
  id="modal"
  app="app"
  first-focus="button"
  node="node"
  animation="true"
  active="active"
>
  <div id="node" slot="modal" role="dialog" aria-labelledby="title">
    <!-- ... -->
    <button id="button"></button>
  </div>
</aria-modal>

```

If you use custom element, see the following code.

```html

<aria-modal
  id="modal"
  app="app"
  node="node"
  animation="true"
  active="active"
>
  <!-- 
    <simple-modal> must be contained `firstFocus` function that return HTMLElement.
    And You must set role and aria-* attributes to your modal.
  -->
  <simple-modal id="node" slot="modal"></simple-modal>
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

#### Tips

If you want to set your modal to center, you can use `margin: auto;` and `flexbox` property.

```css

aria-modal {
  --backdrop-display: flex;
  /* ... */
}

.your-modal {
  margin: auto;
  height: 300px;
  width: 500px;
  background-color: #fff;
}

```

### Props

#### open 

Required: `false`, Type: `boolean`, Default: `false`  
  
It is used to show modal. You can set `true` if you want to open modal.

#### first-focus

Required: `true`, Type: `string` or `function firstFocus(): HTMLElement`  
  
It is used to focus to first element when modal is opened. You should assign `id` name.  
  
If you `first-focus` element is a custom element or inside a custom element, You must implement `firstFocus` function to your `node` element.

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

#### app

Required: `true`, Type: `class-name`  
  
It is used to set `aria-hidden` to your `app` element. You should set main contents `id` name.
  
**Notice**:  Don't contain `aria-modal` inside main contents. If you contain `aria-modal` to your main contents, screen readers can not find `aria-modal`.

#### node

Required: `true`, Type: `class-name`  
  
It is used to move focus inside modal. You should set modal `id` name.

#### shadow

Required: `false`, Type: `boolean`, Default: `false`  
  
You must specify this property to `true`, if you use custom element as `node` element.

#### animation

Required: `false` Type: `boolean`, Default: `false`  
  
If `true`, fade animation will run.

#### duration

Required: `false`, Type: `number`, Default: `300`(ms)  
  
animation duration time(ms)

#### active

Required: `false`, Type: `string`  
  
`active` is class name that is added when `open` props is changed to `true`.

#### hide

Required: `false`, Type: `string`  
  
`hide` is class name that is added when `open` props is changed to `false`.

#### aria-label or aria-labelledby

Required: `true`, Type: `string`  
  
You must include `aria-label` or `aria-labelledby` property to your modal.  
See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-labelledby_attribute

#### aria-describedby

Required: `false`, Type: `string`  
  
See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-describedby_attribute

#### role

Required: `true`, Type: `string`  
  
You must include `role` property to your modal.  
Assignable value is `dialog` or `alertdialog`. See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles

#### aria-modal

Required: `false`, Type: `boolean`, Default: `false`  
  
This property is some problems, see this article https://developer.paciellogroup.com/blog/2018/06/the-current-state-of-modal-dialog-accessibility/  
And if you want to know about `aria-modal`, see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role

### Warning

If the active class is not set to `aria-modal`, it may flicker when reloaded on browser. When you set active class, you should set your modal to `display: none;` and you should set your active class to `display: block; /* or flex, inline-block, etc... */`.  
This problem is occurred by rendering process for Web Components. Your modal is assigned to `slot` element in `aria-modal`, and `slot` is rendered after JavaScript file(and Web Components) have loaded. That is, this problem is occurred by your modal is rendered without your modal is assigned to slot.

### Example

https://github.com/keiya01/aria-modal/tree/master/example

## License

[MIT License](https://github.com/keiya01/aria-modal/blob/master/LICENSE)
