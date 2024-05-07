import React from 'react';
import {View, Text} from 'react-native';

import {useGameEngine} from '../../context/GameEngineContext';
import WordInputForm from './WordInputForm';
import {useGameRoom} from '../../context/GameRoomContext';
import {addPlayerToRoundHistory} from '../../services/GameRoomService';
import {AuthContext, AuthContextType} from '../../context/AuthContext';
import DrawingControls from './Drawing/DrawingControls';
import Timer from './Timer';

export default function () {
  const {user} = React.useContext(AuthContext) as AuthContextType;
  const [isWordSubmittedValid, setIsWordSubmittedValid] = React.useState(false);

  const roomState = useGameRoom();
  const engineState = useGameEngine();

  const handleWordChange = (word: string) => {
    const isWordValid =
      roomState.snapshot?.currentWord?.toLocaleLowerCase() ===
      word.toLocaleLowerCase();

    console.log('isWordValid', isWordValid);
    console.log('word', roomState.snapshot?.currentWord);
    if (isWordValid) {
      setIsWordSubmittedValid(isWordValid);
      addPlayerToRoundHistory(
        roomState.roomId as string,
        user!.uid,
        roomState.snapshot!.currentRound,
      );
    }
  };

  // reset the word input form when the round changes
  React.useEffect(() => {
    if (isWordSubmittedValid) {
      setIsWordSubmittedValid(false);
    }
  }, [roomState.snapshot?.currentRound]);

  return React.useMemo(() => {
    return (
      <View className="relative items-center justify-center px-8 text-black h-44">
        {'on_going' === roomState.snapshot?.state && (
          <>
            <View className="absolute top-0 right-0 mt-2 mr-2">
              <Timer />
            </View>
            {engineState.hasToGuess && (
              <>
                <Text className="mb-1 text-xl font-bold text-black">
                  {isWordSubmittedValid && 'Bien joué!'}
                  {!roomState.snapshot.showWordToGuess &&
                    !isWordSubmittedValid &&
                    'Essayez de deviner le mot'}
                  {roomState.snapshot.showWordToGuess &&
                    !isWordSubmittedValid &&
                    'Il fallait trouver : ' + roomState.snapshot?.currentWord}
                </Text>
                {!roomState.snapshot.showWordToGuess &&
                  !isWordSubmittedValid && (
                    <WordInputForm
                      editable={!isWordSubmittedValid}
                      wordToGuessLength={
                        roomState.snapshot?.currentWord?.length
                      }
                      handleWordChange={handleWordChange}
                      isWordValid={isWordSubmittedValid}
                    />
                  )}
              </>
            )}
            {engineState.isAllowedToDraw && <DrawingControls />}
          </>
        )}
        {'waiting' === roomState.snapshot?.state && (
          <Text className="text-xl font-bold text-center text-black">
            En attente de joueurs pour démarrer la partie (min{' '}
            {roomState.snapshot?.config.minPlayers} joueurs)
          </Text>
        )}
        {'finished' === roomState.snapshot?.state && (
          <Text className="text-xl font-bold text-center text-black">
            La partie est terminée
          </Text>
        )}
      </View>
    );
  }, [
    isWordSubmittedValid,
    engineState.hasToGuess,
    engineState.isAllowedToDraw,
    roomState.snapshot?.showWordToGuess,
    roomState.snapshot?.state,
    roomState.snapshot?.currentWord,
  ]);
}
