import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-4">
      <Text className="mb-2 text-2xl font-semibold text-slate-800">
        Not Found
      </Text>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-blue-500 px-4 py-2 text-base font-semibold text-white"
      >
        Go to home
      </Link>
    </View>
  );
}
