import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import FontSize from '@tiptap/extension-font-size';
import Highlight from '@tiptap/extension-highlight'; // optional
import { useEffect, useState } from 'react';
import { IndentedParagraph } from './extensions/IndentedParagraph';
function preserveLeadingSpaces(html: string | undefined): string {
  if (typeof html !== 'string') return '';
  return html.replace(/(^|\n)( +)/g, (match, p1, spaces) => {
    return p1 + spaces.replace(/ /g, '\u00a0');
  });
}

const Editor = ({ initialHTML }: { initialHTML?: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'], // Needed to apply font family to textStyle marks
      }),
      FontSize.configure({
        types: ['textStyle'], // Needed for font size on inline text
      }),
      Highlight, // Optional, for background highlight color
      IndentedParagraph
    ],
    content: preserveLeadingSpaces(initialHTML),
  });

  return <EditorContent editor={editor} style={{ whiteSpace: 'pre-wrap' }} />;
};

export default Editor;
