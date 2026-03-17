import { previewInvoiceHtml, generateInvoiceForJob } from "@/services/invoiceService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import RenderHtml from "react-native-render-html";

export default function InvoicePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setError(null);
        const content = await previewInvoiceHtml(id);
        setHtml(content);
      } catch (error) {
        console.error("Failed to load invoice preview", error);
        setError("Could not load invoice preview. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleGenerateAndShare = async () => {
    if (!id) return;
    try {
      setGenerating(true);
      const { fileUri, invoiceNumber } = await generateInvoiceForJob(id);
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
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-sm text-gray-500">Loading invoice preview...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="mb-2 text-xl font-semibold text-red-500">
          Something went wrong
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-400">
          {error}
        </Text>
        <TouchableOpacity
          className="mt-2 rounded-lg bg-blue-500 px-5 py-3"
          onPress={() => {
            setLoading(true);
            setError(null);
            setHtml(null);
          }}
          disabled={loading}
        >
          <Text className="text-sm font-semibold text-white">Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-3"
          onPress={() => router.back()}
        >
          <Text className="text-sm font-semibold text-blue-500">
            Go back to job
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!html) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="mb-2 text-xl font-semibold text-slate-800">
          No preview available
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-400">
          We couldn't generate a preview for this invoice.
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-500 px-5 py-3"
          onPress={handleGenerateAndShare}
          disabled={generating}
        >
          <Text className="text-sm font-semibold text-white">
            {generating ? "Generating..." : "Generate & Share anyway"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 pb-4 pt-14">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-base text-blue-500">Back</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-800">
          Invoice Preview
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        <RenderHtml contentWidth={400} source={{ html }} />
      </ScrollView>

      <View className="flex-row gap-3 px-4 pb-6">
        <TouchableOpacity
          className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
          onPress={() => router.back()}
          disabled={generating}
        >
          <Text className="text-base font-semibold text-gray-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
          onPress={handleGenerateAndShare}
          disabled={generating}
        >
          <Text className="text-base font-semibold text-white">
            {generating ? "Generating..." : "Generate & Share"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

