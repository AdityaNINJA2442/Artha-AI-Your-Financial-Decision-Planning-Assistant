# ARTHA AI — Personal Financial Operating System

> **Understand Your Money. Build Your Future.**  
> Built by **Aditya Prakash** • © 2026 Artha AI

---

## 🚀 How to Run (1-Click Startup for Windows)

If you received this project as a ZIP file:

1. **Unzip the folder** to your computer.
2. Double-click **`start_artha.bat`**.
3. It will automatically install dependencies and launch both servers:
   - **Frontend Application**: [http://localhost:5173](http://localhost:5173)
   - **Backend API & Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 💻 Manual Setup Instructions

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 1. Backend Setup (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## ⚡ Key Features Included
- **Dark Motion Fintech UI/UX**: Deep navy styling (`#050914`), electric blue accents (`#4169E1`), and champagne gold highlights (`#D7B56D`).
- **Salary Flow & Money Visualizer**: Income (₹1,00,000) → Needs (52%), Wants (20%), Future (28%).
- **Loans & EMI Suite (`/loans`)**: EMI calculator, amortization schedule, loan comparison, floating rate stress test (+1%, +2%, +3%), and interactive **Mark EMI as Paid** button.
- **Decision Engine (`/simulator`)**: "Can I Afford This?" purchase simulation, FutureView 10-year net worth trajectory, and Financial Shock Test.
- **Context-Aware AI Coach (`/coach`)**: Multi-stage intent detector executing real backend financial tools.
- **Financial Decision Journal (`/decisions`)**: Persistent historical log of all user affordability checks and loan evaluations.
