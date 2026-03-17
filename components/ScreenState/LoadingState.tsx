import { ActivityIndicator, Text, View } from "react-native";

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-5">
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-sm text-gray-400">{message}</Text>
    </View>
  );
}

