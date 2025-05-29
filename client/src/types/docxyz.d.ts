declare module 'docxyz' {
  export class Editor {
    constructor(container: HTMLElement, options?: { width?: string; height?: string });
    load(blob: Blob): void;
    save(): Promise<Blob>;
    destroy(): void;
  }

  export class Document {
    constructor(buffer?: ArrayBuffer);
    addParagraph(paragraph: any): void;
    toBuffer(): ArrayBuffer;
  }

  // Add others from the library if needed
}
