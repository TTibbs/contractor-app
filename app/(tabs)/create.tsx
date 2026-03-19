import { CreateJobForm } from "@/components/jobs/CreateJobForm";
import { View } from "react-native";

export default function CreateJobScreen() {
  return (
    <View className="flex-1 bg-slate-50 mt-12">
      <CreateJobForm />
    </View>
  );
}
