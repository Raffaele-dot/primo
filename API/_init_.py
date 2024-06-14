from flask import Flask, request, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__, static_folder='../static', template_folder='../static')

# Load the Excel data
df = pd.read_excel(os.path.join(os.path.dirname(__file__), '../data.xlsx'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/filter', methods=['GET'])
def filter_data():
    # Get filter parameters from the request
    filters = request.args
    
    filtered_df = df.copy()
    
    for key, value in filters.items():
        if value:
            filtered_df = filtered_df[filtered_df[key] == value]

    data = filtered_df.to_dict(orient='records')
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

