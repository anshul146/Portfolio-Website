const chessboard = document.getElementById('chessboard');

let currentPlayer = 'white'; // 'white' or 'black'
let draggedPiece = null;

// Initial chessboard setup with positions
const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

// Map pieces to players
const piecePlayer = {
    '♜': 'black', '♞': 'black', '♝': 'black', '♛': 'black', '♚': 'black', '♟': 'black',
    '♖': 'white', '♘': 'white', '♗': 'white', '♕': 'white', '♔': 'white', '♙': 'white',
};

// Initialize the board
function createBoard() {
    chessboard.innerHTML = ''; // Clear previous board
    let isDark = false;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square', isDark ? 'dark' : 'light');
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = initialBoard[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.textContent = piece;
                pieceElement.classList.add('piece');
                pieceElement.dataset.player = piecePlayer[piece];
                pieceElement.setAttribute('draggable', true);
                square.appendChild(pieceElement);
            }

            chessboard.appendChild(square);
            isDark = !isDark;
        }
        isDark = !isDark;
    }
}

// Validates if a move is possible for the piece
function isValidMove(piece, startRow, startCol, endRow, endCol) {
    const pieceType = piece.textContent;
    const player = piece.dataset.player;

    // Can't move to a square occupied by a piece of the same player
    const targetSquare = chessboard.querySelector(`[data-row='${endRow}'][data-col='${endCol}']`);
    const targetPiece = targetSquare ? targetSquare.querySelector('.piece') : null;
    if (targetPiece && targetPiece.dataset.player === player) {
        return false;
    }

    // Pawn movement (basic implementation)
    if (pieceType === '♙' || pieceType === '♟') {
        return isValidPawnMove(piece, startRow, startCol, endRow, endCol);
    }

    // Rook movement (straight lines)
    if (pieceType === '♖' || pieceType === '♜') {
        return isValidRookMove(startRow, startCol, endRow, endCol);
    }

    // Knight movement (L-shape)
    if (pieceType === '♘' || pieceType === '♞') {
        return isValidKnightMove(startRow, startCol, endRow, endCol);
    }

    // Bishop movement (diagonals)
    if (pieceType === '♗' || pieceType === '♝') {
        return isValidBishopMove(startRow, startCol, endRow, endCol);
    }

    // Queen movement (rook + bishop)
    if (pieceType === '♕' || pieceType === '♛') {
        return isValidQueenMove(startRow, startCol, endRow, endCol);
    }

    // King movement (1 square in any direction)
    if (pieceType === '♔' || pieceType === '♚') {
        return isValidKingMove(startRow, startCol, endRow, endCol);
    }

    return false;
}

// Pawn move logic
function isValidPawnMove(piece, startRow, startCol, endRow, endCol) {
    const direction = piece.dataset.player === 'white' ? -1 : 1;
    const startRowInitial = piece.dataset.player === 'white' ? 6 : 1;

    if (startCol === endCol && initialBoard[endRow][endCol] === '' && endRow === startRow + direction) {
        return true;
    }

    if (startRow === startRowInitial && startCol === endCol && endRow === startRow + direction * 2 && initialBoard[endRow][endCol] === '') {
        return true;
    }

    if (Math.abs(startCol - endCol) === 1 && endRow === startRow + direction && initialBoard[endRow][endCol] !== '' && piecePlayer[initialBoard[endRow][endCol]] !== piece.dataset.player) {
        return true;
    }

    return false;
}

// Rook move logic (straight lines)
function isValidRookMove(startRow, startCol, endRow, endCol) {
    if (startRow !== endRow && startCol !== endCol) {
        return false; // Must move in a straight line
    }

    const rowStep = startRow === endRow ? 0 : startRow < endRow ? 1 : -1;
    const colStep = startCol === endCol ? 0 : startCol < endCol ? 1 : -1;

    let r = startRow + rowStep;
    let c = startCol + colStep;

    while (r !== endRow || c !== endCol) {
        if (initialBoard[r][c] !== '') {
            return false; // Blocked by another piece
        }
        r += rowStep;
        c += colStep;
    }

    return true;
}

// Knight move logic (L-shape)
function isValidKnightMove(startRow, startCol, endRow, endCol) {
    return (Math.abs(startRow - endRow) === 2 && Math.abs(startCol - endCol) === 1) ||
           (Math.abs(startRow - endRow) === 1 && Math.abs(startCol - endCol) === 2);
}

// Bishop move logic (diagonal)
function isValidBishopMove(startRow, startCol, endRow, endCol) {
    if (Math.abs(startRow - endRow) !== Math.abs(startCol - endCol)) {
        return false; // Must move diagonally
    }

    const rowStep = startRow < endRow ? 1 : -1;
    const colStep = startCol < endCol ? 1 : -1;

    let r = startRow + rowStep;
    let c = startCol + colStep;

    while (r !== endRow || c !== endCol) {
        if (initialBoard[r][c] !== '') {
            return false; // Blocked by another piece
        }
        r += rowStep;
        c += colStep;
    }

    return true;
}

// Queen move logic (rook + bishop)
function isValidQueenMove(startRow, startCol, endRow, endCol) {
    return isValidRookMove(startRow, startCol, endRow, endCol) || isValidBishopMove(startRow, startCol, endRow, endCol);
}

// King move logic (1 square in any direction)
function isValidKingMove(startRow, startCol, endRow, endCol) {
    return Math.abs(startRow - endRow) <= 1 && Math.abs(startCol - endCol) <= 1;
}

// Drag-and-drop logic
function setupDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('piece') &&
            e.target.dataset.player === currentPlayer) {
            draggedPiece = e.target;
            draggedPiece.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', () => {
        if (draggedPiece) {
            draggedPiece.classList.remove('dragging');
            draggedPiece = null;
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        const target = e.target;
        const square = target.classList.contains('square') ? target : target.parentElement;
        const startRow = parseInt(draggedPiece.parentElement.dataset.row);
        const startCol = parseInt(draggedPiece.parentElement.dataset.col);
        const endRow = parseInt(square.dataset.row);
        const endCol = parseInt(square.dataset.col);

        if (!square.classList.contains('square') || !draggedPiece) return;

        const isValid = isValidMove(draggedPiece, startRow, startCol, endRow, endCol);

        if (isValid) {
            // Move the piece
            square.appendChild(draggedPiece);
            initialBoard[startRow][startCol] = '';
            initialBoard[endRow][endCol] = draggedPiece.textContent;
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        } else {
            alert('Invalid move!');
        }
    });
}

// Initialize game
createBoard();
setupDragAndDrop();
