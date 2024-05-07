export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
};

export const GameRoomEntityState = {
  WAITING: 'waiting',
  ON_GOING: 'on_going',
  FINISHED: 'finished',
};

export type GameRoomEntityConfig = {
  roomName: string;
  minPlayers: number;
  maxPlayers: number;
  rounds: number;
  roundDuration: number; // in seconds
  owner: PlayerId;
};

export type GameRoomEntityMessage = {
  id?: string;
  content: string;
  authorName: string;
  authorId: PlayerId;
  createdAt?: number;
};

export type GameRoomEntityHistory = {
  [round: number]: {
    wordToGuess: string;
    players: PlayerId[];
  };
};

export type GameRoomFirebaseEntity = {
  id: string;
  state: 'waiting' | 'on_going' | 'finished';
  config: GameRoomEntityConfig;
  currentRound: number;
  currentPlayer: PlayerId | null;
  remainingRoundTime: number;
  winner: string | null;
  playersTurnOrder: PlayerId[];
  players: Player[];
  roundHistory: GameRoomEntityHistory;
  messages: GameRoomEntityMessage[];
  currentWord: string | null;
  currentDrawingPath: string | null;
  showWordToGuess: boolean;
};
