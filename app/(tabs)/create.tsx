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
  const [errors, setErrors] = useState<{
    title?: string;
    clientName?: string;
    price?: string;
  }>({});

  const validate = () => {
    const nextErrors: {
      title?: string;
      clientName?: string;
      price?: string;
    } = {};

    const trimmedTitle = title.trim();
    const trimmedClientName = clientName.trim();
    const trimmedPrice = price.trim();

    if (!trimmedTitle) {
      nextErrors.title = "Job title is required.";
    } else if (trimmedTitle.length < 3) {
      nextErrors.title = "Job title should be at least 3 characters.";
    }

    if (!trimmedClientName) {
      nextErrors.clientName = "Client name is required.";
    } else if (trimmedClientName.length < 2) {
      nextErrors.clientName = "Client name should be at least 2 characters.";
    }

    if (trimmedPrice) {
      const numeric = Number(trimmedPrice.replace(/,/g, ""));
      if (Number.isNaN(numeric) || numeric < 0) {
        nextErrors.price = "Enter a valid, non‑negative number.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert(
        "Check job details",
        "Please fix the highlighted fields before saving.",
      );
      return;
    }

    try {
      await createJob({
        title: title.trim(),
        clientName: clientName.trim(),
        address: address.trim(),
        description: description.trim(),
        price: price ? parseFloat(price.replace(/,/g, "")) : undefined,
        status: "pending",
      });

      setTitle("");
      setClientName("");
      setAddress("");
      setDescription("");
      setPrice("");
      setErrors({});

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
            className={`rounded-lg border bg-white px-3 py-3 text-base text-slate-800 ${
              errors.title ? "border-red-400" : "border-slate-300"
            }`}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="e.g., Boiler Repair"
          />
          {errors.title && (
            <Text className="mt-1 text-xs text-red-500">{errors.title}</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-700">
            Client Name *
          </Text>
          <TextInput
            className={`rounded-lg border bg-white px-3 py-3 text-base text-slate-800 ${
              errors.clientName ? "border-red-400" : "border-slate-300"
            }`}
            value={clientName}
            onChangeText={(text) => {
              setClientName(text);
              if (errors.clientName) {
                setErrors((prev) => ({ ...prev, clientName: undefined }));
              }
            }}
            placeholder="e.g., John Smith"
          />
          {errors.clientName && (
            <Text className="mt-1 text-xs text-red-500">
              {errors.clientName}
            </Text>
          )}
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
            className={`rounded-lg border bg-white px-3 py-3 text-base text-slate-800 ${
              errors.price ? "border-red-400" : "border-slate-300"
            }`}
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              if (errors.price) {
                setErrors((prev) => ({ ...prev, price: undefined }));
              }
            }}
            placeholder="e.g., 250"
            keyboardType="decimal-pad"
          />
          {errors.price && (
            <Text className="mt-1 text-xs text-red-500">{errors.price}</Text>
          )}
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
