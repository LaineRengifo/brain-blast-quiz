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

        // Defensive check: If no questions, show error and reset
        if (!this.questions || this.questions.length === 0) {
            alert("Sorry, no questions available for this category. Please try another one.");
            this.resetGame();
            return;
        }

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
            // Map your category IDs to The Trivia API categories
            const categoryMap = {
                9: "general_knowledge",
                17: "science",
                21: "sport_and_leisure",
                22: "geography",
                11: "film_and_tv",
                12: "music",
                23: "history",
                24: "society_and_culture",
                27: "animals",
                28: "vehicles",
                15: "video_games",
                10: "arts_and_literature",
                25: "arts_and_literature",
                26: "celebrities",
                29: "arts_and_literature",
                20: "mythology",
                32: "arts_and_literature",
                19: "science",
                18: "science",
                30: "science",
                31: "arts_and_literature",
                14: "film_and_tv",
                16: "arts_and_literature",
                13: "arts_and_literature"
            };
            const apiCategory = categoryMap[category] || "general_knowledge";
            const response = await fetch(
                `https://the-trivia-api.com/api/questions?categories=${apiCategory}&limit=10&difficulty=medium`
            );
            const data = await response.json();
            if (!data || data.length === 0) {
                return [];
            }
            return data.map(q => ({
                question: q.question,
                correct: q.correctAnswer,
                options: [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5)
            }));
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
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
                cat => !(String(cat.id) in this.categories)
            );
            if (available.length > 0) {
                let newCat = available[Math.floor(Math.random() * available.length)];
                // Replace the last played category with the new one (ensure string key)
                delete this.categories[this.lastPlayedCategoryId];
                this.categories[String(newCat.id)] = newCat.name;
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