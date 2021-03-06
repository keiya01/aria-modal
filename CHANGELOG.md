# Changelog

## v2.6.9

- Removed `node` property
- Removed `shadow` property
- Fixed bugs

## v2.6.8

- Fixed bugs

## v2.6.7

- Fixed bugs

## v2.6.6

- Fixed bugs
- Added `disabled` property that is not to prevent hide when clicked backdrop.

## v2.6.5

- Fixed bugs

## v2.6.4

- Fixed README.ms

## v2.6.3

- Added `fade` property to opt out  default fade animation.
- Added `--animation-delay` css variables to wait finishing your custom animation.
- Added fallback to css variables.

## v2.6.2

- Fixed css variables description on README.md

## v2.6.1

- Fixed a bug that dialog does not open when `open` property is `true` at initial loading.

## v2.6.0

- **Breaking Change**: Deleted `duration` property and added `--animation-duration` CSS variables.
- Fixed README.md
- Fixed performance
- Reduced code size
- Fixed bugs

## v2.5.1

- Fixed README.md

## v2.5.0

- **Breaking Change**: Added `app` property. This property is require to run aria-modal.
- **Breaking Change**: Changed default value of `aria-modal` property to `false`, because `aria-modal` property is contained some bugs.
- Fixed to set default `display` style to `display: block;` for aria-modal(`:host`)

## v2.4.2, v2.4.3, v2.4.4

- Fixed bugs that web contents is not read because aria-modal is **visible**.

## v2.4.1

- Fixed bugs

## v2.4.0

- Added `hide` property to run animation for hide phase
- Deleted `aria-*` and `role` validation
- Fixed bugs

## v2.3.1

- Fixed bugs that the modal don't open when initial `open` property is true

## v2.3.0

- Fixed types on index.d.ts

## v2.2.5

- Supported scrolling on the modal

## v2.2.4

- Fixed bugs

## v2.2.3

- Publish DEMO page

## v2.2.1, v2.2.2

- Fixed README.md

## v2.2.0

- Supported frozen scroll

## v2.1.1

- Fixed bugs

## v2.1.0

- Refactor source code
- Deleted `AriaModalProps`
- Fixed bugs

## v2.0.4

- Fixed bugs

## v2.0.1, v2.0.2, v2.0.3

- Fixed README.md

## v2.0.0

- Supported custom element.
- Added `shadow` property that is used to check your node element is custom element.
- Fixed `firstFocus` property.
  - `firstFocus` property is supported custom element.
  - You can use custom property, if you implement `firstFocus` function to your node element instead of `firstFocus` property.
- Changed `aria-describedby` to optional.

## v1.2.10

- Fixed README.md

## v1.2.9

- Fixed LICENSE
- Fixed README.md

## v1.2.8

- Fixed README.md

## v1.2.7

- Fixed README.md

## v1.2.6

- Fixed bugs

## v1.2.5

- Fixed bugs

## v1.2.4

- Fixed README.md

## v1.2.3

- **Breaking Change**: Renamed package name from web-components-aria-modal to aria-modal.

## v1.2.2

- Added `--backdrop-z-index` as CSS variables.

## v1.2.1

- Minified UMD file
- **Breaking Change**: Fixed type in index.d.ts

## v1.2.0

- Added `active` property.
  - `active` property is added to modal class list, if animation property is true.
- Added `--backdrop-display` and `--animation-function` as CSS variables.

## v1.1.0

- Added `animation` property.
  - Run fade in animation, if `animation` property is true.
- Added `duration` property.
  - animation duration.
- **Breaking Changes**: Delete modal default styles.
- **Breaking Changes**: CSS variables for modal.

## v1.0.0

- first release.
