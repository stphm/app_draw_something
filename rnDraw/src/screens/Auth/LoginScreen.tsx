import React from 'react';
import {
  Button,
  Text,
  TextInput,
  Image,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext, AuthContextType} from '../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

export default function () {
  const {login} = React.useContext(AuthContext) as AuthContextType;

  const [email, setEmail] = React.useState('test@gmail.com'); // TODO: Remove default values
  const [password, setPassword] = React.useState('password'); // TODO: Remove default values
  const [loading, setLoading] = React.useState(false);

  const navigation = useNavigation();

  const handleLogin = React.useCallback(async () => {
    setLoading(true);
    const error = await login(email, password);
    if (undefined !== error && 'code' in error) {
      switch (error.code) {
        case 'auth/invalid-email':
          ToastAndroid.show(
            'Cette adresse email est invalide',
            ToastAndroid.SHORT,
          );
          console.log('[LOGIN] Invalid email');
          break;
        case 'auth/user-disabled':
          ToastAndroid.show('Ce compte a été désactivé', ToastAndroid.SHORT);
          console.log('[LOGIN] User disabled');
          break;
        case 'auth/user-not-found':
          ToastAndroid.show("Ce compte n'existe pas", ToastAndroid.SHORT);
          console.log('[LOGIN] User not found');
          break;
        case 'auth/wrong-password':
          ToastAndroid.show(
            'Le mot de passe est incorrect',
            ToastAndroid.SHORT,
          );
          console.log('[LOGIN] Wrong password');
          break;
        default:
          ToastAndroid.show(error.message, ToastAndroid.SHORT);
          console.error(error);
          break;
      }
    } else if (undefined !== error) {
      ToastAndroid.show('Une erreur est survenue [G]', ToastAndroid.SHORT);
      console.error(error);
    }
    setLoading(false);
  }, [email, password, login]);

  return (
    <SafeAreaView className="justify-center flex-1">
      <View className="px-8 -mt-32">
        <Text className="text-2xl text-center text-gray-800">Connexion</Text>

        <TextInput
          placeholder="Adresse mail"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          defaultValue=""
          editable={!loading}
          className="px-4 py-2 mt-4 text-gray-800 border border-gray-300 rounded-md"
        />

        <TextInput
          placeholder="Mot de passe"
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={setPassword}
          defaultValue=""
          editable={!loading}
          className="px-4 py-2 mt-4 text-gray-800 border border-gray-300 rounded-md"
        />

        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          className="px-4 py-2 mt-4 bg-purple-400 rounded-md active:opacity-60">
          <Text className="text-center text-white">Valider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2"
          onPress={() => {
            navigation.navigate('Register');
          }}>
          <Text className="text-center text-gray-800 active:opacity-60">
            Je n'ai pas de compte
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
