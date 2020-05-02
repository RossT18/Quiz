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

$.ajaxSetup({ async: false }); // Probably should deal with async methods properly but this will do, for now.

//#region Loading Category Information
let showingInfo = false;
const categories = [];

$.getJSON('https://opentdb.com/api_category.php', function(data) {
    const categoriesRes = data.trivia_categories;
    for (let i = 0; i < categoriesRes.length; i++) {
        const category = categoriesRes[i];
        categories[i] = category;
    }
});

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

/*
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
        return;
    }

    const q = questions[questionNumber];
    $("#qNumP").html(`Question ${questionNumber + 1}`);
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
}

$(document).on("click", ".answerBtn", function() {

    const clickedBtn = this;
    const value = $(this).attr('value');
    const isCorrect = value === correctAnswer;
    const correctAnswerDelay = 3000;
    const nextQuestionDelay = correctAnswerDelay + 3000;

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
                'border-color': '#33db1d'
            });
            correctCount++;
        }
        else {
            $(clickedBtn).css({
                'border-color': '#FF0000',
                'text-decoration': 'none'
            });
            const ansBtns = document.getElementsByClassName("answerBtn");
            for (let btn of ansBtns) {
                if (btn.value === correctAnswer) {
                    $(btn).css({
                        'font-weight': 'bold',
                        'text-decoration': 'none',
                        'border-color': '#33db1d'
                    });
                }
            }
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

//#region Fullscreen
/* Get the documentElement (<html>) to display the page in fullscreen */
/*
function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}*/
//#endregion