import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from 'prosemirror-state';

const A4_HEIGHT_PX = 1140;
const AutoPaginateExtension = Extension.create({
  name: 'autoPaginate',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        view: (editorView) => ({
          update: (view) => {
            const { state } = view;
            const { doc, schema, tr } = state;

            const sections = view.dom.querySelectorAll('section');

            sections.forEach((sectionEl) => {
              if (sectionEl.offsetHeight <= A4_HEIGHT_PX) return;

              const sectionPos = view.posAtDOM(sectionEl, 0);
              const $pos = state.doc.resolve(sectionPos);
              const parentNode = $pos.nodeAfter;

              if (!parentNode || parentNode.type.name !== 'section') return;

              const start = sectionPos + 1;
              const end = sectionPos + parentNode.nodeSize - 1;

              const splitAt = start + Math.floor((end - start) / 2); // Or calculate better
              const slice = doc.slice(splitAt, end);

              const pageBreak = schema.nodes.pageBreak?.create();
              const newSection = schema.nodes.section?.create({}, slice.content);

              tr.delete(splitAt, end);
              if (pageBreak) tr.insert(splitAt, pageBreak);
              if (newSection) tr.insert(splitAt + 1, newSection);

              view.dispatch(tr);
            });
          },
        }),
      }),
    ];
  },
});

export default AutoPaginateExtension;

//

//