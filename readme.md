# Unchained UI

## Input Field UI Component

[![NPM Version](https://img.shields.io/npm/v/uc-input-field.svg?style=flat-square)](https://www.npmjs.com/package/uc-input-field)
[![NPM Downloads](https://img.shields.io/npm/dt/uc-input-field.svg?style=flat-square)](https://www.npmjs.com/package/uc-input-field)

### Usage

```js
import input from 'uc-input'

const elDisplay = get('#display')

const input = new Input({
  title: 'test field',
  slugify: true,
  trim: true,
  onChange: val => {
    console.log('val', val);
  }
}).appendTo(elDisplay);

```

This component follows **Unchained** UI guidelines.

Constructor options:

* el – HTLMElement, parse all the information from the DOM element
* **title** — string, title of the input
* value — string, initial value
* type – string, default text. HTML input type
* limit — number, the text limit
* debounce – number, default 500ms. Debounce onChange calls
* onChange — function, callback will be called when value is changed
* slugify — boolean, slugify input
* trim — boolean, trim input

### Methods

#### value([val])

if `val` is undefined returns current value, otherwise sets the value.

#### focus()

Sets the focus.

#### blur()

Removes focus.

#### active(state)

Sets the state.

#### error([msg])

Shows the error with optional `msg`.

#### remove()

Removes the input.

#### pushTransform(fn)

Adds the transform function to the end of transformation chain.

#### unshiftTransform(fn)

Adds the transform function to the begining of transformation chain.

License MIT

© velocityzen

