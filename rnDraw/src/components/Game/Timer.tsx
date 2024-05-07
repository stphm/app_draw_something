import React from 'react';
import {Text} from 'react-native';

import {useGameRoom} from '../../context/GameRoomContext';
import {zeroPad} from '../../utils';

export default function () {
  const {snapshot} = useGameRoom();

  const minutes = zeroPad(Math.floor((snapshot?.remainingRoundTime || 0) / 60));
  const seconds = zeroPad((snapshot?.remainingRoundTime || 0) % 60);

  let str = `${minutes}:${seconds}`;

  return React.useMemo(() => {
    return (
      <Text className="text-gray-400">
        Temps restant: {str} ({snapshot?.remainingRoundTime})
      </Text>
    );
  }, [minutes, seconds]);
}
