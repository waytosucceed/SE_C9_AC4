document.addEventListener('DOMContentLoaded', () => {
    const nextButton = document.getElementById('next-btn');
    const questionContainerElement = document.querySelector('.question-container');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const questionNumbersElement = document.getElementById('question-numbers');
    const feedbackContainer = document.getElementById('feedback-container');
    const restartButton = document.createElement('button');
    const storyContainer = document.getElementById('story-container');
    const buttonsContainer = document.querySelector('.buttons');

    let questions = [];
    let currentQuestionIndex = 0;
    let quizCompleted = false;

    // Fetch and display story content from story.html
    fetch('story.html')
        .then(response => response.text())
        .then(data => {
            const startDiv = extractStartDiv(data);
            storyContainer.innerHTML = startDiv;

            const imgElement = document.querySelector('.right-container img');
            if (imgElement) {
                imgElement.src = './assests/story/3.png';
            }
        })
        .catch(error => console.error('Error loading story:', error));

    // Fetch questions
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            questions = data;
            setNextQuestion(); // Load the first question immediately
        })
        .catch(error => console.error('Error loading questions:', error));

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        setNextQuestion();
    });

    restartButton.innerText = 'Restart Quiz';
    restartButton.classList.add('btn', 'restart-btn', 'hide');
    restartButton.addEventListener('click', restartQuiz);
    buttonsContainer.appendChild(restartButton);

    function setNextQuestion() {
        resetState();

        if (currentQuestionIndex >= questions.length) {
            showCompletionMessage();
        } else {
            showQuestion(questions[currentQuestionIndex]);
        }
    }

    function showQuestion(question) {
        questionNumbersElement.innerHTML = '';

        questions.forEach((_, index) => {
            const numberButton = document.createElement('button');
            numberButton.innerText = index + 1;
            numberButton.classList.add('btn');
            if (index === currentQuestionIndex) {
                numberButton.classList.add('current');
            }
            numberButton.addEventListener('click', () => {
                currentQuestionIndex = index;
                setNextQuestion();
            });
            questionNumbersElement.appendChild(numberButton);
        });

        questionElement.innerHTML = question.question;

        const imgElement = document.querySelector('.background-image');
        imgElement.src = './assests/story/3.png';

        const secondImgElement = document.querySelector('.second-image');
        if (question.secondImg) {
            secondImgElement.src = question.secondImg;
            secondImgElement.style.display = 'block';
        } else {
            secondImgElement.style.display = 'none';
        }

        if (question.options.every(option => option.endsWith('.jpg') || option.endsWith('.png'))) {
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div'); // Create a new div for each option
                optionDiv.classList.add('option');
    
                const imgButton = document.createElement('img');
                imgButton.src = option;
                imgButton.alt = 'Option Image';
                imgButton.classList.add('btnImg');
                imgButton.dataset.correct = index === question.correct;
    
                imgButton.addEventListener('click', selectAnswer);
                optionDiv.appendChild(imgButton); // Append the image to its div
                answerButtonsElement.appendChild(optionDiv); // Append the div to the answer buttons container
            });
        } else {
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.innerHTML = option;
                    button.classList.add('btn');
                    if (question.correct === question.options.indexOf(option)) {
                        button.dataset.correct = true;
                    }
                    button.addEventListener('click', selectAnswer);
                    answerButtonsElement.appendChild(button);
                });
            }
    }

    function resetState() {
        clearStatusClass(document.body);
        clearStatusClass(questionContainerElement);
        nextButton.classList.add('hide');
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
        feedbackContainer.classList.add('hide');
    }

    function showCompletionMessage() {
        const cheersAudio = document.getElementById('cheers');
        cheersAudio.play();

        questionElement.innerHTML = "";
        questionNumbersElement.innerHTML = '';
        answerButtonsElement.classList.add('hide');
        nextButton.classList.add('hide');
        restartButton.classList.remove('hide');

        const imgElement = document.querySelector('.right-container img');
        if (imgElement) {
            imgElement.src = './assests/story/2.png';
        }

        if (!quizCompleted) {
            fetch('story.html')
                .then(response => response.text())
                .then(data => {
                    const endDiv = extractEndDiv(data);
                    storyContainer.innerHTML = endDiv;
                })
                .catch(error => console.error('Error loading story end:', error));

            quizCompleted = true;
        }
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        resetState();
        setNextQuestion();
        restartButton.classList.add('hide');
        hideStoryEnd();
        quizCompleted = false;
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        const correct = selectedButton.dataset.correct === 'true';

        if (correct) {
            const pointsAudio = document.getElementById('points');
            pointsAudio.play();
        } else {
            const failAudio = document.getElementById('fail');
            failAudio.currentTime = 0;
            failAudio.play();
        }
        clearStatusClass(document.body);
        clearStatusClass(questionContainerElement);

        Array.from(answerButtonsElement.children).forEach(button => {
            clearStatusClass(button);
        });

        setStatusClass(selectedButton, correct);
        setStatusClass(questionContainerElement, correct);

        if (correct) {
            showFeedback('Good job! 👏', 'correct');
            nextButton.classList.remove('hide');
        } else {
            showFeedback('Try again! 💪', 'wrong');
            nextButton.classList.add('hide');
        }
    }

    function showFeedback(message, status) {
        feedbackContainer.innerText = message;
        feedbackContainer.classList.remove('hide');
        feedbackContainer.classList.add(status);
    }

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct-bg');
        } else {
            element.classList.add('wrong-bg');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct-bg', 'wrong-bg');
    }

    function extractStartDiv(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const startDiv = doc.querySelector('.start').innerHTML;
        return startDiv;
    }

    function extractEndDiv(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const endDiv = doc.querySelector('.end').innerHTML;
        return endDiv;
    }

    function hideStoryEnd() {
        storyContainer.innerHTML = '';
    }
});
