import { FormButtonRow } from "@/components/forms/FormButtonRow";
import { FormField } from "@/components/forms/FormField";
import { createJob } from "@/database/db";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";

export function CreateJobForm() {
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
        <FormField
          label="Job Title *"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          placeholder="e.g., Boiler Repair"
          error={errors.title}
        />

        <FormField
          label="Client Name *"
          value={clientName}
          onChangeText={(text) => {
            setClientName(text);
            if (errors.clientName) {
              setErrors((prev) => ({ ...prev, clientName: undefined }));
            }
          }}
          placeholder="e.g., John Smith"
          error={errors.clientName}
        />

        <FormField
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Main St"
        />

        <FormField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Job details..."
          multiline
          numberOfLines={4}
          inputClassName="h-24"
        />

        <FormField
          label="Estimated Price"
          value={price}
          onChangeText={(text) => {
            setPrice(text);
            if (errors.price) {
              setErrors((prev) => ({ ...prev, price: undefined }));
            }
          }}
          placeholder="e.g., 250"
          keyboardType="decimal-pad"
          error={errors.price}
        />

        <FormButtonRow
          primaryLabel="Save Job"
          onPrimaryPress={handleSave}
          secondaryLabel="Cancel"
          onSecondaryPress={handleCancel}
        />
      </View>
    </ScrollView>
  );
}

