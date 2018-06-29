import { create, remove, on, off } from 'uc-dom';
import { toCamelCase } from 'uc-strings';
import icon from 'uc-icon';

const CONFIRMDELAY = 500;

const Buttons = function(action, opts, cb) {
  this.cb = cb;
  this.el = create('div.pop-buttons');
  this.buttons = this.createButtons(action, opts);
  this.confirm = null;

  for (const name in this.buttons) {
    this[toCamelCase(`on-${name}`)] = this.createHandler(name);
    this.el.appendChild(this.buttons[name].el);
  }
}

Buttons.prototype = {
  createButtons: function(action, opts) {
    const buttons = {};

    for (const name in opts) {
      if (name === 'type') {
        continue;
      }

      const button = opts[name];
      const el = create('a', icon(button.icon));
      el.href = `#/${action}/${name}${button.value ? `/${button.value}` : ''}`;
      if (button.title) {
        el.title = button.title;
      }

      buttons[name] = {
        el,
        confirm: !!button.confirm
      }

    }

    return buttons;
  },

  createHandler: function(name) {
    return (...args) => this.clickHandler(name, ...args);
  },

  clickHandler: function(name, ...args) {
    const button = this.buttons[name];

    if (!button.confirm) {
      this.cb(name, ...args);
      return;
    }

    if (name === this.confirm) {
      if (this.confirmTimeout) {
        return;
      }
      this.hideConfirm();
      this.cb(name, ...args);
      return;
    }

    this.willConfirm(name);
  },

  willConfirm: function(name) {
    this.confirm && this.hideConfirm();
    this.confirm = name;
    const el = this.buttons[name].el;
    el.classList.add('pop-confirm');
    this.confirmMouseOut = on(el, 'mouseout', () => this.hideConfirm())
    this.confirmTimeout = setTimeout(() => {
      this.confirmTimeout = null;
    }, CONFIRMDELAY);
  },

  hideConfirm: function() {
    if (!this.confirm) {
      return;
    }
    clearTimeout(this.confirmTimeout);
    this.confirmTimeout = null;
    const el = this.buttons[this.confirm].el;
    el.classList.remove('pop-confirm');
    off(el, 'mouseout', this.confirmMouseOut);
    this.confirmMouseOut = null;
    this.confirm = null;
  },

  title: function(name, title) {
    this.buttons[name].el.title = title;
  },

  remove: function() {
    this.confirm && this.hideConfirm()
    remove(this.el);
  }
};

export default function button(action, opts) {
  return new Buttons(action, opts, (name, ...args) =>
    this.cbs[name].apply(this, args)
  )
}
