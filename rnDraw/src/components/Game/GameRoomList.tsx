import React from 'react';
import {Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import GameRoomItem from './GameRoomItem';
import {GameRoomFirebaseEntity} from '../../types';

type GameRoomListProps = {};

export type GameRoomEntry = {
  id: string;
  name: string;
  playersCount: number;
  maxPlayers: number;
  state: string;
};

export default function ({}: GameRoomListProps) {
  const [rooms, setRooms] = React.useState<GameRoomEntry[]>([]);

  React.useLayoutEffect(() => {
    const unsubscribe = firestore()
      .collection('games_rooms')
      .onSnapshot(documentSnapshot => {
        if (undefined === documentSnapshot) return;
        const data: GameRoomEntry[] = [];
        documentSnapshot.forEach(doc => {
          const {
            config: roomConfig,
            players,
            state,
            id,
          } = doc.data() as GameRoomFirebaseEntity;
          if (undefined === roomConfig) {
            return;
          }
          data.push({
            id,
            name: roomConfig.roomName,
            playersCount: players.length,
            maxPlayers: roomConfig.maxPlayers,
            state,
          });
        });
        setRooms(data);
      });

    // Stop listening for updates when no longer required
    return () => {
      unsubscribe();
      console.log('[GAMES_ROOMS_LIST] unsubscribed');
    };
  }, []);

  return (
    <View className="flex-1">
      {0 === rooms.length && (
        <View className="items-center justify-center flex-1">
          <Text className="text-lg text-gray-600">Aucune salle</Text>
        </View>
      )}
      {rooms.map(room => {
        return <GameRoomItem key={room.id} {...room} />;
      })}
    </View>
  );
}
