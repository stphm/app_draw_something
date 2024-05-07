import React from 'react';
import {Text, ToastAndroid, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-paper';

import GameRoomList from '../components/Game/GameRoomList';
import {AuthContext, AuthContextType} from '../context/AuthContext';
import {createNewGameRoom} from '../services/GameRoomService';
import NewGameModal, {onConfirmPayload} from '../components/NewGameModal';

export default function () {
  const {logout, user} = React.useContext(AuthContext) as AuthContextType;

  const [newGameModal, setNewGameModal] = React.useState(false);

  const newGameRoomHandler = React.useCallback(
    async (payload: onConfirmPayload) => {
      if (!user) return;
      const {payload: roomId, error} = await createNewGameRoom({
        roomName: 'Room #' + user.uid.slice(0, 8),
        minPlayers: payload.minPlayers,
        maxPlayers: payload.maxPlayers,
        rounds: payload.rounds * 2,
        roundDuration: payload.roundDuration,
        owner: user.uid,
      });
      setNewGameModal(false);
      if (error) {
        // TODO: handle error
        console.log('GOTO ROOM ERROR', error);
        ToastAndroid.show(error.message, ToastAndroid.SHORT);
        return;
      }

      navigation.navigate('Room', {
        roomId,
      });
    },
    [],
  );

  const navigation = useNavigation();

  return (
    <SafeAreaView className="relative h-screen px-4 py-6">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">Pictlonis</Text>
      </View>

      <Button
        className="mt-6"
        onPress={() => {
          setNewGameModal(!newGameModal);
        }}>
        Créer une salle
      </Button>

      {/* 
      <Button
        title="Logout"
        onPress={() => {
          logout();
        }}
      />

      <Button
        title="Modal"
        onPress={() => {
          setNewGameModal(!newGameModal);
        }}
      /> */}

      <View
        className="flex h-64 bg-gray-100 border-2 border-gray-300 rounded-md"
        style={{
          minHeight: 64,
        }}>
        <GameRoomList />
      </View>
      <NewGameModal
        visible={newGameModal}
        onDismiss={() => setNewGameModal(false)}
        onConfirm={newGameRoomHandler}
      />
    </SafeAreaView>
  );
}
