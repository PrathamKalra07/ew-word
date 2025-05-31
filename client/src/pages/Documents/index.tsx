import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import axios from 'axios'
import {toast} from "sonner"
import { useNavigate } from 'react-router-dom'

const Documents = () => {

    const [files,setFiles] = useState<Blob | undefined>();
    const navigate = useNavigate();

    const updateFile = (e)=>{
        const file:Blob | undefined = e.target.files[0];
        setFiles(file);

    }
    const handleUpload=async ()=>{
        const formData = new FormData()

        console.log("files : ",files);
        if(files){
            formData.append('file',files);
            const uploadRes = await axios.post('http://localhost:8085/upload',formData);

            if(uploadRes.status ==200){
                toast.success("File uploaded successfully");
                setTimeout(()=>{
                    navigate(`/document/${uploadRes.data.uuid}`)
                },[2000])
            }else{
                toast.error("File upload failed")
            }
        }
    }

  return (
    <div className='h-[100vh] relative'> 
        <div className='text-xl font-semibold absolute top-[45%] w-[100%] text-center '>
        Please Upload File to continue

        <div className='mt-5 w-fit mx-auto font-light'>
            <Input type='file' onChange={updateFile}></Input>
            <Button className='mt-2' onClick={handleUpload} >Upload</Button>
        </div>
        </div>    
    </div>
  )
}

export default Documents