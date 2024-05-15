import json
import sqlite3
from flask import request
from flask import Flask, render_template, jsonify, send_from_directory
from flask_cors import CORS
import csv
import re
# import psycopg2
app = Flask(__name__)
CORS(app)

# Path to SQLite database file
DATABASE_FILE = "dt.db"


@app.route('/files/<path:filename>')
def serve_files(filename):
    return send_from_directory('input', filename)


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


@app.route('/input_query_return', methods=['POST'])
def input_query_return():
    data = request.get_json()
    query = data.get("query")
    cur_query = query
    all_inputs = data.get("allInputs")
    result = data.get("resultStr")
    # print(result)
    print("all_inputs: ", all_inputs)

    # Replace INPUT keywords with corresponding input values based on key-value pairs in all_inputs
    print("Query after key-value replacement: " + cur_query)
    for key in all_inputs:
        pattern = re.compile(r'\b{}\b'.format(re.escape(key)))
        cur_query = pattern.sub(all_inputs[key], cur_query)
        print("Query after key-value replacement: " + cur_query)

    # Connect to database
    # connection = sqlite3.connect("dt.db")
    connection = sqlite3.connect(DATABASE_FILE)
    crsr = connection.cursor()
    print("Connected to the database")

    # Create comparables table:
    # sql_command = """CREATE TABLE IF NOT EXISTS comps (
        # house_number SERIAL PRIMARY KEY,
        # id INTEGER,
        # date TEXT,
        # price INTEGER,
        # bedrooms INTEGER,
        # bathrooms REAL,
        # sqft_living INTEGER,
        # sqft_lot,floors INTEGER,
        # waterfront INTEGER,
        # view INTEGER,
        # condition INTEGER,
        # grade INTEGER,
        # sqft_above INTEGER,
        # sqft_basement INTEGER,
        # yr_built INTEGER,
        # yr_renovated INTEGER,
        # zipcode INTEGER,
        # lat REAL,
        # long REAL,
        # sqft_living15 INTEGER,
        # sqft_lot15 INTEGER);"""
    # crsr.execute(sql_command)

#     # # populates comps table with data from comparables_dataset.csv
#     # with open('datasets/kentucky_comps.csv', 'r') as csv_file:
#     #         csv_reader = csv.reader(csv_file)
#     #         next(csv_reader)  # Skip header row

#     #         sql_insert_command = """INSERT INTO comps (id,date,price,bedrooms,bathrooms,sqft_living,sqft_lot,floors,waterfront,view,condition,grade,sqft_above,sqft_basement,yr_built,yr_renovated,zipcode,lat,long,sqft_living15,sqft_lot15)
#     #                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);"""

#     #         # Step 4: Insert Data
#     #         for row in csv_reader:
#     #             # values.append(row)
#     #             # zip_code = int(row[0])  # 'zipcode' column
#     #             # sale_price = int(row[1])  # 'price' column
#     #             # house_square_footage = int(row[2])  # 'sqft_living' column
#     #             # bedrooms = int(row[3])  # 'bedrooms' column

#     #             # crsr.execute(sql_insert_command, (zip_code, sale_price, house_square_footage, bedrooms))
#     #             crsr.execute(sql_insert_command, (row))

    # Create federal_tax_rates table:
    # sql_command = """CREATE TABLE IF NOT EXISTS federal_tax_rates (
    # bracket_tax_rate INTEGER,
    # min_income_single INTEGER,
    # max_income_single INTEGER,
    # min_income_married INTEGER,
    # max_income_married INTEGER,
    # min_income_head_of_household INTEGER,
    # max_head_of_household INTEGER);"""
    # crsr.execute(sql_command)

#     # populates federal_tax_rates table with data from tax_brackets.csv
#     # with open('datasets/federal_tax_brackets.csv', 'r') as csv_file:
#     #     csv_reader = csv.reader(csv_file)
#     #     next(csv_reader)  # Skip header row

#     #     sql_insert_command = """INSERT INTO federal_tax_rates (bracket_tax_rate, min_income_single, max_income_single, min_income_married, max_income_married, min_income_head_of_household, max_head_of_household) VALUES (?, ?, ?, ?, ?, ?, ?);"""

#     #     for row in csv_reader:
#     #         crsr.execute(sql_insert_command, (row))


# Create apple products table:
    # sql_command = """CREATE TABLE IF NOT EXISTS apple_products (
    # category TEXT,
    # product_name TEXT,
    # product_link TEXT);"""
    # crsr.execute(sql_command)

# Populate apple products table
    # iPhone  = [["iPhone 15 Pro", "https://www.apple.com/iphone-15-pro/"], ["iPhone 15", "https://www.apple.com/iphone-15/"], ["iPhone 14", "https://www.apple.com/shop/buy-iphone/iphone-14"], ["iPhone 13", "https://www.apple.com/shop/buy-iphone/iphone-13"]]

    # Mac = [["Mac Pro", "https://www.apple.com/mac-pro/"], ["Mac Studio", "https://www.apple.com/mac-studio/"], ["Mac Mini", "https://www.apple.com/mac-mini/"], ["iMac", "https://www.apple.com/imac/"], ["MacBook Pro 16", "https://www.apple.com/shop/buy-mac/macbook-pro/16-inch"], ["MacBook Pro 14", "https://www.apple.com/shop/buy-mac/macbook-pro/14-inch"], ["MacBook Air M1", "https://www.apple.com/macbook-air-m1/"], ["MacBook Air 13-inch M2", "https://www.apple.com/shop/buy-mac/macbook-air/13-inch-m2"], ["MacBook Air 15-inch M2", "https://www.apple.com/shop/buy-mac/macbook-air/15-inch-m2"]]

    # iPad = [["IPad Pro", "https://www.apple.com/ipad-pro/"], ["IPad Air", "https://www.apple.com/ipad-air/"], ["IPad (10th Generation)", "https://www.apple.com/shop/buy-ipad/ipad"], ["iPad (9th Generation)", "https://www.apple.com/shop/buy-ipad/ipad-10-2"], ["iPad Mini", "https://www.apple.com/ipad-mini/"]]

    # Watch = [["Apple Watch Series 9", "https://www.apple.com/apple-watch-series-9/"], ["Apple Watch Ultra 2", "https://www.apple.com/apple-watch-ultra-2/"], ["Apple Watch SE", "https://www.apple.com/apple-watch-se/"]]

    # for i in iPhone:
    #     sql_command = """INSERT INTO apple_products (category, product_name, product_link) VALUES (?, ?, ?);"""
    #     crsr.execute(sql_command, ("iPhone", i[0], i[1]))
    # for i in Mac:
    #     sql_command = """INSERT INTO apple_products (category, product_name, product_link) VALUES (?, ?, ?);"""
    #     crsr.execute(sql_command, ("Mac", i[0], i[1]))
    # for i in iPad:
    #     sql_command = """INSERT INTO apple_products (category, product_name, product_link) VALUES (?, ?, ?);"""
    #     crsr.execute(sql_command, ("iPad", i[0], i[1]))
    # for i in Watch:
    #     sql_command = """INSERT INTO apple_products (category, product_name, product_link) VALUES (?, ?, ?);"""
    #     crsr.execute(sql_command, ("Watch", i[0], i[1]))

    print("current query: " + cur_query)
    
    try:
        crsr.execute(cur_query)
        query_result = crsr.fetchall()
        print("Original query result: ", query_result)
        # Convert query_result to string and truncate outer parentheses and last comma
        if "(".count(str(query_result)) > 1:
            query_result = query_result = ' '.join([str(elem) for elem in query_result])[:-1]
        else:
            query_result = ' '.join([str(elem) for elem in query_result])[1:-2]

        if len(query_result) > 0 and query_result[0] == "'" and query_result[-1] == "'":
            query_result = query_result[1:-1]

        if query_result == "":
            query_result = "No query results found."
            
        print("Converted query result: " + query_result)
    except Exception as e:
        query_result = repr(e)
        print("Error: " + query_result)
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
