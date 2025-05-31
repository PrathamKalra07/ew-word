import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
// import Editor from './Editor';
import Editor from './Editor';

const DocxViewer = ({ fileBlob }: { fileBlob: Blob }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string | undefined>();

  const inlineComputedStyles = (element: HTMLElement): string => {
    const clone = element.cloneNode(true) as HTMLElement;

    const applyInlineStyles = (source: HTMLElement, target: HTMLElement) => {
      const computedStyle = window.getComputedStyle(source);
      let styleString = '';

      for (let i = 0; i < computedStyle.length; i++) {
        const propName = computedStyle.item(i);
        const propValue = computedStyle.getPropertyValue(propName);
        styleString += `${propName}: ${propValue}; `;
      }

      target.setAttribute('style', styleString.trim());

      Array.from(source.children).forEach((child, index) => {
        if (child instanceof HTMLElement && target.children[index] instanceof HTMLElement) {
          applyInlineStyles(child, target.children[index] as HTMLElement);
        }
      });
    };

    applyInlineStyles(element, clone);
    return clone.innerHTML;
  };

  useEffect(() => {
    const renderAndExtract = async () => {
      if (!fileBlob || !containerRef.current) return;

      await renderAsync(fileBlob, containerRef.current);
      const styledHTML = inlineComputedStyles(containerRef.current);
      console.log('INLINE HTML:', styledHTML);
      setContent(styledHTML);
    };

    renderAndExtract();
  }, [fileBlob]);

  return (
    <div>
      {content && <Editor initialHTML={content} />} 
      <div
        ref={containerRef}
        style={{ display: 'none', position: 'absolute', top: '-9999px', left: '-9999px' }}
      />
    </div>
  );
};

export default DocxViewer;
