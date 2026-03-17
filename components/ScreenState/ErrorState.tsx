import { Text, View } from "react-native";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-5">
      <Text className="mb-2 text-xl font-semibold text-red-500">{title}</Text>
      <Text className="mb-4 text-center text-sm text-gray-400">{message}</Text>
    </View>
  );
}

