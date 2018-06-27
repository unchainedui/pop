import { ready, get } from 'uc-dom';
import Input from 'uc-input-field';
import Pop from './index';

ready(() => {
  const elDisplay = get('#display');

  const pop = new Pop({
    willOpen: () => true,
    autoHide: true,
    menu: false,
    pop: 'c',
    items: {
      'title': {
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
    node: val => console.log('node', val),
    title: val => console.log('title', val)
  }).appendTo(elDisplay);

  // setTimeout(() => pop.remove(), 5000);
});
