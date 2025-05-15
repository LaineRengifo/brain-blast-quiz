/* filepath: /Users/lainerengifoarmas/Desktop/brain-blast-quiz/assets/js/script.js */
class QuizGame {
    constructor() {
        this.score = 0;
        this.currentQuestion = 0;
        this.questions = [];
        this.categories = {
            9: 'General Knowledge',
            17: 'Science & Nature',
            21: 'Sports'
        };

        this.init();
    }

    async init() {
        this.addEventListeners();
        this.hideQuestionContainer();
        this.setupThemeToggle();
        this.setupBackButton();
    }

    addEventListeners() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => this.startGame(e));
        });
    }

    setupThemeToggle() {
        const toggleBtn = document.getElementById('toggleTheme');
        // Set initial icon
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

    async startGame(event) {
        const category = event.target.dataset.category;
        this.questions = await this.fetchQuestions(category);
        this.showQuestionContainer();
        this.displayQuestion();
        this.updateProgress();
        document.getElementById('backBtn').style.display = 'inline-block';
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
        document.getElementById('questionText').innerHTML = currentQ.question;

        const optionGrid = document.getElementById('optionGrid');
        optionGrid.innerHTML = currentQ.options
            .map(option => `<div class="option">${option}</div>`)
            .join('');

        optionGrid.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', (e) => this.checkAnswer(e));
        });
    }

    checkAnswer(event) {
        const selected = event.target.textContent;
        const correct = this.questions[this.currentQuestion].correct;
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
            this.score += 100;
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

    showQuestionContainer() {
        document.getElementById('questionContainer').style.display = 'block';
        document.getElementById('categoryGrid').style.display = 'none';
        document.getElementById('backBtn').style.display = 'inline-block';
    }

    hideQuestionContainer() {
        document.getElementById('questionContainer').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
    }

    endGame() {
        alert(`Game Over! Your final score: ${this.score}`);
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.currentQuestion = 0;
        document.getElementById('score').textContent = '0';
        document.getElementById('progressBar').style.width = '0%';
        document.getElementById('categoryGrid').style.display = 'grid';
        this.hideQuestionContainer();
    }
}

// Initialize the game
const game = new QuizGame();