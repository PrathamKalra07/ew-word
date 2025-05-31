  import { useEditor, EditorContent } from '@tiptap/react';
  import StarterKit from '@tiptap/starter-kit';
  import TextStyle from '@tiptap/extension-text-style';
  import Color from '@tiptap/extension-color';
  import Table from '@tiptap/extension-table'
  import TableCell from '@tiptap/extension-table-cell'
  import TableHeader from '@tiptap/extension-table-header'
  import TableRow from '@tiptap/extension-table-row'
  import FontFamily from '@tiptap/extension-font-family';
  import FontSize from '@tiptap/extension-font-size';
  import Highlight from '@tiptap/extension-highlight'; 
  import HorizontalRule from '@tiptap/extension-horizontal-rule';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';

  import {Download, Save} from 'lucide-react'
  import { useEffect, useState } from 'react';
  import { IndentedParagraph } from './extensions/IndentedParagraph';
  import Section from './extensions/Section';
  import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf';
import { toast } from 'sonner';
  function preserveLeadingSpaces(html: string | undefined): string {
    if (typeof html !== 'string') return '';
    return html.replace(/(^|\n)( +)/g, (match, p1, spaces) => {
      return p1 + spaces.replace(/ /g, '\u00a0');
    });
  }

  const Editor = ({ initialHTML }: { initialHTML?: string }) => {
    const params = useParams()
    const {fileId} = params;

    const handleSave = async ()=>{
      try{
        const content:string | undefined = editor?.getHTML();
        const fullHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Document</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      section { margin-bottom: 1em; }
    </style>
  </head>
  <body>
    ${content}
  </body>
</html>


`;
        console.log(content);
        const saveRes = await axios.post(`http://localhost:8085/save/`,{'html':fullHTML,'uuid':fileId});
        if(saveRes.status !== 200 || !saveRes ){
          console.log('error toast')
          throw saveRes;
        }
  
        toast.success('Saved Successfully');
      }
      catch(e){
        toast.error("Unexpected Error : ",e.message);
      }
    }
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        TextStyle,
        Color,
        FontFamily.configure({
          types: ['textStyle'], // Needed to apply font family to textStyle marks
        }),
        FontSize.configure({
          types: ['textStyle'], // Needed for font size on inline text
        }),
        Highlight, // Optional, for background highlight color
        IndentedParagraph,
        Section,
        Table.configure({
  resizable: true,
  HTMLAttributes: {
    class: 'border border-gray-300 border-collapse table-auto',
    style: 'width: 100%;',
  },
}),
TableRow.configure({
  HTMLAttributes: {
    class: 'border border-gray-300',
  },
}),
TableHeader.configure({
  HTMLAttributes: {
    class: 'border border-gray-300 bg-gray-100 font-semibold p-2',
  },
}),
TableCell.configure({
  HTMLAttributes: {
    class: 'border border-gray-300 p-2',
  },
}),
HorizontalRule,
BulletList,
OrderedList,
ListItem,
TextAlign.configure({
  types: ['heading', 'paragraph'],
  alignments: ['left', 'center', 'right', 'justify'],
  defaultAlignment: 'left',
}),
      ],
      content: preserveLeadingSpaces(initialHTML),
    });

    return <div className='bg-gray-300 absolute top-0 bottom-0 left-0 right-0 h-fit'>
      <Button className='absolute top-10 right-10 cursor-pointer z-2' onClick={handleSave}><Save /></Button>
      <Button className='absolute top-10 right-22 cursor-pointer z-2'><Download /></Button>
      <EditorContent editor={editor} style={{ whiteSpace: 'pre-wrap',alignItems:'center' }} />;
      </div>
  };

  export default Editor;
