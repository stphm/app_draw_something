import React from 'react';
import {
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext, AuthContextType} from '../../context/AuthContext';
import {useNavigation} from '@react-navigation/native';

export default function () {
  const {register} = React.useContext(AuthContext) as AuthContextType;

  const [pseudo, setPseudo] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const navigation = useNavigation();

  const handleRegistration = React.useCallback(async () => {
    setLoading(true);
    const error = await register(pseudo, email, password);
    if (undefined !== error && 'code' in error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          ToastAndroid.show(
            'Cette adresse email est déjà utilisée',
            ToastAndroid.SHORT,
          );
          console.log('[REGISTER] Email already in use');
          break;
        case 'auth/invalid-email':
          ToastAndroid.show(
            'Cette adresse email est invalide',
            ToastAndroid.SHORT,
          );
          console.log('[REGISTER] Invalid email');
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
  }, [pseudo, email, password, register]);

  console.log({email});

  return (
    <SafeAreaView className="justify-center flex-1">
      <View className="px-8 -mt-32">
        <Text className="text-2xl text-center text-gray-800">Inscription</Text>
        <TextInput
          placeholder="Pseudo"
          autoCapitalize="none"
          keyboardType="default"
          onChangeText={setPseudo}
          defaultValue=""
          editable={!loading}
          className="px-4 py-2 mt-4 text-gray-800 border border-gray-300 rounded-md"
        />

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
          onPress={handleRegistration}
          className="px-4 py-2 mt-4 bg-purple-400 rounded-md active:opacity-60">
          <Text className="text-center text-white">Valider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-2"
          onPress={() => {
            navigation.goBack();
          }}>
          <Text className="text-center text-gray-800 active:opacity-60">
            J'ai déjà un compte
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
