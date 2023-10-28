function validateSymbol(input){
    length = input.value.replace(/[,+*|]/g, '').length;
    input.value = input.value.replace(/[,+|*]/g, '').substr(length-1, length);
}
function validateState(input){
    input.value = input.value.replace(/[,+|*]/g, '');
}

function dfaTableGenerate(DFA, StateOrder) {
    var dfaStates = StateOrder;
    var dfaSymbols = Object.keys(DFA[dfaStates[0]]);
    dfaSymbols = dfaSymbols.filter(function(e) { return e != "*" })

    var transitionTable = document.createElement("table");
    var td, tr, th;
    tr = document.createElement("tr");
    th = document.createElement("th");
    tr.appendChild(th);
    for(i = 0; i<dfaSymbols.length; i++) {
        th = document.createElement("th");
        th.innerHTML = dfaSymbols[i];
        tr.appendChild(th);
    }
    transitionTable.appendChild(tr);

    for(i = 0; i<dfaStates.length; i++) {
        tr = document.createElement("tr");

        td = document.createElement("td");
        td.innerHTML = "";
        td.setAttribute("class","bold");
        if(i == 0) td.innerHTML += "→ ";
        if(DFA[dfaStates[i]]["*"] == "*") td.innerHTML += "* ";
        if(dfaStates[i].includes(",")) {
            td.innerHTML += "{"+dfaStates[i]+"}";
        } else {
            td.innerHTML += dfaStates[i];
        }

        tr.appendChild(td);

        for(j = 0; j<dfaSymbols.length; j++) {
            td = document.createElement("td");
            stateData = DFA[dfaStates[i]][dfaSymbols[j]];
            if(stateData.includes(",")) {
                td.innerHTML = "{"+stateData+"}";
            } else {
                td.innerHTML = stateData;
            }
            tr.appendChild(td);
        }
        
        transitionTable.appendChild(tr);
    }

    return transitionTable;
}

function nfaToDfa(NFA, StateOrder) {
    var DFA = {};
    var stateOrders = [];

    var symbols = Object.keys(NFA[StateOrder[0]]);
    symbols = symbols.filter(function(e) { return e != "*" });
    var knownStates = [StateOrder[0]];
    var unknownStates = [];
    var currentTransition = {};
    var transition;
    for(var i=0; i<symbols.length; i++) {
        try {            
            transition = NFA[knownStates[0]][[symbols[i]]].split(",").sort();
            transition = transition.toString();
        }
        catch {
            transition = "";
        }
        
        if(transition == "") {
            currentTransition[symbols[i]] = "qØ";
        }
        else {
            currentTransition[symbols[i]] = transition;
        }

        if((!knownStates.includes(transition))) {
            if(transition == "") {
                unknownStates.push("qØ");
            }
            else {
                unknownStates.push(transition);
            }
        }
    }

    DFA[knownStates[0]] = currentTransition;
    if(!stateOrders.includes(knownStates[0])){
        stateOrders.push(knownStates[0]);
    }

    var k = 0;
    var pseudoCurrentTransition = {};
    var unknownState, unknownStateArray, subTransition;

    while (unknownStates[k]) {
        unknownState = unknownStates[k];
        knownStates.push(unknownState);

        unknownStateArray = unknownState.split(",");
        pseudoCurrentTransition = {};
        for(var j=0; j<symbols.length; j++) {
            transition = [];
            unknownStateArray.forEach(state => {
                if(state == "qØ") {
                    transition.push("qØ");

                }
                else {
                    subTransition = NFA[state][symbols[j]].split(",");
                    subTransition.forEach(element => {
                        if((!transition.includes(element)) && element != '') {
                            transition.push(element);
                        }
                    }); 
                }
            });
            newCreatedState = transition.sort().toString();
            if(!knownStates.includes(newCreatedState)) {
                if(newCreatedState == "") {
                    unknownStates.push("qØ");
                }
                else {
                    unknownStates.push(newCreatedState);
                }
            }
            pseudoCurrentTransition[symbols[j]] = newCreatedState;
        }

        
        // console.log(unknownState+"->");
        // console.log(pseudoCurrentTransition);
        // console.log("--------------------");
        DFA[unknownState] = pseudoCurrentTransition;
        if(!stateOrders.includes(unknownState)){
            stateOrders.push(unknownState);
        }
        k++;
    }

    var DFAStates = Object.keys(DFA);
    var DFASymbols = Object.keys(DFA[DFAStates[0]]);
    DFAStates.forEach(state => {
        DFASymbols.forEach(symbol => {
            if(DFA[state][symbol] == "") {
                DFA[state][symbol] = "qØ";
            }            
        });
        DFA[state]["*"] = "";
        states = state.split(",");
        states.forEach(element => {
            try{
                if(NFA[element]["*"] == "*") {
                    DFA[state]["*"] = "*";
                }
            } 
            catch {}
        });
    });

    if(stateOrders.includes("qØ")) {
        stateOrders = stateOrders.filter(item => item != "qØ");
        stateOrders.push("qØ");
    }

    return {
        "dfa": DFA,
        "stateOrder" : stateOrders
    }
}

function generateNfa(NFA,StateOrder) {
    var firstState = StateOrder[0];

    var currentInput, currentState, pseudoLastState ;

    var vizString = "digraph {\n";
    vizString += "graph [rankdir=LR];\n";
    vizString += "node [shape=circle];\n";
    vizString += "secret_node [style=invis, shape=point];\n";
    vizString += 'secret_node -> "'+firstState+'";\n';

    var n, m, regExp, preRegExp, currentInput;
    var nextState = [];
    m = StateOrder.length;

    for(var i=0; i<m; i++) {
        currentState = StateOrder[i];
        n = Object.keys(NFA[currentState]).length;
        for(var j=0; j<n; j++) {

            currentInput = Object.keys(NFA[currentState])[j];

            if(currentInput != "*") {
                nextState = NFA[currentState][currentInput].split(",");
                for(var k=0; k<nextState.length; k++) {
                    if(nextState[k] != "" && nextState[k] != undefined) {
                        preRegExp = `"${currentState}" -> "${nextState[k]}" \\[label = "(.*)"];`;
                        regExp = new RegExp(preRegExp, "g");

                        if(vizString.match(regExp) != null) {
                            vizString = vizString.replace(regExp, `"${currentState}" -> "${nextState[k]}" [label = "$1, ${currentInput}"];`)   
                        }
                        else {
                            vizString += ('"'+currentState+'" -> "'+nextState[k]+'" [label = "'+currentInput+'"];\n');
                        }
                    }
                }
            }
            else {
                if(NFA[currentState][currentInput] == "*") {
                    vizString += '"'+currentState+'" [shape = doublecircle ];\n';
                }
            }
        }
    }
    vizString += "}";
    return vizString;
}

function generateDfa(NFA, StateOrder) {
    var firstState = StateOrder[0];
    printFirstState = firstState.includes(",") ? "{"+firstState+"}" : firstState;

    var currentInput, currentState;

    var vizString = "digraph {\n";
    vizString += "graph [rankdir=LR];\n";
    vizString += "node [shape=circle];\n";
    vizString += "secret_node [style=invis, shape=point];\n";
    vizString += 'secret_node -> "'+printFirstState+'";\n';

    var n, m, regExp, preRegExp, currentInput;
    var nextState;
    m = StateOrder.length;

    for(var i=0; i<m; i++) {
        currentState = StateOrder[i];
        printCurrentState = currentState.includes(",") ? "{"+currentState+"}" : currentState;
        n = Object.keys(NFA[currentState]).length;
        for(var j=0; j<n; j++) {

            currentInput = Object.keys(NFA[currentState])[j];

            if(currentInput != "*") {
                nextState = NFA[currentState][currentInput];
                printNextState = nextState.includes(",") ? "{"+nextState+"}" : nextState;

                if(nextState != "" && nextState != undefined) {
                    preRegExp = `"${printCurrentState}" -> "${printNextState}" \\[label = "(.*)"];`;
                    regExp = new RegExp(preRegExp, "g");

                    if(vizString.match(regExp) != null) {
                        vizString = vizString.replace(regExp, `"${printCurrentState}" -> "${printNextState}" [label = "$1, ${currentInput}"];`)   
                    }
                    else {
                        vizString += ('"'+printCurrentState+'" -> "'+printNextState+'" [label = "'+currentInput+'"];\n');
                    }
                }
            }
            else {
                if(NFA[currentState][currentInput] == "*") {
                    vizString += '"'+printCurrentState+'" [shape = doublecircle ];\n';
                }
            }
        }
    }
    vizString += "}";
    return vizString;
}

var totalSymbol = 2;

var symbolNumber = document.getElementById("symbolNumber");
var symbolsBox = document.getElementById("symbolsBox");

var symbolRegExp = "[";

document.getElementById("increaseSymbol").onclick = function() {
    var newSymbol = document.createElement("input");
    newSymbol.setAttribute("type","text");
    newSymbol.setAttribute("class", "symbol");
    newSymbol.setAttribute("onkeyup", "validateSymbol(this)");
    newSymbol.setAttribute("value", totalSymbol);
    newSymbol.setAttribute("autocapitalize", "none");
    symbolsBox.appendChild(newSymbol);
    totalSymbol++;
    symbolNumber.value = totalSymbol;
}
document.getElementById("decreaseSymbol").onclick = function() {
    if(totalSymbol >= 2) {
        totalSymbol--;
        symbolNumber.value = totalSymbol;
        symbolsBox.removeChild(symbolsBox.lastChild);
    }
}

var totalState = 2;

var stateNumber = document.getElementById("stateNumber");
var statesBox = document.getElementById("statesBox");

document.getElementById("increaseState").onclick = function() {
    var newState = document.createElement("input");
    newState.setAttribute("type","text");
    newState.setAttribute("class", "state");
    newState.setAttribute("onkeyup", "validateState(this)");
    newState.setAttribute("autocapitalize", "none");
    newState.setAttribute("value", "q"+totalState);
    statesBox.appendChild(newState);
    totalState++;
    stateNumber.value = totalState;
}
document.getElementById("decreaseState").onclick = function() {
    if(totalState >= 2) {
        totalState--;
        stateNumber.value = totalState;
        statesBox.removeChild(statesBox.lastChild);
    }
}

function printNfaPreview() {
    var table = document.getElementById("transitionHtmlTable");

    var columnRowTableData = columnRowTable(table);
    var NFA = columnRowTableData.json;
    var NFAOrder = columnRowTableData.stateOrder;

    var vizString = generateNfa(NFA,NFAOrder);

    var svgXml = Viz(vizString, "svg");   
    document.getElementById("nfaPreview").innerHTML = svgXml;
}

document.getElementById("nextStep").onclick = function() {
    var isError = false;
    
    var symbol = document.getElementsByClassName("symbol");
    var state = document.getElementsByClassName("state");
    
    symbolRegExp = "[";
    for(var i=0; i<symbol.length; i++) {
        if(symbol[i].value == "" || symbol[i].value == undefined) isError = true;
        symbolRegExp += symbol[i].value;
    }
    symbolRegExp += "]";

    document.getElementById("transitionList").innerHTML = "";

    for(var i=0; i<state.length; i++) {
        document.getElementById("transitionList").insertAdjacentHTML("beforeend", `<div class="addState" onclick="addTransition('${state[i].value}')">${state[i].value}</div>`);
        if(state[i].value == "" || state[i].value == undefined) isError = true;
    }

    if(isError) {
        alert("Please fill up all the field or remove them!");
        return;
    }

    document.getElementById("defineNfa").classList.add("hide");
    document.getElementById("defineTransition").classList.remove("hide");

    var transitionTable = document.createElement("table");
    transitionTable.setAttribute("id", "transitionHtmlTable")
    var th,tr,td;
    tr = document.createElement("tr");
    for(var i=-2; i<symbol.length; i++) {      
        th = document.createElement("th");
        if(i != -2) th.innerHTML = "*";
        if(i != -1 && i != -2) th.innerHTML = symbol[i].value;
        tr.append(th);
    }
    transitionTable.append(tr);

    for(var j=0; j<state.length; j++) {
        tr = document.createElement("tr");
        for(var i=0; i<=symbol.length+1; i++) {      
            td = document.createElement("td");
            if(i == 0){
                td.setAttribute("class","bold");
                if(j == 0) {
                    td.setAttribute("class","bold start");
                }
                td.innerHTML = state[j].value;
            }
            else if(i == 1){
                td.setAttribute("onclick","setFinalState(this)");
            }
            else {
                td.setAttribute("onclick","openTransitionMenu(this)");
            }
            tr.append(td);
        }
        transitionTable.append(tr);
    }

    document.getElementById("transitionTable").append(transitionTable);

    printNfaPreview();
}

var currentElement;

function openTransitionMenu(element){
    document.getElementById("transitionListBox").classList.remove("hide");
    currentElement = element;
}
function addTransition(state) {
    if(currentElement.innerHTML != '') currentElement.innerHTML += ",";
    currentElement.innerHTML += state;
    document.getElementById("transitionListBox").classList.add("hide");

    printNfaPreview();
}

document.getElementById("closeTransitionListBox").onclick = function() {
    document.getElementById("transitionListBox").classList.add("hide"); 
}


document.getElementById("removeTransition").onclick = function() {
    document.getElementById("transitionListBox").classList.add("hide"); 
    currentElement.innerHTML = "";
    
    printNfaPreview();
}

function setFinalState(element) {
    if(element.innerHTML == "") {
        element.innerHTML = "*";
    }
    else {
        element.innerHTML = "";
    }
    
    printNfaPreview();
}




function previousStep() {
    document.getElementById("defineNfa").classList.remove("hide");
    document.getElementById("defineTransition").classList.add("hide");
    document.getElementById("transitionTable").innerHTML = "";
    document.getElementById("transitionList").innerHTML = "";
}

function previousPreviousStep() {
    document.getElementById("defineTransition").classList.remove("hide");
    document.getElementById("convertedDfa").classList.add("hide");
}

document.getElementById("backButton").onclick = function() {
    if(!document.getElementById("convertedDfa").classList.contains("hide")) {
        previousPreviousStep();
    }   
    else if(!document.getElementById("defineTransition").classList.contains("hide")) {
        previousStep();
    }
    else {
        location.href = "index.html";
    }
}


document.getElementById("convertToDfa").onclick = function() {
    
    var table = document.getElementById("transitionHtmlTable");

    var columnRowTableData = columnRowTable(table);
    var NFA = columnRowTableData.json;
    var NFAOrder = columnRowTableData.stateOrder;
    
    var nfaToDfaData = nfaToDfa(NFA,NFAOrder);
    var DFA = nfaToDfaData.dfa;
    var stateOrder = nfaToDfaData.stateOrder;

    var vizString = generateDfa(DFA, stateOrder);
    var svgXml = Viz(vizString, "svg");   

    var dfaTransitionTable = dfaTableGenerate(DFA, stateOrder);

    document.getElementById("dfaTransitionTable").innerHTML = "";
    document.getElementById("dfaTransitionTable").appendChild(dfaTransitionTable);
    document.getElementById("automatonGraph").innerHTML = svgXml;
    document.getElementById("convertedDfa").classList.remove("hide");
    document.getElementById("defineTransition").classList.add("hide");
}



document.getElementById("generateAgain").onclick = function() {
    document.getElementById("convertedDfa").classList.add("hide");
    document.getElementById("defineNfa").classList.remove("hide");
    document.getElementById("transitionTable").innerHTML = "";
    document.getElementById("transitionList").innerHTML = "";
}