import { Text, TouchableOpacity, View } from "react-native";

type FormButtonRowProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  secondaryLabel: string;
  onSecondaryPress: () => void;
};

export function FormButtonRow({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  secondaryLabel,
  onSecondaryPress,
}: FormButtonRowProps) {
  return (
    <View className="mt-6 flex-row space-x-3">
      <TouchableOpacity
        className="flex-1 items-center rounded-lg border border-slate-300 bg-white py-4"
        onPress={onSecondaryPress}
      >
        <Text className="text-base font-semibold text-gray-500">
          {secondaryLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 items-center rounded-lg bg-blue-500 py-4 ${
          primaryDisabled ? "opacity-60" : ""
        }`}
        onPress={onPrimaryPress}
        disabled={primaryDisabled}
      >
        <Text className="text-base font-semibold text-white">
          {primaryLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

