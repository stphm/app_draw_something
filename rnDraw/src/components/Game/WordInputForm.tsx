import React from 'react';
import OTPTextView from 'react-native-otp-textinput';

interface IWordInputFormProps {
  wordToGuessLength: number | undefined;
  handleWordChange: (word: string) => void;
  isWordValid: boolean;
  editable: boolean;
  defaultValue?: string;
}

export default React.forwardRef<React.ReactNode, IWordInputFormProps>(
  (props, ref) => {
    return (
      <>
        <OTPTextView
          ref={ref}
          containerStyle={{
            gap: 0.5,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
          inputCount={props.wordToGuessLength || 0}
          keyboardType="default"
          textInputStyle={{
            borderRadius: 10,
            borderWidth: 4,
            height: 38,
            width: 38,
            fontSize: 16,
          }}
          handleTextChange={props.handleWordChange}
          editable={props.editable}
          defaultValue={props.defaultValue}
          autoFocus={false}
        />
      </>
    );
  },
);
