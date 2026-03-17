import { JobList } from "@/components/jobs/JobList";
import { deleteJob, getActiveJobs, getCompletedJobs } from "@/database/db";
import { Job } from "@/types/job";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

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

  return (
    <View className="flex-1 bg-slate-50">
      <JobList
        jobs={jobs}
        loading={loading}
        error={error}
        viewMode={viewMode}
        onChangeViewMode={handleSwitchMode}
        onPressJob={handleJobPress}
        onLongPressJob={handleJobLongPress}
      />
    </View>
  );
}
