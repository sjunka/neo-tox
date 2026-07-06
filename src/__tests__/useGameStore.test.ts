import { useGameStore, HUMAN_PLAYER, AI_PLAYER } from '../store/useGameStore';
import { playWinSound } from '../utils/sound';
import type { Player } from '../engine/GameEngine';

jest.mock('../utils/sound', () => ({ playWinSound: jest.fn() }));

const freshState = () => {
  jest.clearAllMocks();
  useGameStore.setState({
    board: Array<Player>(9).fill(null),
    gridSize: 3,
    currentPlayer: HUMAN_PLAYER,
    difficulty: 'IMPOSSIBLE',
    isAiThinking: false,
    winningLine: [],
    winner: null,
    stats: { wins: 0, losses: 0, draws: 0 },
    gameId: 0,
  });
};

describe('useGameStore', () => {
  beforeEach(freshState);

  it('initializeGame resets the board and scales to N×N', () => {
    useGameStore.getState().initializeGame(5);
    const state = useGameStore.getState();
    expect(state.board).toHaveLength(25);
    expect(state.gridSize).toBe(5);
    expect(state.winner).toBeNull();
    expect(state.winningLine).toEqual([]);
    expect(state.currentPlayer).toBe(HUMAN_PLAYER);
  });

  it('places the human mark and lets the AI answer', async () => {
    await useGameStore.getState().makeMove(0);
    const state = useGameStore.getState();

    expect(state.board[0]).toBe(HUMAN_PLAYER);
    expect(state.board.filter((cell) => cell === AI_PLAYER)).toHaveLength(1);
    expect(state.isAiThinking).toBe(false);
    expect(state.currentPlayer).toBe(HUMAN_PLAYER);
  });

  it('rejects a move on an occupied cell', async () => {
    await useGameStore.getState().makeMove(0);
    const before = useGameStore.getState().board;

    await useGameStore.getState().makeMove(0);
    expect(useGameStore.getState().board).toEqual(before);
  });

  it('records a human win in the stats and exposes the winning line', async () => {
    useGameStore.setState({
      board: [
        'X', 'X', null,
        'O', 'O', null,
        null, null, null,
      ],
    });

    await useGameStore.getState().makeMove(2);
    const state = useGameStore.getState();

    expect(state.winner).toBe(HUMAN_PLAYER);
    expect(state.winningLine).toEqual([0, 1, 2]);
    expect(state.stats.wins).toBe(1);
    expect(state.stats.losses).toBe(0);
  });

  it('records a draw when the board fills without a winner', async () => {
    useGameStore.setState({
      board: [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', null,
      ],
    });

    await useGameStore.getState().makeMove(8);
    const state = useGameStore.getState();

    expect(state.winner).toBe('DRAW');
    expect(state.stats.draws).toBe(1);
  });

  it('records an AI win as a loss', async () => {
    // O wins with the top row no matter what X plays next.
    useGameStore.setState({
      board: [
        'O', 'O', null,
        'X', 'X', 'O',
        'X', null, null,
      ],
    });

    await useGameStore.getState().makeMove(7);
    const state = useGameStore.getState();

    expect(state.winner).toBe(AI_PLAYER);
    expect(state.stats.losses).toBe(1);
  });

  it('discards a stale AI turn when the game is reset mid-thinking', async () => {
    const movePromise = useGameStore.getState().makeMove(0);
    expect(useGameStore.getState().isAiThinking).toBe(true);

    useGameStore.getState().initializeGame();
    await movePromise;

    const state = useGameStore.getState();
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.isAiThinking).toBe(false);
    expect(state.winner).toBeNull();
  });

  it('blocks input while the AI is thinking', async () => {
    const movePromise = useGameStore.getState().makeMove(0);
    await useGameStore.getState().makeMove(1); // Should be swallowed.

    await movePromise;
    const state = useGameStore.getState();
    // Exactly one human mark and one AI mark on the board.
    expect(state.board.filter((cell) => cell === HUMAN_PLAYER)).toHaveLength(1);
    expect(state.board.filter((cell) => cell === AI_PLAYER)).toHaveLength(1);
  });

  it('plays the victory chime on a human win only', async () => {
    useGameStore.setState({
      board: [
        'X', 'X', null,
        'O', 'O', null,
        null, null, null,
      ],
    });

    await useGameStore.getState().makeMove(2);
    expect(playWinSound).toHaveBeenCalledTimes(1);
  });

  it('stays silent on an AI win', async () => {
    useGameStore.setState({
      board: [
        'O', 'O', null,
        'X', 'X', 'O',
        'X', null, null,
      ],
    });

    await useGameStore.getState().makeMove(7);
    expect(useGameStore.getState().winner).toBe(AI_PLAYER);
    expect(playWinSound).not.toHaveBeenCalled();
  });

  it('resetStats clears the scoreboard', () => {
    useGameStore.setState({ stats: { wins: 3, losses: 2, draws: 1 } });
    useGameStore.getState().resetStats();
    expect(useGameStore.getState().stats).toEqual({
      wins: 0,
      losses: 0,
      draws: 0,
    });
  });
});
