from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import random
from collections import Counter

app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app)

# Load words from the file
with open('wordlist_fives.txt', 'r') as file:
    words = [word.strip() for word in file.readlines()]

# Initialize the global variable to hold the word of the day
wordoftheday = random.choice(words)

@app.route('/')
def index():
    return send_from_directory('', 'index.html')

@app.route('/api/guess', methods=['POST'])
def guess():
    global wordoftheday
    data = request.json
    trial = data.get('trial', '').strip().lower()

    if len(trial) != 5:
        return jsonify({'error': 'Please enter exactly 5 letters.'}), 400

    if trial == wordoftheday:
        response = {
            'message': 'CONGRATULATIONS! YOU GOT THE WORD!',
            'feedback': ['Fix ' + trial[i] for i in range(5)],
            'word': wordoftheday,
            'wrong_letters': []
        }
        wordoftheday = random.choice(words)  # Set a new word for the next game
        return jsonify(response)

    if trial not in words:
        return jsonify({'error': 'Word does not exist. Try again.'}), 400

    word_count = Counter(wordoftheday)
    trial_count = Counter(trial)

    feedback = [''] * 5
    wrong_letters = []

    for j in range(5):
        if trial[j] == wordoftheday[j]:
            feedback[j] = f"Fix {trial[j]}"
            word_count[trial[j]] -= 1
            trial_count[trial[j]] -= 1

    for j in range(5):
        if feedback[j] == '':
            if trial[j] in word_count and word_count[trial[j]] > 0:
                feedback[j] = f"{trial[j]} exists but not in position"
                word_count[trial[j]] -= 1
            else:
                feedback[j] = f"{trial[j]} does not exist"
                wrong_letters.append(trial[j])

    response = {
        # 'message': 'Sorry, try again.',
        'feedback': feedback,
        'word': wordoftheday,
        'wrong_letters': wrong_letters
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
