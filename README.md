# Smart ERP - College ERP with Facial Emotion Detection

Smart ERP is a modern, comprehensive college ERP system featuring camera-based student wellness monitoring, automated attendance tracking via Teachable Machine models, real-time proctoring for online exams, and an AI Counselor. 

The application is structured into four main components:
1. **Backend (Node.js/Express & SQLite):** Manages users, departments, courses, attendance, grades, fees, exams, and AI queries.
2. **Frontend (React, Vite, & Tailwind CSS / Vanilla CSS):** Interactive dashboard for Admins, Faculty, and Students.
3. **Emotion Recognition API (Python & Flask):** A local Flask server that utilizes a Convolutional Neural Network (CNN) trained on the FER2013 dataset to classify face emotion features locally.
4. **NeuroTrack AI (Streamlit):** A standalone classroom energy and emotion intelligence dashboard.

---

## 🛠 Prerequisites

Ensure you have the following installed on your system:
* **Node.js** (v16 or higher)
* **npm** (comes packaged with Node.js)
* **Python** (v3.8 to v3.11 recommended for TensorFlow compatibility)
* **Git**

---

## 🚀 Getting Started

Follow the steps below to configure, initialize, and start each part of the project.

### 1. Backend Setup

The backend serves the API endpoints and connects to the SQLite database.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory and configure the environment variables:
   ```env
   PORT=5000
   JWT_SECRET=supersecret_key_for_jwt_tokens
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Initialize and seed the SQLite database:
   ```bash
   node init-sqlite.js
   ```
   *This command creates the database tables defined in `backend/models/schema.sql` and populates the database (`database.sqlite`) with default admin, faculty, subjects, and mock students.*

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend server will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

The frontend is a React application built with Vite.

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`. Vite will automatically proxy API calls starting with `/api` to the backend running at `http://localhost:5000`.*

#### 🔑 Login Credentials (Default Seed)
Use these credentials to log in to the ERP:
* **Admin:** `admin@erp.com` / `admin123`
* **Faculty:** `prof.sharma@erp.com` / `faculty123`
* **Student:** `ritu.patel@erp.com` / `student123` (PRN: `PRN000`)

---

### 3. Local Emotion Recognition API Setup

The Flask API classifies facial emotions from captured images locally to support the AI Chatbot's mood-reading features.

1. Navigate to the `emotion/` directory:
   ```bash
   cd ../emotion
   ```
2. Create and activate a Python virtual environment:
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS/Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install the required Python packages:
   ```bash
   pip install flask flask-cors opencv-python tensorflow keras numpy pillow
   ```
4. Start the local Flask server:
   ```bash
   python app.py
   ```
   *The server runs locally on `http://127.0.0.1:5001`. The Node.js backend automatically communicates with this server to perform local facial analysis.*

---

### 4. NeuroTrack AI (Streamlit Dashboard) Setup

NeuroTrack AI is a standalone interface for monitoring classroom energy levels and student emotional statuses.

1. Navigate to the `NeuroTrack-AI-Prathamesh/` directory:
   ```bash
   cd ../NeuroTrack-AI-Prathamesh
   ```
2. Activate your virtual environment and install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the Streamlit application:
   ```bash
   streamlit run app.py
   ```
   *The Streamlit web page will open automatically in your browser (typically on `http://localhost:8501`).*

---

## 📂 Project Structure & Key Files

* `backend/`
  * `config/db.js` - SQLite connection configuration.
  * `init-sqlite.js` - Database initialization and seeding script.
  * `server.js` - Entry point for the Express API.
  * `routes/` - Individual routes including the AI chatbot with local model fallbacks (`routes/ai.js`).
* `frontend/`
  * `vite.config.js` - Contains the server proxy redirecting `/api` requests.
  * `src/components/AIChatbot.jsx` - Face-expression reading chatbot.
  * `src/pages/student/StressDetection.jsx` - Emotion fusion user interface.
* `emotion/`
  * `app.py` - Flask server endpoints.
  * `top_models/` - Local Keras facial emotion recognition weights (`fer.h5`).
* `NeuroTrack-AI-Prathamesh/`
  * `app.py` - Streamlit application dashboard interface.
