import { Node, mergeAttributes } from '@tiptap/core';
import { Node as ProseMirrorNode } from 'prosemirror-model';

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const Section = Node.create({
  name: 'section',
  group: 'block',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'section' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, {
        style: `
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
addKeyboardShortcuts() {
  return {
    Backspace: ({ editor, state, dispatch }) => {
      if (!state || !dispatch) return false;

      const { selection } = state;
      const { $from } = selection;

      // Are we at the very start of a section?
      const isAtSectionStart = $from.parentOffset === 0 && $from.depth > 1;
      if (!isAtSectionStart) return false;

      const currentSectionPos = $from.before($from.depth);
      const currentSectionNode = state.doc.nodeAt(currentSectionPos);
      if (!currentSectionNode || currentSectionNode.type.name !== 'section') return false;

      // Prevent deletion if it's the only section
      if (state.doc.content.childCount <= 1) return false;

      const currentIndex = state.doc.content.findIndex(currentSectionPos);
      const prevSection = state.doc.content.child(currentIndex.index - 1);
      const prevPos = state.doc.content.offsetAt(currentIndex.index - 1);

      if (!prevSection || prevSection.type.name !== 'section') return false;

      // Merge: remove current section and move cursor to end of previous
      const tr = state.tr
        .delete(currentSectionPos, currentSectionPos + currentSectionNode.nodeSize)
        .setSelection(
          editor.state.selection.constructor.near(
            state.doc.resolve(prevPos + prevSection.nodeSize - 1),
            -1
          )
        );

      dispatch(tr.scrollIntoView());
      return true;
    },
  };
},
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('section');
      dom.style.width = `${A4_WIDTH_PX}px`;
      dom.style.height = `${A4_HEIGHT_PX}px`;
      dom.style.padding = '91px 51px';
      dom.style.margin = '2rem auto';
      dom.style.background = 'white';
      dom.style.border = '1px solid #ddd';
      dom.style.boxSizing = 'border-box';
      dom.style.overflow = 'hidden';
      dom.style.pageBreakAfter = 'always';

      const contentDOM = document.createElement('div');
      dom.appendChild(contentDOM);

      const checkOverflowAndSplit = () => {
        const contentHeight = contentDOM.scrollHeight;

        if (contentHeight > A4_HEIGHT_PX + 10) {
          const pos = getPos();
          const sectionNode = editor.state.doc.nodeAt(pos);
          if (!sectionNode) return;

          const tr = editor.state.tr;

          // Avoid unnecessary splits by checking if section has only one child
          if (sectionNode.content.childCount <= 1) return;

          // Calculate where to split (rough heuristic)
          let splitIndex = -1;
          let heightSoFar = 0;

          for (let i = 0; i < contentDOM.children.length; i++) {
            const block = contentDOM.children[i] as HTMLElement;
            heightSoFar += block.offsetHeight;

            if (heightSoFar > A4_HEIGHT_PX - 120) {
              splitIndex = i;
              break;
            }
          }

          if (splitIndex > 0) {
            // Count node size until the split index
            let offset = 0;
            for (let i = 0; i < splitIndex; i++) {
              offset += sectionNode.content.child(i).nodeSize;
            }

            const splitPos = pos + 1 + offset;
            if (splitPos < editor.state.doc.content.size) {
              const trSplit = tr.split(splitPos);
              editor.view.dispatch(trSplit);
            }
          }
        }
      };

      // Delay split check slightly after render (no infinite loop)
      requestAnimationFrame(() => checkOverflowAndSplit());

      return {
        dom,
        contentDOM,
        update(updatedNode: ProseMirrorNode) {
          requestAnimationFrame(() => checkOverflowAndSplit());
          return true;
        },
      };
    };
  },
});

export default Section;
