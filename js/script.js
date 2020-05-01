const responseCodes = [
    'success',
    'no results',
    'invalid parameter',
    'token not found',
    'token empty'
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

$("#startBtn").click(function() {
    // Create a session.
    let token = getToken();
    // Get a random question from any category
    let questionNumber = 0;
    const questionList = loadQuestions(token, 10);
    // Show the question, 4 options as buttons
    const q = questionList[questionNumber];
    const questionOutput = `<b>Question ${questionNumber + 1}</b><br>
                            Category: ${q.category}<br>
                            Difficulty: ${q.difficulty}<br>
                            <br>
                            <b>${q.question}</b><br>`
    $("#questionPanel").append(questionOutput);
});