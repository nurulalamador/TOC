function generateNfa(NFA) {
    var firstState = Object.keys(NFA)[0];

    var currentInput, currentState, pseudoLastState ;

    var vizString = "digraph {\n";
    vizString += "graph [rankdir=LR];\n";
    vizString += "node [shape=circle];\n";
    vizString += "secret_node [style=invis, shape=point];\n";
    vizString += 'secret_node -> "'+firstState+'";\n';

    var n, m, regExp, preRegExp, currentInput;
    var nextState = [];
    m = Object.keys(NFA).length;

    for(var i=0; i<m; i++) {
        currentState = Object.keys(NFA)[i];
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

    console.log(vizString);
    return vizString;
}


function generateNfaTree(NFA, input) {
    var lastState = [Object.keys(NFA)[0]];

    var currentInput, currentState, pseudoLastState ;

    var vizString = "digraph {\n";

    var c1 = 1;
    var c2 = 2;

    vizString += "node [shape=circle];\n";
    vizString += "secret_node [style=invis, shape=point];\n";
    vizString += 'secret_node -> "'+lastState[0]+c1+'";\n';

    for(var i=0; i<input.length; i++) {
        currentInput = input.charAt(i);
        pseudoLastState = [];
        for(var j=0; j<lastState.length; j++) {
            //console.log(lastState);
            try {
                currentState = NFA[lastState[j]][currentInput].split(",");
            }
            catch (error) {
                currentState = [];
            }

            if(lastState[j] == '' || lastState[j] == undefined) {
                vizString += '"'+lastState[j]+c1+'" [label = "(Stuck)" ];\n';
                vizString += '"'+lastState[j]+c1+'" [shape = plain ];\n';
            }
            else {
                vizString += '"'+lastState[j]+c1+'" [label = "'+lastState[j]+'" ];\n';
            }
            for(var k=0; k<currentState.length; k++) {
                pseudoLastState.push(currentState[k]);
                try {
                    if(i == input.length-1 && NFA[currentState[k]]["*"] == "*") {
                        vizString += '"'+currentState[k]+c2+'" [shape = doublecircle ];\n';
                    }
                }
                catch(error) {}
                vizString += ('"'+lastState[j]+c1+'" -> "'+currentState[k]+c2+'" [label = "'+currentInput+'" ];\n');
                //console.log('"'+lastState[j]+'" -> "'+currentState[k]+'" [label = "'+currentInput+'" ];\n');
                c2++;
            }
            c1++;
        }

        lastState = pseudoLastState;
    }
    for(var j=0; j<lastState.length; j++) {
        if(lastState[j] == '' || lastState[j] == undefined) {
            vizString += '"'+lastState[j]+c1+'" [label = "(Stuck)" ];\n';
            vizString += '"'+lastState[j]+c1+'" [shape = plain ];\n';
        }
        else {
            vizString += '"'+lastState[j]+c1+'" [label = "'+lastState[j]+'" ];\n';
        }
        c1++;
    }
    vizString += "}";

    return vizString;
}


var totalSymbol = 2;

var symbolNumber = document.getElementById("symbolNumber");
var symbolsBox = document.getElementById("symbolsBox");

document.getElementById("increaseSymbol").onclick = function() {
    totalSymbol++;
    symbolNumber.value = totalSymbol;
    var newSymbol = document.createElement("input");
    newSymbol.setAttribute("type","text");
    newSymbol.setAttribute("class", "symbol");
    newSymbol.setAttribute("maxlength", "1");
    symbolsBox.appendChild(newSymbol);
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
    newState.setAttribute("maxlength", "1");
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

document.getElementById("nextStep").onclick = function() {
    var isError = false;
    
    var symbol = document.getElementsByClassName("symbol");
    var state = document.getElementsByClassName("state");

    for(var i=0; i<symbol.length; i++) {
        if(symbol[i].value == "" || symbol[i].value == undefined) isError = true;
    }
    for(var i=0; i<state.length; i++) {
        document.getElementById("transitionList").insertAdjacentHTML("beforeend", `<div class="addState" onclick="addTransition('${state[i].value}')">${state[i].value}</div>`);
        if(state[i].value == "" || state[i].value == undefined) isError = true;
    }

    if(isError) {
        alert("Please fill up all the field you added or remove them!");
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

    var table = document.getElementById("transitionHtmlTable");
    var NFA = columnRowTable(table);
    var vizString = generateNfa(NFA);
    var svgXml = Viz(vizString, "svg");   
    document.getElementById("nfaPreview").innerHTML = svgXml;
}

document.getElementById("closeTransitionListBox").onclick = function() {
    document.getElementById("transitionListBox").classList.add("hide"); 
}


document.getElementById("removeTransition").onclick = function() {
    document.getElementById("transitionListBox").classList.add("hide"); 
    currentElement.innerHTML = "";
    var table = document.getElementById("transitionHtmlTable");
    var NFA = columnRowTable(table);
    var vizString = generateNfa(NFA);
    var svgXml = Viz(vizString, "svg");   
    document.getElementById("nfaPreview").innerHTML = svgXml;
}

function setFinalState(element) {
    if(element.innerHTML == "") {
        element.innerHTML = "*";
    }
    else {
        element.innerHTML = "";
    }
    var table = document.getElementById("transitionHtmlTable");
    var NFA = columnRowTable(table);
    var vizString = generateNfa(NFA);
    var svgXml = Viz(vizString, "svg");   
    document.getElementById("nfaPreview").innerHTML = svgXml;
}




function previousStep() {
    document.getElementById("defineNfa").classList.remove("hide");
    document.getElementById("defineTransition").classList.add("hide");
    document.getElementById("transitionTable").innerHTML = "";
    document.getElementById("transitionList").innerHTML = "";
}

function previousPreviousStep() {
    document.getElementById("defineTransition").classList.remove("hide");
    document.getElementById("finalNfaTree").classList.add("hide");
}

document.getElementById("backButton").onclick = function() {
    if(!document.getElementById("finalNfaTree").classList.contains("hide")) {
        previousPreviousStep();
    }   
    else if(!document.getElementById("defineTransition").classList.contains("hide")) {
        previousStep();
    }
    else {

    }
}


document.getElementById("generateTree").onclick = function() {
    document.getElementById("finalNfaTree").classList.remove("hide");
    document.getElementById("defineTransition").classList.add("hide");
    
    var table = document.getElementById("transitionHtmlTable");
    var inputString = document.getElementById("inputString").value;
    document.getElementById("reInputString").value = inputString;
    var NFA = columnRowTable(table);
    console.log(NFA);
    var vizString = generateNfaTree(NFA, inputString);

    var svgXml = Viz(vizString, "svg");

    document.getElementById("nfaTreeDiagram").innerHTML = svgXml;
}

document.getElementById("generateAgain").onclick = function() {
    document.getElementById("finalNfaTree").classList.add("hide");
    document.getElementById("defineNfa").classList.remove("hide");
    document.getElementById("transitionTable").innerHTML = "";
    document.getElementById("transitionList").innerHTML = "";
}


document.getElementById("reGenerateTree").onclick = function() {   
    var table = document.getElementById("transitionHtmlTable");
    var inputString = document.getElementById("reInputString").value;
    var NFA = columnRowTable(table);
    var vizString = generateNfaTree(NFA, inputString);
    var svgXml = Viz(vizString, "svg");
    document.getElementById("nfaTreeDiagram").innerHTML = svgXml;
}