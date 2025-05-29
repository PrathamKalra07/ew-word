import { Node, mergeAttributes } from '@tiptap/core'

export const IndentedParagraph = Node.create({
  name: 'indentedParagraph',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(HTMLAttributes), 0]
  },

  addProseMirrorPlugins() {
    return [
      // Optional: add plugins here if needed
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      // Custom node view can be added if needed
      return null
    }
  },

  addInputRules() {
    // Input rules if needed
    return []
  },

  addKeyboardShortcuts() {
    return {}
  },

  // Override how text content is inserted to preserve leading spaces
  addNodeSpec() {
    return {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
      // This hook can be used to modify text serialization, but not straightforward here
    }
  },

  addPasteRules() {
    // Could add paste rules to convert leading spaces to &nbsp; on paste
    return []
  },
})
