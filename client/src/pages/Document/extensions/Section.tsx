import { Node, mergeAttributes } from '@tiptap/core';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const Section = Node.create({
  name: 'section',
  group: 'block',
  content: 'block+',
  isolating: true, // Prevent content merging between sections

  parseHTML() {
    return [
      {
        tag: 'section',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};

          let style = node.getAttribute('style') || '';

          // Include nested <article> styles if present
          const article = node.querySelector('article');
          if (article?.getAttribute('style')) {
            style += ';' + article.getAttribute('style');
          }

          return { style };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const hasStyle = !!HTMLAttributes.style;

    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        style: hasStyle
          ? HTMLAttributes.style
          : `
            width: ${A4_WIDTH_PX}px;
            height: ${A4_HEIGHT_PX}px;
            padding: 91px 51px;
            margin: 2rem auto;
            background: white;
            border: 1px solid #ddd;
            box-sizing: border-box;
            overflow: hidden;
            page-break-after: always;
          `,
      }),
      0,
    ];
  },
});

export default Section
