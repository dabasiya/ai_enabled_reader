from flask import Flask, jsonify, request
from flask_cors import CORS

import google.generativeai as genai


genai.configure(api_key= API_KEY)

model = genai.GenerativeModel('models/gemini-1.5-flash')

def getoutput(inputtext):
    #prompt formatioin
    prompt = (
        f"give defination from this string or if its like explainable easily so explain them : {inputtext} give formated html output, maximum response size is 1000 letters."
    )
    response = model.generate_content(prompt)
    return response.text.strip()


app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])


# Sample GET API
@app.route('/api/search', methods=['GET'])
def greet():
    inputtexts = request.args.get('texts')
    print(inputtexts)
    return getoutput(inputtexts)


if __name__ == '__main__':
    app.run(debug=True)
    