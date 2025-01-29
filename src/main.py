from flask import Flask

app = Flask(__name__)


@app.route('/testing')
def hello():
    return {'date': '1/28/2025'}

@app.route('/testing2')
def hello2():
    return '<h1>Hello, There! 2</h1>'

app.run(debug=True)