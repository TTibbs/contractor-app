import { createJob } from "@/database/db";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateJobScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSave = async () => {
    if (!title.trim() || !clientName.trim()) {
      Alert.alert("Error", "Please fill in job title and client name");
      return;
    }

    try {
      await createJob({
        title: title.trim(),
        clientName: clientName.trim(),
        address: address.trim(),
        description: description.trim(),
        price: price ? parseFloat(price) : undefined,
        status: "pending",
      });

      setTitle("");
      setClientName("");
      setAddress("");
      setDescription("");
      setPrice("");

      router.push("/(tabs)");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to create job");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setClientName("");
    setAddress("");
    setDescription("");
    setPrice("");
    router.push("/(tabs)");
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="p-4">
        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Job Title *
          </Text>
          <TextInput
            className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-800"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Boiler Repair"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Client Name *
          </Text>
          <TextInput
            className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-800"
            value={clientName}
            onChangeText={setClientName}
            placeholder="e.g., John Smith"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Address
          </Text>
          <TextInput
            className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-800"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g., 123 Main St"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Description
          </Text>
          <TextInput
            className="h-24 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-800"
            value={description}
            onChangeText={setDescription}
            placeholder="Job details..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Estimated Price
          </Text>
          <TextInput
            className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-800"
            value={price}
            onChangeText={setPrice}
            placeholder="e.g., 250"
            keyboardType="decimal-pad"
          />
        </View>

        <View className="mt-6 flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 items-center rounded-lg border border-slate-300 bg-white py-4"
            onPress={handleCancel}
          >
            <Text className="text-base font-semibold text-gray-500">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center rounded-lg bg-blue-500 py-4"
            onPress={handleSave}
          >
            <Text className="text-base font-semibold text-white">Save Job</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
