export type CFPlayer = 'R' | 'Y' | null;

export const ROWS = 6;
export const COLS = 7;

export function checkCFWinner(board: CFPlayer[]): { winner: CFPlayer | 'draw', line?: number[] } | null {
    // Check horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece && piece === board[idx + 1] && piece === board[idx + 2] && piece === board[idx + 3]) {
                return { winner: piece, line: [idx, idx+1, idx+2, idx+3] };
            }
        }
    }
    // Check vertical
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece && piece === board[idx + COLS] && piece === board[idx + 2*COLS] && piece === board[idx + 3*COLS]) {
                return { winner: piece, line: [idx, idx+COLS, idx+2*COLS, idx+3*COLS] };
            }
        }
    }
    // Check diagonal right
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece && piece === board[idx + COLS + 1] && piece === board[idx + 2*COLS + 2] && piece === board[idx + 3*COLS + 3]) {
                return { winner: piece, line: [idx, idx+COLS+1, idx+2*COLS+2, idx+3*COLS+3] };
            }
        }
    }
    // Check diagonal left
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 3; c < COLS; c++) {
            const idx = r * COLS + c;
            const piece = board[idx];
            if (piece && piece === board[idx + COLS - 1] && piece === board[idx + 2*COLS - 2] && piece === board[idx + 3*COLS - 3]) {
                return { winner: piece, line: [idx, idx+COLS-1, idx+2*COLS-2, idx+3*COLS-3] };
            }
        }
    }

    if (board.every(cell => cell !== null)) {
        return { winner: 'draw' };
    }

    return null;
}

export function getValidMoves(board: CFPlayer[]): number[] {
    const validMoves = [];
    for (let c = 0; c < COLS; c++) {
        if (board[c] === null) {
            validMoves.push(c);
        }
    }
    return validMoves;
}

export function applyMove(board: CFPlayer[], col: number, player: CFPlayer): { board: CFPlayer[], row: number } {
    const newBoard = [...board];
    let r = ROWS - 1;
    for (; r >= 0; r--) {
        if (newBoard[r * COLS + col] === null) {
            newBoard[r * COLS + col] = player;
            break;
        }
    }
    return { board: newBoard, row: r };
}

// Basic AI for Connect Four
export function getCFBestMove(board: CFPlayer[], player: CFPlayer, difficulty: 'easy'|'medium'|'hard'): number {
    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) return -1;

    if (difficulty === 'easy') {
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    const opponent = player === 'R' ? 'Y' : 'R';

    // Medium: Win if possible, block if possible, else random
    if (difficulty === 'medium' || difficulty === 'hard') {
        for (let col of validMoves) {
            const {board: b} = applyMove(board, col, player);
            if (checkCFWinner(b)?.winner === player) return col;
        }
        for (let col of validMoves) {
            const {board: b} = applyMove(board, col, opponent);
            if (checkCFWinner(b)?.winner === opponent) return col;
        }
    }

    // Since a full minimax for C4 is deep, we use a simple heuristic for hard mode
    if (difficulty === 'hard') {
        const centerCol = Math.floor(COLS/2);
        if (validMoves.includes(centerCol)) {
            // prefer center
            if (Math.random() > 0.3) return centerCol;
        }
    }

    return validMoves[Math.floor(Math.random() * validMoves.length)];
}
