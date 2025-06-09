import { Plugin, PluginKey } from 'prosemirror-state'

const DeleteEmptyPagePlugin = new Plugin({
  key: new PluginKey('deleteEmptyPagePlugin'),

  props: {
    handleKeyDown(view, event) {
      const { state, dispatch } = view
      const { selection } = state
      const { $from } = selection

      if (event.key !== 'Backspace') return false

      const node = $from.node($from.depth)
      const isDocxPage = node.type.name === 'docxPage'

      // Check if it's visually empty (e.g., one empty paragraph or <br>)
      const isVisuallyEmpty =
        node.content.childCount === 1 &&
        node.firstChild?.type.name === 'paragraph' &&
        node.firstChild?.content.size === 0

      const isAtStart = $from.parentOffset === 0

      if (isDocxPage && isVisuallyEmpty && isAtStart) {
        const from = $from.before($from.depth)
        const to = $from.after($from.depth)

        dispatch(state.tr.delete(from, to))
        return true
      }

      return false
    },
  },
})


export default DeleteEmptyPagePlugin