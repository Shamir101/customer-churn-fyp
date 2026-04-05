import json
import os

def create_notebook(filename, cells):
    nb = {
        "cells": [],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.8"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    
    for cell_type, source in cells:
        # Strip trailing newlines just to be safe and split
        lines = source.split("\n")
        # Add newlines back except for the last line
        source_lines = [line + "\n" for line in lines[:-1]] + ([lines[-1]] if lines else [])
        
        cell = {
            "cell_type": cell_type,
            "metadata": {},
            "source": source_lines
        }
        if cell_type == "code":
            cell["outputs"] = []
            cell["execution_count"] = None
        nb["cells"].append(cell)
        
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)

# ==========================================
# 01_data_exploration.ipynb
# ==========================================
cells_01 = [
    ("markdown", "# 1. Data Exploration\nThis notebook covers the Exploratory Data Analysis (EDA) of the Telco Customer Churn dataset."),
    ("code", "import pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\npd.set_option('display.max_columns', None)\n\n# Load Data\ndf = pd.read_csv('../data/Telco-Customer-Churn.csv')\nprint(f'Dataset Shape: {df.shape}')\ndf.head()"),
    ("markdown", "## Basic Information & Missing Values"),
    ("code", "df.info()"),
    ("markdown", "Notice that `TotalCharges` is an object type, but it should be numeric. We also need to check for missing values."),
    ("code", "# Convert TotalCharges to numeric, coercing errors to NaN\ndf['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')\n\n# Check for nulls\ndf.isnull().sum()"),
    ("markdown", "## Churn Distribution"),
    ("code", "sns.countplot(data=df, x='Churn')\nplt.title('Churn Distribution')\nplt.show()")
]

# ==========================================
# 02_data_preprocessing.ipynb
# ==========================================
cells_02 = [
    ("markdown", "# 2. Data Preprocessing\nThis notebook covers handling missing values, encoding categorical variables, and scaling numerical features based directly on the \"Preprocess\" sequence diagram."),
    ("code", "import pandas as pd\nfrom sklearn.preprocessing import StandardScaler, LabelEncoder\n\ndf = pd.read_csv('../data/Telco-Customer-Churn.csv')\ndf['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')"),
    ("markdown", "## Handle Missing Values and Drop ID"),
    ("code", "df.dropna(subset=['TotalCharges'], inplace=True)\ndf.drop('customerID', axis=1, inplace=True)"),
    ("markdown", "## Encode Categorical Features"),
    ("code", "target = 'Churn'\ncategorical_cols = df.select_dtypes(include=['object']).columns\n\n# Label Encoding for Target\nle = LabelEncoder()\ndf['Churn'] = le.fit_transform(df['Churn'])\n\n# One-Hot Encoding for the rest\ndf = pd.get_dummies(df, columns=[c for c in categorical_cols if c != 'Churn'], drop_first=True)"),
    ("markdown", "## Normalize / Scale Features"),
    ("code", "scaler = StandardScaler()\nnumerical_cols = ['tenure', 'MonthlyCharges', 'TotalCharges']\ndf[numerical_cols] = scaler.fit_transform(df[numerical_cols])\n\ndf.head()"),
    ("code", "df.to_csv('../data/processed_dataset.csv', index=False)\nprint('Saved processed dataset to ../data/processed_dataset.csv')")
]

# ==========================================
# 03_feature_engineering.ipynb
# ==========================================
cells_03 = [
    ("markdown", "# 3. Feature Engineering & Selection\nSelecting the best features and splitting the dataset for training."),
    ("code", "import pandas as pd\nfrom sklearn.model_selection import train_test_split\n\ndf = pd.read_csv('../data/processed_dataset.csv')\n\nX = df.drop('Churn', axis=1)\ny = df['Churn']\n\n# 80/20 Stratified Split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)\n\nprint(f'Training shape: {X_train.shape}')\nprint(f'Testing shape: {X_test.shape}')")
]

# ==========================================
# 04_model_training.ipynb
# ==========================================
cells_04 = [
    ("markdown", "# 4. Model Training\nTraining LightGBM and XGBoost as per the 'Train Model' sequence diagram."),
    ("code", "import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom lightgbm import LGBMClassifier\nfrom xgboost import XGBClassifier\nimport joblib\nimport os\n\ndf = pd.read_csv('../data/processed_dataset.csv')\nX = df.drop('Churn', axis=1)\ny = df['Churn']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)\n\nprint('Initializing LightGBM and XGBoost...')"),
    ("code", "lgbm = LGBMClassifier(random_state=42)\nlgbm.fit(X_train, y_train)\n\nxgb = XGBClassifier(random_state=42, eval_metric='logloss')\nxgb.fit(X_train, y_train)\n\nprint('Models trained successfully.')"),
    ("code", "os.makedirs('../backend/ml', exist_ok=True)\njoblib.dump(lgbm, '../backend/ml/lgbm_model.pkl')\njoblib.dump(xgb, '../backend/ml/xgb_model.pkl')\nprint('Models saved to disk.')")
]

# ==========================================
# 05_model_evaluation.ipynb
# ==========================================
cells_05 = [
    ("markdown", "# 5. Model Evaluation\nEvaluating the models with Precision, Recall, F1, and ROC-AUC. Selecting the best model."),
    ("code", "import pandas as pd\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.metrics import classification_report, accuracy_score, roc_auc_score, confusion_matrix\nimport joblib\n\ndf = pd.read_csv('../data/processed_dataset.csv')\nX = df.drop('Churn', axis=1)\ny = df['Churn']\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)\n\nlgbm = joblib.load('../backend/ml/lgbm_model.pkl')\nxgb = joblib.load('../backend/ml/xgb_model.pkl')"),
    ("markdown", "## Evaluate LightGBM"),
    ("code", "y_pred_lgbm = lgbm.predict(X_test)\ny_proba_lgbm = lgbm.predict_proba(X_test)[:, 1]\n\nprint(\"LightGBM Accuracy:\", accuracy_score(y_test, y_pred_lgbm))\nprint(\"LightGBM AUC:\", roc_auc_score(y_test, y_proba_lgbm))\nprint(classification_report(y_test, y_pred_lgbm))"),
    ("markdown", "## Evaluate XGBoost"),
    ("code", "y_pred_xgb = xgb.predict(X_test)\ny_proba_xgb = xgb.predict_proba(X_test)[:, 1]\n\nprint(\"XGBoost Accuracy:\", accuracy_score(y_test, y_pred_xgb))\nprint(\"XGBoost AUC:\", roc_auc_score(y_test, y_proba_xgb))\nprint(classification_report(y_test, y_pred_xgb))"),
    ("markdown", "## Best Model Selection\nSince LightGBM typically offers similar accuracy but faster training, we can select LightGBM as our primary model for the application backend.")
]

# ==========================================
# 06_retention_strategies.ipynb
# ==========================================
cells_06 = [
    ("markdown", "# 6. Retention Strategies\nDemonstrating the rule-based logic applied post-prediction to assign risk levels and retention recommendations."),
    ("code", "import pandas as pd\nimport joblib\nimport numpy as np\n\ndf = pd.read_csv('../data/processed_dataset.csv')\nX = df.drop('Churn', axis=1)\ny = df['Churn']\n\nmodel = joblib.load('../backend/ml/lgbm_model.pkl')\nprobabilities = model.predict_proba(X)[:, 1]\n\nresults_df = pd.DataFrame({'Churn_Prob': probabilities, 'Actual_Churn': y})"),
    ("markdown", "## Risk Classification\nBased on the thresholds: Low (<0.3), Medium (0.3-0.7), High (>0.7)"),
    ("code", "def classify_risk(prob):\n    if prob > 0.7: return 'High'\n    elif prob > 0.3: return 'Medium'\n    else: return 'Low'\n\ndef recommend_strategy(risk):\n    if risk == 'High':\n        return 'Immediate personal outreach, exclusive discount, loyalty program'\n    elif risk == 'Medium':\n        return 'Targeted email campaign, plan upgrade offer'\n    else:\n        return 'Regular engagement, satisfaction survey'\n\nresults_df['Risk_Level'] = results_df['Churn_Prob'].apply(classify_risk)\nresults_df['Recommendation'] = results_df['Risk_Level'].apply(recommend_strategy)\n\nresults_df.head(10)")
]

if __name__ == "__main__":
    create_notebook("notebooks/01_data_exploration.ipynb", cells_01)
    create_notebook("notebooks/02_data_preprocessing.ipynb", cells_02)
    create_notebook("notebooks/03_feature_engineering.ipynb", cells_03)
    create_notebook("notebooks/04_model_training.ipynb", cells_04)
    create_notebook("notebooks/05_model_evaluation.ipynb", cells_05)
    create_notebook("notebooks/06_retention_strategies.ipynb", cells_06)
    print("All 6 Notebooks created successfully in notebooks/ folder.")
