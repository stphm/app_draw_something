import firestore from '@react-native-firebase/firestore';

import {GameRoomEntityMessage} from '../types';
import {ReturnServiceFn} from './GameRoomService';

const collection = firestore().collection('games_rooms');

export async function sendMessage(
  roomId: string,
  message: GameRoomEntityMessage,
): Promise<ReturnServiceFn> {
  try {
    await collection.doc(roomId).update({
      messages: firestore.FieldValue.arrayUnion({
        // generate a random id for the message
        // id: firestore.FieldValue.serverTimestamp(),
        id: Math.random().toString(36),
        ...message,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      }),
    });
    console.log(`[SERVICE] ${roomId} added message`);
    return {payload: roomId, error: undefined};
  } catch (error) {
    console.log('addMessage', error);
    return {payload: undefined, error};
  }
}
