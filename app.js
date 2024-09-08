const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize the app
const app = express();
const port = 3000;

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving for HTML files
app.use(express.static('views'));

// Import signature routes
const signatureRoutes = require('./routes/signatureRoutes');

// Use the imported routes
app.use('/', signatureRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
