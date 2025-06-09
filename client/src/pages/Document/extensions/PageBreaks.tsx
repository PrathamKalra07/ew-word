import { Node } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',    // block node so it behaves like a block
  atom: true,        // atom so it's treated as a single unit

  addOptions() {
    return {
      showBorder: true,
      HTMLAttributes: {
        'data-page-break': 'true',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'hr[data-page-break="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const baseAttributes = {
      ...HTMLAttributes,
      'data-page-break': 'true',
      style: 'page-break-after: always; border: none; margin: 1em 0; height: 0;',
      class: 'page-break',
    };

    if (this.options.showBorder) {
      baseAttributes.style = 'page-break-after: always; border-top: 1px dashed #ccc; margin: 1em 0;';
    }

    // Render as <hr> for semantic page break, no wrapping section tag
    return ['hr', baseAttributes];
  },
});
