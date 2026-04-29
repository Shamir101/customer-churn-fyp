"""
Generates lgbm_model.pkl and xgb_model.pkl from the Telco dataset.
Run from the project root: python train_model.py
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from lightgbm import LGBMClassifier
from xgboost import XGBClassifier
import joblib, os

DATA_PATH  = os.path.join(os.path.dirname(__file__), '..', 'data', 'Telco-Customer-Churn.csv')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'ml')
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

# Clean TotalCharges
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df.dropna(subset=['TotalCharges'], inplace=True)
df.reset_index(drop=True, inplace=True)

# Encode target
df['Churn'] = (df['Churn'] == 'Yes').astype(int)

# Drop customerID
df.drop(columns=['customerID'], inplace=True)

# One-hot encode categoricals
df = pd.get_dummies(df, drop_first=True)

X = df.drop('Churn', axis=1)
y = df['Churn']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

print(f"Training on {len(X_train)} samples, testing on {len(X_test)} samples...")
print(f"Features: {list(X.columns)}")

# LightGBM
print("\nTraining LightGBM...")
lgbm = LGBMClassifier(random_state=42)
lgbm.fit(X_train, y_train)
lgbm_acc = lgbm.score(X_test, y_test)
print(f"LightGBM Accuracy: {lgbm_acc:.4f}")
joblib.dump(lgbm, os.path.join(OUTPUT_DIR, 'lgbm_model.pkl'))
print(f"Saved: {os.path.join(OUTPUT_DIR, 'lgbm_model.pkl')}")

# Save column order for inference alignment
import json
col_file = os.path.join(OUTPUT_DIR, 'feature_columns.json')
with open(col_file, 'w') as f:
    json.dump(list(X.columns), f)
print(f"Saved feature columns: {col_file}")

# XGBoost
print("\nTraining XGBoost...")
xgb = XGBClassifier(random_state=42, eval_metric='logloss', verbosity=0)
xgb.fit(X_train, y_train)
xgb_acc = xgb.score(X_test, y_test)
print(f"XGBoost Accuracy: {xgb_acc:.4f}")
joblib.dump(xgb, os.path.join(OUTPUT_DIR, 'xgb_model.pkl'))
print(f"Saved: {os.path.join(OUTPUT_DIR, 'xgb_model.pkl')}")

print("\n✅ Model training complete!")
print(f"   LightGBM: {lgbm_acc*100:.2f}%")
print(f"   XGBoost:  {xgb_acc*100:.2f}%")
