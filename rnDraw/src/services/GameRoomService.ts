import firestore from '@react-native-firebase/firestore';
import base64 from 'react-native-base64';
import {wordsCount, wordsList} from '../config/wordsList';
import {
  GameRoomEntityConfig,
  GameRoomEntityState,
  GameRoomFirebaseEntity,
  Player,
} from '../types';
import {LeaderBoardEntry} from '../utils';

export const collection = firestore().collection('games_rooms');

export type ReturnServiceFn = {
  payload: any;
  error: any;
};

export async function createNewGameRoom(
  props: GameRoomEntityConfig,
): Promise<ReturnServiceFn> {
  const initialValues: GameRoomFirebaseEntity = {
    id: props.owner,
    state: 'waiting',
    config: {
      roomName: props.roomName,
      minPlayers: props.minPlayers,
      maxPlayers: props.maxPlayers,
      rounds: props.rounds,
      roundDuration: props.roundDuration,
      owner: props.owner,
    },
    currentDrawingPath: null,
    currentRound: 0,
    currentPlayer: null,
    currentWord: null,
    messages: [],
    players: [],
    playersTurnOrder: [],
    remainingRoundTime: props.roundDuration,
    roundHistory: {},
    winner: null,
    showWordToGuess: false,
  };
  try {
    await collection.doc(props.owner).set(initialValues);
    console.info('[SERVICE] createNewGameRoom', 'success');
    return {payload: props.owner, error: undefined};
  } catch (error) {
    console.error('[SERVICE] createNewGameRoom', error);
    return {payload: undefined, error};
  }
}

export async function deleteGameRoom(roomId: string) {
  await collection.doc(roomId).delete();
  console.log(`[GAME_ROOM] ${roomId} deleted`);
}

export async function deleteGameRoomByOwnerId(ownerId: string) {
  await collection
    .where('ownerId', '==', ownerId)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(documentSnapshot => {
        documentSnapshot.ref.delete();
      });
    });

  console.log(`[GAME_ROOM] for owner ${ownerId} deleted`);
}

export async function addPlayerToRoom(
  roomId: string,
  player: Player,
): Promise<ReturnServiceFn> {
  try {
    await collection.doc(roomId).update({
      players: firestore.FieldValue.arrayUnion(player),
    });
    console.log(
      `[GAME_ROOM] ${roomId} added player ${player.name} | ${player.id}`,
    );
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.log('addPlayer', error);
    return {payload: undefined, error};
  }
}

export async function removePlayerFromRoom(
  roomId: string,
  playerId: string,
): Promise<ReturnServiceFn> {
  try {
    const ref = collection.doc(roomId);
    await firestore().runTransaction(async transaction => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) {
        throw 'Document does not exist!';
      }

      const newPlayersList = (snapshot.data() || []).players.filter(
        (player: Player) => player.id !== playerId,
      );

      transaction.update(ref, {
        players: newPlayersList,
      });
    });
    console.log(`[GAME_ROOM] ${roomId} removed player ${playerId}`);
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.log('removePlayer', error);
    return {payload: undefined, error};
  }
}

export async function startGame(roomId: string, playersTurnOrder: string[]) {
  try {
    const wordToGuess = getRandomWord();
    await collection.doc(roomId).update({
      state: GameRoomEntityState.ON_GOING,
      playersTurnOrder,
      currentPlayer: playersTurnOrder[0],
      currentRound: 1,
      currentWord: wordToGuess,
      roundHistory: {
        1: {
          wordToGuess,
          players: [],
        },
      },
    });
    console.info('[SERVICE] startGame', 'success');
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.error('[SERVICE] startGame', error);
    return {payload: undefined, error};
  }
}

export async function updateGameRoom(roomId: string, data: any) {
  try {
    await collection.doc(roomId).update(data);
    console.info('[SERVICE] updateGameRoom', 'success');
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.error('[SERVICE] updateGameRoom', error);
    return {payload: undefined, error};
  }
}

export async function addMessageToRoom(
  roomId: string,
  message: {value: string; sender: string},
): Promise<ReturnServiceFn> {
  try {
    await collection.doc(roomId).update({
      messages: firestore.FieldValue.arrayUnion({
        // generate a random id for the message
        id: Math.random().toString(36),
        ...message,
      }),
    });
    console.log(`[GAME_ROOM] ${roomId} added message`);
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.log('addMessage', error);
    return {payload: undefined, error};
  }
}

export function getRandomWord() {
  const randomIndex = Math.floor(Math.random() * wordsCount);

  return wordsList[randomIndex];
}

export async function addPlayerToRoundHistory(
  roomId: string,
  playerId: string,
  round: number,
) {
  collection.doc(roomId).update({
    [`roundHistory.${round}.players`]:
      firestore.FieldValue.arrayUnion(playerId),
  });
}

export async function updateCurrentDrawPath(roomId: string, path: string) {
  collection.doc(roomId).update({
    currentDrawingPath: base64.encode(path),
  });
}

export async function givePointsToPlayer(playerId: string, points: number) {
  const userRef = firestore().collection('users_details').doc(playerId);
  userRef.update({
    points: firestore.FieldValue.increment(points),
  });
}

export async function givePointsToPlayersFromLeaderboardTransaction(
  leaderboard: LeaderBoardEntry[],
) {
  const batch = firestore().batch();
  leaderboard.forEach(item => {
    const userRef = firestore().collection('users_details').doc(item.playerId);
    batch.update(userRef, {
      points: firestore.FieldValue.increment(item.score),
    });
  });

  await batch.commit();
}
