const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path')
const { exec } = require('child_process');
// const {DocxyzParser } = require('docxyz')

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uuid = uuidv4();
    req.uuid = uuid;
    file.uuid = uuid

    const dir = path.join(__dirname, 'uploads', uuid);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir); 
  },
  filename: function (req, file, cb) {
    cb(null, 'document.docx');
  }
});


const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only .docx files are allowed'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });


app.get('/',(req,res)=>{
    res.status(200).json({"msg":"connection successful"});
})

app.post('/upload',upload.single('file'),(req,res)=>{
    console.log("request : ",req.body)
    if (!req.file) {
    return res.status(400).json('No file uploaded or invalid file type.');
  }
  console.log('uuid : ',req.file.uuid)
  const uuid = req.file.uuid;

//   const fileExists = fs.existsSync(__dirname+'/uploads/'+uuid+"/document.docx")
//     if(fileExists){
//         try{
//             const buffer = fs.readFileSync(__dirname+'/uploads/'+uuid+"/document.docx");
           
//             // this approaches are if the conversion needs to be handled on the backend side.
//             // libreoffice approach
//             // const cmd = `soffice --headless --convert-to html:"HTML (StarWriter)" "${__dirname+'/uploads/'+uuid+"/document.docx"}" --outdir "${__dirname+'/uploads/'+uuid}"`;
    
//             // exec(cmd, (err, stdout, stderr) => {
//             //     if (err) {
//             //     throw err;
    
//             //     }
//             //     console.log('Conversion to odt complete:', stdout || stderr);
//             // });

//             //pandoc approach
//             // const cmd = `pandoc "${__dirname+'\\uploads\\'+uuid+'\\document.docx'}" -o "${__dirname+'\\uploads\\'+uuid+'\\document.html'}" --standalone`;
    
//             // exec(cmd, (err, stdout, stderr) => {
//             //     if (err) {
//             //     throw err;
//             //     }
//             //     console.log('Conversion to html complete:', stdout || stderr);
//             // });

//             // exec(`inline-images ${__dirname+'\\uploads\\'+uuid+'\\document.html'} > ${__dirname+'\\uploads\\'+uuid+'\\document.html'}`,(err,stdout,stderr)=>{
//             //     if (err) {
//             //         throw err;
    
//             //     }
//             //     console.log('Conversion to html inlining complete:', stdout || stderr);
//             // })
//         }catch(e){
//             res.status(500).json("error storing : "+e);
//         }
//     }
  res.status(200).json({
    message: 'File uploaded successfully!',
    filename: req.file.filename,
    path: req.file.path,
    uuid : req.file.uuid
  });
})

app.get('/getDocument/:uuid',async(req,res)=>{
    const {uuid} = req.params;
    // const parser = new DocxyzParser();

    try{

        const buffer = fs.readFileSync(__dirname+'\\uploads\\'+uuid+'\\document.docx');
        // const parsedBuffer = await parser.parse(buffer);
        // console.log("parsed json html : ",parsedBuffer);
        res.status(200).sendFile(__dirname+'/uploads/'+uuid+'/document.docx');
    }catch(e){
        res.status(400).json("Unexpected error : "+e);
    }
})

app.listen((8085),()=>{
    console.log("Server is running on http://localhost:8085")
})