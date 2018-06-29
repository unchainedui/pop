import { on, off, create, remove, addDelayRemoveClass, replaceClass } from 'uc-dom';
import compose from 'uc-compose';
import html from 'uc-dom/methods';
import icon from 'uc-icon';
import { transform, requestAnimationFrame } from 'uc-detective';
import { toCamelCase } from 'uc-strings';

import link from './link';
import button from './button';

const ITEMS = { link, button };
const DEFAULTYPE = 'link';

const TRANSFORMS = {
  c: 'translate(-50%, -50%)',
  n: 'translate(-50%, 0)',
  ne: '',
  e: 'translate(0, -50%)',
  se: '',
  s: 'translate(-50%, 0)',
  sw: '',
  w: 'translate(0, -50%)',
  nw: ''
}

function getTransform(dir, scaleX, scaleY) {
  return `${TRANSFORMS[dir]} scale(${scaleX}, ${scaleY})`;
}

let activePop;
on(document, 'click', () => {
  activePop && activePop.hide();
});

const Pop = function(opts, cbs = {}) {
  this.autoHide = opts.autoHide;
  this.menu = opts.menu;
  this.willOpen = opts.willOpen;
  this.cbs = cbs;
  this.items = {};
  this.el = this.render(opts);
  this.elItems = this.renderItems(opts.items);
  this.el.appendChild(this.elItems);
  this.direction(opts.pop || 'c');

  this.events = {};
  this.events.click = on(this.el, 'click', e => {
    e.stopPropagation();
    if (this.opened) {
      if (this.autoHide) {
        this.hide();
      }
      return;
    }

    if (!this.willOpen) {
      this.show();
      return
    }

    if (this.willOpen()) {
      this.show();
    }
  });

  const self = this;
  this.events.itemClick = on(this.el, 'click', 'a', function(e) {
    e.preventDefault();
    let item;
    let action;
    let args;

    if (this.classList.contains(`pop-${DEFAULTYPE}`)) {
      args = this.hash.split('/').slice(1);
      item = self.items[args.join('/')];
      args = args.slice(1);
    } else {
      args = this.hash.split('/');
      item = self.items[args[1]];
      action = args[2];
      args = args.slice(3);
    }

    item[toCamelCase(`on-${action || 'click'}`)].apply(item, args);
  });
}

Pop.prototype = compose(
  html,
  {
    render: function(opts) {
      return create(
        `div.pop.pop-${opts.size || 'small'}`,
        `<div class="pop-button">${opts.icon ? icon(opts.icon) : ''}</div>`
      );
    },

    renderItems: function(items) {
      const elItems = create('div.pop-items.pop-c');

      for (const name in items) {
        const item = items[name];
        const { instance, type } = this.getItem(name, item);
        const elItem = create(`div.pop-item${ type ? `.pop-item-${type}` : ''}`);
        elItem.appendChild(instance.el);
        elItems.appendChild(elItem);
        this.items[name] = instance;
      }

      return elItems;
    },

    getItem: function(name, item) {
      if (typeof item.type === 'function') {
        const opts = Object.assign({ onChange: val => this.cbs[name](val) }, item);
        delete opts.type;
        const instance = new item.type(opts);
        return {
          instance,
          type: instance.el.classList.item(0)
        }
      }

      const type = item.type || DEFAULTYPE;
      return {
        type,
        instance: ITEMS[type].call(this, name, item)
      }
    },

    value: function(val) {
      if (val === undefined) {
        return this._val;
      }

      if (this._val === val) {
        return;
      }

      if (!this.menu) {
        this._activeItemEl && this._activeItemEl.classList.remove('active');
        this._activeItemEl = this.find(`[href="#/${val}"]`).item(0).parentNode;
        this._activeItemEl.classList.add('active');
      }

      this._val = val;
      return this;
    },

    direction: function(dir) {
      if (!dir) {
        return;
      }

      replaceClass(this.elItems, /pop-(c|s|n|e|w|ne|nw|se|sw)$/, 'pop-' + dir);
      this._dir = dir;
      this.size();
      return this;
    },

    size: function() {
      const itemNames = Object.keys(this.items);
      const itemsNumber = itemNames.length;
      requestAnimationFrame(() => {
        const buttonSize = this.find('.pop-button').item(0).getBoundingClientRect();
        const itemSize = this.items[itemNames[0]].el.getBoundingClientRect();
        const scaleX = buttonSize.width / 4 / itemSize.width;
        const scaleY = buttonSize.height / 4 / (itemSize.height * itemsNumber);
        this.elItems.style[transform] = getTransform(this._dir, scaleX, scaleY);
      });
    },

    toggle: function() {
      if (this.opened) {
        this.hide();
      } else {
        this.show();
      }
    },

    show: function() {
      activePop && activePop.hide();
      activePop = this;
      this.addClass('active');
      this.opened = true;
      return this;
    },

    hide: function() {
      activePop = undefined;
      this.removeClass('active');
      this.opened = false;
      return this;
    },

    error: function() {
      this.errorTimeout = addDelayRemoveClass(this.el, 'error', 600);
    },

    remove: function() {
      clearTimeout(this.errorTimeout);
      if (activePop === this) {
        activePop = undefined;
      }

      for (const i in this.items) {
        this.items[i].remove();
      }

      off(this.el, 'click', this.events.click);
      off(this.el, 'click', this.events.itemClick);

      remove(this.el);
      delete this.el;
    }
  }
);

export default Pop;
