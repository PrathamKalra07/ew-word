const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path')
const { exec } = require('child_process');
// const Blob = require('fetch-blob');
const htmlDocx = require('html-docx-js')
// const {DocxyzParser } = require('docxyz')

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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

app.post('/upload',upload.single('file'),async (req,res)=>{
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

// app.post('/save/',async (req,res)=>{
//     const { default: Blob } = await import('fetch-blob');
//   const {html,uuid} = req.body;

//   if(!html || !uuid){
//     throw "Required Files Missing";
//   }

//   fs.writeFileSync(__dirname+'/uploads/'+uuid+'/document.html',html);
//   // const cmd = `soffice --headless --convert-to docx:"Office Open XML Text" "document.html" --outdir "./uploads/uuid"`;

//   //   exec(cmd, (err, stdout, stderr) => {
//   //     if (err) {
//   //       console.error('LibreOffice conversion error:', stderr);
//   //       return res.status(500).json({ error: 'DOCX conversion failed' });
//   //     }
//   try{
//     // const docxBlob = await htmlDocx.asBlob(html);

//     // Convert Blob to Buffer
//     // const arrayBuffer = await docxBlob.arrayBuffer();
//     // const buffer = Buffer.from(arrayBuffer);

//     // const docxPath = path.join(uploadDir, 'document.docx');

//     // Write Buffer to file
//     // fs.writeFileSync(, buffer);
// const simpleHtml = "<html><body><h1>Hello world</h1><p>This is a test.</p></body></html>";
// const docxBuffer = htmlDocx.asBuffer(simpleHtml);
// console.log("Test DOCX buffer length:", docxBuffer.length);
// // fs.writeFileSync(path.join(uploadDir, 'test.docx'), docxBuffer);


//     // const docxBuffer = htmlDocx.asBuffer(html);
//     fs.writeFileSync(`${__dirname}/uploads/${uuid}/document.docx`, docxBuffer);
//     res.status(200).json({ msg: 'DOCX saved', path: `/uploads/${uuid}/document.docx` });
    
//   }catch(e){
//     res.status(400).json({msg:'Failed : '+e});
//   } 
// })

app.post('/save', async (req, res) => {
  try {
    const { html, uuid } = req.body;

    if (!html || !uuid) {
      return res.status(400).json({ error: "Missing 'html' or 'uuid' in request body" });
    }

    const uploadDir = path.join(__dirname, 'uploads', uuid);
    if (!fs.existsSync(uploadDir)) {
      return res.status(400).json({ error: "Upload directory does not exist for provided uuid" });
    }

    const htmlPath = path.join(uploadDir, 'document.html');
    const odtPath = path.join(uploadDir, 'document.odt');
    const docxPath = path.join(uploadDir, 'document.docx');

    fs.writeFileSync(htmlPath, html, 'utf8');

    if (fs.existsSync(odtPath)) fs.unlinkSync(odtPath);
    if (fs.existsSync(docxPath)) fs.unlinkSync(docxPath);

    const convertHtmlToOdtCmd = `soffice --headless --convert-to odt --outdir "${uploadDir}" "${htmlPath}"`;

    exec(convertHtmlToOdtCmd, (error, stdout, stderr) => {
      console.log('HTML to ODT stdout:', stdout);
      console.log('HTML to ODT stderr:', stderr);

      if (error) {
        console.error('Error converting HTML to ODT:', error);
        return res.status(500).json({ error: 'HTML to ODT conversion failed', details: stderr });
      }

      if (!fs.existsSync(odtPath)) {
        return res.status(500).json({ error: 'ODT file not found after conversion' });
      }

      // Step 2: Convert ODT to DOCX
      const convertOdtToDocxCmd = `soffice --headless --convert-to docx --outdir "${uploadDir}" "${odtPath}"`;

      exec(convertOdtToDocxCmd, (error2, stdout2, stderr2) => {
        console.log('ODT to DOCX stdout:', stdout2);
        console.log('ODT to DOCX stderr:', stderr2);

        if (error2) {
          console.error('Error converting ODT to DOCX:', error2);
          return res.status(500).json({ error: 'ODT to DOCX conversion failed', details: stderr2 });
        }

        if (fs.existsSync(docxPath)) {
          return res.status(200).json({ msg: 'DOCX saved successfully', path: `/uploads/${uuid}/document.docx` });
        } else {
          return res.status(500).json({ error: 'DOCX file not found after conversion' });
        }
      });
    });
  } catch (err) {
    console.error('Unexpected error in /save:', err);
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

app.get('/getDocument/:uuid', async (req, res) => {
  const { uuid } = req.params;
  const filePath = path.join(__dirname, 'uploads', uuid, 'document.docx');

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    res.download(filePath, 'document.docx', (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).send('Failed to send file');
        }
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

app.listen((8085),()=>{
    console.log("Server is running on http://localhost:8085")
})