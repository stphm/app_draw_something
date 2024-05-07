import firestore from '@react-native-firebase/firestore';

const collection = firestore().collection('users_details');

type LeaderBoardEntry = {
  username: string;
  points: number | undefined;
};

export async function getLeaderboard() {
  try {
    const snapshot = await collection.orderBy('points', 'desc').get();
    const leaderboard: LeaderBoardEntry[] = [];
    snapshot.forEach(doc => {
      leaderboard.push(doc.data() as LeaderBoardEntry);
    });
    return leaderboard;
  } catch (error) {
    console.log('getLeaderboard', error);
    return [];
  }
}
