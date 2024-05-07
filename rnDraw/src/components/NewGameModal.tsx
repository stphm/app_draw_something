import React from 'react';
import {Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {Button} from 'react-native-paper';
import Slider from 'react-native-a11y-slider';

export type onConfirmPayload = {
  minPlayers: number;
  maxPlayers: number;
  rounds: number;
  roundDuration: number;
};
interface INewGameModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (payload: onConfirmPayload) => void;
}

export default function (props: INewGameModalProps) {
  const [minPlayers, setMinPlayers] = React.useState(2);
  const [maxPlayers, setMaxPlayers] = React.useState(10);
  const [rounds, setRounds] = React.useState(3);
  const [roundDuration, setRoundDuration] = React.useState(15);

  return (
    <Modal
      isVisible={props.visible}
      useNativeDriverForBackdrop={true}
      onBackdropPress={props.onDismiss}
      onBackButtonPress={props.onDismiss}>
      <View className="relative p-4 bg-white rounded-lg">
        <Text className="text-2xl font-semibold text-gray-600">
          Ajouter une salle
        </Text>
        <Text className="mt-4 text-gray-400">Nombre de joueurs (min):</Text>
        <Slider min={2} max={5} values={[]} onChange={setMinPlayers} />
        <Text className="mt-2 text-gray-400">Nombre de joueurs (min):</Text>
        <Slider min={2} max={12} values={[]} onChange={setMaxPlayers} />
        <Text className="mt-2 text-gray-400">Nombre de tours:</Text>
        <Slider min={2} max={10} values={[]} onChange={setRounds} />
        <Text className="mt-2 text-gray-400">
          Durée d'un tour (en secondes):
        </Text>
        <Slider min={15} max={90} values={[]} onChange={setRoundDuration} />

        <View className="flex-row items-center justify-end gap-2 mt-4">
          <Button onPress={props.onDismiss}>Annuler</Button>
          <Button
            onPress={() => {
              props.onConfirm({
                minPlayers,
                maxPlayers,
                rounds,
                roundDuration,
              });
            }}>
            Valider
          </Button>
        </View>

        {/* <TextInput label="Email" value={'text'} onChangeText={text => ''} /> */}
      </View>
    </Modal>
  );
}
