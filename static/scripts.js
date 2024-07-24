let attemptsLeft = 6;
let cumulativeWrongLetters = new Set(); // Use a Set to avoid duplicates
const gridContainer = document.getElementById('grid-container');
const wrongLettersElement = document.getElementById('wrong-letters');

// Initialize the grid with empty tiles
for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
        const tile = document.createElement('div');
        tile.classList.add('grid-item');
        gridContainer.appendChild(tile);
    }
}

document.getElementById('wordle-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (attemptsLeft <= 0) {
        displayMessage('No more attempts left!');
        return;
    }

    const guess = document.getElementById('guess').value.trim().toLowerCase();
    if (guess.length !== 5) {
        displayMessage('Please enter exactly 5 letters.');
        return;
    }

    const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trial: guess }),
    });

    const result = await response.json();

    if (result.error) {
        displayMessage(result.error);
        return;
    }

    const messageElement = document.getElementById('message');
    messageElement.textContent = result.message || '';

    if (result.feedback) {
        const startIndex = (6 - attemptsLeft) * 5;

        for (let i = 0; i < guess.length; i++) {
            const tile = gridContainer.children[startIndex + i];
            tile.textContent = guess[i].toUpperCase();

            if (result.feedback[i].includes('Fix')) {
                tile.classList.add('correct-position');
            } else if (result.feedback[i].includes('exists')) {
                tile.classList.add('correct-letter');
            } else {
                tile.classList.add('incorrect-letter');
            }
        }

        attemptsLeft--;

        if (attemptsLeft <= 0 && result.message !== 'CONGRATULATIONS! YOU GOT THE WORD!') {
            const word = result.word || 'the word'; // Fallback if result.word is undefined
            displayMessage(`Sorry, you've used all attempts. The word was '${word}'.`);
        }

        // Update the list of cumulative wrong letters
        updateWrongLetters(result.wrong_letters);
    }

    document.getElementById('guess').value = '';
});

function displayMessage(msg) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = msg;
}

function updateWrongLetters(wrongLetters) {
    wrongLetters.forEach(letter => cumulativeWrongLetters.add(letter));
    wrongLettersElement.textContent = Array.from(cumulativeWrongLetters).join(', ').toUpperCase();
}
