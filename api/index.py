from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
import os

app = Flask(__name__, static_folder='../static')

# Load Excel data
df = pd.read_excel('data.xlsx')

# Endpoint to get columns
@app.route('/api/columns', methods=['GET'])
def get_columns():
    columns = df.columns.tolist()
    return jsonify(columns)

# Endpoint to get unique values for a column
@app.route('/api/column_values', methods=['GET'])
def get_column_values():
    column = request.args.get('column')
    if column in df.columns:
        values = df[column].dropna().unique().tolist()
        return jsonify(values)
    else:
        return jsonify([]), 400

# Endpoint to get filtered data
@app.route('/api/filter', methods=['GET'])
def filter_data():
    query_params = request.args.to_dict(flat=False)
    filtered_df = df.copy()

    for column, values in query_params.items():
        if column in df.columns:
            filters = values[0].split('|')
            exclude_filters = [f[1:].strip().lower() for f in filters if f.startswith('!')]
            include_filters = [f.strip().lower() for f in filters if not f.startswith('!')]

            if exclude_filters:
                for filter_value in exclude_filters:
                    filtered_df = filtered_df[~filtered_df[column].str.lower().str.contains(filter_value, na=False)]
            
            if include_filters:
                include_mask = pd.Series([False] * len(filtered_df))
                for filter_value in include_filters:
                    include_mask |= filtered_df[column].str.lower().str.contains(filter_value, na=False)
                filtered_df = filtered_df[include_mask]

    data = filtered_df.replace({pd.NA: None}).to_dict(orient='records')
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
