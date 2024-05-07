import React from 'react';
import {Text, TouchableOpacity, ScrollView, View} from 'react-native';
import Slider, {MarkerProps} from 'react-native-a11y-slider';

import {useGameRoom} from '../../../context/GameRoomContext';
import {DrawingActions, useDrawing} from '../../../context/DrawingContext';

interface IDrawingControlsProps {}

export default function (props: IDrawingControlsProps) {
  const roomState = useGameRoom();
  const drawingState = useDrawing();

  const setColor = (color: string) => {
    console.log('setColor', color);
    drawingState.dispatch(DrawingActions.setColor(color));
  };

  const [tmpStrokeWidth, setTmpStrokeWidth] = React.useState(5);
  // only after 0.8s update the stroke width
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('--------------------- setStrokeWidth', tmpStrokeWidth);
      drawingState.dispatch(DrawingActions.setPenWidth(tmpStrokeWidth));
    }, 800);
    return () => clearTimeout(timeout);
  }, [tmpStrokeWidth]);

  return React.useMemo(() => {
    return (
      <View className="flex-col-reverse w-full">
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => {
                drawingState.dispatch(DrawingActions.setClear(true));
              }}>
              <Text className="font-bold text-black">Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                drawingState.dispatch(DrawingActions.setUndo(true));
              }}>
              <Text className="font-bold text-black">Annuler</Text>
            </TouchableOpacity>
          </View>
          {/* // color */}

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            className="flex-row flex-1 gap-2">
            <TouchableOpacity
              className="w-6 h-6 bg-black rounded-full"
              onPress={() => setColor('black')}></TouchableOpacity>

            <TouchableOpacity
              className="w-6 h-6 bg-red-500 rounded-full"
              onPress={() => setColor('red')}></TouchableOpacity>

            <TouchableOpacity
              className="w-6 h-6 bg-yellow-500 rounded-full"
              onPress={() => setColor('yellow')}></TouchableOpacity>

            <TouchableOpacity
              className="w-6 h-6 bg-green-500 rounded-full"
              onPress={() => setColor('green')}></TouchableOpacity>

            <TouchableOpacity
              className="w-6 h-6 bg-blue-500 rounded-full"
              onPress={() => setColor('blue')}></TouchableOpacity>
          </ScrollView>
        </View>
        {/* <View className="px-4">
          <Slider
            min={5}
            max={15}
            values={drawingState.penWidth}
            showLabel={false}
            onChange={setTmpStrokeWidth}
          />
        </View> */}
        <View className="flex-row items-center justify-center">
          <Text className="text-lg font-bold text-black">Dessiner: </Text>
          <Text className="text-lg text-black">
            {roomState.snapshot?.currentWord}
          </Text>
        </View>
      </View>
    );
  }, [roomState.snapshot?.currentWord, drawingState.penWidth]);
}
