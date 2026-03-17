import { Note } from "@/types/job";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type EditNoteModalProps = {
  note: Note | null;
  text: string;
  saving: boolean;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function EditNoteModal({
  note,
  text,
  saving,
  onChangeText,
  onCancel,
  onSave,
}: EditNoteModalProps) {
  return (
    <Modal
      transparent
      visible={!!note}
      animationType="slide"
      onRequestClose={() => {
        if (!saving) {
          onCancel();
        }
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/30 px-6">
        <View className="w-full rounded-2xl bg-white p-5">
          <Text className="mb-2 text-base font-semibold text-slate-800">
            Edit note
          </Text>
          <Text className="mb-3 text-xs text-gray-500">
            Update the text for this job note.
          </Text>
          <TextInput
            className="h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
            value={text}
            onChangeText={onChangeText}
            placeholder="Note details..."
            multiline
            textAlignVertical="top"
          />
          <View className="mt-4 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
              onPress={onCancel}
              disabled={saving}
            >
              <Text className="text-sm font-semibold text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
              onPress={onSave}
              disabled={saving}
            >
              <Text className="text-sm font-semibold text-white">
                {saving ? "Saving..." : "Save note"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

