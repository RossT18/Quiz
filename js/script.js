const responseCodes = [
    'success',
    'no results',
    'invalid parameter',
    'token not found',
    'token empty'
];

const categories = [];

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }


$.getJSON('https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple', function(data) {
    const responseCode = data.response_code;
    if (responseCode != 0) {
        alert(responseCode + " : " + responseCodes[responseCode]);
    }
    else {
        const results = data.results;
        const qCount = results.length; // Question Count
        let qNumber = getRandomInt(0, qCount);
        let text = `Category: ${results[qNumber].category}<br>
                    Question: ${results[qNumber].question}<br>`
    }
    
});

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
    const table = makeTable(["Category", "Easy", "Medium", "Hard", "Total"], "infoTable");
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
});