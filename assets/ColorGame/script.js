var colorText = document.getElementById("color");
var squares = document.getElementsByClassName("square");
var message = document.getElementById("message");
var newButton = document.getElementById("newButton");
newButton.addEventListener("click", newButtonClick);
var buttonEasy = document.getElementById("buttonEasy");
buttonEasy.addEventListener("click", function() {buttonDifficultyClick(2,this)});
var buttonMedium = document.getElementById("buttonMedium");
buttonMedium.addEventListener("click", function() {buttonDifficultyClick(4,this)});
var buttonHard = document.getElementById("buttonHard");
buttonHard.addEventListener("click", function() {buttonDifficultyClick(6,this)});
buttonHard.classList.add("selected");
var buttonCrazy = document.getElementById("buttonCrazy");
buttonCrazy.addEventListener("click", function() {buttonDifficultyClick(9,this)});

var colorList = [];
var num = 6;
generateNewColorGame();

for(var i = 0 ; i < 9 ; i++)
{
    squares[i].addEventListener("click",function() {squareClick(this)});
}


function buttonDifficultyClick(amount, btn) {
    buttonEasy.classList.remove("selected");
    buttonMedium.classList.remove("selected");
    buttonHard.classList.remove("selected");
    buttonCrazy.classList.remove("selected");
    btn.classList.add("selected");

    num = amount;
    generateNewColorGame();
}

function newButtonClick() {
    generateNewColorGame();
}

function squareClick(square) {
    if(square.style.backgroundColor == colorText.textContent)
        win();
        else
        tryagain(square);
}
function tryagain(square) {
    square.style.opacity = 0;
    message.textContent = "Try Again!"
}

function win() {
    console.log("VICTORY");
    message.textContent = "Correct!"
    for(var i=0;i<num;i++)
    {
        squares[i].style.backgroundColor = colorText.textContent;
    }
}

function generateNewColorGame() {
    message.textContent = "(--------)";
    colorList = [];

    for(var i =0;i<num;i++)
    {
        colorList.push(generateColor());
    }

    for(var i=0;i<num;i++)
    {
        squares[i].style.backgroundColor = colorList[i];
        squares[i].style.opacity = 1;
    }
    for(var i=num;i<squares.length;i++)
    {
        squares[i].style.opacity = 0;
    }


    colorText.textContent = colorList[Math.floor(Math.random()*num)];
}
function generateColor()
{
    var randomColorR = Math.floor(Math.random()*256);
    var randomColorG = Math.floor(Math.random()*256);
    var randomColorB = Math.floor(Math.random()*256);
    return "rgb("+randomColorR+", "+randomColorG+", "+randomColorB+")";
}