import React from 'react';
import {Alert, ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import base64 from 'react-native-base64';

import {updateCurrentDrawPath} from '../../services/GameRoomService';
import {html as htmlString} from '../../../lib/drawing/drawHtml';
import AutoHeightWebView from 'react-native-autoheight-webview';
import {
  DrawingActions,
  DrawingProvider,
  useDrawing,
} from '../../context/DrawingContext';
import {
  GameEngineProvider,
  useGameEngine,
} from '../../context/GameEngineContext';
import {GameRoomProvider, useGameRoom} from '../../context/GameRoomContext';
import DrawingZone from '../../components/Game/Drawing/DrawingZone';
import ActionBar from '../../components/Game/ActionBar';
import Chat from '../../components/Chat/Chat';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';

interface IRoomScreenProps {
  route: {
    params: {
      roomId: string;
    };
  };
  navigation: any; // TODO: type this
}

export default function (props: IRoomScreenProps) {
  return React.useMemo(() => {
    console.log('+ RoomScreen Memo');
    return (
      <SafeAreaView className="flex flex-1">
        <GameRoomProvider roomId={props.route.params.roomId}>
          <GameEngineProvider>
            <DrawingProvider>
              <RoomView />
            </DrawingProvider>
          </GameEngineProvider>
        </GameRoomProvider>
      </SafeAreaView>
    );
  }, []);
}

interface IRoomScreenViewProps {}

function RoomView(props: IRoomScreenViewProps) {
  const drawingZoneRef = React.useRef<AutoHeightWebView>(null);
  const {user} = useAuth();
  const roomState = useGameRoom();
  const engineState = useGameEngine();
  const drawingState = useDrawing();

  const navigation = useNavigation();

  // block the user from drawing when it's not his turn
  React.useEffect(() => {
    if (!drawingZoneRef.current) {
      return;
    }

    drawingZoneRef.current.postMessage(
      JSON.stringify({
        type: 'set_is_drawing_enabled',
        payload: engineState.isAllowedToDraw,
      }),
    );
    console.info('------ set_is_drawing_enabled', engineState.isAllowedToDraw);
  }, [drawingZoneRef.current, engineState.isAllowedToDraw]);

  // clear the drawing zone when the round is over
  React.useEffect(() => {
    if (!drawingZoneRef.current) {
      return;
    }

    drawingZoneRef.current.postMessage(
      JSON.stringify({
        type: 'clear',
      }),
    );
  }, [drawingZoneRef.current, roomState.snapshot?.currentWord]);

  // draw controls
  React.useEffect(() => {
    if (!drawingZoneRef.current) {
      return;
    }

    // set the color
    drawingZoneRef.current.postMessage(
      JSON.stringify({
        type: 'setColor',
        payload: drawingState.color,
      }),
    );

    // set the pen width
    drawingZoneRef.current.postMessage(
      JSON.stringify({
        type: 'setStrokeWidth',
        payload: drawingState.penWidth,
      }),
    );

    // undo
    if (drawingState.undo) {
      drawingZoneRef.current.postMessage(
        JSON.stringify({
          type: 'undo',
        }),
      );
      drawingState.dispatch(DrawingActions.setUndo(false));
    }

    // clear
    if (drawingState.clear) {
      drawingZoneRef.current.postMessage(
        JSON.stringify({
          type: 'clear',
        }),
      );
      drawingState.dispatch(DrawingActions.setClear(false));
    }
  }, [drawingZoneRef.current, drawingState]);

  const onMessageHandler = React.useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        console.log('onMessageHandler', data);
        switch (data.type) {
          case 'pathPoints':
            if ('finished' === roomState.snapshot?.state) return;
            updateCurrentDrawPath(
              roomState.roomId as string,
              JSON.stringify(data.payload),
            );
            break;
          case 'clear':
            if ('finished' === roomState.snapshot?.state) return;
            updateCurrentDrawPath(roomState.roomId as string, 'clear');
            break;
          case 'undo':
            if ('finished' === roomState.snapshot?.state) return;
            updateCurrentDrawPath(roomState.roomId as string, 'undo');
        }
      } catch (error) {
        console.log('onMessageHandler', error);
      }
    },
    [roomState.snapshot?.state],
  );

  React.useEffect(() => {
    if (!drawingZoneRef.current || !roomState.snapshot?.currentDrawingPath) {
      return;
    }

    const drawingPath = base64.decode(roomState.snapshot?.currentDrawingPath);

    let message;
    if ('clear' === drawingPath.substr(0, 5)) {
      message = {type: 'clear_no_emit'};
    } else if ('undo' === drawingPath.substr(0, 4)) {
      message = {type: 'undo_no_emit'};
    } else {
      message = {
        type: 'add_point',
        payload: drawingPath,
      };
    }
    console.log('----++++-----------> + drawingPath', message);

    drawingZoneRef.current.postMessage(JSON.stringify(message));
  }, [drawingZoneRef.current, roomState.snapshot?.currentDrawingPath]);

  // when the game is finished, show the winner and exit the room
  React.useEffect(() => {
    if (!roomState.snapshot) {
      return;
    }

    if ('finished' === roomState.snapshot.state) {
      let message = 'La partie est terminée. Aucun gagnant.';
      if ('-1' !== roomState.snapshot.winner && roomState.snapshot.winner) {
        // get the winner name from the players list
        const winner = roomState.snapshot.players.find(
          player => player.id === roomState?.snapshot?.winner,
        );
        // if the winer is the current user logged in
        if (winner?.id === user?.uid) {
          message = 'Vous avez gagné !';
        } else {
          message = 'Le gagnant est ' + winner?.name;
        }
      }

      Alert.alert(
        'Partie terminée',
        message,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
        {cancelable: false},
      );
    }
  }, [roomState.snapshot?.state]);

  return (
    <>
      <DrawingZone
        ref={drawingZoneRef}
        source={{html: htmlString}}
        onMessage={onMessageHandler}
      />
      <ActionBar />
      <View className="flex-col-reverse h-56 bg-gray-50">
        <Chat />
      </View>
    </>
  );
}
