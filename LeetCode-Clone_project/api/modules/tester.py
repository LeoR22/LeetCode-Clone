import os
import datetime
import js2py
import io,sys
from io import StringIO
from contextlib import redirect_stdout
import subprocess
from sys import argv


def test_py(code):
	
	test_case_list = [
	{"num1":12,"num2":5,"output":17},
	{"num1":-10,"num2":4,"output":-6},
	{"num1":22,"num2":1,"output":23},
	{"num1":1000,"num2":1,"output":1001},
	{"num1":5000,"num2":0,"output":5000}
	]

	correct_cases = []
	original_code=code[::]

	for test_case in test_case_list:
		# print(test_case)
		old_stdout = sys.stdout


		try:
			code= f"{code}\nprint(add(a1,a2)==a3,end=' ')"

			#save original standart output reference
			old_stdout = sys.stdout

			#the output of exec() normally is sent to sys.stdout
			#but here we redirect it to StringIO() to get output in memory object without writing to file(.txt)
			new_stdout = io.StringIO()
			#Redirect python stdout into the builtin io.StringIO() buffer
			sys.stdout = new_stdout
			# exec(code,{"a1":2,"a2":5,"a3":7})

			exec(code,{"a1": test_case['num1'],"a2":test_case['num2'],"a3":test_case['output']})
			result = sys.stdout.getvalue().strip()


		except Exception as e:
			result = str(e)
			
		finally:
			sys.stdout.close()
			#put stdout back to normal 
			sys.stdout = old_stdout
			required = result.split(" ")[0].lower()

			correct_cases.append(required)
			print()
			code=original_code

	return correct_cases




def test_js(code):


	test_case_list = [
	{"num1":12,"num2":5,"output":17},
	{"num1":-10,"num2":4,"output":-6},
	{"num1":22,"num2":1,"output":23},
	{"num1":1000,"num2":1,"output":1001},
	{"num1":5000,"num2":0,"output":5000}
	]

	correct_cases = []
	original_code = code[::]

	for  test_case in test_case_list:
		old_stdout = sys.stdout

		try:
			code= f" function main(a1,a2,a3) {{ {code}  console.log(add(a1,a2)==a3);}}"
			# print("code::",code)

			main = js2py.eval_js(code)
			# result = main
			# print(main(12,5,17))

			#save original standart output reference
			old_stdout = sys.stdout

			#the output of exec() normally is sent to sys.stdout
			#but here we redirect it to StringIO() to get output in memory object without writing to file(.txt)
			new_stdout = io.StringIO()
			#Redirect python stdout into the builtin io.StringIO() buffer
			sys.stdout = new_stdout

			to_run = f"""print(main({test_case["num1"]},{test_case["num2"]},{test_case["output"]}))"""
			exec(to_run)

			# context.execute(code)
			# print(context.output)	

			result = sys.stdout.getvalue().strip()


		except Exception as e:
			result = str(e)
			
		finally:
			sys.stdout.close()
			
			#put stdout back to normal 
			sys.stdout = old_stdout
			required = result.split("\n")[0].lower().replace("'","")

			correct_cases.append(required)
			code = original_code[::]


	return correct_cases
