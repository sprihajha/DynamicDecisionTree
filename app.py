import json
import sqlite3
import psycopg2
from flask import request
from flask import Flask, render_template, jsonify
import csv
import os
app = Flask(__name__)

dbname = os.environ.get('DB_NAME')
user = os.environ.get('DB_USER')
password = os.environ.get('DB_PASSWORD')
host = os.environ.get('DB_HOST')
port = os.environ.get('DB_PORT')


@app.route('/')
def index():
    # empty the root_to_curr.txt file whenever index.html is loaded
    # it is called whenever users load the index.html
    # output: render index.html
    f = open("root_to_curr.txt", 'r+')
    f.truncate(0)
    return render_template('index.html')


@app.route('/tree.html', methods=["POST", "GET"])
def tree():
    # load the page tree.html
    # it is called when users clicked submit button the index.html
    # output: render the tree.html
    return render_template('tree.html')


@app.route('/root_to_curr', methods=['POST'])
def root_to_curr():
    # saving the path from root to current node as a txt file
    # it is called after users answer the question of the box, and when the new box appreas
    # output: the variable storing the path
    output = request.get_json()
    # print(output)
    # print(type(output))
    query_result = json.loads(output)
    # print(query_result)
    # print(type(query_result))

    f = open('root_to_curr.txt', 'a')
    for i in range(len(query_result)):
        i_str = str(i)
        if '-' not in query_result[i_str]:
            f.write('\n')
        f.write(query_result[i_str])
        f.write('\n')

    return query_result


@app.route('/root_to_keyword', methods=['POST'])
def root_to_desired():
    # saving the path from root to the box containing keyword as a txt file
    # it is called when the users search a box through keyword
    # output: the variable storing the path
    output = request.get_json()
    # print(output)
    # print(type(output))
    query_result = json.loads(output)
    # print(query_result)
    # print(type(query_result))

    f = open('root_to_keyword.txt', 'w')
    for i in range(len(query_result)):
        i_str = str(i)
        f.write(query_result[i_str])
        f.write('\n')

    return query_result


@app.route('/get_subtree', methods=['POST'])
def get_subtree():
    # saving the subtree as a txt file
    # it is called when users click the radio button "Nodes reachable from the path/tree so far", and then click "submit"
    # output: the variable storing th path query_result
    output = request.get_json()
    # print(output)
    # print(type(output))
    query_result = json.loads(output)
    # print(query_result)
    # print(type(query_result))

    f = open('root_to_keyword.txt', 'a')
    for i in range(len(query_result)):
        i_str = str(i)
        f.write(query_result[i_str])
        f.write('\n')

    f.write('\n')
    return query_result


@app.route('/get_sql', methods=['POST'])
def get_sql():
    # and execute the sql command sent from the tree.js through ajax.
    # it is called when the text in the new box is a sql command.
    # output: send the query_result of the sql command back to tree.js
    output = request.get_json()
    # print(output)
    # print(type(output))
    query_result = json.loads(output)
    # print(query_result)
    # print(type(query_result))

    # connecting to the database
    # connection = sqlite3.connect("dt.db")
    connection = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )

    # cursor
    crsr = connection.cursor()

    # print statement will execute if there are no errors
    print("Connected to the database")

    sql_command = """CREATE TABLE IF NOT EXISTS houses (
    house_number SERIAL PRIMARY KEY,
    house_name TEXT,
    num_of_bedrooms INTEGER,
    square_feet INTEGER,
    swimming_pool BOOLEAN);"""
    crsr.execute(sql_command)

    # # SQL command to insert the data in the table
    # # sql_command = """INSERT INTO houses (house_name, num_of_bedrooms, square_feet, swimming_pool) VALUES (?, ?, ?, ?);"""
    # # crsr.execute(sql_command, ("Goddard Hall", 1, 1600, 'N'))
    # # crsr.execute(sql_command, ("Palladium Hall", 2, 3100, 'Y'))
    # # crsr.execute(sql_command, ("Lipton Hall", 3, 3300, 'N'))

    sql_command = """CREATE TABLE IF NOT EXISTS comps (
    house_number SERIAL PRIMARY KEY,
    id INTEGER,
    date TEXT,
    price INTEGER,
    bedrooms INTEGER,
    bathrooms REAL,
    sqft_living INTEGER,
    sqft_lot,floors INTEGER,
    waterfront INTEGER,
    view INTEGER,
    condition INTEGER,
    grade INTEGER,
    sqft_above INTEGER,
    sqft_basement INTEGER,
    yr_built INTEGER,
    yr_renovated INTEGER,
    zipcode INTEGER,
    lat REAL,
    long REAL,
    sqft_living15 INTEGER,
    sqft_lot15 INTEGER);"""
    crsr.execute(sql_command)

    # # populates comps table with data from comparables_dataset.csv
    # with open('datasets/kentucky_comps.csv', 'r') as csv_file:
    #         csv_reader = csv.reader(csv_file)
    #         next(csv_reader)  # Skip header row

    #         sql_insert_command = """INSERT INTO comps (id,date,price,bedrooms,bathrooms,sqft_living,sqft_lot,floors,waterfront,view,condition,grade,sqft_above,sqft_basement,yr_built,yr_renovated,zipcode,lat,long,sqft_living15,sqft_lot15)
    #                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"""

    #         # Step 4: Insert Data
    #         for row in csv_reader:
    #             # values.append(row)
    #             # zip_code = int(row[0])  # 'zipcode' column
    #             # sale_price = int(row[1])  # 'price' column
    #             # house_square_footage = int(row[2])  # 'sqft_living' column
    #             # bedrooms = int(row[3])  # 'bedrooms' column

    #             # crsr.execute(sql_insert_command, (zip_code, sale_price, house_square_footage, bedrooms))
    #             crsr.execute(sql_insert_command, (row))

    sql_command = """CREATE TABLE IF NOT EXISTS federal_tax_rates (
    bracket_tax_rate INTEGER,
    min_income_single INTEGER,
    max_income_single INTEGER,
    min_income_married INTEGER,
    max_income_married INTEGER,
    min_income_head_of_household INTEGER,
    max_head_of_household INTEGER);"""
    crsr.execute(sql_command)

    # populates federal_tax_rates table with data from tax_brackets.csv
    # with open('datasets/federal_tax_brackets.csv', 'r') as csv_file:
    #     csv_reader = csv.reader(csv_file)
    #     next(csv_reader)  # Skip header row

    #     sql_insert_command = """INSERT INTO federal_tax_rates (bracket_tax_rate, min_income_single, max_income_single, min_income_married, max_income_married, min_income_head_of_household, max_head_of_household) VALUES (?, ?, ?, ?, ?, ?, ?);"""

    #     for row in csv_reader:
    #         crsr.execute(sql_insert_command, (row))

    # Commit changes
    connection.commit()

    crsr.execute(query_result['0'])
    sql_ans = crsr.fetchall()

    # for i in sql_ans:
    #     print(i)

    # close the connection
    connection.close()

    return jsonify('', render_template('sql.html', x=sql_ans))


@app.route('/input_query_result', methods=['POST'])
def input_query_result():
    data = request.get_json()
    query = data.get("query")
    cur_query = query
    all_inputs = data.get("allInputs")
    result = data.get("resultStr")
    # print(result)
    print("all_inputs: ", all_inputs)

    # Replace INPUTX keywords with corresponding input values based on key-value pairs in all_inputs
    for key in all_inputs:
        cur_query = cur_query.replace(key, all_inputs[key])
        print("Query after key-value replacement: " + cur_query)

    # Connect to database
    # connection = sqlite3.connect("dt.db")
    connection = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    crsr = connection.cursor()

    print(cur_query)
    try:
        crsr.execute(cur_query)
        query_result = crsr.fetchall()
        # Convert query_result to string and truncate outer parentheses and last comma
        query_result = ' '.join([str(elem) for elem in query_result])[1:-2]
        if query_result == "":
            query_result = "No query results found."
        print("Query result: " + query_result)
    except Exception as e:
        query_result = repr(e)
        print("Error " + query_result)
        return jsonify(query_result + ". Please check your query and try again.")
    # Close the connection
    connection.close()

    if result == "":
        return jsonify(query_result)
    elif "RESULT" in result:
        result = result.replace("RESULT", query_result)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
