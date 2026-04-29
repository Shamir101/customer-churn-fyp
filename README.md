# ChurnSense: ML-Based Customer Churn Prediction System

![ChurnSense](https://img.shields.io/badge/Status-Complete-success) ![Python](https://img.shields.io/badge/Python-3.14-blue) ![Flask](https://img.shields.io/badge/Flask-2.3.3-black) ![LightGBM](https://img.shields.io/badge/LightGBM-4.1.0-orange)

ChurnSense is a full-stack, machine learning-powered application designed to predict telecom customer churn. It serves as a Final Year Project (FYP) submission, bridging the gap between raw data science models and accessible business tools.

## 🌟 Key Features

- **Machine Learning Engine**: Built on the IBM Telco Customer Churn dataset utilizing a highly optimized **LightGBM** classifier for fast and accurate real-time inference.
- **Glassmorphism UI**: A beautifully crafted, modern frontend using pure HTML, CSS, and vanilla JavaScript (served via Jinja2 templates).
- **Interactive Dashboards & Graphing**: Extensive use of Chart.js to render beautiful Risk Gauges, Radial Customer Profiles, and Interactive Batch Prediction Dashboards.
- **Secure Authentication**: Custom user registration and login system utilizing JSON Web Tokens (JWT) for secure session management.
- **Risk Classification & Retention Strategies**: Not only predicts if a customer will churn but classifies them into Risk Tiers (High, Medium, Low) and suggests actionable retention strategies.
- **Batch Processing & Data Integrity**: Run predictions simultaneously on thousands of customers with a dedicated dashboard. Built-in **Strict Schema Validation** ensures that unrecognized CSVs are cleanly rejected to maintain application stability.

## 🏗️ Architecture

- **Frontend**: HTML5, CSS3 (Glassmorphism design), Vanilla JS, Chart.js for analytics.
- **Backend API**: Python, Flask (RESTful architecture).
- **Database**: SQLite3 (Using raw SQL queries without ORMs for maximal performance and simplicity).
- **Data Science**: Pandas, Scikit-Learn, LightGBM.

## 🚀 How to Run the Project

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Ensure you have Python 3.10+ installed on your system.

### 2. Installation
Open a terminal in the root directory of the project and navigate to the backend folder to install the required Python packages.

```bash
cd backend
pip install -r requirements.txt
```

### 3. Run the Flask Server
Start the backend server. The SQLite database (`churnsense.db`) will automatically initialize if it does not exist.

```bash
python app.py
```

### 4. Access the Application
Once the server is running, open your web browser and navigate to:
**http://127.0.0.1:5000**

---

## 🧠 Model Training (Optional)

The pre-trained production model (`lgbm_model.pkl`) is already located in `backend/ml/`. However, if you wish to retrain the model from scratch using the raw dataset:

1. Open a terminal in the root directory.
2. Run the training script:
   ```bash
   python scripts/train_lgbm.py
   ```
3. The script will train the model, evaluate the accuracy, and automatically save the new `.pkl` and `feature_columns.json` files to the `backend/ml/` folder.

## 📁 Directory Structure

```text
ChurnSense-Final/
├── backend/                  # Flask backend and UI serving layer
│   ├── app.py                # Main Flask application entry point
│   ├── database.py           # SQLite connection and initialization logic
│   ├── ml/                   # Serialized ML models and feature column definitions
│   ├── routes/               # API endpoints (Auth, Prediction, Data, etc.)
│   ├── static/               # CSS styles and JavaScript (api.js)
│   └── templates/            # HTML Jinja2 templates (The User Interface)
├── data/                     # Raw datasets (e.g., Telco-Customer-Churn.csv)
├── notebooks/                # Jupyter Notebooks for EDA, Preprocessing, and Evaluation
├── scripts/                  # Standalone Python scripts for training models
├── requirements.txt          # Python dependency list
└── README.md                 # You are here!
```
