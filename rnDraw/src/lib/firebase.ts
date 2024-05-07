import firestore from '@react-native-firebase/firestore';

export const gameRoomsCollectionRef = firestore().collection('games_rooms');
export const userDetailsCollectionRef = firestore().collection('user_details');
