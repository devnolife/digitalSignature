import express from "express"
import bodyParser from "body-parser";
import signatureRoutes from "./routes/signatureRoutes";
import { connectToWhatsApp } from "./baileysocket";

connectToWhatsApp()

// Initialize the app
const app = express();
const port = 3000;

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));

// Static file serving for HTML files
app.use(express.static('views'));

app.use(express.json())

// Import signature routes

// Use the imported routes
app.use('/', signatureRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

