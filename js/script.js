const responseCodes = [
    'success',
    'no results',
    'invalid parameter',
    'token not found',
    'token empty'
];

const questionLetters = [
    'A. ',
    'B. ',
    'C. ',
    'D. '
];

let token = "";

let categories = [];
const validCategories = [
    'General Knowledge',
    'Geography',
    'Science',
    'Sports',
    'Entertainment',
    'History'
];
const validSubCategories = [
    { 'Entertainment' : [
        'Books',
        'Film', 'Music',
        'Musicals & Theatres',
        'Television',
        'Video Games',
        'Board Games',
        'Comics']},
    { 'Science' : [
        'Nature',
        'Computers',
        'Mathematics',
        'Gadgets'
    ]}
];

let correctSound;
let incorrectSound;
let woodSound;

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

$.ajaxSetup({ async: false }); // Probably should deal with async methods properly but this will do, for now.

$.getJSON('https://opentdb.com/api_category.php', function(data) {
    const categoriesRes = data.trivia_categories;

    validCategories.forEach(vCat => {
        categories.push({ 'name' : vCat, 'ids' : []});
    });

    categoriesRes.forEach(category => {
        // For each category from the API.

        validCategories.forEach(vCat => {
            if (category.name === vCat) {
                // No sub-categories and it is valid.
                const catIndex = categories.findIndex( ({ name }) => name === vCat )
                categories[catIndex].ids.push(category.id);
            }
            else {
                // Could have sub-categories or is invalid.
                
                validSubCategories.forEach(vSCat => {
                    const keyName = Object.keys(vSCat)[0];
                    if (keyName === vCat) {
                        const subCategories = vSCat[vCat];
                        subCategories.forEach(subCat => {
                            if (category.name.endsWith(subCat)) {
                                const subCatIndex = categories.findIndex( ({ name }) => name === vCat);
                                categories[subCatIndex].ids.push(category.id);
                            }
                        });
                    }
                });
            }
        });

    });

});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function getToken() {
    let token = "";
    $.getJSON(`https://opentdb.com/api_token.php?command=request`, function(data) {
        const responseCode = data.response_code;
        if (responseCode == 0) {
            token = data.token;
        }
        else {
            alert(`ERROR: ${responseCode} - ${responseCodes[responseCode]}`);
        }
    });
    return token;
}

function loadQuestions(token, count) {
    let qs = [];
    let fullLink = `https://opentdb.com/api.php?amount=${count}&token=${token}&type=multiple`;
    $.getJSON(fullLink, function(data) {
        const responseCode = data.response_code;
        if (responseCode == 0) {
            qs = data.results;
        }
        else {
            alert(`ERROR: ${responseCode} - ${responseCodes[responseCode]}`);
        }
    });
    return qs;
}

function loadQuestionsCat(token, count, category) {
    let qs = [];
    let fullLink = `https://opentdb.com/api.php?amount=${count}&token=${token}&category=${category}&type=multiple`;
    $.getJSON(fullLink, function(data) {
        const responseCode = data.response_code;
        if (responseCode == 0) {
            qs = data.results;
        }
        else {
            alert(`ERROR: ${responseCode} - ${responseCodes[responseCode]}`);
        }
    });
    return qs;
}

function shuffle(arr) {
    let arrCopy = JSON.parse(JSON.stringify(arr)); //Deep copy array.
    let shuffled = [];

    while (arrCopy.length > 0) {
        let rndElement = arrCopy[getRandomInt(0, arrCopy.length)];
        shuffled.push(rndElement);
        arrCopy.splice(arrCopy.indexOf(rndElement), 1);
    }
    return shuffled;
}

let correctAnswer = "";
let questionNumber = 0;
let questions = [];
let correctCount = 0;

function showQuestion() {
    if (questionNumber >= questions.length) {
        //There is no next question
        $("#qNumP").remove();
        $("#qInfoP").remove();
        $("#qP").css({
            'font-size': '40px'
        })
        $("#qP").html(`Finished!<br>You Scored: ${correctCount}`);
        $("#qAnswerPanel").empty();
        $("#timerBar").remove();
        return;
    }

    const q = questions[questionNumber];
    $("#qNumP").html(`Question #${questionNumber + 1}`);
    $("#qInfoP").html(`${q.category}<br>${q.difficulty}`);

    $("#qP").html(q.question);

    $("#qAnswerPanel").empty();
    const answers = shuffle(q.incorrect_answers.concat(q.correct_answer));
    correctAnswer = q.correct_answer;
    for (let i = 0; i < answers.length; i++) {
        let newBtn = document.createElement("button");
        newBtn.innerHTML = `${questionLetters[i]}${answers[i]}`;
        newBtn.setAttribute('class', 'answerBtn');
        newBtn.setAttribute('value', answers[i]);
        $("#qAnswerPanel").append(newBtn);
    }
    questionNumber++;

    toggleQuestionTimer();
}

let id = 0;
let timerTicking = false;
function toggleQuestionTimer() {
    if (!timerTicking) {
        $("#timerBar").css({
            'background-color': '#FFFFFF',
            'border-color': '#FFFFFF'
        });
        let width = 1;
        timerTicking = true;
        id = setInterval(function() {
            if (width >= 100) {
                clearInterval(id);
                outOfTime();
            }
            else {
                width++;
                $("#timerBar").css('width', `${width}%`);
            }
        }, 100);
    }
    else {
        resetTimer()
    }
}

function resetTimer() {
    clearInterval(id);
    timerTicking = false;
}

function outOfTime() {
    // If here is reached, they definitely haven't clicked anything and have run out of time on the question.
    // Do a wrong.
    // Will just have to show a red time bar and disable choosing instead of light up an answer with red.
    $("#timerBar").css({
        'background-color': '#FF0000',
        'border-color': '#800000'
    });
    $(".answerBtn").attr('disabled', true);
    lightCorrectAnswer();
    setTimeout(() => {
        showQuestion();
    }, 3000);
    resetTimer();
}

function lightCorrectAnswer() {
    const ansBtns = document.getElementsByClassName("answerBtn");
    for (let btn of ansBtns) {
        if (btn.value === correctAnswer) {
            $(btn).css({
                'font-weight': 'bold',
                'text-decoration': 'none',
                'border-color': '#3be026',
                'background': 'none',
                'background-color': '#3be026'
            });
        }
    }
}

$(document).on("click", ".answerBtn", function() {
    const clickedBtn = this;
    const value = $(this).attr('value');
    const isCorrect = value === correctAnswer;
    const correctAnswerDelay = 3000;
    const nextQuestionDelay = correctAnswerDelay + 3000;

    toggleQuestionTimer();

    $(this).css({
        'border-color': '#FFFFFF',
        'text-decoration': 'underline'
    });

    $(".answerBtn").attr('disabled', true);

    setTimeout(() => {
        if (isCorrect) {
            $(clickedBtn).css({
                'font-weight': 'bold',
                'text-decoration': 'none',
                'border-color': '#3be026',
                'background': 'none',
                'background-color': '#3be026'
            });
            correctCount++;
            correctSound.play();
        }
        else {
            $(clickedBtn).css({
                'border-color': '#c91414',
                'text-decoration': 'none',
                'background': 'none',
                'background-color': '#c91414'
            });
            incorrectSound.play();
            lightCorrectAnswer();
        }
    }, correctAnswerDelay);
    setTimeout(() => {
        showQuestion();
    }, nextQuestionDelay);
});

$("#startBtn").click(function() {
    // Remove welcome div and show the question panel.
    $("#startDiv").remove();
    document.getElementById("questionPanel").style.display = 'flex';
    // Create a session.
    token = getToken();
    // Get a random question from any category
    //questions = loadQuestions(token, 10);
    // Show the question, 4 options as buttons
    showQuestion();

    correctSound = new sound("sounds/correct.wav");
    incorrectSound = new sound("sounds/incorrect.wav");
});

function distributeEvenly(elementCount, targetCount, ranomize) {
    const result = elementCount / targetCount;
    const mantissa = result % 1;
    
    const upCount = Math.round(mantissa * targetCount);
    
    let arr = [];

    for (let i = 0; i < targetCount; i++) {
        if (i < upCount) {
            arr[i] = Math.ceil(result);
        }
        else {
            arr[i] = Math.floor(result);
        }
    }

    if (ranomize) {
        arr = shuffle(arr);
    }

    return arr;
}

function getCategoryQuestions(ids) {
    const questionCounts = distributeEvenly(10, ids.length, true);
    let allQsSubCategories = [];

    for (let i = 0; i < ids.length; i++) {
        allQsSubCategories.push(loadQuestionsCat(token, questionCounts[i], ids[i]));
    }
    let allQs = [];
    
    allQsSubCategories.forEach(qs => {
        qs.forEach(q => {
            allQs.push(q);
        });
    });
    return allQs;
}

function unflap() {
    $("#flapper").animate(
        { deg: 0 },
        {
            duration: 40,
            step: function(now) {
                $(this).css({ transform: `rotate(${now}deg)`});
            }
        }
    );
}

function flap() {
    woodSound.play();
    $("#flapper").animate(
        { deg: -50 },
        {
            duration: 60,
            complete: unflap,
            step: function(now) {
                $(this).css({ transform: `rotate(${now}deg)`});
            }
        }
    );
}

function spinWheel() {
    let fullSpins =  getRandomInt(2, 6);
    let angles = [];
    let currentAngle = 360;
    validCategories.forEach(category => {
        let angleObj = {name: category, angle: currentAngle};
        angles.push(angleObj);
        currentAngle -= 60;
    });

    woodSound = new sound("sounds/wood_tick.wav");
    
    let catIndex = getRandomInt(0, angles.length);
    let randCat = angles[catIndex];
    let actualCategory = categories.find( ({name}) => name === randCat.name);
    questions = getCategoryQuestions(actualCategory.ids);
    console.log(questions);
    let sectorRange = getRandomInt(0, 44) - 22; // Offset by 22 for ahead and after centre of sector.

    let targetAngle = (fullSpins * 360) + randCat.angle + sectorRange;
    const range = 3;
    let hasFlapped = false;
    $("#wheel").animate(
        { deg: targetAngle },
        {
            duration: 5000,
            step: function(now) {
                const flapperPoint = (now - 30) % 60;
                if (hasFlapped && flapperPoint > range) {
                    hasFlapped = false;
                }
                if (!hasFlapped && now > 27 && now < 33) {
                    flap();
                    hasFlapped = true;
                }
                const inRange = (flapperPoint > -range && flapperPoint < range);
                if (!hasFlapped && inRange && now > 60) {
                    flap();
                    hasFlapped = true;
                }
                $(this).css({ transform: `rotate(${now}deg)`});
            }
        }
    );
}

$("#spin").click(function() {
    spinWheel();
});




