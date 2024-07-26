from flask import Flask, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__, static_folder='../static')

# Load Excel data
df = pd.read_excel('data.xlsx')

# Endpoint to get columns
@app.route('/api/columns', methods=['GET'])
def get_columns():
    columns = df.columns.tolist()
    return jsonify(columns)

# Endpoint to get entire data
@app.route('/api/data', methods=['GET'])
def get_data():
    data = df.replace({pd.NA: None}).to_dict(orient='records')
    return jsonify(data)

# Serve index.html
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve other static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True)
