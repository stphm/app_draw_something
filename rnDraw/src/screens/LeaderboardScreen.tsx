import React from 'react';
import {Text, ScrollView, View, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getLeaderboard} from '../services/LeaderboardService';

export default function () {
  const [leaderboardEntries, setLeaderboardEntries] = React.useState<any[]>([]);

  React.useLayoutEffect(() => {
    console.log('LeaderboardScreen');
    (async () => {
      const entries = await getLeaderboard();
      setLeaderboardEntries(entries);
    })();

    return () => {
      console.log('LeaderboardScreen unmount');
    };
  }, []);

  return (
    <SafeAreaView className="px-4 py-6">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-800">Leaderboard</Text>
      </View>
      <ScrollView className="mt-6">
        {leaderboardEntries.map(
          (entry: {username: string; points: number | undefined}) => {
            return <LeaderboardEntry key={entry.username} entry={entry} />;
          },
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ILeaderboardEntryProps {
  entry: {username: string; points: number | undefined};
}

function LeaderboardEntry({entry}: ILeaderboardEntryProps) {
  return (
    <View className="flex-row items-center gap-4 mb-4">
      <Image
        source={require('../assets/person_placeholder.jpg')}
        className="w-12 h-12 rounded-full"
      />
      <View className="">
        <Text className="font-bold text-gray-800">{entry.username}</Text>
        <Text className="text-gray-400 ">Points: {entry.points || 0}</Text>
      </View>
    </View>
  );
}
