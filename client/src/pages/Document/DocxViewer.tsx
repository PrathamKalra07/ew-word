import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import Editor from './Editor';

const PAGE_HEIGHT = 1123; // A4 at 96 DPI approx

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
    const renderAndPaginate = async () => {
      if (!fileBlob || !containerRef.current) return;

      const container = containerRef.current;
      container.innerHTML = ''; // Clear

      await renderAsync(fileBlob, container, null, {
        breakPages: false,
      });

      await new Promise((r) => setTimeout(r, 0)); // Let layout finish

      const allElements = Array.from(container.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];

      // Move everything to a temporary holder
      const tempWrapper = document.createElement('div');
      allElements.forEach((el) => tempWrapper.appendChild(el));

      container.innerHTML = '';

      let currentPage = document.createElement('div');
      currentPage.className = 'docx-page';
      container.appendChild(currentPage);

      let currentHeight = 0;

      for (let i = 0; i < tempWrapper.childNodes.length; i++) {
        const node = tempWrapper.childNodes[i] as HTMLElement;
        container.appendChild(node); // attach temporarily to measure
        const height = node.offsetHeight;

        if (currentHeight + height > PAGE_HEIGHT && currentHeight > 0) {
          currentPage = document.createElement('div');
          currentPage.className = 'docx-page';
          container.appendChild(currentPage);
          currentHeight = 0;
        }

        currentPage.appendChild(node);
        currentHeight += height;
      }

      const styledHTML = inlineComputedStyles(container);
      setContent(styledHTML);
    };

    renderAndPaginate();
  }, [fileBlob]);

  return (
    <div>
      {content && <Editor initialHTML={content} />}
      <div
        ref={containerRef}
        style={{
          display: 'block',
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '794px', // A4 width in pixels at 96dpi
        }}
      />
    </div>
  );
};

export default DocxViewer;
