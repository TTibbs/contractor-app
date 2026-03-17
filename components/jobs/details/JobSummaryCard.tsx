import { JobWithDetails } from "@/types/job";
import { Text, TextInput, View } from "react-native";

type JobSummaryCardProps = {
  job: JobWithDetails;
  isEditing: boolean;
  editTitle: string;
  editClientName: string;
  editAddress: string;
  editDescription: string;
  editPrice: string;
  onChangeTitle: (value: string) => void;
  onChangeClientName: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangePrice: (value: string) => void;
  jobExpensesTotal: number;
  hasSignature: boolean;
  onTogglePaid: (value: boolean) => void;
};

export function JobSummaryCard({
  job,
  isEditing,
  editTitle,
  editClientName,
  editAddress,
  editDescription,
  editPrice,
  onChangeTitle,
  onChangeClientName,
  onChangeAddress,
  onChangeDescription,
  onChangePrice,
  jobExpensesTotal,
  hasSignature,
  onTogglePaid,
}: JobSummaryCardProps) {
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
    <View className="mx-4 my-4 rounded-2xl bg-white p-4 shadow-md">
      {isEditing ? (
        <>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Editing job
          </Text>
          <Text className="mb-1 text-xs text-gray-500">Job Title</Text>
          <TextInput
            className="mb-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
            value={editTitle}
            onChangeText={onChangeTitle}
            placeholder="Job title"
          />
          <Text className="mb-1 text-xs text-gray-500">Client</Text>
          <TextInput
            className="mb-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
            value={editClientName}
            onChangeText={onChangeClientName}
            placeholder="Client name"
          />
        </>
      ) : (
        <>
          <Text className="mb-3 text-2xl font-bold text-slate-800">
            {job.title}
          </Text>
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Client:</Text>
            <Text className="text-base text-slate-800">{job.clientName}</Text>
          </View>
        </>
      )}

      <View
        className={`mb-4 self-start rounded-xl px-3 py-1.5 ${statusBgClass}`}
      >
        <Text className="text-sm font-semibold text-white">{statusLabel}</Text>
      </View>

      {job.status === "completed" && (
        <Text className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-600">
          This job is completed
        </Text>
      )}

      {!isEditing && job.address && (
        <View className="mb-3">
          <Text className="mb-1 text-xs text-gray-500">Address:</Text>
          <Text className="text-base text-slate-800">{job.address}</Text>
        </View>
      )}

      {!isEditing && job.description && (
        <View className="mb-3">
          <Text className="mb-1 text-xs text-gray-500">Description:</Text>
          <Text className="text-base text-slate-800">{job.description}</Text>
        </View>
      )}

      {!isEditing && job.price != null && (
        <View className="mb-3">
          <Text className="mb-1 text-xs text-gray-500">Price:</Text>
          <Text className="text-base text-slate-800">
            £{job.price.toFixed(2)}
          </Text>
          {jobExpensesTotal > 0 && (
            <>
              <Text className="mt-2 text-xs text-gray-500">
                Expenses added for this job:
              </Text>
              <Text className="text-base text-slate-800">
                £{jobExpensesTotal.toFixed(2)}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                Total including expenses:
              </Text>
              <Text className="text-base font-semibold text-slate-800">
                £{(job.price + jobExpensesTotal).toFixed(2)}
              </Text>
            </>
          )}
        </View>
      )}

      {isEditing && (
        <>
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Address</Text>
            <TextInput
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
              value={editAddress}
              onChangeText={onChangeAddress}
              placeholder="Job address"
            />
          </View>
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Description</Text>
            <TextInput
              className="h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
              value={editDescription}
              onChangeText={onChangeDescription}
              placeholder="Job details..."
              multiline
              textAlignVertical="top"
            />
          </View>
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Price</Text>
            <TextInput
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
              value={editPrice}
              onChangeText={onChangePrice}
              placeholder="e.g., 250"
              keyboardType="decimal-pad"
            />
          </View>
        </>
      )}

      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="mb-1 text-xs text-gray-500">Paid:</Text>
          <Text className="text-base text-slate-800">
            {job.paid ? "Paid" : "Unpaid"}
          </Text>
        </View>
        {/* Switch passed from parent to preserve logic & styling */}
      </View>

      <View className="mb-3">
        <Text className="mb-1 text-xs text-gray-500">Client Signature:</Text>
        <Text className="text-base text-slate-800">
          {hasSignature ? "On file" : "Not added"}
        </Text>
      </View>

      <View className="mb-3">
        <Text className="mb-1 text-xs text-gray-500">Created:</Text>
        <Text className="text-base text-slate-800">
          {new Date(job.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

