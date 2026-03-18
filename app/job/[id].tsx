import { EditNoteModal } from "@/components/jobs/details/EditNoteModal";
import { JobActionsSection } from "@/components/jobs/details/JobActionsSection";
import { JobExpensesSection } from "@/components/jobs/details/JobExpensesSection";
import { JobHeader } from "@/components/jobs/details/JobHeader";
import { JobNotesSection } from "@/components/jobs/details/JobNotesSection";
import { JobPhotosSection } from "@/components/jobs/details/JobPhotosSection";
import { JobSummaryCard } from "@/components/jobs/details/JobSummaryCard";
import {
  addExpense,
  addExpensePhoto,
  addPhoto,
  deleteNote,
  deletePhoto,
  getExpensesForJob,
  getExpensePhotosForJob,
  getJobById,
  getTotalExpensesForJob,
  updateJob,
  updateJobPaidStatus,
  updateJobStatus,
  updateNote,
} from "@/database/db";
import { generateInvoiceForJob } from "@/services/invoiceService";
import { getJobSignature } from "@/services/signatureService";
import { Expense, ExpenseReceipt, JobWithDetails, Note } from "@/types/job";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [pendingExpenseReceiptThumbnails, setPendingExpenseReceiptThumbnails] =
    useState<Array<{ uri: string; createdAt: string }>>([]);
  const [
    jobExpenseReceiptsByExpenseId,
    setJobExpenseReceiptsByExpenseId,
  ] = useState<Record<string, ExpenseReceipt[]>>({});
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
        const [
          signature,
          expensesTotal,
          expenses,
          expenseReceipts,
        ] = await Promise.all([
          getJobSignature(jobData.id),
          getTotalExpensesForJob(jobData.id),
          getExpensesForJob(jobData.id),
          getExpensePhotosForJob(jobData.id),
        ]);
        setHasSignature(!!signature);
        setJobExpensesTotal(expensesTotal);
        setJobExpenses(expenses);
        const grouped: Record<string, ExpenseReceipt[]> = {};
        for (const receipt of expenseReceipts) {
          const key = receipt.expenseId;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(receipt);
        }
        setJobExpenseReceiptsByExpenseId(grouped);
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

  const handleChooseExpenseReceiptPhoto = async () => {
    if (!job) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPendingExpenseReceiptThumbnails((prev) => [
        ...prev,
        { uri, createdAt: new Date().toISOString() },
      ]);
    }
  };

  const handleTakeExpenseReceiptPhoto = async () => {
    if (!job) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera access is required to take receipt photos",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPendingExpenseReceiptThumbnails((prev) => [
        ...prev,
        { uri, createdAt: new Date().toISOString() },
      ]);
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

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      "Delete photo?",
      "This will permanently remove this photo from the job.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePhoto(photoId);
              await loadJob();
            } catch (e) {
              console.error("Failed to delete photo", e);
              Alert.alert(
                "Error",
                "Could not delete this photo. Please try again.",
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

      const createdExpense = await addExpense({
        amount: numeric,
        jobId: job.id,
        category: "Job",
        note: expenseNote.trim()
          ? `${job.title} – ${expenseNote.trim()}`
          : job.title,
      });

      // Attach any pending receipt photos to the newly created expense row.
      for (const receipt of pendingExpenseReceiptThumbnails) {
        await addExpensePhoto(createdExpense.id, receipt.uri);
      }

      setPendingExpenseReceiptThumbnails([]);

      setExpenseAmount("");
      setExpenseNote("");
      setShowExpenseForm(false);

      const [
        updatedTotal,
        updatedExpenses,
        updatedReceipts,
      ] = await Promise.all([
        getTotalExpensesForJob(job.id),
        getExpensesForJob(job.id),
        getExpensePhotosForJob(job.id),
      ]);
      setJobExpensesTotal(updatedTotal);
      setJobExpenses(updatedExpenses);
      const grouped: Record<string, ExpenseReceipt[]> = {};
      for (const receipt of updatedReceipts) {
        const key = receipt.expenseId;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(receipt);
      }
      setJobExpenseReceiptsByExpenseId(grouped);

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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <JobHeader onBack={() => router.back()} />

      <ScrollView className="flex-1 p-1">
        <JobSummaryCard
          job={job}
          isEditing={isEditing}
          editTitle={editTitle}
          editClientName={editClientName}
          editAddress={editAddress}
          editDescription={editDescription}
          editPrice={editPrice}
          onChangeTitle={setEditTitle}
          onChangeClientName={setEditClientName}
          onChangeAddress={setEditAddress}
          onChangeDescription={setEditDescription}
          onChangePrice={setEditPrice}
          jobExpensesTotal={jobExpensesTotal}
          hasSignature={hasSignature}
          onTogglePaid={handleTogglePaid}
        />

        <View className="mt-3 flex-row items-center justify-between px-4">
          <View>
            <Text className="mb-1 text-xs text-gray-500">Paid:</Text>
            <Text className="text-base text-slate-800">
              {job.paid ? "Paid" : "Unpaid"}
            </Text>
          </View>
          <Switch value={!!job.paid} onValueChange={handleTogglePaid} />
        </View>

        <JobExpensesSection
          showExpenseForm={showExpenseForm}
          expenseAmount={expenseAmount}
          expenseNote={expenseNote}
          expenseError={expenseError}
          expenses={jobExpenses}
          expenseReceiptsByExpenseId={jobExpenseReceiptsByExpenseId}
          pendingExpenseReceiptThumbnails={pendingExpenseReceiptThumbnails}
          onTakeExpenseReceiptPhoto={handleTakeExpenseReceiptPhoto}
          onAddExpenseReceiptPhoto={handleChooseExpenseReceiptPhoto}
          onRemovePendingExpenseReceipt={(index) => {
            setPendingExpenseReceiptThumbnails((prev) =>
              prev.filter((_, i) => i !== index),
            );
          }}
          onChangeAmount={setExpenseAmount}
          onChangeNote={setExpenseNote}
          onClearError={() => setExpenseError(null)}
          onToggleForm={(visible) => {
            setShowExpenseForm(visible);
            if (!visible) {
              setExpenseAmount("");
              setExpenseNote("");
              setExpenseError(null);
              setPendingExpenseReceiptThumbnails([]);
            }
          }}
          onSaveExpense={handleSaveExpense}
        />

        <JobNotesSection
          notes={job.notes}
          onAddNote={handleAddNote}
          onEditNote={beginEditNote}
          onDeleteNote={handleDeleteNote}
        />

        <JobPhotosSection
          photos={job.photos}
          onTakePhoto={handleTakePhoto}
          onAddPhoto={handleAddPhoto}
          onDeletePhoto={handleDeletePhoto}
        />

        <JobActionsSection
          status={job.status}
          isEditing={isEditing}
          loading={loading}
          hasSignature={hasSignature}
          generatingInvoice={generatingInvoice}
          onStartJob={handleStartJob}
          onCompleteJob={handleCompleteJob}
          onBeginEdit={beginEdit}
          onCancelEdit={cancelEdit}
          onSaveEdit={saveEdit}
          onAddSignature={handleAddSignature}
          onGenerateInvoice={handleGenerateInvoice}
          onGenerateSummary={handleGenerateSummary}
        />
      </ScrollView>

      <EditNoteModal
        note={editingNote}
        text={editingNoteText}
        saving={savingNote}
        onChangeText={setEditingNoteText}
        onCancel={() => {
          if (!savingNote) {
            setEditingNote(null);
            setEditingNoteText("");
          }
        }}
        onSave={handleSaveEditedNote}
      />
    </SafeAreaView>
  );
}
