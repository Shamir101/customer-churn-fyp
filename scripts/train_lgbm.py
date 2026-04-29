"""Fast model trainer — LightGBM only."""
import pandas as pd
from sklearn.model_selection import train_test_split
from lightgbm import LGBMClassifier
import joblib, json, os, sys

DATA  = os.path.join(os.path.dirname(__file__), '..', 'data', 'Telco-Customer-Churn.csv')
OUT   = os.path.join(os.path.dirname(__file__), '..', 'backend', 'ml')
os.makedirs(OUT, exist_ok=True)

print("Loading data...")
df = pd.read_csv(DATA)
df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
df.dropna(subset=['TotalCharges'], inplace=True)
df['Churn'] = (df['Churn'] == 'Yes').astype(int)
df.drop(columns=['customerID'], inplace=True)
df = pd.get_dummies(df, drop_first=True)

X = df.drop('Churn', axis=1)
y = df['Churn']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

print(f"Training LightGBM on {len(X_train)} rows, {len(X.columns)} features...")
m = LGBMClassifier(random_state=42, n_estimators=100, verbose=-1)
m.fit(X_train, y_train)
acc = m.score(X_test, y_test)
print(f"Accuracy: {acc*100:.2f}%")

joblib.dump(m, os.path.join(OUT, 'lgbm_model.pkl'))
with open(os.path.join(OUT, 'feature_columns.json'), 'w') as f:
    json.dump(list(X.columns), f)

print("Done! Model saved to backend/ml/lgbm_model.pkl")
print("Features saved to backend/ml/feature_columns.json")
