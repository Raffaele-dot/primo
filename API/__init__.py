from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import os

app = Flask(__name__, static_folder='../static')

# Load the Excel data
df = pd.read_excel(os.path.join(os.path.dirname(__file__), '../data.xlsx'))

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/columns', methods=['GET'])
def get_columns():
    columns = df.columns.tolist()
    return jsonify(columns)

@app.route('/api/filter', methods=['GET'])
def filter_data():
    filters = request.args
    filtered_df = df.copy()
    for key, value in filters.items():
        if value:
            filtered_df = filtered_df[filtered_df[key] == value]
    data = filtered_df.to_dict(orient='records')
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
