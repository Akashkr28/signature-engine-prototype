# SignStream: Full-Stack PDF Signature Engine

  

**SignStream** is a MERN stack application I built to handle digital signatures on PDF documents. It allows users to upload a file, drag a signature to a specific spot, and save a signed copy.

The main goal of this project was to solve the problem of mapping coordinates from a web browser (HTML/CSS) to a PDF file structure, which uses a different coordinate system.

-----

## 🚀 Live Demo

**Frontend:** [https://signature-engine-prototype.vercel.app](https:/signature-engin-git-146b1c-akash-kumar-singhs-projects-fcf110d0.vercel.app)
**Backend:** [https://signstream-backend.onrender.com](https://www.google.com/search?q=https://signstream-backend.onrender.com)

-----

## ✨ Features

### **Frontend**

  * **PDF Viewer:** I used `react-pdf` to render the pages since HTML browsers can't display raw PDF data natively in a customizable way.
  * **Pagination:** Added Next/Previous buttons to handle multi-page documents.
  * **Drag-and-Drop:**
      * Used `react-draggable` to let users place the signature box.
      * **Responsive Logic:** Instead of saving the X/Y position in pixels (which breaks on mobile), I calculate the position as a **percentage** of the container width. This keeps the signature in the right relative spot on any screen size.
  * **Staging:** Users can place signatures on multiple pages (e.g., Page 1 and Page 5) in one session.

### **Backend**

  * **PDF Modification:** I used `pdf-lib` to open the file buffer and inject the PNG image.
  * **Coordinate Conversion:**
      * Browsers count $(0,0)$ from the **Top-Left**.
      * PDFs count $(0,0)$ from the **Bottom-Left**.
      * I wrote a function to invert the Y-axis so the signature appears exactly where the user dropped it.
  * **Batch Processing:** The backend accepts an array of positions and loops through them to sign multiple pages at once.

### **Database & Security**

  * **Audit Logs:** Every time a file is signed, I save a log in MongoDB.
  * **Hashing:** I use Node's `crypto` module to create a SHA-256 hash of the original and signed files. This proves that the document hasn't been tampered with.

-----

## 🛠️ Tech Stack

  * **Frontend:** React, Vite
  * **Backend:** Node.js, Express
  * **Libraries:** pdf-lib, react-pdf, react-draggable
  * **Database:** MongoDB (Atlas)

-----

## 📐 How the Coordinates Work

The hardest part of this project was getting the signature to land in the right spot.

1.  **Frontend:** I convert the pixel position to a percentage:
    $$X_{\text{percent}} = \frac{X_{\text{pixels}}}{\text{ContainerWidth}}$$

2.  **Backend:** I convert that percentage back to PDF "Points" (1/72 inch) and flip the Y-axis:
    $$Y_{\text{pdf}} = \text{PageHeight} - (Y_{\text{percent}} \times \text{PageHeight}) - \text{ImageHeight}$$

-----

## 🏃‍♂️ How to Run Locally

### 1\. Clone the Repo

```bash
git clone https://github.com/your-username/signature-engine-prototype.git
cd signature-engine-prototype
```

### 2\. Setup Backend

```bash
cd server
npm install
# Create a .env file and add your MongoDB connection string:
# MONGO_URI=mongodb+srv://...
node index.js
```

### 3\. Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

-----

**Built by Akash Kumar Singh**
