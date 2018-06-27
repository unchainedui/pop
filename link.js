/*eslint-disable strict */
import { create, remove } from 'uc-dom';

export default function link(action, opts) {
  const el = create('a.pop-link');
  el.href = `#/${action}`;
  el.textContent = opts.title;

  return {
    el,
    click: (...args) => {
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
