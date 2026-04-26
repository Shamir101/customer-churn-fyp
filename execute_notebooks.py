import nbformat
from nbconvert.preprocessors import ExecutePreprocessor
import os

notebooks = [
    '01_data_exploration.ipynb',
    '02_data_preprocessing.ipynb',
    '03_feature_engineering.ipynb',
    '04_model_training.ipynb',
    '05_model_evaluation.ipynb',
    '06_retention_strategies.ipynb'
]

ep = ExecutePreprocessor(timeout=600, kernel_name='python3')

for nb_name in notebooks:
    print(f"Executing {nb_name}...")
    nb_path = os.path.join('notebooks', nb_name)
    with open(nb_path, 'r', encoding='utf-8') as f:
        nb = nbformat.read(f, as_version=4)
        
    ep.preprocess(nb, {'metadata': {'path': 'notebooks/'}})
    
    with open(nb_path, 'w', encoding='utf-8') as f:
        nbformat.write(nb, f)
        
print("All notebooks executed successfully.")
