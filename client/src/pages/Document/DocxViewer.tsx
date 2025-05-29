import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview'; // must be installed
import Editor from './Editor';
import inlineCss from 'inline-css';


const DocxViewer = ({ fileBlob }: { fileBlob: Blob }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<string | undefined>();


  useEffect(() => {
    if (fileBlob && containerRef.current) {
      // Wait for rendering to complete before grabbing HTML
      renderAsync(fileBlob, containerRef.current).then(() => {
        setContent(containerRef.current?.innerHTML);
      });
    }
  }, [fileBlob]);

  useEffect(() => {
  if (fileBlob && containerRef.current) {
    renderAsync(fileBlob, containerRef.current).then(async () => {
      const rawHtml = containerRef.current?.innerHTML || '';
      const inlinedHtml = await inlineCss(rawHtml, {
        url: ' ', // base URL for relative paths in CSS; ' ' or your site URL
        removeStyleTags: true,
        applyStyleTags: true,
      });
      setContent(inlinedHtml);
    });
  }
}, [fileBlob]);


  return (
    <div>
      <div className='z-1'>
        {content && <Editor initialHTML={content} />}
      </div>
      <div className='z-0'>
        <div ref={containerRef} />
      </div>
    </div>
  );
};

export default DocxViewer;
