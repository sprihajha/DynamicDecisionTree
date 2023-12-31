from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    if request.method == 'POST':
        # Restart your service
        subprocess.call(['sudo', 'systemctl', 'restart', 'dynamicdecisiontree.service'])
        return 'Success', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
