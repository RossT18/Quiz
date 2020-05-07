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

let categories = [];
const validCategories = [
    'General Knowledge',
    'Geography',
    'Science',
    'Sports',
    'Entertainment',
    'History'
];

class Category {
    constructor(name, ids) {
        this._name = name;
        this._ids = ids;
    }

    get name() {
        return this._name;
    }
    get ids() {
        return this._ids;
    }
    get firstId() {
        if (this._ids.length > 0) {
            return this._ids[0];
        }
        else {
            return undefined;
        }
    }
}


$.ajaxSetup({ async: false }); // Probably should deal with async methods properly but this will do, for now.

$.getJSON('https://opentdb.com/api_category.php', function(data) {
    const categoriesRes = data.trivia_categories;
    for (let i = 0; i < categoriesRes.length; i++) {
        // For each category retrieved.

        let thisCategory = new Category(categoriesRes[i].name, categoriesRes[i].id);
        categories.push(thisCategory);

        


        /*

        const catName = categoriesRes[i].name;
        const catId = categoriesRes[i].id;
        
        validCategories.forEach(validCat => {
            if (validCat === catName) {
                // Name is exactly the same. Therefore only 1
                let catObj = {name: catName, ids: [catId]}
            }
            else if (catName.startsWith(validCat)) {
                // It's got sub-categories because it only starts with a valid category name
                categories.forEach(cat => {
                    if (cat.name === catName) {
                        // Already added to categories. Just add 1.
                    }
                });
            }
        });*/
    }
});

// {name, ids[]}

//#region Loading Category Information
/*
let showingInfo = false;
const categories = [];



function makeTable(headers, id) {
    let table  = document.createElement('table');
    table.setAttribute("id", id);
    let thead = table.createTHead();
    for (let i = 0; i < headers.length; i++) {
        let th = thead.appendChild(document.createElement("th"));
        th.appendChild(document.createTextNode(headers[i]));
    }

    return table;
}


$("#infoBtn").click(function() {
    let tableID = "infoTable";
    if (!showingInfo) {
        // Show the table
        const table = makeTable(["Category", "Easy", "Medium", "Hard", "Total"], tableID);
        for (let i = 0; i < categories.length; i++) {
            let tr = table.insertRow();
    
            $.getJSON("https://opentdb.com/api_count.php?category=" + categories[i].id, function(data) {
                let thisCategoryData = data.category_question_count;
                
                let tdCat = tr.insertCell();
                tdCat.appendChild(document.createTextNode(categories[i].name));
    
                let tdEasy = tr.insertCell();
                tdEasy.appendChild(document.createTextNode(thisCategoryData.total_easy_question_count));
    
                let tdMed = tr.insertCell();
                tdMed.appendChild(document.createTextNode(thisCategoryData.total_medium_question_count));
    
                let tdHard = tr.insertCell();
                tdHard.appendChild(document.createTextNode(thisCategoryData.total_hard_question_count));
    
                let tdTotal = tr.insertCell();
                tdTotal.appendChild(document.createTextNode(thisCategoryData.total_question_count));
            });
    
        }
        $('#quizInfo').append(table);
        showingInfo = true;
    }
    else {
        // Hide the table.
        $(`#${tableID}`).remove();
        showingInfo = false;
    }
});
*/
//#endregion

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
        }
        else {
            $(clickedBtn).css({
                'border-color': '#c91414',
                'text-decoration': 'none',
                'background': 'none',
                'background-color': '#c91414'
            });
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
    let token = getToken();
    // Get a random question from any category
    questions = loadQuestions(token, 10);
    // Show the question, 4 options as buttons
    showQuestion();
});

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
    
    let catIndex = getRandomInt(0, angles.length);
    let randCat = angles[catIndex];

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