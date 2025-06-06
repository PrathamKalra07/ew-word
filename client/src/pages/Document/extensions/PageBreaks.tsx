// PageBreak.ts
import { Node } from '@tiptap/core';

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      // Add an option to control border visibility
      showBorder: true,
      HTMLAttributes: {
        'data-page-break': 'true',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-page-break]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const baseAttributes = {
      ...HTMLAttributes,
      'data-page-break': 'true',
    };

    // Only add border in editor mode
    if (this.options.showBorder) {
      return [
        'p',
        { 
          ...baseAttributes,
          class:'page-break',
          style: 'page-break-after: always; border-top: 1px dashed #ccc; margin: 1em 0;',
        },
        '\u00A0',
      ];
    }

    // Clean output for export
    return [
      'p',
      { 
        ...baseAttributes,
        class:'page-break',
        style: 'page-break-after: always;',
      },
      '\u00A0',
    ];
  },
});