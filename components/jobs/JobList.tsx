import { JobCard } from "@/components/JobCard";
import { EmptyState } from "@/components/ScreenState/EmptyState";
import { ErrorState } from "@/components/ScreenState/ErrorState";
import { LoadingState } from "@/components/ScreenState/LoadingState";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Job } from "@/types/job";
import { FlatList, View } from "react-native";

type ViewMode = "active" | "completed";

type JobListProps = {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onPressJob: (jobId: string) => void;
  onLongPressJob: (job: Job) => void;
};

export function JobList({
  jobs,
  loading,
  error,
  viewMode,
  onChangeViewMode,
  onPressJob,
  onLongPressJob,
}: JobListProps) {
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
        <SegmentedControl
          options={[
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ]}
          value={viewMode}
          onChange={(mode) => onChangeViewMode(mode as ViewMode)}
        />
      </View>
      {loading && jobs.length === 0 && (
        <LoadingState
          message={
            viewMode === "active"
              ? "Loading your active jobs..."
              : "Loading your completed jobs..."
          }
        />
      )}
      {!loading && error && jobs.length === 0 && <ErrorState message={error} />}
      {!loading && !error && jobs.length === 0 && (
        <EmptyState title={emptyMessage.title} body={emptyMessage.body} />
      )}
      {jobs.length > 0 && (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onPress={() => onPressJob(item.id)}
              onLongPress={() => onLongPressJob(item)}
            />
          )}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 8 }}
        />
      )}
    </View>
  );
}
