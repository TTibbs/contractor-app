import { JobHeader } from "@/components/jobs/details/JobHeader";
import { FormButtonRow } from "@/components/forms/FormButtonRow";
import { addNote } from "@/database/db";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

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
      <JobHeader title="Add Note" onBack={() => router.back()} />

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

        <View className="mt-4">
          <FormButtonRow
            primaryLabel="Save Note"
            onPrimaryPress={handleSave}
            secondaryLabel="Cancel"
            onSecondaryPress={() => router.back()}
          />
        </View>
      </View>
    </View>
  );
}
