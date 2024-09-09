import { Request, Response } from "express";
import { getSockg } from "../baileysocket";

const express = require('express');
const signatureRoutes = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Simulate database
let signatureRequests : {
  [key : string] : {
    surat : string, kepada : string, kodeVerifikasi : number, status : "success" | "pending" | "approved"
  }
} = {};

// Route to handle signature creation
signatureRoutes.post('/create-signature', async(req : Request, res : Response) => {
  const { surat, kepada, no_hpdituju } = req.body;
  const id = uuidv4();  // Generate unique ID for the request
  const kodeVerifikasi = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code

  console.log(req.body)
  // Store the request details in the simulated database
  signatureRequests[id] = { surat, kepada, kodeVerifikasi, status: 'pending' };

  // Send the verification link to the signer (for simplicity, return the link here)
  await getSockg()?.sendMessage("6281341477442@s.whatsapp.net", {
    text : `Nomor Surat ${id}\nDikirim Kepada ${kepada}.\n\n\tBerikut adalah kode verifikasinya : ${kodeVerifikasi}`
  })


  return res.json({
    message :"Berhasil",
    status : true,
    code : 200
  })
});

// Route to render approval page
signatureRoutes.get('/approve-signature/:id', (req : Request, res : Response) => {
  const id = req.params.id;
  const signatureRequest = signatureRequests[id];

  if (!signatureRequest) {
    return res.send('<h1>Surat tidak ditemukan</h1>');
  }

  // Send the approval page
  res.sendFile(path.join(__dirname, '..', 'views', 'approvalPage.html'));
});

// Route to handle signature approval
signatureRoutes.post('/verify-signature/:id', (req : Request, res : Response) => {
  const id = req.params.id;
  const { kodeVerifikasi } = req.body;

  const signatureRequest = signatureRequests[id];
  if (!signatureRequest) {
    return res.status(404).json({
      message : "Tidak Menemukan Surat",
      code : 200,
      status : false
    })
  }

  if(signatureRequest.kodeVerifikasi === parseInt(kodeVerifikasi, 10)) {
    
    signatureRequest.status = 'approved';

    return res.json({
      data : signatureRequest,
      code : 200,
      message : "Berhasil Mendapatkan Surat"
    });
  } else {
    return res.status(400).json({
      status : false,
      code : 400,
      message :"Kode Verifikasi Salah"
    })
  }
});

export default signatureRoutes
