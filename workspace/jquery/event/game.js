const height = 34, width = 20; // 필드 크기
const arr = [
    [[2, 2], [1, 2], [1, 1], [0, 1]],
    [[1, 1], [1, 0], [0, 2], [0, 1]],
    [[2, 1], [1, 1], [1, 2], [0, 2]],
    [[1, 2], [1, 1], [0, 1], [0, 0]],
    [[1, 2], [1, 1], [0, 2], [0, 1]],
    [[2, 0], [1, 1], [1, 0], [0, 0]],
    [[1, 1], [0, 2], [0, 1], [0, 0]],
    [[2, 2], [1, 2], [1, 1], [0, 2]],
    [[1, 2], [1, 1], [1, 0], [0, 1]],
    [[3, 1], [2, 1], [1, 1], [0, 1]],
    [[1, 3], [1, 2], [1, 1], [1, 0]],
    [[2, 2], [2, 1], [1, 1], [0, 1]],
    [[1, 0], [0, 2], [0, 1], [0, 0]],
    [[2, 2], [1, 2], [0, 2], [0, 1]],
    [[1, 2], [1, 1], [1, 0], [0, 2]],
    [[2, 2], [2, 1], [1, 2], [0, 2]],
    [[2, 2], [2, 1], [2, 0], [1, 0]],
    [[2, 1], [1, 1], [0, 1], [0, 2]],
    [[1, 2], [0, 2], [0, 1], [0, 0]]
];
const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 0]; // list -> arr2로 변경
const colorarr = ["red", "yellow", "green", "darkgreen", "blue", "purple"]; // 블록 색상
const tileColor = "rgb(9,17,26)";
const wallColor = "rgb(22,41,63)";
const initSpeed = 500;
const deltaSpeed = 40;
const fastSpeed = 25;
const createPoint = [1, parseInt(width / 2) - 2];

let shapeColor;
let shapeColorIndex, nextColorIndex;
let movingSpeed;
let fastMode = false;
let shapeCell;
let existField;
let shapePoint;
let currentShape, nextShape;
let score;
let gameFieldElement;
let gameTableElement;
let movingThread; // movingThread 변수 선언

init();

// 키 입력 처리
document.addEventListener('keydown', keyDownEventHandler);
document.addEventListener('keyup', keyUpEventHandler);

// 키가 눌렸을 때 실행되는 함수
function keyDownEventHandler(e) {
    switch (e.keyCode) {
        case 37:
            setTimeout(() => moveLR(-1), 0);
            break;
        case 39:
            setTimeout(() => moveLR(1), 0);
            break;
        case 32:
            setTimeout(rotateShape, 0);
            break;
        case 40:
            moveFast();
            break;
    }
}
// 키에서 손을 뗐을 때 keyUpEventHandler 함수
function keyUpEventHandler(e) {
    if (e.keyCode == 40) moveSlow();
}

// 초기 설정
// 게임을 시작하기 위한 초기 설정을 담당하는 함수
function init() {
    gameFieldElement = document.getElementById("gameField");
    drawField();
    initExistField();
    setWall();
    nextColorIndex = -1;
    movingSpeed = initSpeed;
    shapeCell = [];
    shapePoint = [createPoint[0], createPoint[1]];
    score = 0;
    document.getElementById("score").innerText = score;
    chooseNextShape();
    chooseNextColor();
    createShape();
    // 게임 필드 초기화 추가
    for (let i = 1; i < height - 1; i++) {
        for (let j = 1; j < width - 1; j++) {
            const cell = gebi(i, j);
            if (cell) cell.style.background = tileColor;
        }
    }
}

function gebi(y, x) {
    if (!gameTableElement) return null; // gameTableElement가 초기화되지 않았을 경우 null 반환
    if (!gameTableElement?.rows[y]?.cells[x]) {
        return null;
    }
    return gameTableElement.rows[y].cells[x];
}

// 필드 초기화
// 게임 필드에 이미 놓인 블록 정보를 초기화하는 함수
function initExistField() {
    existField = new Array(height);
    for (let i = 0; i < height; i++) existField[i] = new Array(width);
    for (let i = 0; i < height; i++)
        for (let j = 0; j < width; j++)
            existField[i][j] = false;
}
// 게임 필드를 HTML 테이블 형태로 그리는 함수
function drawField() {
    if (!gameFieldElement) return;
    let fieldTag = `<table id="gameTable" border=0>`;
    for (let i = 0; i < height; i++) {
        fieldTag += "<tr>";
        for (let j = 0; j < width; j++)
            fieldTag += `<td id="${i} ${j}"></td>`;
        fieldTag += "</tr>";
    }
    fieldTag += "</table>";
    gameFieldElement.innerHTML = fieldTag;
    gameTableElement = document.getElementById("gameTable");
}
// 게임 필드 주변에 벽을 설정하는 함수
function setWall() {
    for (let i = 0; i < height; i++) {
        const leftWall = gebi(i, 0);
        const rightWall = gebi(i, width - 1);
        if (leftWall) leftWall.style.background = wallColor;
        if (rightWall) rightWall.style.background = wallColor;
        existField[i][0] = true;
        existField[i][width - 1] = true;
    }
    for (let i = 0; i < width; i++) {
        const topWall = gebi(0, i);
        const bottomWall = gebi(height - 1, i);
        if (topWall) topWall.style.background = wallColor;
        if (bottomWall) bottomWall.style.background = wallColor;
        existField[0][i] = true;
        existField[height - 1][i] = true;
    }
}

// 도형 생성
// 다음에 나올 블록의 종류를 무작위로 선택하는 함수
function chooseNextShape() {
    nextShape = parseInt(Math.random() * arr.length);
}
// 다음에 나올 블록의 색상을 순환적으로 선택하는 함수
function chooseNextColor() {
    nextColorIndex = parseInt(Math.random() * colorarr.length);
}
// 새로운 블록을 생성하고 게임 필드에 배치하는 함수
function createShape() {
    shapePoint[0] = createPoint[0];
    shapePoint[1] = createPoint[1];
    currentShape = nextShape;
    currentColorIndex = nextColorIndex; // currentColorIndex 할당
    shapeColor = colorarr[currentColorIndex];
    const shape = arr[currentShape];
    chooseNextShape();
    chooseNextColor();
    displayNextShape();
    shapeCell = []; // shapeCell 초기화
    for (let i = 0; i < shape.length; i++) {
        const sy = shapePoint[0] + shape[i][0];
        const sx = shapePoint[1] + shape[i][1];
        if (!isValidPoint(sy, sx)) gameOver();
        const el = gebi(parseInt(sy), parseInt(sx));
        if (el) el.style.background = shapeColor;
        shapeCell.push([sy, sx]);
    }
    movingThread = setTimeout(moveDown, movingSpeed);
}
// 다음에 나올 블록을 미리보기 영역에 표시하는 함수
function displayNextShape() {
    initNextTable();
    const shape = arr[nextShape];
    const color = colorarr[nextColorIndex];
    for (let i = 0; i < 4; i++) {
        const y = shape[i][0];
        const x = shape[i][1];
        const nextTableCell = document.getElementById(`nextTable`).rows[y].cells[x];
        if (nextTableCell) {
            nextTableCell.style.background = color;
        }
    }
}
// 다음 블록 미리보기 테이블을 초기화하는 함수
function initNextTable() {
    const nextTable = document.getElementById("nextTable");
    if (nextTable) {
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
                const nextTableCell = nextTable.rows[i].cells[j];
                if (nextTableCell) {
                    nextTableCell.style.background = "rgb(14,31,49)";
                }
            }
    }
}

// 도형 조작
// 현재 움직이는 블록을 아래로 한 칸 이동시키는 함수
function moveDown() {
    if (!canMove(1, 0)) {
        commitExist();
        checkLine();
        shapeCell = []; // shapeCell 초기화
        createShape();
        return;
    }
    removeShape();
    for (let i = 0; i < shapeCell.length; i++) shapeCell[i][0]++;
    shapePoint[0]++;
    showShape();
    movingThread = setTimeout(moveDown, movingSpeed);
}
// 현재 움직이는 블록을 회전시키는 함수
function rotateShape() {
    if (!canRotate()) return;
    removeShape();
    const tempShapeCell = [];
    const rotatedShapeIndex = arr2[currentShape]; // list -> arr2로 변경
    const rotatedShape = arr[rotatedShapeIndex];
    for (let i = 0; i < 4; i++) {
        const sy = shapePoint[0] + rotatedShape[i][0];
        const sx = shapePoint[1] + rotatedShape[i][1];
        tempShapeCell.push([sy, sx]);
        if (!isValidPoint(sy, sx)) {
            showShape(); // 회전 불가능하면 원래대로 그림
            return;
        }
    }
    shapeCell = tempShapeCell;
    currentShape = rotatedShapeIndex;
    showShape(); // 회전된 위치에 블록을 다시 그리기
}
// 현재 블록이 회전 가능한지 확인하는 함수
function canRotate() {
    const tempShape = arr[arr2[currentShape]]; // list -> arr2로 변경
    for (let i = 0; i < 4; i++) {
        const ty = shapePoint[0] + tempShape[i][0];
        const tx = shapePoint[1] + tempShape[i][1];
        if (!isValidPoint(ty, tx)) return false;
    }
    return true;
}
// 주어진 y, x 좌표가 게임 필드 내의 유효한 위치인지 확인하는 함수
function isValidPoint(y, x) {
    return !(y <= 0 || y >= height - 1 || x <= 0 || x >= width - 1 || existField[y][x]);
}
// 현재 움직이는 블록을 화면에서 지우는 함수
function removeShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        const el = gebi(shapeCell[i][0], shapeCell[i][1]);
        if (el) el.style.background = tileColor;
    }
}
// 현재 움직이는 블록을 화면에 그리는 함수
function showShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        const el = gebi(shapeCell[i][0], shapeCell[i][1]);
        if (el) el.style.background = shapeColor;
    }
}
// 현재 블록이 주어진 방향(dy, dx)으로 이동 가능한지 확인하는 함수
function canMove(dy, dx) {
    for (let i = 0; i < shapeCell.length; i++) {
        const ny = shapeCell[i][0] + dy;
        const nx = shapeCell[i][1] + dx;
        if (!isValidPoint(ny, nx)) return false;
    }
    return true;
}
// 현재 움직이는 블록을 좌우로 이동시키는 함수
function moveLR(delta) {
    if (!canMove(0, delta)) return;
    removeShape();
    for (let i = 0; i < shapeCell.length; i++) shapeCell[i][1] += delta;
    shapePoint[1] += delta;
    showShape();
}
// 빠른 이동 모드를 활성화하는 함수
function moveFast() {
    if (fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = fastSpeed;
    movingThread = setTimeout(moveDown, movingSpeed);
    fastMode = true;
}
// 빠른 이동 모드를 해제하는 함수
function moveSlow() {
    if (!fastMode) return;
    clearTimeout(movingThread);
    movingSpeed = initSpeed;
    movingThread = setTimeout(moveDown, movingSpeed);
    fastMode = false;
}

// 현재 움직이는 블록을 게임 필드에 고정시키는 함수
function commitExist() {
    for (let i = 0; i < shapeCell.length; i++) {
        const y = shapeCell[i][0];
        const x = shapeCell[i][1];
        existField[y][x] = true;
    }
}
// 게임 필드에 완성된 라인이 있는지 확인하고 제거하는 함수
function checkLine() {
    let plusScore = 100;
    let linesCleared = 0;
    for (let i = height - 2; i > 1; i--) {
        if (isFull(i)) {
            removeLine(i);
            i++; // 라인이 제거되었으므로 현재 인덱스를 다시 검사
            linesCleared++;
        }
    }
    if (linesCleared > 0) {
        updateScore(plusScore * linesCleared * linesCleared); // 동시 제거된 라인 수에 따라 점수 증가
        if (movingSpeed > fastSpeed && linesCleared > 0) {
            movingSpeed = Math.max(fastSpeed, movingSpeed - deltaSpeed * linesCleared); // 속도 증가 (최소 fastSpeed)
            if (!!fastMode) {
                clearTimeout(movingThread);
                movingThread = setTimeout(moveDown, movingSpeed);
            }
        }
    }
}
// 주어진 lineIndex의 라인이 가득 찼는지 확인하는 함수
function isFull(lineIndex) {
    for (let i = 1; i < width - 1; i++)
        if (!existField[lineIndex][i]) return false;
    return true;
}
// 주어진 lineIndex의 라인을 제거하고 윗줄들을 아래로 이동시키는 함수
function removeLine(lineIndex) {
    for (let i = lineIndex - 1; i >= 1; i--) {
        for (let j = 1; j < width - 1; j++) {
            const aboveCell = gebi(i, j);
            const currentCell = gebi(i + 1, j);
            if (aboveCell && currentCell) {
                currentCell.style.background = aboveCell.style.background;
            }
            existField[i + 1][j] = existField[i][j];
        }
    }
    for (let j = 1; j < width - 1; j++) {
        const topCell = gebi(1, j);
        if (topCell) topCell.style.background = tileColor;
        existField[1][j] = false;
    }
}
// 게임점수 업데이트 함수
function updateScore(plusScore) {
    score += plusScore;
    document.getElementById("score").innerText = score;
}
// 종료
// 게임 종료 처리 함수
function gameOver() {
    clearTimeout(movingThread);
    initExistField();
    shapeCell = []; // shapeCell 초기화
    if (gameTableElement) {
        for (let i = 1; i < height - 1; i++) {
            for (let j = 1; j < width - 1; j++) {
                const cell = gebi(i, j);
                if (cell) {
                    cell.style.background = tileColor;
                    existField[i][j] = false; // existField 배열 초기화 추가
                }
            }
        }
    }
    const restart = confirm(`[Game Over]\nScore: ${score}\n다시 시작하시겠습니까?`);
    const gameFieldElement = document.getElementById("gameField");
    const gameoverElement = document.getElementById("gameover");
    if (restart) {
        if (gameFieldElement) gameFieldElement.style.display = "block";
        if (gameoverElement) gameoverElement.style.display = "none";
        init();
        movingThread = setTimeout(moveDown, movingSpeed); // 게임 루프 재시작
    } else {
        if (gameFieldElement) gameFieldElement.style.display = "none";
        if (gameoverElement) gameoverElement.style.display = "block";
    }
    // 게임 필드 초기화 추가
    for (let i = 1; i < height - 1; i++) {
        for (let j = 1; j < width - 1; j++) {
            const cell = gebi(i, j);
            if (cell) cell.style.background = tileColor;
        }
    }
}