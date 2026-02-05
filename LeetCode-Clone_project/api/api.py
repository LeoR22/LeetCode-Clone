from flask import Flask
from flask_cors import CORS
from flask import make_response
from flask import request

import os
from modules import tester
from modules import compiler
# import json


app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file('index.html')


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route("/api")
def home_api():
	return {'mesage':"Online Compiler API",
	"endpoints":"/run",
	"example_python":"""response({"language":"py","code":"YOUR CODE"})""",
	"example_javascript":"""response({"language":"js","code":"YOUR CODE"})"""

	}
	
@app.route("/api/run_test_case",methods=["POST"])
def run_test_case():
	data = request.json
	extension = data.get("language")
	code = data.get("code")
	print("CDOE",code)

	if(extension=="py"):
		output = tester.test_py(code)
	else:
		output = tester.test_js(code)

	return {"message":output}



@app.route("/api/run",methods=["POST"])
def run():

	data = request.json
	extension = data.get("language")
	code = data.get("code")

	if(extension=="py"):
		output = compiler.execute_py(code)
	else:
		output = compiler.execute_js(code)

	return {"message":output}



@app.route("/api/questions")
def myquestion():
	# paths = os.path.join("mysite","question","q1.txt")
	paths = os.path.join("questions","question","q1.txt")
	with open(paths,'r') as fs:
		q1 = fs.read()
	return make_response({"message":q1},200)


if __name__=="__main__":
	app.run(debug = False)