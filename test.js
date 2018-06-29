import { ready, get } from 'uc-dom';
import Input from 'uc-input-field';
import Pop from './index';

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
