class QuizGame {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.questions = [];
        this.categories = {
            9: 'General Knowledge',
            17: 'Science & Nature',
            21: 'Sports',
            22: 'Geography'
        };
        // Pool of extra categories (categoryId: name)
        this.extraCategories = [
            { id: 11, name: 'Films' },
            { id: 12, name: 'Music' },
            { id: 23, name: 'History' },
            { id: 24, name: 'Politics' },
            { id: 27, name: 'Animals' },
            { id: 28, name: 'Vehicles' },
            { id: 15, name: 'Video Games' },
            { id: 10, name: 'Books' },
            { id: 25, name: 'Art' },
            { id: 26, name: 'Celebrities' },
            { id: 29, name: 'Comics' },
            { id: 20, name: 'Mythology' },
            { id: 32, name: 'Cartoon & Animations' },
            { id: 19, name: 'Mathematics' },
            { id: 22, name: 'Geography' }, // in case allow repeats
            { id: 18, name: 'Computers' },
            { id: 30, name: 'Gadgets' },
            { id: 31, name: 'Anime & Manga' },
            { id: 14, name: 'Television' },
            { id: 16, name: 'Board Games' },
            { id: 13, name: 'Musicals & Theatres' },
            { id: 21, name: 'Sports' }, // in case allow repeats
            { id: 17, name: 'Science & Nature' }, // in case allow repeats
            { id: 9, name: 'General Knowledge' } // in case allow repeats
        ];
        this.lastPlayedCategoryId = null;
        this.timerInterval = null;
        this.startTime = null;
        this.endTime = null;

        this.init();
    }

    async init() {
        this.generateCategories();
        this.hideQuestionContainer();
        this.setupThemeToggle();
        this.setupBackButton();
        this.setupHowToPlay();
        document.getElementById('timer').textContent = '';
        document.getElementById('questionCounter').textContent = '';
    }

    generateCategories() {
        const grid = document.getElementById('categoryGrid');
        grid.innerHTML = '';
        Object.entries(this.categories).forEach(([id, name]) => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.category = id;
            card.textContent = name;
            card.addEventListener('click', (e) => this.startGame(e));
            grid.appendChild(card);
        });
    }

    setupThemeToggle() {
        const toggleBtn = document.getElementById('toggleTheme');
        toggleBtn.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light');
            toggleBtn.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
        });
    }

    setupBackButton() {
        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }

    setupHowToPlay() {
        var howToPlayBtn = document.getElementById('howToPlayBtn');
        var howToPlayModal = document.getElementById('howToPlayModal');
        var closeHowToPlayBtn = document.getElementById('closeHowToPlayBtn');
        howToPlayBtn.style.display = 'inline-block';

        howToPlayBtn.onclick = function() {
            howToPlayModal.style.display = 'flex';
        };
        closeHowToPlayBtn.onclick = function() {
            howToPlayModal.style.display = 'none';
        };
    }

    async startGame(event) {
        const category = event.target.dataset.category;
        this.lastPlayedCategoryId = category; // Track the last played category
        this.questions = await this.fetchQuestions(category);
        this.currentQuestion = 0;
        this.score = 0;
        document.getElementById('score').textContent = '0';
        this.showQuestionContainer();
        this.displayQuestion();
        this.updateProgress();
        document.getElementById('backBtn').style.display = 'inline-block';
        // Start timer
        this.startTime = Date.now();
        this.updateTimer();
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    async fetchQuestions(category) {
        try {
            const response = await fetch(
                `https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`
            );
            const data = await response.json();
            return data.results.map(q => ({
                question: q.question,
                correct: q.correct_answer,
                options: [...q.incorrect_answers, q.correct_answer]
                    .sort(() => Math.random() - 0.5)
            }));
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    displayQuestion() {
        const currentQ = this.questions[this.currentQuestion];
        document.getElementById('questionText').innerHTML = this.decodeHTML(currentQ.question);

        // Update question counter
        document.getElementById('questionCounter').textContent =
            `Question ${this.currentQuestion + 1} of ${this.questions.length}`;

        const optionGrid = document.getElementById('optionGrid');
        optionGrid.innerHTML = currentQ.options
            .map(option => `<div class="option">${this.decodeHTML(option)}</div>`)
            .join('');

        optionGrid.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => this.checkAnswer(e));
        });
    }

    checkAnswer(event) {
        const selected = event.target.textContent;
        const correct = this.decodeHTML(this.questions[this.currentQuestion].correct);
        const options = document.querySelectorAll('.option');

        options.forEach(option => {
            option.classList.add('disabled');
            if (option.textContent === correct) {
                option.classList.add('correct');
            }
            if (option.textContent === selected && selected !== correct) {
                option.classList.add('wrong');
            }
        });

        if (selected === correct) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
        }

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.displayQuestion();
                this.updateProgress();
            } else {
                this.endGame();
            }
        }, 2000);
    }

    updateProgress() {
        const progress = (this.currentQuestion / this.questions.length) * 100;
        document.getElementById('progressBar').style.width = `${progress}%`;
    }

    updateTimer() {
        if (this.startTime) {
            const now = this.endTime ? this.endTime : Date.now();
            const elapsed = Math.floor((now - this.startTime) / 1000);
            const min = Math.floor(elapsed / 60);
            const sec = elapsed % 60;
            document.getElementById('timer').textContent =
                `Time: ${min}:${sec < 10 ? '0' : ''}${sec}`;
        }
    }

    showQuestionContainer() {
        document.getElementById('questionContainer').style.display = 'block';
        document.getElementById('categoryGrid').style.display = 'none';
        document.getElementById('backBtn').style.display = 'inline-block';
        document.getElementById('howToPlayBtn').style.display = 'none'; // Hide How to Play button
    }

    hideQuestionContainer() {
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
        document.getElementById('howToPlayBtn').style.display = 'inline-block'; // Show How to Play button
    }

    endGame() {
        // Stop timer
        this.endTime = Date.now();
        clearInterval(this.timerInterval);
        this.updateTimer();
        const elapsed = Math.floor((this.endTime - this.startTime) / 1000);
        const min = Math.floor(elapsed / 60);
        const sec = elapsed % 60;

        // Set modal message
        var finalMessage = document.getElementById('finalMessage');
        finalMessage.innerHTML =
            `<strong>Your final score:</strong> ${this.score}<br>
            <strong>Total time:</strong> ${min}:${sec < 10 ? '0' : ''}${sec}<br><br>
            <span style="font-size:1.2em;">Great job!</span>`;

        // Show modal
        document.getElementById('endModal').style.display = 'flex';

        // Handle close button
        document.getElementById('closeModalBtn').onclick = () => {
            document.getElementById('endModal').style.display = 'none';
            this.resetGame();
        };

        // Replace the just-played category with a new one from the pool
        this.replaceCategory();
    }

    replaceCategory() {
        // Remove the last played category from the main categories
        if (this.lastPlayedCategoryId && this.categories[this.lastPlayedCategoryId]) {
            // Pick a random new category from the pool that isn't already in use
            let available = this.extraCategories.filter(
                cat => !(cat.id in this.categories)
            );
            if (available.length > 0) {
                let newCat = available[Math.floor(Math.random() * available.length)];
                // Replace the last played category with the new one
                delete this.categories[this.lastPlayedCategoryId];
                this.categories[newCat.id] = newCat.name;
            }
        }
        // Regenerate the categories grid for next time
        this.generateCategories();
    }

    resetGame() {
        this.score = 0;
        this.currentQuestion = 0;
        document.getElementById('score').textContent = '0';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('categoryGrid').style.display = 'grid';
        this.hideQuestionContainer();
        clearInterval(this.timerInterval);
        document.getElementById('timer').textContent = '';
        document.getElementById('questionCounter').textContent = '';
        this.startTime = null;
        this.endTime = null;
    }

    decodeHTML(html) {
        var txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }
}

// Initialize the game
const game = new QuizGame();