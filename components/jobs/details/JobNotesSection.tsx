import { Note } from "@/types/job";
import { Pencil, Trash2 } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

type JobNotesSectionProps = {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
};

export function JobNotesSection({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: JobNotesSectionProps) {
  return (
    <View className="px-4 py-4">
      <Text className="mb-3 text-lg font-semibold text-slate-800">
        Notes ({notes.length})
      </Text>
      {notes.map((note) => (
        <View key={note.id} className="mb-2 rounded-lg bg-white p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="mb-1 text-sm text-slate-800">{note.text}</Text>
              <Text className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleString()}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => onEditNote(note)}
              >
                <Pencil size={18} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => onDeleteNote(note.id)}
              >
                <Trash2 size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity
        className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
        onPress={onAddNote}
      >
        <Text className="text-sm font-semibold text-blue-500">Add Note</Text>
      </TouchableOpacity>
    </View>
  );
}

