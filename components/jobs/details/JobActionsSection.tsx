import { Check } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type JobActionsSectionProps = {
  status: "pending" | "in_progress" | "completed";
  isEditing: boolean;
  loading: boolean;
  hasSignature: boolean;
  generatingInvoice: boolean;
  onStartJob: () => void;
  onCompleteJob: () => void;
  onBeginEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onAddSignature: () => void;
  onGenerateInvoice: () => void;
  onGenerateSummary: () => void;
};

export function JobActionsSection({
  status,
  isEditing,
  loading,
  hasSignature,
  generatingInvoice,
  onStartJob,
  onCompleteJob,
  onBeginEdit,
  onCancelEdit,
  onSaveEdit,
  onAddSignature,
  onGenerateInvoice,
  onGenerateSummary,
}: JobActionsSectionProps) {
  return (
    <View className="gap-3 px-4 pb-6 pt-2">
      {status === "pending" && !isEditing && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-4"
          onPress={onStartJob}
        >
          <Text className="text-base font-semibold text-white">Start Job</Text>
        </TouchableOpacity>
      )}
      {status === "in_progress" && !isEditing && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-4"
          onPress={onCompleteJob}
        >
          <Check size={20} color="#fff" />
          <Text className="text-base font-semibold text-white">
            Mark Completed
          </Text>
        </TouchableOpacity>
      )}
      {!isEditing && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
          onPress={onBeginEdit}
        >
          <Text className="text-base font-semibold text-blue-500">
            Edit Job
          </Text>
        </TouchableOpacity>
      )}
      {isEditing && (
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-4"
            onPress={onCancelEdit}
            disabled={loading}
          >
            <Text className="text-base font-semibold text-gray-600">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-4"
            onPress={onSaveEdit}
            disabled={loading}
          >
            <Text className="text-base font-semibold text-white">
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
        onPress={onAddSignature}
      >
        <Text className="text-base font-semibold text-blue-500">
          {hasSignature ? "View / Update Signature" : "Add Signature"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
        onPress={onGenerateInvoice}
        disabled={generatingInvoice}
      >
        <Text className="text-base font-semibold text-blue-500">
          {generatingInvoice ? "Generating Invoice..." : "Generate Invoice"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
        onPress={onGenerateSummary}
      >
        <Text className="text-base font-semibold text-gray-500">
          Generate Summary
        </Text>
      </TouchableOpacity>
    </View>
  );
}

