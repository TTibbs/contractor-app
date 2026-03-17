import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import {
  addExpense,
  addPhoto,
  deleteNote,
  getExpensesForJob,
  getJobById,
  getTotalExpensesForJob,
  updateJob,
  updateJobPaidStatus,
  updateJobStatus,
  updateNote,
} from "@/database/db";
import { generateInvoiceForJob } from "@/services/invoiceService";
import { getJobSignature } from "@/services/signatureService";
import { Expense, JobWithDetails, Note } from "@/types/job";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  Check,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [jobExpensesTotal, setJobExpensesTotal] = useState(0);
  const [jobExpenses, setJobExpenses] = useState<Expense[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadJob();
      }
    }, [id]),
  );

  const loadJob = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const jobData = await getJobById(id);
      setJob(jobData);
      if (jobData) {
        const [signature, expensesTotal, expenses] = await Promise.all([
          getJobSignature(jobData.id),
          getTotalExpensesForJob(jobData.id),
          getExpensesForJob(jobData.id),
        ]);
        setHasSignature(!!signature);
        setJobExpensesTotal(expensesTotal);
        setJobExpenses(expenses);
      } else {
        setHasSignature(false);
        setError("We couldn't find this job. It may have been deleted.");
      }
    } catch (e) {
      console.error("Failed to load job", e);
      setError("Failed to load this job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async () => {
    if (!job) return;
    try {
      setLoading(true);
      await updateJobStatus(job.id, "in_progress");
      await loadJob();
    } catch (e) {
      console.error("Failed to start job", e);
      Alert.alert("Error", "Could not update job status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!job) return;
    try {
      setLoading(true);
      await updateJobStatus(job.id, "completed");
      await loadJob();
    } catch (e) {
      console.error("Failed to complete job", e);
      Alert.alert("Error", "Could not update job status. Please try again.");
    } finally {
      setLoading(false);
    }
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
      Alert.alert("Error", "Could not generate the invoice. Please try again.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleTogglePaid = async (value: boolean) => {
    if (!job) return;
    try {
      setLoading(true);
      await updateJobPaidStatus(job.id, value);
      await loadJob();
    } catch (error) {
      console.error("Failed to update paid status", error);
      Alert.alert("Error", "Could not update paid status. Please try again.");
    } finally {
      setLoading(false);
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
      try {
        setLoading(true);
        await addPhoto(job.id, result.assets[0].uri);
        await loadJob();
      } catch (e) {
        console.error("Failed to add photo", e);
        Alert.alert(
          "Error",
          "Could not add the photo to this job. Please try again.",
        );
      } finally {
        setLoading(false);
      }
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
      try {
        setLoading(true);
        await addPhoto(job.id, result.assets[0].uri);
        await loadJob();
      } catch (e) {
        console.error("Failed to add photo from camera", e);
        Alert.alert(
          "Error",
          "Could not save the photo from your camera. Please try again.",
        );
      } finally {
        setLoading(false);
      }
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

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      "Delete note?",
      "This will permanently remove this note from the job.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNote(noteId);
              await loadJob();
            } catch (e) {
              console.error("Failed to delete note", e);
              Alert.alert(
                "Error",
                "Could not delete this note. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const beginEditNote = (note: Note) => {
    setEditingNote(note);
    setEditingNoteText(note.text);
  };

  const handleSaveEditedNote = async () => {
    if (!editingNote) return;

    const trimmed = editingNoteText.trim();
    if (!trimmed) {
      Alert.alert("Missing text", "Please enter some text for the note.");
      return;
    }

    try {
      setSavingNote(true);
      await updateNote({
        ...editingNote,
        text: trimmed,
      });
      await loadJob();
      setEditingNote(null);
      setEditingNoteText("");
    } catch (e) {
      console.error("Failed to update note", e);
      Alert.alert("Error", "Could not update this note. Please try again.");
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!job) return;

    const trimmedAmount = expenseAmount.trim();
    if (!trimmedAmount) {
      setExpenseError("Amount is required.");
      return;
    }

    const numeric = Number(trimmedAmount.replace(/,/g, ""));
    if (Number.isNaN(numeric) || numeric < 0) {
      setExpenseError("Enter a valid, non-negative number.");
      return;
    }

    try {
      setLoading(true);
      setExpenseError(null);

      await addExpense({
        amount: numeric,
        jobId: job.id,
        category: "Job",
        note: expenseNote.trim()
          ? `${job.title} – ${expenseNote.trim()}`
          : job.title,
      });

      setExpenseAmount("");
      setExpenseNote("");
      setShowExpenseForm(false);

      const [updatedTotal, updatedExpenses] = await Promise.all([
        getTotalExpensesForJob(job.id),
        getExpensesForJob(job.id),
      ]);
      setJobExpensesTotal(updatedTotal);
      setJobExpenses(updatedExpenses);

      Alert.alert(
        "Expense recorded",
        "This expense has been added to your totals.",
      );
    } catch (e) {
      console.error("Failed to record expense", e);
      setExpenseError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const beginEdit = () => {
    if (!job) return;
    setEditTitle(job.title);
    setEditClientName(job.clientName);
    setEditAddress(job.address);
    setEditDescription(job.description ?? "");
    setEditPrice(job.price != null ? String(job.price) : "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!job) return;

    const trimmedTitle = editTitle.trim();
    const trimmedClientName = editClientName.trim();

    if (!trimmedTitle || !trimmedClientName) {
      Alert.alert(
        "Missing details",
        "Please fill in both job title and client name.",
      );
      return;
    }

    let numericPrice: number | undefined;
    const trimmedPrice = editPrice.trim();
    if (trimmedPrice) {
      const parsed = Number(trimmedPrice.replace(/,/g, ""));
      if (Number.isNaN(parsed) || parsed < 0) {
        Alert.alert(
          "Invalid price",
          "Please enter a valid, non‑negative number for the price.",
        );
        return;
      }
      numericPrice = parsed;
    }

    try {
      setLoading(true);
      await updateJob({
        ...job,
        title: trimmedTitle,
        clientName: trimmedClientName,
        address: editAddress.trim(),
        description: editDescription.trim(),
        price: numericPrice,
      });
      await loadJob();
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update job", e);
      Alert.alert("Error", "Could not update the job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!job && loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-sm text-gray-400">
          Loading job details...
        </Text>
      </View>
    );
  }

  if (!job && error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="mb-2 text-xl font-semibold text-red-500">
          Something went wrong
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-400">{error}</Text>
        <TouchableOpacity
          className="mt-2 rounded-lg bg-blue-500 px-5 py-3"
          onPress={loadJob}
        >
          <Text className="text-sm font-semibold text-white">Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3" onPress={() => router.back()}>
          <Text className="text-sm font-semibold text-blue-500">
            Go back to jobs
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!job) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="mb-2 text-xl font-semibold text-slate-800">
          Job not found
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-400">
          We couldn't load this job. It may have been removed.
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-500 px-5 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-sm font-semibold text-white">Back to jobs</Text>
        </TouchableOpacity>
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
          {isEditing ? (
            <>
              <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Editing job
              </Text>
              <Text className="mb-1 text-xs text-gray-500">Job Title</Text>
              <TextInput
                className="mb-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Job title"
              />
              <Text className="mb-1 text-xs text-gray-500">Client</Text>
              <TextInput
                className="mb-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                value={editClientName}
                onChangeText={setEditClientName}
                placeholder="Client name"
              />
            </>
          ) : (
            <>
              <Text className="mb-3 text-2xl font-bold text-slate-800">
                {job.title}
              </Text>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Client:</Text>
                <Text className="text-base text-slate-800">
                  {job.clientName}
                </Text>
              </View>
            </>
          )}
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

          {!isEditing && job.address && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Address:</Text>
              <Text className="text-base text-slate-800">{job.address}</Text>
            </View>
          )}

          {!isEditing && job.description && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Description:</Text>
              <Text className="text-base text-slate-800">
                {job.description}
              </Text>
            </View>
          )}

          {!isEditing && job.price != null && (
            <View className="mb-3">
              <Text className="mb-1 text-xs text-gray-500">Price:</Text>
              <Text className="text-base text-slate-800">
                £{job.price.toFixed(2)}
              </Text>
              {jobExpensesTotal > 0 && (
                <>
                  <Text className="mt-2 text-xs text-gray-500">
                    Expenses added for this job:
                  </Text>
                  <Text className="text-base text-slate-800">
                    £{jobExpensesTotal.toFixed(2)}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    Total including expenses:
                  </Text>
                  <Text className="text-base font-semibold text-slate-800">
                    £{(job.price + jobExpensesTotal).toFixed(2)}
                  </Text>
                </>
              )}
            </View>
          )}

          {isEditing && (
            <>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Address</Text>
                <TextInput
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Job address"
                />
              </View>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Description</Text>
                <TextInput
                  className="h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Job details..."
                  multiline
                  textAlignVertical="top"
                />
              </View>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Price</Text>
                <TextInput
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                  value={editPrice}
                  onChangeText={setEditPrice}
                  placeholder="e.g., 250"
                  keyboardType="decimal-pad"
                />
              </View>
            </>
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
            Expenses
          </Text>
          {showExpenseForm ? (
            <View className="mb-3 rounded-2xl bg-white p-4 shadow-md">
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Amount *</Text>
                <TextInput
                  className={`rounded-lg border bg-white px-3 py-2 text-base text-slate-800 ${
                    expenseError ? "border-red-400" : "border-slate-300"
                  }`}
                  value={expenseAmount}
                  onChangeText={(text) => {
                    setExpenseAmount(text);
                    if (expenseError) {
                      setExpenseError(null);
                    }
                  }}
                  placeholder="e.g., 45.50"
                  keyboardType="decimal-pad"
                />
                {expenseError && (
                  <Text className="mt-1 text-xs text-red-500">
                    {expenseError}
                  </Text>
                )}
              </View>
              <View className="mb-3">
                <Text className="mb-1 text-xs text-gray-500">Note</Text>
                <TextInput
                  className="h-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
                  value={expenseNote}
                  onChangeText={setExpenseNote}
                  placeholder="Optional details about this expense..."
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
                  onPress={() => {
                    setShowExpenseForm(false);
                    setExpenseAmount("");
                    setExpenseNote("");
                    setExpenseError(null);
                  }}
                >
                  <Text className="text-sm font-semibold text-gray-600">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
                  onPress={handleSaveExpense}
                >
                  <Text className="text-sm font-semibold text-white">
                    Save Expense
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
              onPress={() => setShowExpenseForm(true)}
            >
              <Text className="text-sm font-semibold text-blue-500">
                Record an Expense for this Job
              </Text>
            </TouchableOpacity>
          )}

          {jobExpenses.length > 0 && (
            <View className="mt-4 rounded-2xl bg-white p-4 shadow-md">
              <Text className="mb-2 text-sm font-semibold text-slate-800">
                Expense breakdown
              </Text>
              {jobExpenses.map((expense) => (
                <View
                  key={expense.id}
                  className="border-b border-slate-100 py-2 last:border-b-0"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-slate-800">
                      £{expense.amount.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {expense.note && (
                    <Text className="mt-1 text-xs text-gray-500">
                      {expense.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="px-4 py-4">
          <Text className="mb-3 text-lg font-semibold text-slate-800">
            Notes ({job.notes.length})
          </Text>
          {job.notes.map((note) => (
            <View key={note.id} className="mb-2 rounded-lg bg-white p-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="mb-1 text-sm text-slate-800">
                    {note.text}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {new Date(note.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => beginEditNote(note)}
                  >
                    <Pencil size={18} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
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
          {!isEditing && (
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-4"
              onPress={beginEdit}
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
                onPress={cancelEdit}
                disabled={loading}
              >
                <Text className="text-base font-semibold text-gray-600">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-4"
                onPress={saveEdit}
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

      <Modal
        transparent
        visible={!!editingNote}
        animationType="slide"
        onRequestClose={() => {
          if (!savingNote) {
            setEditingNote(null);
            setEditingNoteText("");
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
              value={editingNoteText}
              onChangeText={setEditingNoteText}
              placeholder="Note details..."
              multiline
              textAlignVertical="top"
            />
            <View className="mt-4 flex-row gap-2">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
                onPress={() => {
                  if (!savingNote) {
                    setEditingNote(null);
                    setEditingNoteText("");
                  }
                }}
                disabled={savingNote}
              >
                <Text className="text-sm font-semibold text-gray-600">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
                onPress={handleSaveEditedNote}
                disabled={savingNote}
              >
                <Text className="text-sm font-semibold text-white">
                  {savingNote ? "Saving..." : "Save note"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
