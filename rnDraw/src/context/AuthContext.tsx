import React from 'react';
import auth from '@react-native-firebase/auth';
import {ReactNativeFirebase} from '@react-native-firebase/app';
import {createNewUser, getUserDetails} from '../services/UserService';

export type User = {
  uid: string;
  email: string;
  username: string;
};

export type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (
    email: string,
    password: string,
  ) => Promise<ReactNativeFirebase.NativeFirebaseError | Error | undefined>;
  register: (
    pseudo: string,
    email: string,
    password: string,
  ) => Promise<ReactNativeFirebase.NativeFirebaseError | Error | undefined>;
  logout: () => Promise<
    ReactNativeFirebase.NativeFirebaseError | Error | undefined
  >;
};

export const AuthContext = React.createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({children}: AuthProviderProps) => {
  const [user, setUser] = React.useState<User | null>(null);

  const login = React.useCallback<
    (
      email: string,
      password: string,
    ) => Promise<ReactNativeFirebase.NativeFirebaseError | Error | undefined>
  >(async (email, password) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e) {
      if (e instanceof Error) return e;

      return new Error('Something went wrong');
    }
  }, []);

  const register = React.useCallback<
    (
      pseudo: string,
      email: string,
      password: string,
    ) => Promise<ReactNativeFirebase.NativeFirebaseError | Error | undefined>
  >(async (pseudo, email, password) => {
    try {
      const credentials = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      if (credentials.additionalUserInfo?.isNewUser) {
        await createNewUser(credentials.user.uid, pseudo);
      }
    } catch (e) {
      if (e instanceof Error) return e;
      return new Error('Something went wrong');
    }
  }, []);

  const logout = React.useCallback<
    () => Promise<ReactNativeFirebase.NativeFirebaseError | Error | undefined>
  >(async () => {
    try {
      await auth().signOut();
    } catch (e) {
      if (e instanceof Error) return e;
      return new Error('Something went wrong');
    }
  }, []);

  React.useLayoutEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (!user) return setUser(null);
      const userDetails = await getUserDetails(user.uid);
      setUser({
        uid: user.uid,
        email: user.email as string,
        username: userDetails?.username,
      });
    });

    return unsubscribe;
  }, []);

  const state = React.useMemo(() => {
    return {user, setUser, login, register, logout};
  }, [user, setUser, login]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
