import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

import {useAuth} from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import RoomScreen from '../screens/Room/RoomScreen';

import BottomTabsNavigation from './BottomTabsNavigation';

const Stack = createNativeStackNavigator();
export const defaultScreenOptions = {
  headerShown: false,
};

export default function () {
  const [initializing, setInitializing] = React.useState(true);
  const {user} = useAuth();

  function onAuthStateChanged() {
    if (initializing) setInitializing(false);
  }

  React.useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user === null ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                ...defaultScreenOptions,
                // When logging out, a pop animation feels intuitive
                // You can remove this if you want the default 'push' animation
                animationTypeForReplace: user === null ? 'pop' : 'push',
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                ...defaultScreenOptions,
                animationTypeForReplace: user === null ? 'pop' : 'push',
              }}
            />
          </>
        ) : (
          // User is signed in
          <>
            <Stack.Screen
              name="BottomNavigator"
              component={BottomTabsNavigation}
              options={defaultScreenOptions}
            />
            {/* <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={defaultScreenOptions}
            />
            <Stack.Screen name="Draw" component={DrawnScreen} />

            <Stack.Screen name="WS" component={WebsocketTestScreen} /> */}
            <Stack.Screen name="Room" component={RoomScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
