import { addNote } from "@/database/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const trimmed = noteText.trim();

    if (!trimmed) {
      setError("Please enter a note.");
      Alert.alert("Missing note", "Add a few words so this note is useful.");
      return;
    }

    if (trimmed.length < 3) {
      setError("Note is too short to be useful.");
      Alert.alert(
        "Note too short",
        "Please add a bit more detail so you remember what this was about.",
      );
      return;
    }

    if (!id) return;

    try {
      await addNote(id, trimmed);
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save note");
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-800">Add Note</Text>
        <View className="w-6" />
      </View>

      <View className="flex-1 p-4">
        <TextInput
          className={`h-52 rounded-lg border bg-white px-3 py-3 text-base text-slate-800 ${
            error ? "border-red-400" : "border-slate-300"
          }`}
          value={noteText}
          onChangeText={(text) => {
            setNoteText(text);
            if (error) {
              setError(null);
            }
          }}
          placeholder="Enter your note..."
          multiline
          autoFocus
          textAlignVertical="top"
        />
        {error && (
          <Text className="mt-1 text-xs text-red-500">{error}</Text>
        )}

        <View className="mt-4 flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 items-center rounded-lg border border-slate-300 bg-white py-4"
            onPress={() => router.back()}
          >
            <Text className="text-base font-semibold text-gray-500">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center rounded-lg bg-blue-500 py-4"
            onPress={handleSave}
          >
            <Text className="text-base font-semibold text-white">
              Save Note
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
