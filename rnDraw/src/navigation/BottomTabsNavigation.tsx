import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {defaultScreenOptions} from './Routes';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Tab = createBottomTabNavigator();

export default function () {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          ...defaultScreenOptions,
          // tabBarIcon: ({color, size}) => (
          //   <Icon name="home" color={color} size={size} />
          // ),
        }}
      />
      <Tab.Screen
        name="LeaderBoard"
        component={LeaderboardScreen}
        options={{...defaultScreenOptions, unmountOnBlur: true}}
        listeners={({navigation}) => ({
          blur: () => navigation.setParams({screen: undefined}),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{...defaultScreenOptions, unmountOnBlur: true}}
        listeners={({navigation}) => ({
          blur: () => navigation.setParams({screen: undefined}),
        })}
      />
    </Tab.Navigator>
  );
}
