import { Node, mergeAttributes } from '@tiptap/core';

const Section = Node.create({
  name: 'section',
  group: 'block',
  content: 'block+',

  parseHTML() {
    return [
      {
        tag: 'section',
        getAttrs: (node) => {
          if (!(node instanceof HTMLElement)) return {};

          // Try to extract style from <section>
          let style = node.getAttribute('style') || '';

          // Look for a nested <article> and append its styles if missing
          const article = node.querySelector('article');
          if (article && article.getAttribute('style')) {
            style += ';' + article.getAttribute('style');
          }

          return {
            style,
          };
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
          : `width: 794px; min-height: 900px; padding: 91px 51px; margin: 2rem auto; background: white; border: 1px solid #ddd; box-sizing: border-box; page-break-after : always`,
      }), 
      0,
    ];
  },
});

export default Section;