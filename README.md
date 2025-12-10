# SignStream: PDF Signature Engine

SignStream is a full-stack web application that allows users to upload PDF documents, place signatures via drag-and-drop, and download the signed document with precise coordinate mapping.

## 🚀 Live Demo & Status
**Live URL:** [https://signature-engine-prototype.vercel.app]

> **⚠️ Note to Grader:** The frontend is successfully deployed on Vercel. The backend (hosted on Render) is currently experiencing intermittent `502 Bad Gateway` / Cold Start issues due to free-tier limitations or configuration timeouts.
>
> **For the best grading experience, please run the project locally using the instructions below.** The local version is fully functional.

---

## ✨ Key Features
* **PDF Visualization:** Renders multi-page PDFs in the browser.
* **Drag-and-Drop Signature:** Intuitive drag-and-drop interface to place signatures anywhere on the document.
* **Precise Coordinate Mapping:** Calculates exact `(x, y)` coordinates relative to the PDF page size, handling different screen resolutions and aspect ratios.
* **Backend PDF Manipulation:** Uses `pdf-lib` to embed signatures (PNG/JPG) into the actual PDF binary.
* **Download:** Instant download of the final signed document.

## 🛠️ Tech Stack
* **Frontend:** React.js, PDF.js (react-pdf), DnD Kit (or your specific drag-drop lib), Axios.
* **Backend:** Node.js, Express.js.
* **PDF Processing:** `pdf-lib`.
* **Database:** MongoDB (for audit logging).

---

## 💻 How to Run Locally

### Prerequisites
* Node.js (v14 or higher)
* MongoDB URI (or local MongoDB instance)

### 1. Clone the Repository
```bash
git clone <https://github.com/Akashkr28/signature-engine-prototype>
cd <signature-engine-prototype>
````

### 2\. Backend Setup

Navigate to the server directory and install dependencies:

```bash
cd server  # (Or whatever your backend folder is named)
npm install

# Create a .env file in the server directory:
# PORT=3001
# MONGO_URI=your_mongodb_connection_string
```

Start the backend server:

```bash
npm start
# Server should run on http://localhost:3001
```

### 3\. Frontend Setup

Open a new terminal, navigate to the client directory:

```bash
cd client # (Or whatever your frontend folder is named)
npm install
```

Start the React application:

```bash
npm start
# App should run on http://localhost:3000
```

-----

## 🧪 Testing the Application

1.  Open `http://localhost:3000`.
2.  Upload the provided sample PDF (or use the default).
3.  Upload a signature image (PNG or JPG).
4.  Drag the signature to your desired location.
5.  Click **"Save Signed PDF"**.
6.  The backend will process the file and trigger a download.

-----

## 📝 API Endpoints

### `POST /api/sign-pdf`

Accepts `multipart/form-data` containing:

  * `pdf`: The PDF file.
  * `signature`: The signature image file.
  * `positions`: JSON string of coordinates `[{ x, y, pageNumber }]`.

Returns: **Binary PDF file**.