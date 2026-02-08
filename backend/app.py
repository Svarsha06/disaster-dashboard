from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "Python app deployed successfully 🚀"

@app.route("/health")
def health():
    return jsonify(status="OK", message="Server is running")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
