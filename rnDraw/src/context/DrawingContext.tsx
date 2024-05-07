import React from 'react';
import {Action} from './types';

export type DrawingState = {
  color: string;
  penWidth: number;
  undo: boolean;
  clear: boolean;
};

type DrawingContextType = DrawingState & {
  dispatch: React.Dispatch<Action>;
};

export const DrawingActionType = {
  setColor: 'setColor',
  setPenWidth: 'setPenWidth',
  setUndo: 'setUndo',
  setClear: 'setClear',
};

export const DrawingActions = {
  setColor: (color: string) => {
    return {
      type: DrawingActionType.setColor,
      payload: color,
    };
  },
  setPenWidth: (penWidth: number) => {
    return {
      type: DrawingActionType.setPenWidth,
      payload: penWidth,
    };
  },
  setUndo: (undo: boolean) => {
    return {
      type: DrawingActionType.setUndo,
      payload: undo,
    };
  },
  setClear: (clear: boolean) => {
    return {
      type: DrawingActionType.setClear,
      payload: clear,
    };
  },
};

const initialState: DrawingState = {
  color: '#000000',
  penWidth: 5,
  undo: false,
  clear: false,
};

const DrawingContext = React.createContext<DrawingContextType | null>(null);

const reducer: React.Reducer<DrawingState, any> = (state, action) => {
  switch (action.type) {
    case DrawingActionType.setColor:
      return {...state, color: action.payload};
    case DrawingActionType.setPenWidth:
      return {...state, penWidth: action.payload};
    case DrawingActionType.setUndo:
      return {...state, undo: action.payload};
    case DrawingActionType.setClear:
      return {...state, clear: action.payload};
    default:
      return state;
  }
};

interface IDrawingProviderProps {
  children: React.ReactNode;
}

export function DrawingProvider({children}: IDrawingProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useLayoutEffect(() => {}, []);

  const store = React.useMemo(() => {
    return {...state, dispatch};
  }, [state]);

  return (
    <DrawingContext.Provider value={store}>{children}</DrawingContext.Provider>
  );
}

export const useDrawing = () => {
  const context = React.useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
};
