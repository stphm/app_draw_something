export type Action = {type: string; payload?: any};
export type ReducerAction<S, Action> = (prevState: S, action: Action) => S;
