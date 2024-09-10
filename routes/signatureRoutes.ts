import { Request, Response } from "express";
import { getSockg } from "../baileysocket";
import express from "express"
const signatureRoutes = express.Router();
import * as fs from "fs"
import { v4 as uuidv4 } from "uuid"
import path from "path"
import moment from "moment"
import imoment from "moment-hijri"
import { generateReport } from "../services/report";
import { createDirectoryIfNotExists, saveFileWithUniqueName } from "../utils/fileutils";

// Simulate database
let signatureRequests: {
  [key: string]: {
    surat: string, kepada: string, kodeVerifikasi: number, status: "success" | "pending" | "approved", filepath : string 
  }
} = {};


// Route to handle signature creation
signatureRoutes.post('/create-signature', async (req: Request, res: Response) => {
  
  const { surat, kepada, no_wa } = req.body;
  const id = uuidv4();  // Generate unique ID for the request
  const kodeVerifikasi = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code

  console.log(req.body)
  // Store the request details in the simulated database
  signatureRequests[id] = { surat, kepada, kodeVerifikasi, status: 'pending', filepath : "suratKKP.docx" };

  // Send the verification link to the signer (for simplicity, return the link here)
  await getSockg()?.sendMessage("6281341477442@s.whatsapp.net", {
    text: `${surat}\nDikirim Kepada ${kepada}.\n\n\tBerikut adalah kode verifikasinya : ${kodeVerifikasi}.\nLink : http://localhost:5173/preview/${id}`
  })

  return res.json({
    message: "Berhasil",
    status: true,
    code: 200
  })
});






// Route to render approval page
signatureRoutes.get('/approve-signature/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const signatureRequest = signatureRequests[id];

  if (!signatureRequest) {
    return res.status(404).json({
      message :"Tidak Menemukan Surat",
      code : 404,
      status : false
    })
  }
  res.sendFile(path.join(__dirname, "..", "templates", signatureRequest.filepath || ""))
});

signatureRoutes.post("/reportGenerator", async (req: Request, res: Response): Promise<void> => {
  try {
    // Dapatkan template dan gambar
    const templatePath = path.resolve(__dirname, '../template/suratKKP.docx');
    const imagePath = path.resolve(__dirname, '../template/images.jpg');
    const templateBuffer = fs.readFileSync(templatePath);
    const imageBuffer = fs.readFileSync(imagePath);

    // Dapatkan tanggal sekarang dalam format Masehi dan Hijriyah
    const currentMasehiDate = moment().format('DD MMMM YYYY') + ' M'; // Contoh: "03 September 2024 M"
    const currentHijriyahDate = imoment().format('iD iMMMM iYYYY') + ' H'; // Contoh: "29 Shafar 1446 H"

    // Data dinamis dari request body
    const data = {
      no: req.body.no || '12345',
      nama: req.body.nama || 'John Doe',
      imageName: 'gambar.png', // Nama gambar yang digunakan di placeholder
      tanggal: moment().format('DD/MM/YYYY'), // Tanggal sekarang format umum
      tanggal_masehi: currentMasehiDate, // Tanggal Masehi
      tanggal_hijriyah: currentHijriyahDate, // Tanggal Hijriyah
      table_data: req.body.table_data || [], // Tabel data yang dikirim dari body
    };

    // Panggil service untuk generate report
    const reportBuffer = await generateReport(templateBuffer, imageBuffer, data);

    // Tentukan direktori penyimpanan
    const outputDir = path.resolve(__dirname, '../generated_reports');
    createDirectoryIfNotExists(outputDir);

    // Simpan file menggunakan fungsi dari fileUtils
    const outputFilePath = saveFileWithUniqueName(outputDir, reportBuffer, 'docx');

    // Kirimkan respon dengan link untuk download
    res.json({
      message: 'Report generated successfully',
      downloadLink: `/download/${path.basename(outputFilePath)}`,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).send('Internal Server Error');
  }
}
)

// Route to handle signature approval
signatureRoutes.post('/verify-signature/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const { kodeVerifikasi } = req.body;

  const signatureRequest = signatureRequests[id];
  if (!signatureRequest) {
    return res.status(404).json({
      message: "Tidak Menemukan Surat",
      code: 200,
      status: false
    })
  }

  if (signatureRequest.kodeVerifikasi === parseInt(kodeVerifikasi, 10)) {

    signatureRequest.status = 'approved';

    return res.json({
      data: signatureRequest,
      code: 200,
      message: "Berhasil Mendapatkan Surat"
    });
  } else {
    return res.status(400).json({
      status: false,
      code: 400,
      message: "Kode Verifikasi Salah"
    })
  }
});

export default signatureRoutes
