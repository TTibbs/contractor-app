import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-5">
      <Text className="mb-2 text-xl font-semibold text-gray-500">{title}</Text>
      <Text className="text-center text-sm text-gray-400">{body}</Text>
    </View>
  );
}

