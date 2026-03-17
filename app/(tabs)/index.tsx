import { JobCard } from "@/components/JobCard";
import { deleteJob, getActiveJobs, getCompletedJobs } from "@/database/db";
import { Job } from "@/types/job";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobListScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "completed">("active");
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadJobs(viewMode);
    }, [viewMode]),
  );

  const loadJobs = async (mode: "active" | "completed") => {
    try {
      setLoading(true);
      setError(null);
      const data =
        mode === "active" ? await getActiveJobs() : await getCompletedJobs();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/job/${jobId}`);
  };

  const handleJobLongPress = (job: Job) => {
    // Use a native-style confirm dialog before deleting
    // to avoid accidental long-press removals.
    // We keep the copy short and clear.
    const { Alert } = require("react-native") as typeof import("react-native");

    Alert.alert(
      "Delete job?",
      "This will remove the job and its notes and photos. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJob(job.id);
              await loadJobs(viewMode);
            } catch (err) {
              console.error("Failed to delete job", err);
              Alert.alert(
                "Error",
                "Could not delete this job. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleSwitchMode = (mode: "active" | "completed") => {
    if (mode === viewMode) return;
    setViewMode(mode);
  };

  const emptyMessage =
    viewMode === "active"
      ? {
          title: "No jobs yet",
          body: 'Tap "New Job" to create your first job',
        }
      : {
          title: "No completed jobs",
          body: "Completed jobs will appear here once you finish them.",
        };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-4">
        <View className="mb-3 flex-row rounded-full bg-slate-200 p-1">
          <TouchableOpacity
            className={`flex-1 items-center rounded-full px-3 py-2 ${
              viewMode === "active" ? "bg-blue-500" : "bg-transparent"
            }`}
            onPress={() => handleSwitchMode("active")}
          >
            <Text
              className={`text-sm font-semibold ${
                viewMode === "active" ? "text-white" : "text-slate-600"
              }`}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 items-center rounded-full px-3 py-2 ${
              viewMode === "completed" ? "bg-blue-500" : "bg-transparent"
            }`}
            onPress={() => handleSwitchMode("completed")}
          >
            <Text
              className={`text-sm font-semibold ${
                viewMode === "completed" ? "text-white" : "text-slate-600"
              }`}
            >
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && jobs.length === 0 && (
        <View className="flex-1 items-center justify-center px-5">
          <ActivityIndicator size="large" />
          <Text className="mt-4 text-sm text-gray-400">
            {viewMode === "active"
              ? "Loading your active jobs..."
              : "Loading your completed jobs..."}
          </Text>
        </View>
      )}
      {!loading && error && jobs.length === 0 && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="mb-2 text-xl font-semibold text-red-500">
            Something went wrong
          </Text>
          <Text className="mb-4 text-center text-sm text-gray-400">
            {error}
          </Text>
        </View>
      )}
      {!loading && !error && jobs.length === 0 && (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="mb-2 text-xl font-semibold text-gray-500">
            {emptyMessage.title}
          </Text>
          <Text className="text-center text-sm text-gray-400">
            {emptyMessage.body}
          </Text>
        </View>
      )}
      {jobs.length > 0 && (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => handleJobPress(item.id)}
              onLongPress={() => handleJobLongPress(item)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </View>
  );
}
