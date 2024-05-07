import {PlayerId} from './types';

export const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

export function zeroPad(num) {
  return num < 10 ? `0${num}` : num;
}

type GameRoomLeaderBoardRow = [PlayerId, number];

/**
 *  compute the leaderboard for a game room
 *  compute method for a row in a round: word's length * number of players * multiplier, the first player gets 100% of the score, the second 50%, the third 33% and so on
 */
export function computeGameRoomLeaderBoard(
  gameHistory: GameRoomEntityHistory,
  multiplier = 1,
): GameRoomLeaderBoardRow[] {
  const leaderBoard = new Map<PlayerId, number>();

  Object.keys(gameHistory).forEach(round => {
    const roundHistory = gameHistory[round];
    const wordLength = roundHistory.wordToGuess.length;
    const players = roundHistory.players;

    const score = wordLength * players.length * multiplier;

    players.forEach((player, index) => {
      const currentScore = leaderBoard.get(player) || 0;
      const newScore = currentScore + score / (index + 1);
      leaderBoard.set(player, newScore);
    });
  });

  return Array.from(leaderBoard.entries()).sort((a, b) => b[1] - a[1]);
}

export type GameRoomEntityHistory = {
  [round: number]: {
    wordToGuess: string;
    players: PlayerId[];
  };
};

export type LeaderBoardEntry = {
  playerId: PlayerId;
  score: number;
};

function calculateScore(
  wordLength: number,
  numPlayers: number,
  rank: number,
): number {
  const multiplier = 1; // adjust as needed
  const maxScore = wordLength * numPlayers * multiplier;
  const rankPercentage = 1 / rank;
  return Math.round(maxScore * rankPercentage);
}

export function computeLeaderBoard(
  history: GameRoomEntityHistory,
): LeaderBoardEntry[] {
  const scores: {[playerId: string]: number} = {};

  // Calculate scores for each player in each round
  Object.values(history).forEach(round => {
    const wordLength = round.wordToGuess.length;
    const numPlayers = round.players.length;
    const maxRank = Math.min(numPlayers, 10); // only consider top 10 players
    round.players.slice(0, maxRank).forEach((playerId, index) => {
      const score = calculateScore(wordLength, numPlayers, index + 1);
      scores[playerId] = (scores[playerId] || 0) + score;
    });
  });

  // Convert scores object to array and sort by descending score
  const leaderboard: LeaderBoardEntry[] = Object.entries(scores)
    .map(([playerId, score]) => ({playerId, score}))
    .sort((a, b) => b.score - a.score);

  return leaderboard;
}
