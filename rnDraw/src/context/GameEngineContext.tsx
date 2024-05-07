import React from 'react';

import {
  getRandomWord,
  givePointsToPlayersFromLeaderboardTransaction,
  startGame,
  updateGameRoom,
} from '../services/GameRoomService';
import {GameRoomActions, useGameRoom} from './GameRoomContext';
import {
  computeGameRoomLeaderBoard,
  computeLeaderBoard,
  shuffleArray,
} from '../utils';
import {Action, ReducerAction} from './types';
import {GameRoomEntityState, GameRoomFirebaseEntity} from '../types';
import {AuthContext, AuthContextType} from './AuthContext';

type GameEngineState = {
  isAllowedToDraw: boolean;
  hasToGuess: boolean;
};

type GameEngineContextType = GameEngineState & {
  // state: GameEngineState;
  dispatch: React.Dispatch<Action>;
};

const initialState: GameEngineState = {
  isAllowedToDraw: false,
  hasToGuess: false,
};

const GameEngineContext = React.createContext<GameEngineContextType | null>(
  null,
);

export const GameEngineActionType = {
  setIsAllowedToDraw: 'setIsAllowedToDraw',
  setHasToGuess: 'setHasToGuess',
  setDisplayWordToGuess: 'setDisplayWordToGuess',
  bulkSet: 'bulkSet',
};

export const GameEngineActions = {
  setIsAllowedToDraw: (isAllowedToDraw: boolean) => {
    return {
      type: GameEngineActionType.setIsAllowedToDraw,
      payload: isAllowedToDraw,
    };
  },
  setHasToGuess: (hasToGuess: boolean) => {
    return {type: GameEngineActionType.setHasToGuess, payload: hasToGuess};
  },
  bulkSet: (state: GameEngineState) => {
    return {
      type: 'bulkSet',
      payload: state,
    };
  },
};

const reducer: ReducerAction<GameEngineState, any> = (state, action) => {
  switch (action.type) {
    case GameEngineActionType.setIsAllowedToDraw:
      return {...state, isAllowedToDraw: action.payload};
    case GameEngineActionType.setHasToGuess:
      return {...state, hasToGuess: action.payload};
    case GameEngineActionType.bulkSet:
      return {...state, ...action.payload};
    default:
      return state;
  }
};

interface IGameEngineProviderProps {
  initialState?: GameEngineState;
  children: React.ReactNode;
}

export function GameEngineProvider(props: IGameEngineProviderProps) {
  const [state, dispatch] = React.useReducer(
    reducer,
    props.initialState || initialState,
  );
  const store = React.useMemo(() => ({...state, dispatch}), [state]);

  const {user} = React.useContext(AuthContext) as AuthContextType;

  const roomState = useGameRoom();

  // auto-start the game when the min players are reached / stop the game when the min players are not reached
  React.useEffect(() => {
    if (roomState.initializing || !roomState.isOwner) {
      return;
    }

    const snapshot = roomState.snapshot;
    const playersCount = snapshot?.players.length || 0;
    if ('waiting' === snapshot?.state) {
      if (snapshot.config.minPlayers <= playersCount) {
        // start the game
        // randomize the players turn order
        const playersTurnOrder = snapshot.players.map(p => p.id);
        shuffleArray(playersTurnOrder);
        startGame(roomState.roomId as string, playersTurnOrder);
      }
    }
    if ('on_going' === snapshot?.state) {
      if (snapshot.config.minPlayers > playersCount) {
        // stop the game and give the points to the remaining players
        console.log('--------- Game is stopped');
        // compute the leaderboard
        const leaderboard = computeGameRoomLeaderBoard(snapshot.roundHistory);
        updateGameRoom(roomState.roomId as string, {
          state: 'finished', //GameRoomEntityState.FINISHED,
        });
        // TODO: give points to the remaining players
      }
    }
  }, [roomState?.snapshot?.state, roomState?.snapshot?.players]);

  // set 5 seconds timeout to check if the current player is still present
  React.useEffect(() => {
    if (
      roomState.initializing ||
      !roomState.isOwner ||
      'on_going' !== roomState.snapshot?.state
    ) {
      return;
    }
    console.log('***++ --------------- ');
    const snapshot = roomState.snapshot;
    const clear = setTimeout(() => {
      console.log('***++ Checking if current player is present');
      const isCurrentPlayerPresent =
        0 <
        snapshot.players.filter(p => p.id === snapshot?.currentPlayer).length;
      if (isCurrentPlayerPresent) {
        console.log('***++ Current player is present');
        return;
      }
      console.log('***++ Current player is not present');
      // TODO: check if they are still in the room or give them the points
    }, 5000);
    return () => {
      console.log('***++ Clearing timeout');
      clearTimeout(clear);
    };
  }, [roomState?.snapshot?.players]);

  // update the remaining time
  React.useEffect(() => {
    let timeout1: number | null = null;
    if (roomState.initializing || !roomState.isOwner) {
      return;
    }
    const snapshot = roomState.snapshot as GameRoomFirebaseEntity;
    if ('on_going' !== snapshot.state) {
      return;
    }

    if (0 >= snapshot.remainingRoundTime) {
      console.log('***++ Round is finished');
      // give the player the points
      // TODO: give the player the points

      // check if this is the last round
      if (snapshot.currentRound === snapshot.config.rounds) {
        // show the word to guess
        updateGameRoom(roomState.roomId as string, {
          showWordToGuess: true,
        });

        // compute the leaderboard
        const computedLeaderBoard = computeLeaderBoard(snapshot.roundHistory);
        console.log('***++ computedLeaderboard', computedLeaderBoard);

        timeout1 = setTimeout(() => {
          dispatch(GameEngineActions.bulkSet(initialState));
          // set the game as finished
          // check if there is a winner
          updateGameRoom(roomState.roomId as string, {
            state: 'finished',
            showWordToGuess: false,
            winner:
              0 < computedLeaderBoard.length
                ? computedLeaderBoard[0].playerId
                : '-1',
          });
          // for each player, give them the points
          givePointsToPlayersFromLeaderboardTransaction(computedLeaderBoard);
          console.info('[GameEngineProvider] Game is finished');
        }, 6000);

        return () => {
          if (null !== timeout1) {
            clearTimeout(timeout1);
          }
        };
      }

      // set the next player to draw
      // set the remaining time to the round duration
      const currentPlayerIndex = snapshot.playersTurnOrder.indexOf(
        snapshot.currentPlayer as string,
      );
      const totalPlayers = snapshot.playersTurnOrder.length;
      const nextPlayerIndex =
        totalPlayers - 1 === currentPlayerIndex ? 0 : currentPlayerIndex + 1;
      console.log('-----------------> nextPlayerIndex', nextPlayerIndex);
      const wordToGuess = getRandomWord();
      const nextRoundIndex = snapshot.currentRound + 1;

      // show the word to the players
      updateGameRoom(roomState.roomId as string, {
        showWordToGuess: true,
      });
      // wait 6 seconds to give the players time to see the word
      timeout1 = setTimeout(() => {
        updateGameRoom(roomState.roomId as string, {
          remainingRoundTime: snapshot.config.roundDuration,
          currentPlayer: snapshot.playersTurnOrder[nextPlayerIndex],
          currentRound: nextRoundIndex,
          currentWord: wordToGuess,
          roundHistory: {
            ...snapshot.roundHistory,
            [nextRoundIndex]: {
              wordToGuess,
              players: [],
            },
          },
          showWordToGuess: false,
        });
      }, 6000);
      return;
    }

    const timeout2 = setTimeout(() => {
      console.log('***++ Updating remaining time');
      updateGameRoom(roomState.roomId as string, {
        remainingRoundTime: snapshot.remainingRoundTime - 1,
      });
    }, 900); // 900ms to avoid the network latency
    return () => {
      console.log('***++ Clearing timeout', timeout1, timeout2);
      if (null !== timeout1) {
        clearTimeout(timeout1);
      }
      clearTimeout(timeout2);
    };
  }, [roomState?.snapshot?.state, roomState?.snapshot?.remainingRoundTime]);

  // set if the player can answer, draw
  React.useEffect(() => {
    if ('on_going' !== roomState.snapshot?.state) {
      return;
    }

    // if the current player is the same current user, allow him to draw else answer
    const isCurrentPlayer = user?.uid === roomState.snapshot?.currentPlayer;
    dispatch(
      GameEngineActions.bulkSet({
        isAllowedToDraw: isCurrentPlayer,
        hasToGuess: !isCurrentPlayer,
      }),
    );
  }, [roomState.snapshot?.currentPlayer]);

  return (
    <GameEngineContext.Provider value={store}>
      {props.children}
    </GameEngineContext.Provider>
  );
}

export const useGameEngine = () => {
  const ctx = React.useContext(GameEngineContext);
  if (!ctx) {
    throw new Error('useGameEngine must be used within a GameEngineProvider');
  }

  return ctx;
};
