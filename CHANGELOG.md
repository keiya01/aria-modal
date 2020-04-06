# Changelog

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
