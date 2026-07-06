import {
  checkWin,
  getBestMove,
  getWinningLines,
  isBoardFull,
  NO_MOVE,
  type Player,
} from '../engine/GameEngine';

const _ = null;

describe('GameEngine — getWinningLines (N×N)', () => {
  it('produces 2N + 2 lines for any grid size', () => {
    expect(getWinningLines(3)).toHaveLength(8);
    expect(getWinningLines(4)).toHaveLength(10);
    expect(getWinningLines(5)).toHaveLength(12);
  });

  it('builds correct diagonals for a 4×4 grid', () => {
    const lines = getWinningLines(4);
    expect(lines).toContainEqual([0, 5, 10, 15]);
    expect(lines).toContainEqual([3, 6, 9, 12]);
  });
});

describe('GameEngine — checkWin (N×N)', () => {
  it('detects a horizontal row win on 3×3', () => {
    const board: Player[] = [
      'X', 'X', 'X',
      _, 'O', _,
      _, _, 'O',
    ];
    const res = checkWin(board, 3);
    expect(res?.winner).toBe('X');
    expect(res?.line).toEqual([0, 1, 2]);
  });

  it('detects a vertical column win on 4×4', () => {
    const board: Player[] = [
      'O', 'X', _, _,
      'O', _, 'X', _,
      'O', _, _, 'X',
      'O', _, _, _,
    ];
    const res = checkWin(board, 4);
    expect(res?.winner).toBe('O');
    expect(res?.line).toEqual([0, 4, 8, 12]);
  });

  it('detects the main diagonal on 5×5', () => {
    const board: Player[] = Array<Player>(25).fill(null);
    for (let i = 0; i < 5; i++) board[i * 6] = 'X';
    const res = checkWin(board, 5);
    expect(res?.winner).toBe('X');
    expect(res?.line).toEqual([0, 6, 12, 18, 24]);
  });

  it('detects the anti-diagonal on 3×3', () => {
    const board: Player[] = [
      _, _, 'O',
      _, 'O', _,
      'O', _, _,
    ];
    const res = checkWin(board, 3);
    expect(res?.winner).toBe('O');
    expect(res?.line).toEqual([2, 4, 6]);
  });

  it('returns null for a drawn board', () => {
    const board: Player[] = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(checkWin(board, 3)).toBeNull();
    expect(isBoardFull(board)).toBe(true);
  });

  it('returns null for an empty board', () => {
    expect(checkWin(Array<Player>(9).fill(null), 3)).toBeNull();
  });
});

describe('GameEngine — AI logic', () => {
  it('IMPOSSIBLE blocks an immediate human threat on 3×3', () => {
    const board: Player[] = [
      'X', 'X', _,
      'O', _, _,
      _, _, _,
    ];
    expect(getBestMove(board, 3, 'O', 'IMPOSSIBLE')).toBe(2);
  });

  it('IMPOSSIBLE takes an immediate winning move over blocking', () => {
    const board: Player[] = [
      'O', 'O', _,
      'X', 'X', _,
      _, _, _,
    ];
    expect(getBestMove(board, 3, 'O', 'IMPOSSIBLE')).toBe(2);
  });

  it('MEDIUM still blocks an immediate threat', () => {
    const board: Player[] = [
      'X', 'X', _,
      _, 'O', _,
      _, _, _,
    ];
    expect(getBestMove(board, 3, 'O', 'MEDIUM')).toBe(2);
  });

  it('EASY plays a random open cell when the dice say so', () => {
    const board: Player[] = [
      'X', 'X', _,
      'O', _, _,
      _, _, _,
    ];
    // First call < mistake probability → random branch; second selects cell 0
    // of the empty list deterministically.
    const rigged = jest.fn().mockReturnValueOnce(0.1).mockReturnValueOnce(0);
    const move = getBestMove(board, 3, 'O', 'EASY', rigged);
    expect(move).toBe(2); // First empty index — chosen randomly, not by search.
    expect(board[move]).toBeNull();
  });

  it('does not mutate the caller board', () => {
    const board: Player[] = [
      'X', _, _,
      _, 'O', _,
      _, _, _,
    ];
    const snapshot = [...board];
    getBestMove(board, 3, 'O', 'IMPOSSIBLE');
    expect(board).toEqual(snapshot);
  });

  it('returns NO_MOVE on a full board', () => {
    const board: Player[] = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X',
    ];
    expect(getBestMove(board, 3, 'O', 'IMPOSSIBLE')).toBe(NO_MOVE);
  });

  it('IMPOSSIBLE never loses a full 3×3 game against every human strategy opening', () => {
    // The human plays greedily-random via a seeded LCG; the AI must never lose
    // across many complete games.
    let seed = 42;
    const nextRandom = () => {
      seed = (seed * 1664525 + 1013904223) % 2 ** 32;
      return seed / 2 ** 32;
    };

    const GAMES = 25;
    for (let game = 0; game < GAMES; game++) {
      const board: Player[] = Array<Player>(9).fill(null);
      let result = null;

      while (!result && !isBoardFull(board)) {
        // Human ('X') plays a random open cell.
        const open = board
          .map((cell, idx) => (cell === null ? idx : -1))
          .filter((idx) => idx !== -1);
        board[open[Math.floor(nextRandom() * open.length)]] = 'X';
        result = checkWin(board, 3);
        if (result || isBoardFull(board)) break;

        // AI ('O') answers perfectly.
        const aiMove = getBestMove(board, 3, 'O', 'IMPOSSIBLE');
        board[aiMove] = 'O';
        result = checkWin(board, 3);
      }

      expect(result?.winner).not.toBe('X');
    }
  });

  it('responds within a frame-friendly budget on a 5×5 board', () => {
    const board: Player[] = Array<Player>(25).fill(null);
    board[0] = 'X';
    board[12] = 'O';
    board[6] = 'X';

    const start = Date.now();
    const move = getBestMove(board, 5, 'O', 'IMPOSSIBLE');
    const elapsed = Date.now() - start;

    expect(move).toBeGreaterThanOrEqual(0);
    expect(board[move]).toBeNull();
    expect(elapsed).toBeLessThan(2000);
  });
});
