# Customer Churn Prediction & Retention System

This is the entire source code for the **Telecommunication Customer Churn Prediction System** Final Year Project. 
The system features a **React** frontend connected to a **Flask** REST API backend, utilizing **LightGBM** and **XGBoost** for intelligent churn prediction.

## Project Structure
```
customer-churn-project/
├── notebooks/          # Data exploration, preprocessing, and model training (Phase 1)
├── backend/            # Flask REST API containing SQLAlchemy models and endpoints (Phase 2)
├── frontend/           # React + Vite UI codebase with glassmorphism design (Phase 3)
├── data/               # IBM Telco Customer Churn Kaggle Dataset
├── build_backend.py    # Generates backend codebase (Used during scaffolding)
├── generate_notebooks.py # Scaffolds Jupyter notebooks (Used during scaffolding)
└── requirements.txt    # Python PIP dependencies
```

---

## 1. Setup & Installation (Backend)

The backend natively relies on Flask, SQLAlchemy, and standard ML libraries.

1. **Install Python via the Official Installer!** *(Make sure Python 3.8+ is installed rather than the Windows Store execution alias)*
2. Open a terminal in the `backend/` directory or run `pip` on the global project file:
   ```bash
   pip install -r requirements.txt
   ```
3. Boot the Flask Application:
   ```bash
   cd backend
   python app.py
   ```
   *The server will boot locally at `http://localhost:5000` and automatically create the `customer_churn.db` SQLite database using the built-in Object Relational Mapper.*

---

## 2. Setup & Installation (Frontend)

The modern glassmorphic dashboard powers the UI layer using Vite + React.

1. **Install Node.js** (LTS version recommended).
2. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
3. Run the Development Server:
   ```bash
   npm run dev
   ```
   *The application will boot at `http://localhost:5173`.*

---

## 3. Jupyter Notebooks Overview (Data Science Layer)

All experimentation logic to be presented to the supervisor/examiner exists under `notebooks/`. It is best viewed through **Jupyter Lab** or **VS Code**:

- `01_data_exploration.ipynb`: Explores distributions and detects basic missing values.
- `02_data_preprocessing.ipynb`: Normalization, Handling nulls, Label/One-Hot encoding.
- `03_feature_engineering.ipynb`: Feature isolation & train-test stratified splitting.
- `04_model_training.ipynb`: Initializes and dumps LightGBM and XGBoost classifier binaries to the `/backend/ml/` folder for production inference.
- `05_model_evaluation.ipynb`: ROC-AUC analysis, F1, Precision matrices.
- `06_retention_strategies.ipynb`: The rule-based engine mapping logic to Churn probability thresholds.

> **Note:** If you edit the models in the notebooks, re-run `joblib.dump` to ensure the production `backend` API consumes the latest algorithmic thresholds!
