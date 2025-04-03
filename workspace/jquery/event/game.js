const height = 34, width = 20; // 게임 필드 높이와 너비
const arr = [
    [[2, 2], [1, 2], [1, 1], [0, 1]], // ㅗ 모양 (T-Block)
    [[1, 1], [1, 0], [0, 2], [0, 1]], // Z 모양 (Z-Block)
    [[2, 1], [1, 1], [1, 2], [0, 2]], // S 모양 (S-Block)
    [[1, 2], [1, 1], [0, 1], [0, 0]], // ㄴ 모양 (L-Block)
    [[1, 2], [1, 1], [0, 2], [0, 1]], // 네모 모양 (O-Block)
    [[2, 0], [1, 1], [1, 0], [0, 0]], // ㅡ 모양 (I-Block)
    [[1, 1], [0, 2], [0, 1], [0, 0]], // 반대 S 모양 (S-Block, 회전된 형태)
    [[2, 2], [1, 2], [1, 1], [0, 2]], // 반대 Z 모양 (Z-Block, 회전된 형태)
    [[1, 2], [1, 1], [1, 0], [0, 1]], // L 모양 (L-Block, 회전된 형태)
    [[3, 1], [2, 1], [1, 1], [0, 1]], // ㅣ 모양 (I-Block, 세워진 형태)
    [[1, 3], [1, 2], [1, 1], [1, 0]], // T 모양 (T-Block, 회전된 형태)
    [[2, 2], [2, 1], [1, 1], [0, 1]], // ㅏ 모양 (L-Block, 다른 회전 형태)
    [[1, 0], [0, 2], [0, 1], [0, 0]], // 반대 Z 모양 (Z-Block, 다른 회전 형태)
    [[2, 2], [1, 2], [0, 2], [0, 1]], // L-Block 과 유사한 모양
    [[1, 2], [1, 1], [1, 0], [0, 2]], // 네모 모양 (O-Block, 다른 형태)
    [[2, 2], [2, 1], [1, 2], [0, 2]], // Z-Block 과 유사한 모양
    [[2, 2], [2, 1], [2, 0], [1, 0]], // I-Block 과 유사한 모양
    [[2, 1], [1, 1], [0, 1], [0, 2]], // Z 모양 (Z-Block, 회전된 형태)
    [[1, 2], [0, 2], [0, 1], [0, 0]]  // 네모 모양 (O-Block, 다른 형태)
];
const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 0]; // 회전시 사용되는 인덱스 배열
const colorarr = ["red", "yellow", "green", "darkgreen", "blue", "purple"]; // 블록 색상
const tileColor = "rgb(9,17,26)";  // 게임필드 색상
const wallColor = "rgb(22,41,63)"; // 게임필드 벽 색상
const initSpeed = 500; // 초기 이동속도
const deltaSpeed = 40; // 라인제거시 블록 이동속도
const fastSpeed = 25;  // 아래키 눌렀을때 최대 속도
const createPoint = [1, parseInt(width / 2) - 2]; // 새 블록 생성 위치

let shapeColor; // 현재 블록색상
let shapeColorIndex, nextColorIndex; // 현재/다음 블록 색상 인덱스
let movingSpeed; // 현재 블록 이동 속도
let fastMode = false; // 빠른 이동 모드 활성화 여부를 저장하는 변수
let shapeCell; // 현재 움직이는 블록의 셀 좌표를 저장하는 배열
let existField; // 게임 필드에 이미 놓인 블록 정보를 저장하는 2차원 배열 
let shapePoint; // 현재 움직이는 블록의 기준 좌표 
let currentShape, nextShape; // 현재/다음에 나올 블록의 종류 
let score; // 현재 게임 점수
let gf = document.getElementById("gameField");  // 게임 필드 영역의 HTML 요소 (gameField id를 가진 div)
let gt ;  // 게임 필드를 나타내는 HTML 테이블 요소 (gameTable id를 가진 table)
let movingThread; // 블록 이동 타이머의 ID
const gameoverElement = document.getElementById("gameover");

init();

// 키 입력 처리
document.addEventListener('keydown', keyDownEventHandler);
document.addEventListener('keyup', keyUpEventHandler);

// 키가 눌렸을 때 실행되는 함수
function keyDownEventHandler(e) {
    switch (e.keyCode) {
        case 37:
            setTimeout(() => moveLR(-1), 0); // 왼쪽 이동
            break;
        case 39:
            setTimeout(() => moveLR(1), 0); // 오른쪽 이동
            break;
        case 32:
            setTimeout(rotateShape, 0); // 회전
            break;
        case 40:
            moveFast(); // 빠른 이동
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
}
// 주어진 좌표(y, x)에 해당하는 게임 테이블의 셀(cell) 요소를 반환하는 함수
function gebi(y, x) {
    if (!gt) return null; // 
    if (!gt?.rows[y]?.cells[x]) { 
        return null;
    }
    const cell = gt.rows[y].cells[x]; 
    if (!cell) {
        console.error(`[${y}, ${x}] 셀을 찾을 수 없습니다.`); 
    }
    return cell; 
}

// 필드 초기화
// 게임 필드에 이미 놓인 블록 정보를 초기화하는 함수
function initExistField() {
    existField = new Array(height);
    for (let i = 0; i < height; i++) existField[i] = new Array(width).fill(false);
}
// 게임 필드를 HTML 테이블 형태로 그리는 함수
function drawField() {
    if (!gf) return;
    let fieldTag = `<table id="gameTable" border=0>`;
    for (let i = 0; i < height; i++) {
        fieldTag += "<tr>";
        for (let j = 0; j < width; j++)
            fieldTag += `<td id="${i} ${j}"></td>`;
        fieldTag += "</tr>";
    }
    fieldTag += "</table>";
    gf.innerHTML = fieldTag;
    gt = document.getElementById("gameTable");
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
// 다음에 나올 블록의 색상을 무작위로  선택하는 함수
function chooseNextColor() {
    nextColorIndex = parseInt(Math.random() * colorarr.length);
}
// 새로운 블록을 생성하고 게임 필드에 배치하는 함수
function createShape() {
    shapePoint[0] = createPoint[0];
    shapePoint[1] = createPoint[1];
    currentShape = nextShape;
    currentColorIndex = nextColorIndex;
    shapeColor = colorarr[currentColorIndex];
    const shape = arr[currentShape];
    chooseNextShape();
    chooseNextColor();
    displayNextShape();
    shapeCell = [];
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
        const nextTableCell = document.getElementById("nextTable").rows[y].cells[x];
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
        shapeCell = [];
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

    for (let i = 0; i < 4; i++) {
        const relativeY = shapeCell[i][0] - shapePoint[0];
        const relativeX = shapeCell[i][1] - shapePoint[1];
        const rotatedY = shapePoint[0] + relativeX;
        const rotatedX = shapePoint[1] - relativeY;
        tempShapeCell.push([rotatedY, rotatedX]);

        if (!isValidPoint(rotatedY, rotatedX)) {
            showShape();
            return;
        }
    }
    shapeCell = tempShapeCell;

    showShape();
}
// 현재 블록이 회전 가능한지 확인하는 함수
function canRotate() {
    const tempShape = arr[arr2[currentShape]];
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
// 셀의 배경색을 설정하는 함수
function setCellColor(y, x, color) {
    const cell = gebi(y, x);
    if (cell) cell.style.background = color;
}
// 현재 움직이는 블록을 화면에서 지우는 함수
function removeShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        setCellColor(shapeCell[i][0], shapeCell[i][1], tileColor);
    }
}
// 현재 움직이는 블록을 화면에 그리는 함수
function showShape() {
    for (let i = 0; i < shapeCell.length; i++) {
        setCellColor(shapeCell[i][0], shapeCell[i][1], shapeColor);
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
    clearTimeout(movingThread);
    movingSpeed = fastSpeed;
    movingThread = setTimeout(moveDown, movingSpeed);
}
// 빠른 이동 모드를 해제하는 함수
function moveSlow() {
    clearTimeout(movingThread);
    movingSpeed = initSpeed;
    movingThread = setTimeout(moveDown, movingSpeed);
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
        updateScore(plusScore * linesCleared);
        if (movingSpeed > fastSpeed && linesCleared > 0) {
            movingSpeed = Math.max(fastSpeed, movingSpeed - deltaSpeed * linesCleared);
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
    alert("Game Over!");
    initExistField();
    const restart = confirm(`[Game Over]\nScore: ${score}\n다시 시작하시겠습니까?`);
    if (restart) {
        location.reload();
    } else {
        if (gf) gf.style.display = "none";
        document.getElementById("scoreField").style.display = "none";   
    }
}
