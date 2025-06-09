import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import Editor from './Editor';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const PAGE_HEIGHT = 1123; // A4 at 96 DPI approx

const DocxViewer = () => {
  const params = useParams();
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
    const fetchAndRender = async () => {
      if (!params.fileId || !containerRef.current) return;

      try {
        // Fetch the document as a blob
        const response = await axios.get(`http://localhost:8085/getDocument/${params.fileId}`, {
          responseType: 'blob',
        });

        const fileBlob = response.data;
        const container = containerRef.current;
        container.innerHTML = ''; // Clear existing content

        // Render the docx into the container
        await renderAsync(fileBlob, container, null, {
          breakPages: false,
        });

        await new Promise((r) => setTimeout(r, 0)); // Let DOM settle

        // Paginate into A4-sized divs
        const allElements = Array.from(container.childNodes).filter(
          (node) => node.nodeType === Node.ELEMENT_NODE
        ) as HTMLElement[];

        const tempWrapper = document.createElement('div');
        allElements.forEach((el) => tempWrapper.appendChild(el));
        container.innerHTML = '';

        let currentPage = document.createElement('div');
        currentPage.className = 'docx-page';
        container.appendChild(currentPage);

        let currentHeight = 0;

        for (let i = 0; i < tempWrapper.childNodes.length; i++) {
          const node = tempWrapper.childNodes[i] as HTMLElement;
          container.appendChild(node); // temporarily attach to measure
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

        // Convert with inline styles
        const styledHTML = inlineComputedStyles(container);
        setContent(styledHTML);
      } catch (err) {
        console.error('Error fetching or rendering DOCX:', err);
      }
    };

    fetchAndRender();
  }, [params.fileId]);

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
          width: '794px', // A4 width in pixels
        }}
      />
    </div>
  );
};

export default DocxViewer;
