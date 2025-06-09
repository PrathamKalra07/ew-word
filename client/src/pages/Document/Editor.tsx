import './Editor.css';
import { useEditor, EditorContent } from '@tiptap/react';
  import StarterKit from '@tiptap/starter-kit';
  import TextStyle from '@tiptap/extension-text-style';
  import Color from '@tiptap/extension-color';
  import Table from '@tiptap/extension-table'
  import TableCell from '@tiptap/extension-table-cell'
  import TableHeader from '@tiptap/extension-table-header'
  // import { createContext, useContext } from 'react'
  import TableRow from '@tiptap/extension-table-row'
  import FontFamily from '@tiptap/extension-font-family';
  import FontSize from '@tiptap/extension-font-size';
  import Highlight from '@tiptap/extension-highlight'; 
  import UnderlineTipTap from '@tiptap/extension-underline';
  import HorizontalRule from '@tiptap/extension-horizontal-rule';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
  import {Bold, Download, Highlighter, Italic, Loader2Icon, Redo2, Save, SquareSplitVertical, Strikethrough, Underline, Undo2} from 'lucide-react'
  import ImageResize from 'tiptap-extension-resize-image';
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Link2, ArrowDownToLine } from "lucide-react"
import { createContext, useContext, useMemo } from 'react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
  import { useEffect, useState } from 'react';
  import { IndentedParagraph } from './extensions/IndentedParagraph';
  import Section from './extensions/Section';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf';
import { toast } from 'sonner';
import React from 'react';
// import { PageBreak } from './extensions/PageBreaks';
import AutoPaginateExtension from './extensions/AutoPaginateExtension';

 
    const frameworks = [
  {
    value: "Times New Roman",
    label: "Times New Roman",
  },
  {
    value: "Arial",
    label: "Arial",
  },
  {
    value: "Calibri",
    label: "Calibri",
  },
  {
    value: "Helvetica",
    label: "Helvetica",
  },
  {
    value: "Verdana",
    label: "Verdana",
  },
  {
    value: "Courier",
    label: "Courier",
  },
]

const fontSizes = [
  { value: "12px", label: "12" },
  { value: "14px", label: "14" },
  { value: "16px", label: "16" },
  { value: "18px", label: "18" },
  { value: "24px", label: "24" },
  { value: "32px", label: "32" },
];





  function preserveLeadingSpaces(html: string | undefined): string {
    if (typeof html !== 'string') return '';
    return html.replace(/(^|\n)( +)/g, (match, p1, spaces) => {
      return p1 + spaces.replace(/ /g, '\u00a0');
    });
  }

//   function splitSectionsIfTooTall(editor, maxHeight = 900) {
//   const sections = editor.view.dom.querySelectorAll('section');

//   sections.forEach((section, index) => {
//     const height = section.offsetHeight;

//     if (height > maxHeight) {
//       // Find a split position roughly in the middle (or nearest paragraph boundary)
//       // This requires mapping DOM position back to document position
//       // You can get the pos of the section start:

//       const pos = editor.view.posAtDOM(section, 0);

//       // Then find a block boundary near the middle and split:
//       // This is non-trivial and requires ProseMirror commands.

//       // Simplified example: split at pos + 10 (adjust as needed)
//       editor.chain().focus().splitNodeAt(pos + 10).run();
//     }
//   });
// }


  const Editor = ({ initialHTML }: { initialHTML?: string }) => {
  const [fontFamilyOpen, setFontFamilyOpen] = React.useState(false);
  const [fontSizeOpen,setFontSizeOpen] = React.useState(false);
  const [fontFamilyValue, setFontFamilyValue] = React.useState("")
  const [fontSizeValue, setFontSizeValue] = React.useState("")
  const [downloadDisabled,setDownloadDisabled] = React.useState(false);
  const [saveDisabled,setSaveDisabled] = React.useState(false);

  // const [title, setTitle] = React.useState("")
  const [fontSize, setFontSize] = React.useState<string | undefined>(undefined);


    
    const params = useParams()
    const {fileId} = params;

    const handleSave = async ()=>{
      try{
        setDownloadDisabled(true);
        setSaveDisabled(true);
        const content:string | undefined = editor?.getHTML();
        let fullHTML = `
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

        fullHTML = fullHTML.replace(/<section style="page-break-after: always;">/g,'');
        fullHTML = fullHTML.replace(/<\/section>/g, '<p style="page-break-after: always;">&nbsp;</p>');
        fullHTML = fullHTML.replace(/<div class="pagebreak">&nbsp;<\/div>/g,'<p style="page-break-after: always;">&nbsp;</p>');
        fullHTML = fullHTML.replace(/<\/div>/g, '<p style="page-break-after: always;">&nbsp;</p>');

        console.log(fullHTML);
        const imgHtml = fixImageSizes(fullHTML);
        const saveRes = await axios.post(`http://localhost:8085/save/`,{'html':imgHtml,'uuid':fileId});
        if(saveRes.status !== 200 || !saveRes ){
          console.log('error toast')
          throw saveRes;
        }
  
        toast.success('Saved Successfully');
        setDownloadDisabled(false);
        setSaveDisabled(false);
      }
      catch(e){
        console.log(e);
        toast.error("Unexpected Error : ",e);
      }
    }

    const handleDownload = async ()=>{
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
        const downloadRes = await axios.post(`http://localhost:8085/download/`,{'html':fullHTML,'uuid':fileId},{
        responseType: 'blob',
      });
        if(downloadRes.status !== 200 || !downloadRes ){
          console.log('error toast')
          throw downloadRes;
        }
         const blob = new Blob([downloadRes.data], { type: downloadRes.headers['content-type'] });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `document.docx`; // Change extension accordingly
    document.body.appendChild(link);
    link.click();
    link.remove();
  
        toast.success('Downloaded Successfully');
      }
      catch(e){
        console.log(e)
        toast.error("Unexpected Error : ",e);
      }
    }



const fixImageSizes = (html: string): string => {
  const PAGE_WIDTH = 595;  // A4 width at 72 DPI
  const PAGE_HEIGHT = 842; // A4 height at 72 DPI
  const MAX_WIDTH = PAGE_WIDTH * 0.9; // 90% of canvas

  const div = document.createElement('div');
  div.innerHTML = html;

  div.querySelectorAll('img').forEach((img) => {
    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    document.body.appendChild(clone);

    const naturalWidth = clone.naturalWidth;
    const naturalHeight = clone.naturalHeight;
    document.body.removeChild(clone);

    img.removeAttribute('width');
    img.removeAttribute('height');

    let finalWidth = naturalWidth;
    let finalHeight = naturalHeight;

    if (naturalWidth > MAX_WIDTH) {
      const scale = MAX_WIDTH / naturalWidth;
      finalWidth = MAX_WIDTH;
      finalHeight = naturalHeight * scale;
    }

    // Ensure height doesn’t exceed page height
    if (finalHeight > PAGE_HEIGHT) {
      const scale = PAGE_HEIGHT / finalHeight;
      finalHeight = PAGE_HEIGHT;
      finalWidth = finalWidth * scale;
    }

    img.style.width = `${finalWidth}px`;
    img.style.height = `${finalHeight}px`;
    img.style.display = 'block';
    img.style.margin = '0 auto';

    // Optional: wrap for alignment
    const margin = img.style.margin || '';
    let align = '';

    if (margin.includes('auto') && margin.startsWith('auto') && margin.endsWith('auto')) {
      align = 'center';
    } else if (margin.includes('auto') && margin.startsWith('auto') && margin.endsWith('0px')) {
      align = 'left';
    } else if (margin.includes('auto') && margin.startsWith('0px') && margin.endsWith('auto')) {
      align = 'right';
    }

    if (align) {
      const wrapper = document.createElement('p');
      wrapper.setAttribute('align', align);
      img.replaceWith(wrapper);
      wrapper.appendChild(img);
    }
  });

  return div.innerHTML;
};

function processHtmlForTipTap(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Convert all page breaks to a consistent format
  doc.querySelectorAll('[style*="page-break"], [style*="break-after"]').forEach(el => {
    if (getComputedStyle(el).getPropertyValue('page-break-after') === 'always' || 
        getComputedStyle(el).getPropertyValue('break-after') === 'page') {
      el.replaceWith(createPageBreakElement());
    }
  });

  // Handle LibreOffice-style page breaks
  doc.querySelectorAll('hr[type="page-break"]').forEach(el => {
    el.replaceWith(createPageBreakElement());
  });

  // Handle empty paragraphs that might be page breaks
  doc.querySelectorAll('p, div').forEach(el => {
    if (el.innerHTML.trim() === '' && el.textContent === '\f') { // Form feed character
      el.replaceWith(createPageBreakElement());
    }
  });

  return doc.body.innerHTML;
}

function createPageBreakElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'page-break';
  div.setAttribute('data-page-break', 'true');
  div.innerHTML = '<!-- PAGE BREAK -->';
  return div;
}


function getFontFamilyAtCursor(editor): { fontFamily: string, fontSize: string } | null {
  const { from } = editor.state.selection;
  let dom = editor.view.domAtPos(from);

  // If the node is a text node, use its parent
  let element = (dom.node.nodeType === 3 ? dom.node.parentElement : dom.node) as HTMLElement;

  // If element is a block like <p> with no style, try to find a styled span inside
  if (element && element.nodeType === 1 && element.childNodes.length > 0) {
    const styledChild = Array.from(element.childNodes).find(child => {
      if (child.nodeType !== 1) return false;
      const style = window.getComputedStyle(child as HTMLElement);
      return style.fontFamily && style.fontFamily !== "";
    }) as HTMLElement;

    if (styledChild) element = styledChild;
  }

  if (!element) return null;

  const computedStyle = window.getComputedStyle(element);
  const rawFont = computedStyle.fontFamily;
  const fontSize = computedStyle.fontSize;

  const cleanedFont = rawFont
    .split(",")[0]
    .replace(/['"]/g, "")
    .trim();

  const matchedFont = frameworks.find(font => font.value === cleanedFont);

  if (matchedFont) {
    return {
      fontFamily: matchedFont.value,
      fontSize: fontSize,
    };
  }

  return null;
}

const processedHTML = useMemo(() => {
  // console.log("Processed HTML : ",initialHTML);
  return processHtmlForTipTap(preserveLeadingSpaces(initialHTML));
}, [initialHTML]);

    
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        TextStyle,
        Color,
        Image,
        FontFamily.configure({
          types: ['textStyle'], 
        }),
        FontSize.configure({
          types: ['textStyle'],
        }),
        Highlight,
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
AutoPaginateExtension,
ListItem,
TextAlign.configure({
  types: ['heading', 'paragraph'],
  alignments: ['left', 'center', 'right', 'justify'],
  defaultAlignment: 'left',
}),
ImageResize,
UnderlineTipTap,
// PageBreak,
// ResizableImage,
      ],
      content: processedHTML,
      editorProps :{
        attributes :{
            style : "page-break-after: always",
            class:"focus:outline-none print:border-0 bg-gray-300 border border-gray-300 rounded-sm flex flex-col min-h-[1000.89px] w-[794px] mx-auto pt-10 px-0 pb-10 leading-normal cursor-text text-[11px] mt-10" 
        }
    },
    });


    useEffect(() => {
  if (!editor) return;

  const handler = () => {
    // Update font at cursor
    const getFontStyle: { fontFamily: string; fontSize: string } | null = getFontFamilyAtCursor(editor);
    const font: string = getFontStyle?.fontFamily || '';
    const size: string = getFontStyle?.fontSize || '';

    setFontFamilyValue(font);
    setFontSize(size);

    // Check section heights
    const proseMirrorEl = document.querySelector('.ProseMirror');
    if (!proseMirrorEl) return;

    // const blocks = proseMirrorEl.querySelectorAll('p, h1, h2, ul, ol, blockquote');

    // let runningHeight = 0;

    
    // blocks.forEach(block => {
    //   const height = block.clientHeight;
    //   runningHeight += height;

    //   const prevNode = block.previousElementSibling?.classList.contains('page-break');

    //   console.log(prevNode)

    //   if (runningHeight > 1050 && !prevNode) {
    //     const pos = editor.view.posAtDOM(block, 0);
    //     editor.commands.insertContentAt(pos, { type: 'pageBreak' });
    //     runningHeight = 0;
    //   }
    // });
  };

  
  editor.on('create', handler);
  return () => {
    editor.off('create', handler);
  };
}, [editor]);



    return <div className='bg-gray-300 absolute top-0 bottom-0 left-0 right-0 h-fit'>

      <div className="p-4 bg-white shadow flex flex-wrap gap-2 sticky top-0 z-10">
    
    <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>
  <Button variant="outline" onClick={() => editor?.chain().focus().toggleBold().run()} className={editor?.isActive('bold') ? 'bg-gray-200' : ''}>
    <Bold />
  </Button>
    </HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Bold
  </HoverCardContent>
</HoverCard>
    <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>
  <Button variant="outline" onClick={() => editor?.chain().focus().toggleItalic().run()} className={editor?.isActive('italic') ? 'bg-gray-200' : ''}>
    <Italic />
  </Button>
    </HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Italics
  </HoverCardContent>
</HoverCard>
    <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>
  <Button variant="outline" onClick={() => editor?.chain().focus().toggleUnderline().run()} className={editor?.isActive('underline') ? 'bg-gray-200' : ''}>
    <Underline />
  </Button>
    </HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Underline
  </HoverCardContent>
</HoverCard>
    
    <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
  <Button variant="outline" onClick={() => editor?.chain().focus().toggleStrike().run()} className={editor?.isActive('strike') ? 'bg-gray-200' : ''}>
    <Strikethrough />
  </Button>
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    StrikeThrough
  </HoverCardContent>
</HoverCard>
    <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
  <Button variant="outline" onClick={() => editor?.chain().focus().toggleHighlight().run()} className={editor?.isActive('strike') ? 'bg-gray-200' : ''}>
    <Highlighter />
  </Button>
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Highlight
  </HoverCardContent>
</HoverCard>
    
  <div>
<Popover open={fontFamilyOpen} onOpenChange={setFontFamilyOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between overflow-hidden" role="combobox" aria-expanded={fontFamilyOpen}>
          {fontFamilyValue ? fontFamilyValue : "Select Font..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search Fonts..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Fonts found</CommandEmpty>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setFontFamilyValue(currentValue === fontFamilyValue ? "" : currentValue);
                    setFontFamilyOpen(false);
                    editor?.chain().focus().setFontFamily(currentValue).run();
                  }}
                >
                  {framework.label}
                  <Check className={cn("ml-auto", fontFamilyValue === framework.value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

     <Popover open={fontSizeOpen} onOpenChange={setFontSizeOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[100px] ml-2 justify-between" role="combobox" aria-expanded={fontSizeOpen}>
          {fontSize ?? "Font Size"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100px] p-0">
        <Command>
          <CommandInput placeholder="Search Sizes..." className="h-9" />
          <CommandList>
            <CommandEmpty>No Sizes found</CommandEmpty>
            <CommandGroup>
              {fontSizes.map(({ value, label }) => (
                <CommandItem
                  key={value}
                  value={value}
                  onSelect={(currentValue) => {
                    setFontSize(currentValue === fontSize ? undefined : currentValue);
                    setFontSizeOpen(false);
                    editor?.chain().focus().setFontSize(currentValue).run();
                  }}
                >
                  {label}
                  <Check className={cn("ml-auto", fontSize === value ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>


  </div>
  <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
  <Button variant="outline" onClick={() =>{editor?.commands.deleteCurrentNode()}}>
    
    {/* '<div class="pagebreak" contenteditable="false" data-page-break="true">&nbsp;</div>' */}
    {/* editor?.commands.insertContent('</section><section style="page-break-after : always">'); */}
    <SquareSplitVertical />
</Button>
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Delete Page
  </HoverCardContent>
</HoverCard>
<HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
  <Button variant="outline" onClick={() => {editor?.chain().undo().run();}}>
    <Undo2 />
</Button>
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Undo
  </HoverCardContent>
</HoverCard>

<HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
  <Button variant="outline" onClick={() => {editor?.chain().redo().run();}}>
    <Redo2 />
</Button>
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Redo
  </HoverCardContent>
</HoverCard>

      <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>    
    {!saveDisabled && 
        <Button variant="outline" className='cursor-pointer z-2' onClick={handleSave}>
          <Save />
</Button>
}
  {saveDisabled && 

<Button size="sm" disabled>
      <Loader2Icon className="animate-spin" />
    </Button>
  }
</HoverCardTrigger>

  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Save
  </HoverCardContent>
</HoverCard>
      <HoverCard openDelay={100} closeDelay={100}>
  <HoverCardTrigger>
    {!downloadDisabled && 
      <Button variant="outline" className=' cursor-pointer z-2' onClick={handleDownload}>
        <Download />
        
</Button>
    }
    {downloadDisabled && 

<Button size="sm" disabled>
      <Loader2Icon className="animate-spin" />
    </Button>
  }
</HoverCardTrigger>
  <HoverCardContent className='w-min flex p-1 px-3 -mt-1 text-xs'>
    Download
  </HoverCardContent>
</HoverCard>


</div>
      <EditorContent editor={editor} style={{ whiteSpace: 'pre-wrap',alignItems:'center' }} />;
      </div>
  };

  export default Editor;
