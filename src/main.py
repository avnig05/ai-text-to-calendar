from flask import Flask, request

app = Flask(__name__)


@app.route('/add-to-calendar', methods=["POST"])
def add_to_calendar():
    request_data = request.data
    return request_data

app.run(debug=True)