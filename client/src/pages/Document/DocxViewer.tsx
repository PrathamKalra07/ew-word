// import React, { useEffect, useRef, useState } from 'react';
// import { renderAsync } from 'docx-preview';
// import Editor from './Editor';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';

// const PAGE_HEIGHT = 1123; // A4 at 96 DPI approx

// const DocxViewer = () => {
//   const params = useParams();
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [content, setContent] = useState<string | undefined>();

//   const inlineComputedStyles = (element: HTMLElement): string => {
//     const clone = element.cloneNode(true) as HTMLElement;

//     const applyInlineStyles = (source: HTMLElement, target: HTMLElement) => {
//       const computedStyle = window.getComputedStyle(source);
//       let styleString = '';

//       for (let i = 0; i < computedStyle.length; i++) {
//         const propName = computedStyle.item(i);
//         const propValue = computedStyle.getPropertyValue(propName);
//         styleString += `${propName}: ${propValue}; `;
//       }

//       target.setAttribute('style', styleString.trim());

//       Array.from(source.children).forEach((child, index) => {
//         if (child instanceof HTMLElement && target.children[index] instanceof HTMLElement) {
//           applyInlineStyles(child, target.children[index] as HTMLElement);
//         }
//       });
//     };

//     applyInlineStyles(element, clone);
//     return clone.innerHTML;
//   };

//   useEffect(() => {
//     const fetchAndRender = async () => {
//       if (!params.fileId || !containerRef.current) return;

//       try {
//         // Fetch the document as a blob
//         const response = await axios.get(`http://localhost:8085/getDocument/${params.fileId}`, {
//           responseType: 'blob',
//         });

//         const fileBlob = response.data;
//         const container = containerRef.current;
//         container.innerHTML = ''; // Clear existing content

//         // Render the docx into the container
//         await renderAsync(fileBlob, container, null, {
//           breakPages: false,
//         });

//         await new Promise((r) => setTimeout(r, 0)); // Let DOM settle

//         // Paginate into A4-sized divs
//         const allElements = Array.from(container.childNodes).filter(
//           (node) => node.nodeType === Node.ELEMENT_NODE
//         ) as HTMLElement[];

//         const tempWrapper = document.createElement('div');
//         allElements.forEach((el) => tempWrapper.appendChild(el));
//         container.innerHTML = '';

//         let currentPage = document.createElement('div');
//         currentPage.className = 'docx-page';
//         container.appendChild(currentPage);

//         let currentHeight = 0;

//         for (let i = 0; i < tempWrapper.childNodes.length; i++) {
//           const node = tempWrapper.childNodes[i] as HTMLElement;
//           container.appendChild(node); // temporarily attach to measure
//           const height = node.offsetHeight;

//           if (currentHeight + height > PAGE_HEIGHT && currentHeight > 0) {
//             currentPage = document.createElement('div');
//             currentPage.className = 'docx-page';
//             container.appendChild(currentPage);
//             currentHeight = 0;
//           }

//           currentPage.appendChild(node);
//           currentHeight += height;
//         }

//         // Convert with inline styles
//         const styledHTML = inlineComputedStyles(container);
//         setContent(styledHTML);
//       } catch (err) {
//         console.error('Error fetching or rendering DOCX:', err);
//       }
//     };

//     fetchAndRender();
//   }, [params.fileId]);

//   return (
//     <div>
//       {content && <Editor initialHTML={content} />}
//       <div
//         ref={containerRef}
//         style={{
//           display: 'block',
//           position: 'absolute',
//           top: '-9999px',
//           left: '-9999px',
//           width: '794px', // A4 width in pixels
//         }}
//       />
//     </div>
//   );
// };

// export default DocxViewer;
import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Editor from './Editor';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

const DocxViewer = () => {
  const { fileId } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string>();

  const inlineComputedStyles = (element: HTMLElement): string => {
    const clone = element.cloneNode(true) as HTMLElement;

    const applyInlineStyles = (src: HTMLElement, target: HTMLElement) => {
      const computed = window.getComputedStyle(src);
      let style = '';

      for (let i = 0; i < computed.length; i++) {
        const name = computed.item(i);
        const value = computed.getPropertyValue(name);
        style += `${name}: ${value}; `;
      }

      target.setAttribute('style', style.trim());

      Array.from(src.children).forEach((child, i) => {
        if (child instanceof HTMLElement && target.children[i] instanceof HTMLElement) {
          applyInlineStyles(child, target.children[i] as HTMLElement);
        }
      });
    };

    applyInlineStyles(element, clone);
    return clone.innerHTML;
  };

useEffect(() => {
  const fetchAndRenderDocx = async () => {
    if (!fileId) return;

    const response = await fetch('http://localhost:8085/getDocument/' + fileId);
    const blob = await response.blob();

    const container = containerRef.current;
    if (!blob || !container) return;

    container.innerHTML = '';
    await renderAsync(blob, container, null, { breakPages: true });

    // Let rendering settle
    await new Promise((r) => setTimeout(r, 0));

    // Extract all rendered elements
    const elements = Array.from(container.childNodes).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    ) as HTMLElement[];

    const tempWrapper = document.createElement('div');
    elements.forEach((el) => tempWrapper.appendChild(el));

    container.innerHTML = '';

    // Pagination
    let currentPage = document.createElement('div');
    currentPage.className = 'docx-page';
    currentPage.style.cssText = `
      width: ${PAGE_WIDTH}px;
      height: ${PAGE_HEIGHT}px;
      padding: 91px 51px;
      margin: 2rem auto;
      background: white;
      border: 1px solid #ddd;
      box-sizing: border-box;
      overflow: hidden;
      page-break-after: always;
    `;
    container.appendChild(currentPage);

    let currentHeight = 0;

    for (const node of Array.from(tempWrapper.childNodes) as HTMLElement[]) {
      // Measure height using clone to avoid DOM mutations during measuring
      const clone = node.cloneNode(true) as HTMLElement;
      container.appendChild(clone);
      const height = clone.offsetHeight;
      container.removeChild(clone);

      if (currentHeight + height > PAGE_HEIGHT && currentHeight > 0) {
        currentPage = document.createElement('div');
        currentPage.className = 'docx-page';
        currentPage.style.cssText = `
          width: ${PAGE_WIDTH}px;
          height: ${PAGE_HEIGHT}px;
          padding: 91px 51px;
          margin: 2rem auto;
          background: white;
          border: 1px solid #ddd;
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: always;
        `;
        container.appendChild(currentPage);
        currentHeight = 0;
      }

      currentPage.appendChild(node);
      currentHeight += height;
    }

    // INLINE STYLE HELPER FUNCTION
    const applyInlineStylesRecursively = (src: HTMLElement, tgt: HTMLElement) => {
      const computed = window.getComputedStyle(src);
      let style = '';
      for (let i = 0; i < computed.length; i++) {
        const name = computed.item(i);
        const value = computed.getPropertyValue(name);
        style += `${name}: ${value}; `;
      }
      tgt.setAttribute('style', style.trim());
      Array.from(src.children).forEach((child, i) => {
        if (child instanceof HTMLElement && tgt.children[i] instanceof HTMLElement) {
          applyInlineStylesRecursively(child, tgt.children[i] as HTMLElement);
        }
      });
    };

    // Generate styled HTML per page and join — NO wrapping container
    const pages = Array.from(container.children) as HTMLElement[];
    const styledPagesHTML = pages
      .map((page) => {
        const clone = page.cloneNode(true) as HTMLElement;
        applyInlineStylesRecursively(page, clone);
        return clone.outerHTML; // includes <div class="docx-page"> wrapper
      })
      .join('');

    setContent(styledPagesHTML);
  };

  fetchAndRenderDocx();
}, [fileId]);


  return (
    <div>
      {content && <Editor initialHTML={content} />}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: `${PAGE_WIDTH}px`,
        }}
      />
    </div>
  );
};

export default DocxViewer;
