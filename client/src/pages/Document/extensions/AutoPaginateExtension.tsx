// auto-paginate-extension.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

const A4_HEIGHT_PX = 1123;

export const AutoPaginateExtension = Extension.create({
  name: 'autoPaginate',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('auto-paginate'),
        view: (editorView) => ({
          update: (view) => {
            const sectionDOMs = view.dom.querySelectorAll('section');

            sectionDOMs.forEach((sectionEl) => {
              const sectionHeight = sectionEl.offsetHeight;

              if (sectionHeight > A4_HEIGHT_PX) {
                const children = Array.from(sectionEl.children) as HTMLElement[];

                let cumulativeHeight = 0;
                let splitChildIndex = -1;

                for (let i = 0; i < children.length; i++) {
                  cumulativeHeight += children[i].offsetHeight;

                  if (cumulativeHeight > A4_HEIGHT_PX) {
                    splitChildIndex = i;
                    break;
                  }
                }

                if (splitChildIndex === -1) return;

                const splitChild = children[splitChildIndex];
                const overflowPos = view.posAtDOM(splitChild, 0);

                const { state } = view;
                const $pos = state.doc.resolve(overflowPos);
                const parentSectionPos = $pos.before($pos.depth);
                const parentSectionNode = $pos.node($pos.depth - 1);

                if (!parentSectionNode || parentSectionNode.type.name !== 'section') return;
                const alreadySplit = parentSectionNode.attrs['data-split'];
                if (alreadySplit) return;

                const tr = state.tr;

                // Mark the section to prevent repeat splitting
                tr.setNodeMarkup(parentSectionPos, undefined, {
                  ...parentSectionNode.attrs,
                  'data-split': true,
                });

                const sectionStart = parentSectionPos + 1;
                const sectionEnd = parentSectionPos + parentSectionNode.nodeSize - 1;

                if (overflowPos <= sectionStart || overflowPos >= sectionEnd) return;

                const overflowSlice = state.doc.slice(overflowPos, sectionEnd);
                const newSection = state.schema.nodes.section?.create({}, overflowSlice.content);

                tr.delete(overflowPos, sectionEnd);

                const insertPos = parentSectionPos + parentSectionNode.nodeSize - (sectionEnd - overflowPos);
                if (newSection) {
                  tr.insert(insertPos, newSection);
                  view.dispatch(tr);
                }
              }
            });
          },
        }),
      }),
    ];
  },
});
