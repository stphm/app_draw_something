import firestore from '@react-native-firebase/firestore';

const collection = firestore().collection('users_details');

export async function createNewUser(userId: string, username: string) {
  await collection.doc(userId).set({
    username,
    points: 0,
  });

  console.log('[USER] created');
}

export async function getUserDetails(userId: string) {
  try {
    const document = await collection.doc(userId).get();
    return document.data();
  } catch (error) {
    console.log('getUserDetails', error);
    return null;
  }
}
