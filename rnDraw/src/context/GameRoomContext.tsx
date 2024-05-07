import React from 'react';
import {Alert, ToastAndroid} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import type {Action, ReducerAction} from './types';
import {gameRoomsCollectionRef} from '../lib/firebase';
import {AuthContext, AuthContextType} from './AuthContext';
import {
  addPlayerToRoom,
  deleteGameRoom,
  removePlayerFromRoom,
} from '../services/GameRoomService';
import {GameRoomFirebaseEntity} from '../types';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

type GameRoomState = {
  roomId: string | null;
  initializing: boolean;
  deleted: boolean;
  snapshot: GameRoomFirebaseEntity | null;
  forceQuit: boolean;
  forceQuitReason: string | null;
  isOwner: boolean;
};

type GameEngineContextType = GameRoomState & {
  // state: ;
  dispatch: React.Dispatch<Action>;
};

const forceQuitTimeout = 5 * 1000; // 5 seconds
const initialState: GameRoomState = {
  roomId: null,
  initializing: true,
  deleted: false,
  snapshot: null,
  forceQuit: false,
  forceQuitReason: null,
  isOwner: false,
};

const GameRoomContext = React.createContext<GameEngineContextType | null>(null);

export enum GameRoomActionType {
  setRoomId = 'setRoomId',
  setInitializing = 'setInitializing',
  setDeleted = 'setDeleted',
  setSnapshot = 'setSnapshot',
  setForceQuit = 'setForceQuit',
  setForceQuitReason = 'setForceQuitReason',
  setIsOwner = 'setIsOwner',
  bulkSet = 'bulkSet',
}

export const GameRoomActions = {
  setRoomId: (id: string) => {
    return {type: GameRoomActionType.setRoomId, payload: id};
  },
  setInitializing: (initializing: boolean) => {
    return {type: GameRoomActionType.setInitializing, payload: initializing};
  },
  setDeleted: (deleted: boolean) => {
    return {type: GameRoomActionType.setDeleted, payload: deleted};
  },
  setSnapshot: (snapshot: GameRoomFirebaseEntity | null) => {
    return {type: GameRoomActionType.setSnapshot, payload: snapshot};
  },
  setForceQuit: (forceQuit: boolean) => {
    return {type: GameRoomActionType.setForceQuit, payload: forceQuit};
  },
  setForceQuitReason: (forceQuitReason: string) => {
    return {
      type: GameRoomActionType.setForceQuitReason,
      payload: forceQuitReason,
    };
  },
  setIsOwner: (isOwner: boolean) => {
    return {type: GameRoomActionType.setIsOwner, payload: isOwner};
  },
  bulkSet: (payload: Partial<GameRoomState>) => {
    return {type: GameRoomActionType.bulkSet, payload};
  },
};

const reducer: ReducerAction<GameRoomState, any> = (state, action) => {
  switch (action.type) {
    case GameRoomActionType.setRoomId:
      return {...state, roomId: action.payload};
    case GameRoomActionType.setInitializing:
      return {...state, initializing: action.payload};
    case GameRoomActionType.setDeleted:
      return {...state, deleted: action.payload};
    case GameRoomActionType.setSnapshot:
      return {...state, snapshot: action.payload};
    case GameRoomActionType.setForceQuit:
      return {...state, forceQuit: action.payload};
    case GameRoomActionType.setForceQuitReason:
      return {...state, forceQuitReason: action.payload};
    case GameRoomActionType.setIsOwner:
      return {...state, isOwner: action.payload};
    case GameRoomActionType.bulkSet:
      console.log(state, action.payload);
      return {...state, ...action.payload};
    default:
      return state;
  }
};

type SnapshotCallback = (
  s: FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>,
) => void | undefined;

interface IGameRoomProviderProps {
  children: React.ReactNode;
  roomId: string;
}

export function GameRoomProvider(props: IGameRoomProviderProps) {
  const goBackConfirmationCallback =
    React.useRef<(e: any) => void | undefined>();

  const snapshotCallbackRef = React.useRef<SnapshotCallback>();
  const removePeopleFromRoomCallback = React.useRef<() => void | undefined>();

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const store = React.useMemo(() => ({...state, dispatch}), [state]);

  const {user} = React.useContext(AuthContext) as AuthContextType;

  const navigation = useNavigation();

  React.useEffect(() => {
    snapshotCallbackRef.current = s => {
      const snapshotData = s.data();
      if (undefined === snapshotData) {
        return dispatch(GameRoomActions.setDeleted(true));
      }

      if (state.initializing) {
        // set the game room as initialized
        dispatch(
          GameRoomActions.bulkSet({
            initializing: false,
            isOwner: user!.uid === snapshotData.config.owner,
            snapshot: snapshotData as GameRoomFirebaseEntity,
          }),
        );

        // add player to the game room
        addPlayerToRoom(props.roomId, {
          id: user!.uid,
          name: user!.username,
        });
        return;
      }

      // update the game room snapshot
      dispatch(
        GameRoomActions.setSnapshot(snapshotData as GameRoomFirebaseEntity),
      );
    };
  }, [state.initializing]);

  React.useLayoutEffect(() => {
    dispatch(GameRoomActions.setRoomId(props.roomId));
    // subscribe to the game room
    const unsubscribe = gameRoomsCollectionRef
      .doc(props.roomId)
      .onSnapshot(s => {
        if (snapshotCallbackRef.current) return snapshotCallbackRef.current(s);
        console.log('[ERROR] snapshotCallbackRef.current is undefined');
      });

    return () => {
      // unsubscribe from the game room
      unsubscribe();
      console.log('unsubscribed from game room ' + props.roomId);
      // remove player from the game room
      if (removePeopleFromRoomCallback.current) {
        removePeopleFromRoomCallback.current();
      }
    };
  }, []);

  removePeopleFromRoomCallback.current = React.useCallback(() => {
    if (state.isOwner) {
      deleteGameRoom(props.roomId);
      return;
    }
    if (state.deleted) {
      return;
    }

    removePlayerFromRoom(props.roomId, user!.uid);
  }, [state.deleted, state.isOwner]);

  // set force quit if after x seconds the game room is still initializing
  React.useEffect(() => {
    if (state.initializing) {
      const timeout = setTimeout(() => {
        dispatch(
          GameRoomActions.bulkSet({
            forceQuit: true,
            forceQuitReason: 'Le serveur a mis trop de temps à répondre.',
          }),
        );
      }, forceQuitTimeout);
      return () => clearTimeout(timeout);
    }
  }, [state.initializing]);

  // defined the back button behavior
  React.useEffect(() => {
    if ('finished' === state.snapshot?.state) {
      goBackConfirmationCallback.current = undefined;
      return;
    }

    if (state.deleted) {
      if (goBackConfirmationCallback.current) {
        navigation.removeListener(
          'beforeRemove',
          goBackConfirmationCallback.current,
        );
        goBackConfirmationCallback.current = undefined;
      }
      Alert.alert(
        'Partie supprimée',
        "L'hôte a quitté la partie. Vous allez être redirigé sur la page d'accueil.",
        [
          {
            text: 'Continuer',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
      return;
    }

    goBackConfirmationCallback.current = e => {
      // if the game is still initializing & force quit is not possible then prevent the user from going back
      if (state.initializing && !state.forceQuit) {
        e.preventDefault();
        ToastAndroid.show(
          "La partie est toujours en cours d'initialisation",
          ToastAndroid.SHORT,
        );
        return;
      }
      e.preventDefault();
      Alert.alert(
        'Quitter la partie ?',
        state.isOwner
          ? 'Attention, vous êtes le créateur de la partie, celle-ci sera supprimée.'
          : 'Vous êtes sur le point de quitter la partie.',
        [
          {text: 'Annuler', style: 'cancel'},
          {
            text: 'Continuer',
            style: 'destructive',
            // If the user confirmed, then we dispatch the action we blocked earlier
            // This will continue the action that had triggered the removal of the screen
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      );
    };
    navigation.addListener('beforeRemove', goBackConfirmationCallback.current);

    return () => {
      if (goBackConfirmationCallback.current) {
        navigation.removeListener(
          'beforeRemove',
          goBackConfirmationCallback.current,
        );
      }
    };
  }, [
    navigation,
    state.deleted,
    state.forceQuit,
    state.initializing,
    state?.snapshot?.state,
    goBackConfirmationCallback.current,
  ]);

  return (
    <GameRoomContext.Provider value={store}>
      {props.children}
    </GameRoomContext.Provider>
  );
}

export const useGameRoom = () => {
  const ctx = React.useContext(GameRoomContext);
  if (!ctx) {
    throw new Error('useGameRoom must be used within a GameRoomProvider');
  }

  return ctx;
};
