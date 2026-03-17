import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import {
  addPhoto,
  getJobById,
  updateJobPaidStatus,
  updateJobStatus,
} from "@/database/db";
import { JobWithDetails } from "@/types/job";
import { getJobSignature } from "@/services/signatureService";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Camera, Check, FileText } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { generateInvoiceForJob } from "@/services/invoiceService";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadJob();
      }
    }, [id]),
  );

  const loadJob = async () => {
    if (!id) return;
    const jobData = await getJobById(id);
    setJob(jobData);
    if (jobData) {
      const signature = await getJobSignature(jobData.id);
      setHasSignature(!!signature);
    } else {
      setHasSignature(false);
    }
  };

  const handleStartJob = async () => {
    if (!job) return;
    await updateJobStatus(job.id, "in_progress");
    loadJob();
  };

  const handleCompleteJob = async () => {
    if (!job) return;
    await updateJobStatus(job.id, "completed");
    loadJob();
  };

  const handleAddNote = () => {
    if (!job) return;
    router.push(`/job/${job.id}/add-note`);
  };

  const handleAddSignature = () => {
    if (!job) return;
    router.push(`/job/${job.id}/signature`);
  };

  const handleGenerateInvoice = async () => {
    if (!job) return;
    try {
      setGeneratingInvoice(true);
      const { fileUri, invoiceNumber } = await generateInvoiceForJob(job.id);
      // @ts-ignore expo-sharing is provided by Expo at runtime
      const Sharing = await import("expo-sharing");
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          "Invoice generated",
          `Invoice #${invoiceNumber} was created at:\n${fileUri}`,
        );
      }
    } catch (error) {
      console.error("Failed to generate invoice", error);
      Alert.alert(
        "Error",
        "Could not generate the invoice. Please try again.",
      );
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleTogglePaid = async (value: boolean) => {
    if (!job) return;
    try {
      await updateJobPaidStatus(job.id, value);
      await loadJob();
    } catch (error) {
      console.error("Failed to update paid status", error);
      Alert.alert(
        "Error",
        "Could not update paid status. Please try again.",
      );
    }
  };

  const handleAddPhoto = async () => {
    if (!job) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await addPhoto(job.id, result.assets[0].uri);
      loadJob();
    }
  };

  const handleTakePhoto = async () => {
    if (!job) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera access is required to take photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await addPhoto(job.id, result.assets[0].uri);
      loadJob();
    }
  };

  const handleGenerateSummary = () => {
    if (!job) return;

    const statusLabel = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
    }[job.status];

    let summary = `Job: ${job.title}\n`;
    summary += `Client: ${job.clientName}\n`;
    summary += `Status: ${statusLabel}\n\n`;

    if (job.notes.length > 0) {
      summary += `Notes:\n`;
      job.notes.forEach((note) => {
        summary += `• ${note.text}\n`;
      });
      summary += `\n`;
    }

    summary += `Photos attached: ${job.photos.length}`;

    Alert.alert("Job Summary", summary);
  };

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

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
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-800">
          Job Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1">
        <View className="mx-4 my-4 rounded-2xl bg-white p-4 shadow-md">
          <Text className="mb-3 text-2xl font-bold text-slate-800">
            {job.title}
          </Text>
          <View
            className={`mb-4 self-start rounded-xl px-3 py-1.5 ${statusBgClass}`}
          >
            <Text className="text-sm font-semibold text-white">
              {statusLabel}
            </Text>
          </View>

          {job.status === "completed" && (
            <Text className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-600">
              This job is completed
            </Text>
          )}

          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Client:</Text>
            <Text className="text-base text-slate-800">{job.clientName}</Text>
          </View>

          {job.address && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Address:</Text>
              <Text className="text-base text-slate-800">{job.address}</Text>
            </View>
          )}

          {job.description && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Description:</Text>
              <Text className="text-base text-slate-800">
                {job.description}
              </Text>
            </View>
          )}

          {job.price && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Price:</Text>
              <Text className="text-base text-slate-800">
                ${job.price.toFixed(2)}
              </Text>
            </View>
          )}

          <View className="mb-3 flex-row items-center justify-between">
            <View>
              <Text className="mb-1 text-xs text-gray-500">Paid:</Text>
              <Text className="text-base text-slate-800">
                {job.paid ? "Paid" : "Unpaid"}
              </Text>
            </View>
            <Switch value={!!job.paid} onValueChange={handleTogglePaid} />
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">
              Client Signature:
            </Text>
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

        <View className="px-4 py-4">
          <Text className="mb-3 text-lg font-semibold text-slate-800">
            Notes ({job.notes.length})
          </Text>
          {job.notes.map((note) => (
            <View key={note.id} className="mb-2 rounded-lg bg-white p-3">
              <Text className="mb-1 text-sm text-slate-800">{note.text}</Text>
              <Text className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleString()}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            className="mt-2 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
            onPress={handleAddNote}
          >
            <FileText size={20} color="#3b82f6" />
            <Text className="text-sm font-semibold text-blue-500">
              Add Note
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-4 py-4">
          <Text className="mb-3 text-lg font-semibold text-slate-800">
            Photos ({job.photos.length})
          </Text>
          <View className="mb-2 flex-row flex-wrap">
            {job.photos.map((photo) => (
              <PhotoThumbnail key={photo.id} photo={photo} />
            ))}
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
              onPress={handleTakePhoto}
            >
              <Camera size={20} color="#3b82f6" />
              <Text className="text-sm font-semibold text-blue-500">
                Take Photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
              onPress={handleAddPhoto}
            >
              <Camera size={20} color="#3b82f6" />
              <Text className="text-sm font-semibold text-blue-500">
                Choose Photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-3 px-4 pb-6 pt-2">
          {job.status === "pending" && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-4"
              onPress={handleStartJob}
            >
              <Text className="text-base font-semibold text-white">
                Start Job
              </Text>
            </TouchableOpacity>
          )}
          {job.status === "in_progress" && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-4"
              onPress={handleCompleteJob}
            >
              <Check size={20} color="#fff" />
              <Text className="text-base font-semibold text-white">
                Mark Completed
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
            onPress={handleAddSignature}
          >
            <Text className="text-base font-semibold text-blue-500">
              {hasSignature ? "View / Update Signature" : "Add Signature"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
            onPress={handleGenerateInvoice}
            disabled={generatingInvoice}
          >
            <Text className="text-base font-semibold text-blue-500">
              {generatingInvoice ? "Generating Invoice..." : "Generate Invoice"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
            onPress={handleGenerateSummary}
          >
            <Text className="text-base font-semibold text-gray-500">
              Generate Summary
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
