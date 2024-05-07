import React from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth} from '../context/AuthContext';
import {getUserDetails} from '../services/UserService';

export default function () {
  const {logout, user} = useAuth();
  const [profile, setProfile] = React.useState<any>(null);

  React.useEffect(() => {
    console.log('ProfileScreen mount');
    (async () => {
      setProfile(await getUserDetails(user?.uid as string));
    })();
    return () => {
      console.log('ProfileScreen unmount');
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Vous êtes sur le point de vous déconnecter.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  return (
    <SafeAreaView className="px-4 py-6">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-gray-600">Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center justify-center mx-auto mt-12 border-4 border-gray-200 rounded-full w-36 h-36">
        <Image
          source={require('../assets/person_placeholder.jpg')}
          className="w-32 h-32 rounded-full"
        />
      </View>
      <Text className="mt-4 text-xl font-bold text-center text-gray-600">
        {profile ? profile.username : user?.username}
      </Text>
      <View className="flex-row items-center justify-center">
        <Text className="mt-4 text-xl font-bold text-center text-gray-600">
          Score :{' '}
        </Text>
        <Text className="mt-4 text-xl font-bold text-center text-gray-600">
          {profile ? profile.points : 0}
        </Text>
      </View>

      {/* <View className="flex flex-row items-center justify-between mt-8">
        <Text className="text-lg font-bold text-gray-600">Stats</Text>
      </View> */}
    </SafeAreaView>
  );
}
