const board = document.getElementById('board');
const message = document.getElementById('message');
const playerScore = document.getElementById('playerScore');
const friendScore = document.getElementById('friendScore');
const aiScore = document.getElementById('aiScore');
const resetButton = document.getElementById('reset');
const difficulty = document.getElementById('level');
const modeSelect = document.getElementById('mode');

let cells = [];
let currentPlayer = 'X';
let scores = { X: 0, O: 0, AI: 0 };
let gameOver = false;

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function createBoard() {
  board.innerHTML = '';
  cells = [];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', () => handleMove(i));
    board.appendChild(cell);
    cells.push(cell);
  }
  currentPlayer = 'X';
  gameOver = false;
  message.textContent = "Your turn!";
}

function handleMove(index) {
  if (cells[index].textContent !== '' || gameOver) return;

  cells[index].textContent = currentPlayer;
  cells[index].classList.add(currentPlayer.toLowerCase());

  if (checkWin(currentPlayer)) {
    updateScores(currentPlayer);
    message.textContent = `${currentPlayer} wins!`;
    gameOver = true;
    return;
  }

  if (isDraw()) {
    message.textContent = "It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (modeSelect.value === 'ai' && currentPlayer === 'O') {
    message.textContent = "AI's turn...";
    setTimeout(aiMove, 500);
  } else {
    message.textContent = `${currentPlayer}'s turn`;
  }
}

function updateScores(winner) {
  if (modeSelect.value === 'ai' && winner === 'O') {
    scores.AI++;
    aiScore.textContent = scores.AI;
  } else {
    scores[winner]++;
    if (winner === 'X') playerScore.textContent = scores.X;
    else friendScore.textContent = scores.O;
  }
}

function isDraw() {
  return cells.every(cell => cell.textContent !== '');
}

function checkWin(player) {
  return winningCombinations.some(combo => combo.every(i => cells[i].textContent === player));
}

function aiMove() {
  let move;
  const level = difficulty.value;
  const boardState = cells.map(cell => cell.textContent);

  if (level === 'easy') {
    move = randomMove();
  } else if (level === 'medium') {
    move = smartMove() ?? randomMove();
  } else {
    move = minimax(boardState, 'O').index;
  }

  if (move !== undefined) handleMove(move);
}

function randomMove() {
  const empty = cells.map((cell, i) => cell.textContent === '' ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function smartMove() {
  for (let combo of winningCombinations) {
    const [a, b, c] = combo;
    const line = [cells[a], cells[b], cells[c]].map(cell => cell.textContent);

    if (line.filter(v => v === 'O').length === 2 && line.includes('')) return combo[line.indexOf('')];
    if (line.filter(v => v === 'X').length === 2 && line.includes('')) return combo[line.indexOf('')];
  }
  return null;
}

function minimax(newBoard, player) {
  const emptySpots = newBoard.map((v, i) => v === '' ? i : null).filter(i => i !== null);

  if (checkWinFromState(newBoard, 'X')) return { score: -10 };
  if (checkWinFromState(newBoard, 'O')) return { score: 10 };
  if (emptySpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i of emptySpots) {
    const move = { index: i };
    newBoard[i] = player;

    const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
    move.score = result.score;

    newBoard[i] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    moves.forEach((m, i) => {
      if (m.score > bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  } else {
    let bestScore = Infinity;
    moves.forEach((m, i) => {
      if (m.score < bestScore) {
        bestScore = m.score;
        bestMove = i;
      }
    });
  }

  return moves[bestMove];
}

function checkWinFromState(board, player) {
  return winningCombinations.some(combo => combo.every(i => board[i] === player));
}

resetButton.addEventListener('click', createBoard);
createBoard();
