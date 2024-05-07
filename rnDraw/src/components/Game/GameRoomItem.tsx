import React from 'react';
import {Text, ToastAndroid, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

interface IGameRoomItemProps {
  id: string;
  name: string;
  playersCount: number;
  maxPlayers: number;
  state: string;
}

export default function ({
  id,
  name,
  playersCount,
  maxPlayers,
  state,
}: IGameRoomItemProps) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('Room pressed', id);
        if ('waiting' !== state || playersCount >= maxPlayers) {
          ToastAndroid.show(
            'La partie est pleine ou en cours',
            ToastAndroid.SHORT,
          );
          return;
        }
        navigation.navigate('Room', {roomId: id});
      }}>
      <View className="px-6 py-4">
        <Text className="text-2xl text-gray-600">{name}</Text>
        <Text className="text-gray-600">
          {playersCount}/{maxPlayers} | Status: {state}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
