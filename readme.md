# Unchained UI

## Pop UI Component

[![NPM Version](https://img.shields.io/npm/v/uc-pop.svg?style=flat-square)](https://www.npmjs.com/package/uc-pop)
[![NPM Downloads](https://img.shields.io/npm/dt/uc-pop.svg?style=flat-square)](https://www.npmjs.com/package/uc-pop)

### Usage

```js
import Input from 'uc-input-field';
import Pop from 'uc-pop';

const pop = new Pop({
  items: {
    tools: {
      type: 'button',
      delete: {
        title: 'Delete',
        icon: 'delete',
        confirm: true
      },
      tool: {
        title: 'Tool',
        icon: 'tool'
      }
    },
    title: {
      type: Input,
      title: 'Title',
      value: 'New post'
    },
    'node/p': { title: 'Paragraph' },
    'node/image': { title: 'Image' },
    'node/vimeo': { title: 'Vimeo' },
    'node/youtube': { title: 'Youtube' },
    'node/soundcloud': { title: 'Soundcloud' }
  }
}, {
  delete: val => console.log('delete', val),
  tool: val => console.log('tool', val),
  node: val => console.log('node', val),
  title: val => console.log('title', val)
})

```

This component follows **Unchained** UI guidelines.

Constructor options:

* **opts**
  - **items** — object, items for the Pop menu. Item options are dependent on the item type.
  - pop – string, default 'c'. Direction of the Pop animation. Values: 'c', 'n', 'ne, 'e', 'se, 's', 'sw, 'w', 'nw'.
  - menu – boolean, default `false`. When true Pop instance behaves like a menu, elements will never be marked as active.
  - autoHide — boolean, default `false`. Hide Pop menu on every click.
  - willOpen — function. This function will be called before Pop instance is open. Pop will be opened when `willOpen` function returns `true`.
* **callbacks**
  - <name> callback will be called when the item with the same name becomes active on changed its value.

#### Items

**You can set `type` to the UI component constructor.**

Built-in types:

##### link

Link is the default type.

###### Properties

* title — string, the title of the link.

###### Methods

* title(str) — sets the title of the link.

##### button

Defines the row of the buttons.

###### Properties

Every property except the `type` will become the buttons. Buttons options are:

* **title** — string, the title of the button.
* **icon** — string, the name of the icon. Will be rendered with [icon](https://github.com/unchainedui/icon)
* confirm - boolean, default false. Confirm the action of the icon or not.

###### Methods

* title(name, str) — sets the title.


### Methods

#### value([val])

If `val` is undefined returns current value, otherwise sets the value. Works only when `menu: false`.

#### direction(dir)

Sets the direction of the pop animation.

#### toggle()

Opens or closes the Pop

#### show()

Opens the Pop

#### hide()

Closes the Pop

#### error()

Turns the error state on.

#### remove()

Removes the Pop.

### Properties

#### items

An object with all the items instances.

#### opened

Boolean, opened/hidden flag.

License MIT

© velocityzen

