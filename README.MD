# Digital Signature Application

This project is a basic digital signature application built using **Express.js** for backend services. The application allows users to create a digital document, request a signature, and send a verification code or link to the signer. The signer can then approve the document by entering the verification code on a dedicated page.

## Features

- **Create Digital Document**: Users can create a document that requires a digital signature.
- **Unique Verification Code**: Each signature request generates a unique 4-digit verification code.
- **Approval via Link**: Signers can approve the document by entering the verification code.
- **HTML Pages for Approval**: A clean HTML page for signers to enter the verification code.

## Installation

### Prerequisites

Make sure you have Node.js installed on your machine. You can download it [here](https://nodejs.org/).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/devnolife/digital-signature-app.git
   ```

2. Navigate into the project directory:

   ```bash
   cd digital-signature-app
   ```

3. Install dependencies:

   ```bash
   npm install express body-parser uuid
   ```

4. Start the server:

   ```bash
   node app.js
   ```

5. Open your browser and visit:
   ```bash
   http://localhost:3000
   ```

### Additional Installed Packages

- **Express.js**: Web framework for Node.js.
- **Body-parser**: Middleware to parse incoming request bodies.
- **UUID**: Package to generate unique identifiers for each signature request.

These can be installed using:

```bash
npm install express body-parser uuid
```

## Usage

### Create a Signature Request

Send a **POST** request to `/create-signature` with the following parameters:

- `surat`: The type of document (e.g., "Surat Izin").
- `kepada`: The person who will sign the document (e.g., "Dosen").

For example, using `curl`:

```bash
curl -X POST http://localhost:3000/create-signature \
  -d "surat=Surat Izin" \
  -d "kepada=Dosen"
```

The system will generate a document and provide a link for the signer to approve the signature.

### Approve the Signature

1. The signer receives a link (e.g., `http://localhost:3000/approve-signature/{id}`) and enters the verification code on the page.
2. The signer inputs the 4-digit verification code on the approval page.
3. If the code is correct, the document is successfully signed.

### Project Structure

```
.
├── app.js                   # Main server file
├── routes
│   └── signatureRoutes.js    # Signature-related routes
└── views
    ├── approvalPage.html     # HTML page for signer to input verification code
    └── success.html          # HTML page shown after successful approval
```

### Available Routes

1. **POST `/create-signature`**  
   Creates a new signature request. Takes in `surat` (document type) and `kepada` (signer).

2. **GET `/approve-signature/:id`**  
   Displays the approval page where the signer can input their verification code.

3. **POST `/verify-signature/:id`**  
   Verifies the code and confirms the signature.

### Sample Workflow

1. User creates a signature request via `/create-signature`.
2. System generates a verification link and sends it to the signer.
3. The signer clicks the link, enters the verification code, and approves the document.

## Future Improvements

- Implement database storage for signature requests.
- Add user authentication for both the document creator and signer.
- Implement a more secure verification system (e.g., OTP via email or SMS).
- Add more detailed error handling.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
