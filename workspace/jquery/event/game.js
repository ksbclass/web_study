const height = 34, width = 20; // 필드 크기
const arr = [
    [[2,2],[1,2],[1,1],[0,1]],
    [[1,1],[1,0],[0,2],[0,1]],
    [[2,1],[1,1],[1,2],[0,2]],
    [[1,2],[1,1],[0,1],[0,0]],
    [[1,2],[1,1],[0,2],[0,1]],
    [[2,0],[1,1],[1,0],[0,0]],
    [[1,1],[0,2],[0,1],[0,0]],
    [[2,2],[1,2],[1,1],[0,2]],
    [[1,2],[1,1],[1,0],[0,1]],
    [[3,1],[2,1],[1,1],[0,1]],
    [[1,3],[1,2],[1,1],[1,0]],
    [[2,2],[2,1],[1,1],[0,1]],
    [[1,0],[0,2],[0,1],[0,0]],
    [[2,2],[1,2],[0,2],[0,1]],
    [[1,2],[1,1],[1,0],[0,2]],
    [[2,2],[2,1],[1,2],[0,2]],
    [[2,2],[2,1],[2,0],[1,0]],
    [[2,1],[1,1],[0,1],[0,2]],
    [[1,2],[0,2],[0,1],[0,0]]
];
const list = [1,0,3,2,4,6,7,8,5,10,9,12,13,14,11,16,17,18,15];
const colorarr = ["red","yellow","green","darkgreen","blue","purple"];
const tileColor = "rgb(9,17,26)";
const wallColor = "rgb(22,41,63)";
let shapeColor;
let shapeColorIndex, nextColorIndex;
let movingSpeed;
let fastMode = false;
let initSpeed = 500, deltaSpeed = 40, fastSpeed = 25;
let shapeCell;
let existField;
let shapePoint;
let createPoint = [1, parseInt(width / 2) - 2];
let currentShape, nextShape;
let score;

init();

// 키 입력 처리
document.onkeydown = keyDownEventHandler;
function keyDownEventHandler(e){
    switch(e.keyCode){
        case 37: setTimeout("moveLR(-1)",0); break;
        case 39: setTimeout("moveLR(1)",0); break;
        case 32: setTimeout("rotateShape()",0); break;
        case 40: moveFast(); break;
    }
}
document.onkeyup = keyUpEventHandler;
function keyUpEventHandler(e){
    if(e.keyCode == 40) moveSlow();
}

// 초기 설정
function init(){
    drawField();
    initExistField();
    setWall();
    nextColorIndex = -1;
    movingSpeed = initSpeed;
    shapeCell = [];
    shapePoint = [1, 1];
    score = 0;
    chooseNextShape();
    chooseNextColor();
    createShape();
}

function gebi(y,x){
    const ret = document.getElementById(`${y} ${x}`);
    return ret;
}

// 필드 초기화
function initExistField(){
    existField = new Array(height);
    for(let i = 0; i < height; i++) existField[i] = new Array(width);
    for(let i = 0; i < height; i++)
        for(let j = 0; j < width; j++)
            existField[i][j] = false;
}
function drawField(){
    let fieldTag = "<table id=\"gameTable\" border=0>";
    for(let i = 0; i < height; i++){
        fieldTag += "<tr>";
        for(let j = 0; j < width; j++)
            fieldTag += `<td id="${i} ${j}"></td>`;
        fieldTag += "</tr>";
    }
    document.write(fieldTag);
}
function setWall(){
    for(let i = 0; i < height; i++){
        gebi(i, 0).style.background = wallColor;
        gebi(i, width - 1).style.background = wallColor;
        existField[i][0] = true;
        existField[i][width - 1] = true;
    }
    for(let i = 0; i < width; i++){
        gebi(0, i).style.background = wallColor;
        gebi(height - 1, i).style.background = wallColor;
        existField[0][i] = true;
        existField[height - 1][i] = true;
    }
}

// 도형 생성
function chooseNextShape(){
    nextShape = parseInt(Math.random() * arr.length);
}
function chooseNextColor(){
    if(++nextColorIndex == colorarr.length)
        nextColorIndex = 0;
}
function createShape(){
    shapePoint[0] = createPoint[0];
    shapePoint[1] = createPoint[1];
    currentShape = nextShape;
    currentColorIndex = nextColorIndex;
    shapeColor = colorarr[currentColorIndex];
    const shape = arr[currentShape];
    chooseNextShape();
    chooseNextColor();
    displayNextShape();
    for(let i = 0; i < shape.length; i++){
        const sy = shapePoint[0] + shape[i][0];
        const sx = shapePoint[1] + shape[i][1];
        if(!isValidPoint(sy, sx)) gameOver();
        const el = gebi(parseInt(sy), parseInt(sx));
        el.style.background = shapeColor;
        shapeCell.push([sy, sx]);
    }
    movingThread = setTimeout("moveDown()", movingSpeed);
}
function displayNextShape(){
    initNextTable();
    const shape = arr[nextShape];
    const color = colorarr[nextColorIndex];
    for(let i = 0; i < 4; i++){
        const y = shape[i][0];
        const x = shape[i][1];
        document.getElementById(`${y}${x}`).style.background = color;
    }
}
function initNextTable(){
    for(let i = 0; i < 4; i++)
        for(let j = 0; j < 4; j++)
            document.getElementById(`${i}${j}`).style.background = "rgb(14,31,49)";
}

// 도형 조작
function moveDown(){
    if(!canMove(1, 0)){
        commitExist();
        checkLine();
        shapeCell = [];
        createShape();
        return;
    }
    removeShape();
    for(let i = 0; i < shapeCell.length; i++) shapeCell[i][0]++;
    shapePoint[0]++;
    showShape();
    movingThread = setTimeout("moveDown()", movingSpeed);
}
function rotateShape(){
    if(!canRotate()) return;
    removeShape();
    shapeCell = [];
    currentShape = list[currentShape];
    const rotatedShape = arr[currentShape];
    for(let i = 0; i < 4; i++){
        const sy = shapePoint[0] + rotatedShape[i][0];
        const sx = shapePoint[1] + rotatedShape[i][1];
        shapeCell.push([sy, sx]);
    }
    showShape();
}
function canRotate(){
    const tempShape = arr[list[currentShape]];
    for(let i = 0; i < 4; i++){
        const ty = shapePoint[0] + tempShape[i][0];
        const tx = shapePoint[1] + tempShape[i][1];
        if(!isValidPoint(ty, tx)) return false;
    }
    return true;
}
function isValidPoint(y, x){
    return !(y <= 0 || y >= height - 1 || x <= 0 || x >= width - 1 || existField[y][x]);
}
function removeShape(){
    for(let i = 0; i < shapeCell.length; i++){
        const el = gebi(shapeCell[i][0], shapeCell[i][1]);
        el.style.background = tileColor;
    }
}
function showShape(){
    for(let i = 0; i < shapeCell.length; i++){
        const el = gebi(shapeCell[i][0], shapeCell[i][1]);
        el.style.background = shapeColor;
    }
}
function canMove(dy, dx){
    for(let i = 0; i < shapeCell.length; i++){
        const ny = shapeCell[i][0] + dy;
        const nx = shapeCell[i][1] + dx;
        if(!isValidPoint(ny, nx)) return false;
    }
    return true;
}
function moveLR(delta){
    if(!canMove(0, delta)) return;
    removeShape();
    for(let i = 0; i < shapeCell.length; i++) shapeCell[i][1] += delta;
    shapePoint[1] += delta;
    showShape();
}
function moveFast(){
    if(fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = fastSpeed;
    movingThread = setTimeout("moveDown()", movingSpeed);
    fastMode = true;
}
function moveSlow(){
    if(!fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = initSpeed;
    movingThread = setTimeout("moveDown()", movingSpeed);
    fastMode = false;
}

// 점수 판정
function commitExist(){
    for(let i = 0; i < shapeCell.length; i++){
        const y = shapeCell[i][0];
        const x = shapeCell[i][1];
        existField[y][x] = true;
    }
}
function checkLine(){
    let plusScore = 100;
    for(let i = height - 2; i > 1; i--){
        if(isFull(i)){
            removeLine(i);
            i++;
            updateScore(plusScore);
        }
    }
}
function isFull(lineIndex){
    for(let i = 1; i < width - 1; i++)
        if(!existField[lineIndex][i]) return false;
    return true;
}
function removeLine(lineIndex){
    for(let i = lineIndex - 1; i >= 1; i--){
        for(let j = 1; j < width - 1; j++){
            gebi(i + 1, j).style.background = gebi(i, j).style.background;
            existField[i + 1][j] = existField[i][j];
        }
    }
}

function updateScore(plusScore){
    score += plusScore;
    document.getElementById("score").innerHTML = score;
}

// 종료
function gameOver(){
    clearTimeout(movingThread);
    initExistField();
    alert(`[Game Over]\nScore: ${score}`);
    document.getElementById("gameField").style.visibility = "hidden";
    document.getElementById("gameover").style.visibility = "visible";
}
