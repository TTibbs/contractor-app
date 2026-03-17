import { Job } from "@/types/job";
import { Text, TouchableOpacity, View } from "react-native";

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export function JobCard({ job, onPress }: JobCardProps) {
  const statusBgClass =
    job.status === "pending"
      ? "bg-amber-500"
      : job.status === "in_progress"
        ? "bg-blue-500"
        : "bg-emerald-600";

  const statusLabel = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  }[job.status];

  return (
    <TouchableOpacity
      className="mx-4 my-4 rounded-2xl bg-white p-4 shadow-md"
      onPress={onPress}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-lg font-semibold text-slate-800">
          {job.title}
        </Text>
        <View className={`ml-2 rounded-xl px-3 py-1 ${statusBgClass}`}>
          <Text className="text-xs font-semibold text-white">
            {statusLabel}
          </Text>
        </View>
      </View>
      <Text className="mb-1 text-sm text-gray-500">{job.clientName}</Text>
      <Text className="text-xs text-gray-400">
        {new Date(job.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}
