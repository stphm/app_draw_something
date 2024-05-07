import React from 'react';
import {StyleSheet, View, SafeAreaView} from 'react-native';
import RNDrawOnScreen from 'react-native-draw-on-screen';

export default class Test extends React.Component {
  state = {
    color: 'black',
    strokeWidth: 10,
  };

  changeColor = color => {
    this.setState({color});
  };

  changeBrushSize = strokeWidth => {
    this.setState({strokeWidth});
  };

  undo = () => {
    this.RNDraw.undo();
  };

  clear = () => {
    this.RNDraw.clear();
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        {/* <Controls
          handleColorChange={this.changeColor}
          handleBrushSizeChange={this.changeBrushSize}
          selectedColor={this.state.color}
          selectedStrokeWidth={this.state.strokeWidth}
          handleUndo={this.undo}
          handleClear={this.clear}
        /> */}
        <View
          style={{
            flex: 1,
            flexGrow: 1,
            border: 'solid',
            borderWidth: 2,
            borderColor: '#ccc',
          }}>
          <RNDrawOnScreen
            penColor={this.state.color}
            strokeWidth={this.state.strokeWidth}
            ref={r => (this.RNDraw = r)}
          />
        </View>
      </SafeAreaView>
    );
  }
}
