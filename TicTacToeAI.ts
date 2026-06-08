export type PlayerType = 'X' | 'O' | null;
export type Difficulty = 'easy' | 'medium' | 'hard';

export function checkWinner(board: PlayerType[]): { winner: PlayerType | 'draw', line?: number[] } | null {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], line: [a, b, c] };
        }
    }

    if (board.every(cell => cell !== null)) {
        return { winner: 'draw' };
    }

    return null;
}

export function getBestMove(board: PlayerType[], player: PlayerType, difficulty: Difficulty): number {
    const availableMoves = board.map((c, i) => c === null ? i : -1).filter(i => i !== -1);
    
    if (availableMoves.length === 0) return -1;

    // Easy: Completely random
    if (difficulty === 'easy') {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    const opponent = player === 'X' ? 'O' : 'X';

    // Medium: Win if possible, block if necessary, otherwise random
    if (difficulty === 'medium') {
        // Try to win
        for (let i of availableMoves) {
            const newBoard = [...board];
            newBoard[i] = player;
            if (checkWinner(newBoard)?.winner === player) return i;
        }
        // Try to block
        for (let i of availableMoves) {
            const newBoard = [...board];
            newBoard[i] = opponent;
            if (checkWinner(newBoard)?.winner === opponent) return i;
        }
        // Random
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Hard: Minimax Algorithm
    const minimax = (b: PlayerType[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
        const result = checkWinner(b);
        if (result?.winner === player) return 10 - depth;
        if (result?.winner === opponent) return depth - 10;
        if (result?.winner === 'draw') return 0;

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === null) {
                    b[i] = player;
                    let ev = minimax(b, depth + 1, false, alpha, beta);
                    b[i] = null;
                    maxEval = Math.max(maxEval, ev);
                    alpha = Math.max(alpha, ev);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 9; i++) {
                if (b[i] === null) {
                    b[i] = opponent;
                    let ev = minimax(b, depth + 1, true, alpha, beta);
                    b[i] = null;
                    minEval = Math.min(minEval, ev);
                    beta = Math.min(beta, ev);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    };

    let bestScore = -Infinity;
    let bestMove = -1;
    
    // Slight randomization on the first move for hard mode to make it less predictable
    if (availableMoves.length === 9) {
        const cornersCenter = [0, 2, 4, 6, 8];
        return cornersCenter[Math.floor(Math.random() * cornersCenter.length)];
    }

    for (let i of availableMoves) {
        const newBoard = [...board];
        newBoard[i] = player;
        const score = minimax(newBoard, 0, false, -Infinity, Infinity);
        if (score > bestScore) {
            bestScore = score;
            bestMove = i;
        }
    }

    return bestMove;
}
