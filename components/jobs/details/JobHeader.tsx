import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type JobHeaderProps = {
  title?: string;
  onBack: () => void;
  backDisabled?: boolean;
};

export function JobHeader({
  title = "Job Details",
  onBack,
  backDisabled,
}: JobHeaderProps) {
  return (
    <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-14">
      <TouchableOpacity onPress={onBack} disabled={backDisabled}>
        <ArrowLeft size={24} color="#1f2937" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-slate-800">{title}</Text>
      <View className="w-6" />
    </View>
  );
}

