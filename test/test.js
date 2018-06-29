(function () {
  'use strict';

  const rxQuery = /^\s*([>+~])?\s*([*\w-]+)?(?:#([\w-]+))?(?:\.([\w.-]+))?\s*/;
  const rxClassOnly = /^\.([-\w]+)$/;
  const rxIdOnly = /^#([-\w]+)$/;

  function get(selector, root = document) {
    const id = selector.match(rxIdOnly);
    if (id) {
      return document.getElementById(id[1]);
    }

    const className = selector.match(rxClassOnly);
    if (className) {
      return root.getElementsByClassName(className[1]);
    }

    return root.querySelectorAll(selector);
  }

  function query(selector) {
    let f;
    const out = [];
    if (typeof selector === 'string') {
      while (selector) {
        f = selector.match(rxQuery);
        if (f[0] === '') {
          break;
        }

        out.push({
          rel: f[1],
          tag: (f[2] || '').toUpperCase(),
          id: f[3],
          classes: (f[4]) ? f[4].split('.') : undefined
        });
        selector = selector.substring(f[0].length);
      }
    }
    return out;
  }

  function createNs(namespaceURI, selector) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElementNs(namespaceURI, tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    return el;
  }

  function create(selector, content) {
    const s = query(selector)[0];
    const tag = s.tag;
    if (!tag) {
      return null;
    }

    const el = document.createElement(tag);
    const id = s.id;
    if (id) {
      el.id = id;
    }

    const classes = s.classes;
    if (classes) {
      el.className = classes.join(' ');
    }

    if (content) {
      el.innerHTML = content;
    }

    return el;
  }

  function closest(el, selector) {
    while (!el.matches(selector) && (el = el.parentElement));
    return el;
  }

  function attr(el, name, value) {
    if (value === undefined) {
      return el.getAttribute(name);
    }

    el.setAttribute(name, value);
  }

  function append(parent, el) {
    parent.appendChild(el);
    return parent;
  }

  function prepend(parent, el) {
    parent.insertBefore(el, parent.firstChild);
    return parent;
  }

  function appendTo(el, parent) {
    parent.appendChild(el);
    return el;
  }

  function prependTo(el, parent) {
    parent.insertBefore(el, parent.firstChild);
    return el;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function on(el, event, selector, handler, options) {
    if (typeof selector !== 'string') {
      handler = selector;
      selector = undefined;
    }

    if (!selector) {
      el.addEventListener(event, handler, options);
      return handler;
    }

    return on(el, event, e => {
      const target = closest(e.target, selector);
      if (target) {
        handler.call(target, e);
      }
    }, options);
  }

  function off(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
    return handler;
  }

  function once(el, event, handler, options) {
    const _handler = (...args) => {
      handler(...args);
      off(el, event, handler);
    };

    el.addEventListener(event, handler, options);
    return _handler;
  }

  function addClass(el, ...cls) {
    return el.classList.add(...cls);
  }

  function removeClass(el, ...cls) {
    return el.classList.remove(...cls);
  }

  function toggleClass(el, cls, force) {
    return el.classList.toggle(cls, force);
  }

  function addDelayRemoveClass(el, cls, delay) {
    addClass(el, cls);
    return setTimeout(() => removeClass(el, cls), delay);
  }

  function replaceClass(el, rx, newClass) {
    const newClasses = [];
    attr(el, 'class').split(' ').forEach(function(cls) {
      const c = rx.test(cls) ? newClass : cls;

      if (newClasses.indexOf(c) === -1) {
        newClasses.push(c);
      }
    });

    attr(el, 'class', newClasses.join(' '));
    return newClasses.length;
  }

  function insertBefore(el, node) {
    return node.parentNode.insertBefore(el, node);
  }

  function insertAfter(el, node) {
    return node.parentNode.insertBefore(el, node.nextSibling);
  }

  function remove(el) {
    return el.parentNode.removeChild(el);
  }

  var dom = /*#__PURE__*/Object.freeze({
    get: get,
    query: query,
    createNs: createNs,
    create: create,
    closest: closest,
    attr: attr,
    append: append,
    prepend: prepend,
    appendTo: appendTo,
    prependTo: prependTo,
    ready: ready,
    on: on,
    off: off,
    once: once,
    addClass: addClass,
    removeClass: removeClass,
    toggleClass: toggleClass,
    addDelayRemoveClass: addDelayRemoveClass,
    replaceClass: replaceClass,
    insertBefore: insertBefore,
    insertAfter: insertAfter,
    remove: remove
  });

  function compose(...args) {
    let newObject = true;

    if (args[args.length - 1] === true) {
      args.pop();
      newObject = false;
    }

    newObject && args.unshift({});
    return Object.assign.apply(Object, args);
  }

  /*eslint-disable strict */

  const html = [
    'addClass',
    'removeClass',
    'toggleClass',
    'replaceClass',
    'appendTo',
    'prependTo',
    'insertBefore',
    'insertAfter'
  ].reduce((obj, method) => {
    obj[method] = function(...args) {
      dom[method].apply(null, [ this.el ].concat(args));
      return this;
    };
    return obj;
  }, {});

  html.attr = function(name, value) {
    if (value === undefined) {
      return this.el.getAttribute(name);
    }

    this.el.setAttribute(name, value);
    return this
  };

  html.find = function(selector) {
    return get(selector, this.el);
  };

  function debounce(func, wait, immediate) {
    let timeout;
    const fn = function(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) {
          func.apply(this, args);
        }
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        func.apply(this, args);
      }
    };

    fn.cancel = function() {
      clearTimeout(timeout);
    };

    return fn;
  }

  var charMap = {
    // latin
    'À': 'A',
    'Á': 'A',
    'Â': 'A',
    'Ã': 'A',
    'Ä': 'Ae',
    'Å': 'A',
    'Æ': 'AE',
    'Ç': 'C',
    'È': 'E',
    'É': 'E',
    'Ê': 'E',
    'Ë': 'E',
    'Ì': 'I',
    'Í': 'I',
    'Î': 'I',
    'Ï': 'I',
    'Ð': 'D',
    'Ñ': 'N',
    'Ò': 'O',
    'Ó': 'O',
    'Ô': 'O',
    'Õ': 'O',
    'Ö': 'Oe',
    'Ő': 'O',
    'Ø': 'O',
    'Ù': 'U',
    'Ú': 'U',
    'Û': 'U',
    'Ü': 'Ue',
    'Ű': 'U',
    'Ý': 'Y',
    'Þ': 'TH',
    'ß': 'ss',
    'à': 'a',
    'á': 'a',
    'â': 'a',
    'ã': 'a',
    'ä': 'ae',
    'å': 'a',
    'æ': 'ae',
    'ç': 'c',
    'è': 'e',
    'é': 'e',
    'ê': 'e',
    'ë': 'e',
    'ì': 'i',
    'í': 'i',
    'î': 'i',
    'ï': 'i',
    'ð': 'd',
    'ñ': 'n',
    'ò': 'o',
    'ó': 'o',
    'ô': 'o',
    'õ': 'o',
    'ö': 'oe',
    'ő': 'o',
    'ø': 'o',
    'ù': 'u',
    'ú': 'u',
    'û': 'u',
    'ü': 'ue',
    'ű': 'u',
    'ý': 'y',
    'þ': 'th',
    'ÿ': 'y',
    'ẞ': 'SS',
    // greek
    'α': 'a',
    'β': 'b',
    'γ': 'g',
    'δ': 'd',
    'ε': 'e',
    'ζ': 'z',
    'η': 'h',
    'θ': '8',
    'ι': 'i',
    'κ': 'k',
    'λ': 'l',
    'μ': 'm',
    'ν': 'n',
    'ξ': '3',
    'ο': 'o',
    'π': 'p',
    'ρ': 'r',
    'σ': 's',
    'τ': 't',
    'υ': 'y',
    'φ': 'f',
    'χ': 'x',
    'ψ': 'ps',
    'ω': 'w',
    'ά': 'a',
    'έ': 'e',
    'ί': 'i',
    'ό': 'o',
    'ύ': 'y',
    'ή': 'h',
    'ώ': 'w',
    'ς': 's',
    'ϊ': 'i',
    'ΰ': 'y',
    'ϋ': 'y',
    'ΐ': 'i',
    'Α': 'A',
    'Β': 'B',
    'Γ': 'G',
    'Δ': 'D',
    'Ε': 'E',
    'Ζ': 'Z',
    'Η': 'H',
    'Θ': '8',
    'Ι': 'I',
    'Κ': 'K',
    'Λ': 'L',
    'Μ': 'M',
    'Ν': 'N',
    'Ξ': '3',
    'Ο': 'O',
    'Π': 'P',
    'Ρ': 'R',
    'Σ': 'S',
    'Τ': 'T',
    'Υ': 'Y',
    'Φ': 'F',
    'Χ': 'X',
    'Ψ': 'PS',
    'Ω': 'W',
    'Ά': 'A',
    'Έ': 'E',
    'Ί': 'I',
    'Ό': 'O',
    'Ύ': 'Y',
    'Ή': 'H',
    'Ώ': 'W',
    'Ϊ': 'I',
    'Ϋ': 'Y',
    // turkish
    'ş': 's',
    'Ş': 'S',
    'ı': 'i',
    'İ': 'I',
    // 'ç': 'c', // duplicate
    // 'Ç': 'C', // duplicate
    // 'ü': 'ue', // duplicate
    // 'Ü': 'Ue', // duplicate
    // 'ö': 'oe', // duplicate
    // 'Ö': 'Oe', // duplicate
    'ğ': 'g',
    'Ğ': 'G',
    // macedonian
    'Ќ': 'Kj',
    'ќ': 'kj',
    'Љ': 'Lj',
    'љ': 'lj',
    'Њ': 'Nj',
    'њ': 'nj',
    'Тс': 'Ts',
    'тс': 'ts',
    // russian */
    'а': 'a',
    'б': 'b',
    'в': 'v',
    'г': 'g',
    'д': 'd',
    'е': 'e',
    'ё': 'yo',
    'ж': 'zh',
    'з': 'z',
    'и': 'i',
    'й': 'y',
    'к': 'k',
    'л': 'l',
    'м': 'm',
    'н': 'n',
    'о': 'o',
    'п': 'p',
    'р': 'r',
    'с': 's',
    'т': 't',
    'у': 'u',
    'ф': 'f',
    'х': 'h',
    'ц': 'c',
    'ч': 'ch',
    'ш': 'sh',
    'щ': 'sch',
    'ъ': '',
    'ы': 'y',
    'ь': '',
    'э': 'e',
    'ю': 'yu',
    'я': 'ya',
    'А': 'A',
    'Б': 'B',
    'В': 'V',
    'Г': 'G',
    'Д': 'D',
    'Е': 'E',
    'Ё': 'Yo',
    'Ж': 'Zh',
    'З': 'Z',
    'И': 'I',
    'Й': 'J',
    'К': 'K',
    'Л': 'L',
    'М': 'M',
    'Н': 'N',
    'О': 'O',
    'П': 'P',
    'Р': 'R',
    'С': 'S',
    'Т': 'T',
    'У': 'U',
    'Ф': 'F',
    'Х': 'H',
    'Ц': 'C',
    'Ч': 'Ch',
    'Ш': 'Sh',
    'Щ': 'Sh',
    'Ъ': '',
    'Ы': 'Y',
    'Ь': '',
    'Э': 'E',
    'Ю': 'Yu',
    'Я': 'Ya',
    // ukranian
    'Є': 'Ye',
    'І': 'I',
    'Ї': 'Yi',
    'Ґ': 'G',
    'є': 'ye',
    'і': 'i',
    'ї': 'yi',
    'ґ': 'g',
    // czech
    'č': 'c',
    'ď': 'd',
    'ě': 'e',
    'ň': 'n',
    'ř': 'r',
    'š': 's',
    'ť': 't',
    'ů': 'u',
    'ž': 'z',
    'Č': 'C',
    'Ď': 'D',
    'Ě': 'E',
    'Ň': 'N',
    'Ř': 'R',
    'Š': 'S',
    'Ť': 'T',
    'Ů': 'U',
    'Ž': 'Z',
    // polish
    'ą': 'a',
    'ć': 'c',
    'ę': 'e',
    'ł': 'l',
    'ń': 'n',
    // 'ó': 'o', // duplicate
    'ś': 's',
    'ź': 'z',
    'ż': 'z',
    'Ą': 'A',
    'Ć': 'C',
    'Ę': 'E',
    'Ł': 'L',
    'Ń': 'N',
    'Ś': 'S',
    'Ź': 'Z',
    'Ż': 'Z',
    // latvian
    'ā': 'a',
    // 'č': 'c', // duplicate
    'ē': 'e',
    'ģ': 'g',
    'ī': 'i',
    'ķ': 'k',
    'ļ': 'l',
    'ņ': 'n',
    // 'š': 's', // duplicate
    'ū': 'u',
    // 'ž': 'z', // duplicate
    'Ā': 'A',
    // 'Č': 'C', // duplicate
    'Ē': 'E',
    'Ģ': 'G',
    'Ī': 'I',
    'Ķ': 'k',
    'Ļ': 'L',
    'Ņ': 'N',
    // 'Š': 'S', // duplicate
    'Ū': 'U',
    // 'Ž': 'Z', // duplicate
    // Arabic
    'ا': 'a',
    'أ': 'a',
    'إ': 'i',
    'آ': 'aa',
    'ؤ': 'u',
    'ئ': 'e',
    'ء': 'a',
    'ب': 'b',
    'ت': 't',
    'ث': 'th',
    'ج': 'j',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'th',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'dh',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y',
    'ى': 'a',
    'ة': 'h',
    'ﻻ': 'la',
    'ﻷ': 'laa',
    'ﻹ': 'lai',
    'ﻵ': 'laa',
    // Arabic diactrics
    'َ': 'a',
    'ً': 'an',
    'ِ': 'e',
    'ٍ': 'en',
    'ُ': 'u',
    'ٌ': 'on',
    'ْ': '',

    // Arabic numbers
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    // symbols
    '“': '"',
    '”': '"',
    '‘': '\'',
    '’': '\'',
    '∂': 'd',
    'ƒ': 'f',
    '™': '(TM)',
    '©': '(C)',
    'œ': 'oe',
    'Œ': 'OE',
    '®': '(R)',
    '†': '+',
    '℠': '(SM)',
    '…': '...',
    '˚': 'o',
    'º': 'o',
    'ª': 'a',
    '•': '*',
    // currency
    '$': 'USD',
    '€': 'EUR',
    '₢': 'BRN',
    '₣': 'FRF',
    '£': 'GBP',
    '₤': 'ITL',
    '₦': 'NGN',
    '₧': 'ESP',
    '₩': 'KRW',
    '₪': 'ILS',
    '₫': 'VND',
    '₭': 'LAK',
    '₮': 'MNT',
    '₯': 'GRD',
    '₱': 'ARS',
    '₲': 'PYG',
    '₳': 'ARA',
    '₴': 'UAH',
    '₵': 'GHS',
    '¢': 'cent',
    '¥': 'CNY',
    '元': 'CNY',
    '円': 'YEN',
    '﷼': 'IRR',
    '₠': 'EWE',
    '฿': 'THB',
    '₨': 'INR',
    '₹': 'INR',
    '₰': 'PF'
  };

  const rxAstralRange = /&nbsp;|\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]?|[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g;

  function length(str) {
    const match = str.match(rxAstralRange);
    return (match === null) ? 0 : match.length;
  }

  function substring(str, begin, end) {
    return str.match(rxAstralRange).slice(begin, end).join('')
  }

  function toCamelCase(str) {
    return str.replace(/[-_](\w)/g, (matches, letter) => letter.toUpperCase());
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .split('')
      .map(char => charMap[char] || char)
      .join('')
      .replace(' ', '-')
      .replace(/[^-a-z0-9]{1,60}/, '');
  }

  var input = {
    setValue: function() {
      // interface, implement this in your class
    },

    getValue: function() {
      // interface, implement this in your class
    },

    setPlaceholder: function() {
      // interface, implement this in your class
    },

    removePlaceholder: function() {
      // interface, implement this in your class
    },

    setCarret: function() {
      // interface, implement this in your class
    },

    getCarret: function() {
      // interface, implement this in your class
    },

    resetCarret: function() {
      // interface, implement this in your class
    },

    setup: function(opts) {
      this.debouncedUpdate = debounce(this.update, opts.debounce || 500);

      let isMeta = false;
      this._value = this.getValue();
      this.limit = opts.limit;
      this.events = {};
      this.events.click = on(this.el, 'click', e => e.stopPropagation());
      this.events.focus = on(this.input, 'focus', () => this.removeClass('input-message'));
      this.events.blur = on(this.input, 'blur', () => {
        isMeta = false;
        this.toggleClass('input-value', this.getValue() !== '');
        this.onKeyUp();
      });
      this.events.paste = on(this.input, 'paste', e => this.onPaste(e));
      this.events.keydown = on(this.input, 'keydown', e => {
        isMeta = e.altKey || e.ctrlKey || e.metaKey;
      });
      this.events.keyup = on(this.input, 'keyup', e => {
        if (isMeta || !e.keyCode) {
          return;
        }
        this.onKeyUp();
      });

      opts.placeholder && this.setPlaceholder(opts.placeholder);
      this.toggleClass('input-value', this.getValue() !== '');
    },

    onKeyUp: function() {
      const pos = this.getCarret();
      const limit = this.limit;
      let val = this.transform(this.getValue(), true);
      let needUpdate = false;

      if (limit && length(val) > limit) {
        val = substring(val, 0, limit);
        needUpdate = true;
      }

      if (val !== this._value || needUpdate) {
        this._value = val;
        this.setValue(val);
        this.setCarret(pos);
        this.debouncedUpdate(val);
      }
    },

    onPaste: function(e) {
      const str = e.originalEvent.clipboardData.getData('text/plain');
      const pos = this.getCarret();
      document.execCommand('insertText', false, str);
      e.preventDefault();
      e.stopPropagation();

      setTimeout(() => {
        const val = this.transform(this.getValue());
        this.setValue(val);
        this.setCarret(pos + str.length);
        this.update(val);
      }, 100);
    },

    update: function(val, silent) {
      this.removeClass('error');
      !silent && this.didUpdate && this.didUpdate(val);
    },

    focus: function() {
      this.input.focus();
      this.resetCarret();
      return this;
    },

    blur: function() {
      this.input.blur();
      return this;
    },

    value: function(val, dontUpdate) {
      if (val === undefined) {
        return this.getValue();
      }

      const value = this.getValue();
      val = this.transform(val);

      if (val !== value) {
        this.setValue(val);
        if (dontUpdate) {
          this.toggleClass('input-value', val !== '');
        } else {
          this.update(val);
        }
      }
      return this;
    },

    on: function(...args) {
      return on.apply(null, [ this.input ].concat(args));
    },

    off: function(...args) {
      return off.apply(null, [ this.input ].concat(args));
    },

    destroy: function() {
      this.removePlaceholder && this.removePlaceholder();
      this.removeClass('input-msg', 'input-value');

      const events = this.events;
      off(this.el, 'click', events.click);
      off(this.input, 'focus', events.focus);
      off(this.input, 'blur', events.blur);
      off(this.input, 'paste', events.paste);
      off(this.input, 'keydown', events.keydown);
      off(this.input, 'keyup', events.keyup);

      delete this.input;
      delete this.events;
    }
  };

  const rxGt = /&gt;/g;
  const rxNoTags = /<[^>]*>/ig;
  const rxMultipleSpaces = /\s{2,}/g;

  const transforms = {
    slugify,

    noHtml: str => str.replace(rxNoTags, ''),

    fix: str => str
      .replace(rxGt, '>')
      .replace(rxMultipleSpaces, ' '),

    trim: (str, stopper) => {
      if (stopper) {
        return str;
      }

      return str.trim();
    }
  };

  function apply(arr, fn, push) {
    const order = push ? 'push' : 'unshift';

    switch (typeof fn) {
      case 'string':
        arr[order](transforms[fn]);
        break;

      case 'function':
        arr[order](fn);
        break;

      case 'object':
        for (const prop in transforms) {
          if (fn[prop]) {
            arr[order](transforms[prop]);
          }
        }
        break;
    }
  }

  var transform = {
    unshiftTransform: function(fn) {
      apply(this.transforms, fn, false);
    },

    pushTransform: function(fn) {
      apply(this.transforms, fn, true);
    },

    transform: function(val, stopper) {
      if (!this.transforms.length) {
        return val;
      }

      const transforms = this.transforms;
      for (const i in transforms) {
        if (!val) {
          break;
        }

        val = transforms[i](val, stopper);
      }

      return val;
    }
  };

  const Input = function(opts) {
    this.didUpdate = opts.onChange;
    this.el = opts.el || this.render(opts);
    this.input = this.find('input').item(0);
    this.setup(opts);

    this.transforms = [];
    this.pushTransform(opts);
  };

  Input.prototype = compose(
    html,
    transform,
    input,
    {
      setValue: function(val) {
        this.input.value = val;
      },

      getValue: function() {
        return this.input.value;
      },

      render: function(opts) {
        return create('label.input', `
        <input
          type="${opts.type || 'text'}"
          ${(opts.name ? `name="${opts.name}" ` : '')}
          ${(opts.value ? `value="${opts.value}" ` : '')}
        >
        <span>${opts.title}</span>
        <em></em>`
        );
      },

      getCarret: function() {
        return this.input.selectionEnd;
      },

      setCarret: function(pos) {
        this.input.setSelectionRange(pos, pos);
      },

      resetCarret: function(toBegin) {
        this.input.focus();
        const pos = toBegin ? 0 : this.input.value.length;
        this.input.setSelectionRange(pos, pos);
      },

      error: function(msg) {
        if (msg) {
          this.addClass('input-message')
            .find('em')
            .item(0)
            .textContent = msg;
        }

        this.errorTimeout = addDelayRemoveClass(this.el, 'error', 600);
      },

      active: function(state) {
        this.input.disabled = !state;
      },

      remove: function() {
        clearTimeout(this.errorTimeout);
        this.destroy();
        remove(this.el);
        delete this.el;
      }
    }
  );

  var icon = name => `<svg><use xlink:href="#icon-${name}"></use></svg>`;

  const prefix = (() => {
    const styles = window.getComputedStyle(document.documentElement, '');
    const pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && [ '', 'o' ])
    )[1];
    return pre[0].toUpperCase() + pre.substr(1);
  })();

  const prefixed = (prop, ctx) => {
    if (!ctx) {
      ctx = document.documentElement;
    }

    return ctx[prop] ? ctx[prop] : prefix + (prop[0].toUpperCase() + prop.substr(1));
  };

  const requestAnimationFrame = (() => {
    const rAF = prefixed('requestAnimationFrame', window);
    if (rAF) {
      return rAF;
    }

    let lastTime = 0;
    return function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    }
  })();

  const preTransform = prefixed('transform');
  const transform$1 = preTransform === 'MsTransform' ? 'msTransform' : preTransform;
  const transition = prefixed('transition');

  const isHDPI = window.devicePixelRatio && window.devicePixelRatio > 1;
  const isSmall = screen.width < 415 || screen.height < 415;
  const isGeolocation = !!navigator.geolocation;
  const isCSSOM = window.CSS && CSS.number;

  const isSafari = /webkit/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent);

  /*eslint-disable strict */

  function link(action, opts) {
    const el = create('a.pop-link');
    el.href = `#/${action}`;
    el.textContent = opts.title;

    return {
      el,
      onClick: (...args) => {
        const a = action.split('/')[0];
        !this.menu && this.value(action);
        this.cbs[a].apply(this, args);
      },
      title: title => {
        el.textContent = title;
      },
      remove: () => remove(el)
    };
  }

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
  };

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
        };

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
      this.confirmMouseOut = on(el, 'mouseout', () => this.hideConfirm());
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
      this.confirm && this.hideConfirm();
      remove(this.el);
    }
  };

  function button(action, opts) {
    return new Buttons(action, opts, (name, ...args) =>
      this.cbs[name].apply(this, args)
    )
  }

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
  };

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
  };

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
          this.elItems.style[transform$1] = getTransform(this._dir, scaleX, scaleY);
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

  ready(() => {
    const elDisplay = get('#display');

    const pop = new Pop({
      willOpen: () => true,
      autoHide: false,
      menu: false,
      pop: 'c',
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
    }).appendTo(elDisplay);

    // setTimeout(() => pop.remove(), 5000);
  });

}());
