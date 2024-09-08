const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Simulate database
let signatureRequests = {};

// Route to handle signature creation
router.post('/create-signature', (req, res) => {
  const { surat, kepada } = req.body;
  const id = uuidv4();  // Generate unique ID for the request
  const kodeVerifikasi = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code

  // Store the request details in the simulated database
  signatureRequests[id] = { surat, kepada, kodeVerifikasi, status: 'pending' };

  // Send the verification link to the signer (for simplicity, return the link here)
  res.send(`
        <h1>Surat berhasil dibuat</h1>
        <p>Nomor Surat: ${id}</p>
        <p>Kode Verifikasi telah dikirim ke ${kepada}</p>
        <a href="/approve-signature/${id}">Link Persetujuan</a>
    `);
});

// Route to render approval page
router.get('/approve-signature/:id', (req, res) => {
  const id = req.params.id;
  const signatureRequest = signatureRequests[id];

  if (!signatureRequest) {
    return res.send('<h1>Surat tidak ditemukan</h1>');
  }

  // Send the approval page
  res.sendFile(path.join(__dirname, '..', 'views', 'approvalPage.html'));
});

// Route to handle signature approval
router.post('/verify-signature/:id', (req, res) => {
  const id = req.params.id;
  const { kodeVerifikasi } = req.body;

  const signatureRequest = signatureRequests[id];
  if (!signatureRequest) {
    return res.send('<h1>Surat tidak ditemukan</h1>');
  }

  if (signatureRequest.kodeVerifikasi === parseInt(kodeVerifikasi, 10)) {
    signatureRequest.status = 'approved';
    return res.sendFile(path.join(__dirname, '..', 'views', 'success.html'));
  } else {
    return res.send('<h1>Kode verifikasi salah, silakan coba lagi</h1>');
  }
});

module.exports = router;
