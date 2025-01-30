from flask import Flask, request, jsonify 
from flask_cors import CORS 
import pg8000 

app = Flask(__name__)
CORS(app)

# PostgreSQL connection details
conn = pg8000.connect(
    database="clinical_trials",
    user="postgres",
    password="Apple@01",
    host="localhost",
    port=5432
)

@app.route('/unique_values', methods=['GET'])
def unique_values():
    
    column = request.args.get('column')
    allowed_columns = [
        "disease_indication_category",
        "trial_datapoint_idc_identifier_row_identifier",
        "immunogenicity_testing",
        "antibody",
        "target"
    ]
    if column not in allowed_columns:
        return jsonify({"error": "Invalid column name"}), 400

    # Decide the table dynamically based on the column
    table = "antibodies" if column in ["antibody", "target"] else "trial"

    cursor = conn.cursor()
    query = f"SELECT DISTINCT {column} FROM {table} WHERE {column} IS NOT NULL"
    cursor.execute(query)
    unique_vals = [row[0] for row in cursor.fetchall()]
    cursor.close()

    return jsonify(unique_vals)


@app.route('/search', methods=['GET'])
def search():
    
    # Input parameters
    disease_indication_category = request.args.get('disease_indication_category', '').strip()
    trial_datapoint_idc_identifier_row_identifier = request.args.get('trial_datapoint_idc_identifier_row_identifier', '').strip()
    immunogenicity_testing = request.args.get('immunogenicity_testing', '').strip()
    antibody = request.args.get('antibody', '').strip()
    target = request.args.get('target', '').strip()

    # Construct the JOIN query
    cursor = conn.cursor()
    query = """
        SELECT * 
        FROM trial t
        FULL JOIN antibodies a
        ON t.therapeutic_assessed_for_ada_inn_name = a.antibody
        WHERE TRUE
    """
    # Add filters dynamically
    if disease_indication_category:
        query += f" AND t.disease_indication_category ILIKE '%{disease_indication_category}%'"
    if trial_datapoint_idc_identifier_row_identifier:
        query += f" AND t.trial_datapoint_idc_identifier_row_identifier ILIKE '%{trial_datapoint_idc_identifier_row_identifier}%'"
    if immunogenicity_testing:
        query += f" AND t.immunogenicity_testing ILIKE '%{immunogenicity_testing}%'"
    if antibody:
        query += f" AND a.antibody ILIKE '%{antibody}%'"
    if target:
        query += f" AND a.target ILIKE '%{target}%'"

    # Execute the query
    cursor.execute(query)
    records = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]
    result = [dict(zip(columns, row)) for row in records]

    cursor.close()
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)