function removeOverlap(str1, str2) {
    let overlap = "";
    let len = Math.min(str1.length, str2.length);
  
    for (let i = 1; i <= len; i++) {
        if (str1.slice(-i) === str2.slice(0, i)) {
        overlap = str1.slice(-i);
        }
    }
  
    let finalString = str2.replace(overlap, "");

    if(finalString == "") {
        return "$";
    }
    else {
        return finalString;
    }
}

var totalSymbol = 2;

var symbolNumber = document.getElementById("symbolNumber");
var symbolsBox = document.getElementById("symbolsBox");

document.getElementById("increase").onclick = function() {
    totalSymbol++;
    symbolNumber.value = totalSymbol;
    var newSymbol = document.createElement("input");
    newSymbol.setAttribute("type","text");
    newSymbol.setAttribute("class", "symbol");
    newSymbol.setAttribute("maxlength", "1");
    symbolsBox.appendChild(newSymbol);
}
document.getElementById("decrease").onclick = function() {
    if(totalSymbol >= 2) {
        totalSymbol--;
        symbolNumber.value = totalSymbol;
        symbolsBox.removeChild(symbolsBox.lastChild);
    }
}

var id = 0;

var addStartWith = document.getElementById("addStartWith");
var addContain = document.getElementById("addContain");
var addEndWith = document.getElementById("addEndWith");

var startWithBox = document.getElementById("startWithBox");
var containBox = document.getElementById("containBox");
var endWithBox = document.getElementById("endWithBox");

function deleteElement(elementId) {
    document.getElementById(elementId).remove();
    checkIfEmpty("start", startWithBox);
    checkIfEmpty("contain", containBox);
    checkIfEmpty("end", endWithBox);
}

function checkIfEmpty(inputClass, inputClassBox) {
    if(document.getElementsByClassName(inputClass).length == 0) {
        inputClassBox.classList.add("hide");
    }
}

addStartWith.onclick = function() {
    addInput("start", startWithBox);
}
addContain.onclick = function() {
    addInput("contain", containBox);
}
addEndWith.onclick = function() {
    addInput("end", endWithBox);
}

function addInput(inputClass, inputClassBox) {
    inputClassBox.classList.remove("hide");
    if(document.getElementsByClassName(inputClass).length == 0) {
        inputClassBox.insertAdjacentHTML("beforeend", ' <div class="inputContainer" id="'+id+'"><input class="'+inputClass+'" type="text" value=""/><div class="delete" onclick="deleteElement('+id+')"><i class="fas fa-times"></i></div></div>');
    }
    else {
        inputClassBox.insertAdjacentHTML("beforeend", ' <div class="inputContainer" id="'+id+'"><div class="or">or, </div><input class="'+inputClass+' orWidth" type="text" value=""/><div class="delete" onclick="deleteElement('+id+')"><i class="fas fa-times"></i></div></div>');
    }
    id++;
}


document.getElementById("generate").onclick = function() {
    var isError = false;
    var newString;

    var symbol = document.getElementsByClassName("symbol");
    var symbolExp = "(";
    for(var i=0; i<symbol.length; i++) {
        if(i!=0) symbolExp += "+";
        symbolExp += symbol[i].value;
        if(symbol[i].value == "" || symbol[i].value == undefined) isError = true;
    }
    symbolExp += ")";
    if(symbolExp == "()") symbolExp = "";

    var start = document.getElementsByClassName("start");
    var startExp = "(";
    for(var i=0; i<start.length; i++) {
        if(i!=0) startExp += "+";
        startExp += start[i].value;
        if(start[i].value == "" || start[i].value == undefined) isError = true;
    }
    startExp += ")";
    if(startExp == "()") startExp = "";

    
    var contain = document.getElementsByClassName("contain");
    var containExp = "(";
    for(var i=0; i<contain.length; i++) {
        if(i!=0) containExp += "+";
        containExp += contain[i].value;
        if(contain[i].value == "" || contain[i].value == undefined) isError = true;
    }
    for(var i=0; i<start.length; i++) {
        for(var j=0; j<contain.length; j++) {
            newString = removeOverlap(start[i].value, contain[j].value);
            if(contain[j].value != newString) {
                containExp += "+"+newString;
            }
        }    
    }
    containExp += ")";
    if(containExp == "()") containExp = "";


    var end = document.getElementsByClassName("end");
    var endExp = "(";
    for(var i=0; i<end.length; i++) {
        if(i!=0) endExp += "+";
        endExp += end[i].value;
        if(end[i].value == "" || end[i].value == undefined) isError = true;
    }
    if(contain.length == 0) {
        for(var i=0; i<start.length; i++) {
            for(var j=0; j<end.length; j++) {
                newString = removeOverlap(start[i].value, end[j].value);
                if(end[j].value != newString) {
                    endExp += "+"+newString;
                }
            }    
        }
    }
    else {
        for(var i=0; i<contain.length; i++) {
            for(var j=0; j<end.length; j++) {
                newString = removeOverlap(contain[i].value, end[j].value);
                if(end[j].value != newString) {
                    endExp += "+"+newString;
                }
            }    
        }
    }
    endExp += ")";
    if(endExp == "()") endExp = "";

    if(isError) {
        alert("Please fill up all the field you added or remove them!");
        return;
    }

    var finalRegEx = "";
    finalRegEx += startExp;
    finalRegEx += symbolExp+"*";
    if(containExp != "") finalRegEx += containExp+symbolExp+"*";
    finalRegEx += endExp;

    if(finalRegEx == symbolExp+"*") finalRegEx = symbolExp+finalRegEx;

    console.log(finalRegEx);

    var symbol = document.getElementsByClassName("symbol");
    var alphabet = "{ ";
    for(var i=0; i<symbol.length; i++) {
        if(i!=0) alphabet += ", ";
        alphabet += symbol[i].value;
    }
    alphabet += " }";
    document.getElementById("alphabetTd").innerHTML = alphabet;

    var language = "{ w in "+alphabet+" | w ";
    if(start.length != 0) {    
        language += "start with ";
        for(var i=0; i<start.length; i++) {
            if(i!=0) language += "or ";
            language += '"'+start[i].value+'" ';
        }
    }
    if(start.length != 0 && contain.length != 0) language += "; "

    if(contain.length != 0) {    
        language += "contains ";
        for(var i=0; i<contain.length; i++) {
            if(i!=0) language += "or ";
            language += '"'+contain[i].value+'" ';
        }
    }
    if((start.length != 0 || contain.length != 0) && end.length != 0) language += "; "

    if(end.length != 0) {    
        language += "end with ";
        for(var i=0; i<end.length; i++) {
            if(i!=0) language += "or ";
            language += '"'+end[i].value+'" ';
        }
    }

    language += "}";

    document.getElementById("languageTd").innerHTML = language;

    drawGraph(finalRegEx);
}

function drawGraph(regEx) {
    document.getElementById("preGenerate").classList.add("hide");
    document.getElementById("postGenerate").classList.remove("hide");


    automaton = noam.re.string.toAutomaton(regEx);
    automaton = noam.fsm.convertEnfaToNfa(automaton);
    automaton = noam.fsm.convertNfaToDfa(automaton);
    automaton = noam.fsm.minimize(automaton);
    automaton = noam.fsm.convertStatesToNumbers(automaton);

    var dotString = noam.fsm.printDotFormat(automaton);
    console.log(dotString);
    var gvizXml = Viz(dotString, "svg");

    document.getElementById("automatonGraph").innerHTML = gvizXml;
    document.getElementById("automatonTable").innerHTML = noam.fsm.printHtmlTable(automaton);
}


document.getElementById("generateAgain").onclick = function() {
    document.getElementById("preGenerate").classList.remove("hide");
    document.getElementById("postGenerate").classList.add("hide");
}