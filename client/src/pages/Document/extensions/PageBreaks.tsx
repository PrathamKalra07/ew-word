// PageBreak.ts
import { Node } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-page-break]',
      },
    ];
  },

  renderHTML() {
    return [
      'p',
      { style: 'page-break-after: always;', 'data-page-break': 'true' },
      '\u00A0', // non-breaking space, required so LibreOffice preserves the tag
    ];
  },
});
