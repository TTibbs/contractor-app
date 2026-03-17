import { Text, TouchableOpacity, View } from "react-native";

type SegmentedOption = {
  key: string;
  label: string;
};

type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
};

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <View className="mb-3 flex-row rounded-full bg-slate-200 p-1">
      {options.map((option) => {
        const isActive = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            className={`flex-1 items-center rounded-full px-3 py-2 ${
              isActive ? "bg-blue-500" : "bg-transparent"
            }`}
            onPress={() => {
              if (!isActive) {
                onChange(option.key);
              }
            }}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-white" : "text-slate-600"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

