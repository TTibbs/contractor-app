import { FormButtonRow } from "@/components/forms/FormButtonRow";
import { FormField } from "@/components/forms/FormField";
import { createJob, searchClients, upsertClient } from "@/database/db";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export function CreateJobForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [clientSuggestions, setClientSuggestions] = useState<
    { id: string; name: string; address: string }[]
  >([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientInputFocused, setClientInputFocused] = useState(false);
  const suppressNextClientSearchRef = useRef(false);
  const latestClientSearchId = useRef(0);
  const blurHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const trimmedClientName = clientName.trim();
      const trimmedAddress = address.trim();

      // Per your requirement: only create/update client profiles when address is populated.
      if (trimmedAddress) {
        await upsertClient(trimmedClientName, trimmedAddress);
      }

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
      setClientSuggestions([]);
      setShowClientDropdown(false);

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
    setClientSuggestions([]);
    setShowClientDropdown(false);
    router.push("/(tabs)");
  };

  useEffect(() => {
    if (!clientInputFocused) return;

    const trimmed = clientName.trim();

    // Skip one search right after selecting a suggestion (prevents dropdown flicker).
    if (suppressNextClientSearchRef.current) {
      suppressNextClientSearchRef.current = false;
      return;
    }

    if (!trimmed) {
      setClientSuggestions([]);
      setShowClientDropdown(false);
      return;
    }

    const searchId = ++latestClientSearchId.current;
    // Hide dropdown while searching; only show it if we get matches.
    setClientSuggestions([]);
    setShowClientDropdown(false);

    const timeout = setTimeout(async () => {
      try {
        const results = await searchClients(trimmed, 8);
        if (latestClientSearchId.current !== searchId) return;
        if (results.length === 0) {
          setClientSuggestions([]);
          setShowClientDropdown(false);
        } else {
          setClientSuggestions(results);
          setShowClientDropdown(true);
        }
      } catch {
        if (latestClientSearchId.current !== searchId) return;
        setClientSuggestions([]);
        setShowClientDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [clientName, clientInputFocused]);

  useEffect(() => {
    // Cleanup any pending blur timeout.
    return () => {
      if (blurHideTimeout.current) clearTimeout(blurHideTimeout.current);
    };
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
    >
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
              suppressNextClientSearchRef.current = false;
              setClientName(text);
              if (errors.clientName) {
                setErrors((prev) => ({ ...prev, clientName: undefined }));
              }
            }}
            placeholder="e.g., John Smith"
            onFocus={() => {
              setClientInputFocused(true);
              if (blurHideTimeout.current) {
                clearTimeout(blurHideTimeout.current);
                blurHideTimeout.current = null;
              }
            }}
            onBlur={() => {
              blurHideTimeout.current = setTimeout(() => {
                setClientInputFocused(false);
                setShowClientDropdown(false);
              }, 150);
            }}
          />

          {errors.clientName && (
            <Text className="mt-1 text-xs text-red-500" numberOfLines={2}>
              {errors.clientName}
            </Text>
          )}

          {showClientDropdown && (
            <View className="mt-1 overflow-hidden rounded-lg border border-slate-300 bg-white">
              <ScrollView
                style={{ maxHeight: 220 }}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
              >
                {clientSuggestions.map((item) => (
                  <Pressable
                    key={item.id}
                    onPressIn={() => {
                      suppressNextClientSearchRef.current = true;
                      if (blurHideTimeout.current) {
                        clearTimeout(blurHideTimeout.current);
                        blurHideTimeout.current = null;
                      }

                      setClientName(item.name);
                      setAddress(item.address);
                      setClientSuggestions([]);
                      setShowClientDropdown(false);
                    }}
                    className="px-3 py-3"
                  >
                    <Text className="text-base font-semibold text-slate-800">
                      {item.name}
                    </Text>
                    <Text
                      className="mt-1 text-xs text-slate-500"
                      numberOfLines={1}
                    >
                      {item.address}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

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
