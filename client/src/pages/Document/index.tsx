import axios from 'axios';
// import { config } from 'process';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import DocxViewer from './DocxViewer';

const Document = () => {
  const [content,setContent]=useState<string>();
    const {fileId} = useParams();
    // THIS FUNCTION PARSES JSON / HTML CONVERTED DATA
    // useEffect(()=>{
    //   const getDocumentData =async ()=>{
    //     const response:{data:{parsedJson:string},status:number} = await axios.get(`http://localhost:8085/getDocument/${fileId}`);
    //     if(response.status == 200){
    //       setContent(response.data.parsedJson);
    //     }else{
    //       toast.error("Failed to Parse data");
    //     }
    //   }
      
    //   getDocumentData();
    // },[])

    const [file,setFile]=useState<Blob | undefined>(undefined);

    useEffect(()=>{
      const getDocument = async ()=>{
        const response = await axios.get(`http://localhost:8085/getDocument/${fileId}`,{
           responseType: 'blob',
        });
        const blobFile = await response.data;

        setFile(blobFile);
        // const arrayBuffer = await blobFile.arrayBuffer();

        return blobFile;
      }

      getDocument();
    },[])

  return (
    <div>
    {file ? <DocxViewer fileBlob={file} /> : <p>Loading document...</p>}
    </div>
  )
}

export default Document