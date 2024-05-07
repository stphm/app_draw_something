import React from 'react';
import {
  TouchableOpacity,
  Text,
  TextInput,
  ScrollView,
  View,
} from 'react-native';

import {GameRoomEntityMessage} from '../../types';
import {useAuth} from '../../context/AuthContext';
import {useGameRoom} from '../../context/GameRoomContext';
import {sendMessage} from '../../services/ChatService';

interface IChatProps {}

export default function (props: IChatProps) {
  const {user} = useAuth();
  const {snapshot} = useGameRoom();

  const [messageContent, setMessageContent] = React.useState('');

  const handleMessageContentChange = React.useCallback((value: string) => {
    setMessageContent(value);
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!snapshot || '' === messageContent.trim() || !user) {
      console.log(
        'handleSubmit',
        'no snapshot or no messageContent or no user',
      );
      return;
    }

    const newMessage: GameRoomEntityMessage = {
      content: messageContent,
      authorName: user.username,
      authorId: user.uid,
    };

    console.log('handleSubmit', newMessage);

    sendMessage(snapshot.id, newMessage);
  }, [snapshot?.id, messageContent, user]);

  return React.useMemo(() => {
    return (
      <>
        <View className="flex-row items-center gap-4 px-4 py-2 text-gray-400 ">
          <TextInput
            className="flex-1 px-3 py-2 leading-tight text-gray-700 border border-gray-400 rounded-md"
            onChangeText={handleMessageContentChange}
          />
          <TouchableOpacity
            className={`px-4 py-2 ${'' === messageContent ? 'opacity-25' : ''}`}
            onPress={handleSubmit}
            disabled={'' === messageContent}>
            <Text className="text-gray-400">Envoyer</Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="h-24 border-b border-gray-200">
          {(!snapshot?.messages || snapshot?.messages.length === 0) && (
            <Text className="mt-12 text-center text-gray-400">
              Aucun message
            </Text>
          )}
          {snapshot?.messages.map(item => {
            return (
              <View key={item.id} className="px-1 py-0.5 flex-row items-center">
                <Text className="font-semibold text-gray-400">
                  {item.authorName}
                </Text>
                <Text className="text-gray-400">: {item.content}</Text>
              </View>
            );
          })}
        </ScrollView>
      </>
    );
  }, [snapshot?.messages, messageContent]);
}
