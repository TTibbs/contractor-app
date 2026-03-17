import { JobHeader } from "@/components/jobs/details/JobHeader";
import { LoadingState } from "@/components/ScreenState/LoadingState";
import {
  getJobSignature,
  saveSignatureForJob,
} from "@/services/signatureService";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Signature from "react-native-signature-canvas";
import * as FileSystem from "expo-file-system/legacy";

export default function JobSignatureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const signatureRef = useRef<any>(null);
  const [initialDataUrl, setInitialDataUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadExistingSignature = async () => {
        if (!id) return;
        try {
          setLoading(true);
          setError(null);
          const existing = await getJobSignature(id);
          if (existing?.uri) {
            const base64 = await FileSystem.readAsStringAsync(existing.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            setInitialDataUrl(`data:image/png;base64,${base64}`);
          } else {
            setInitialDataUrl(undefined);
          }
        } catch (error) {
          console.warn("Failed to load existing signature", error);
          setError(
            "We couldn't load the existing signature. You can still draw a new one.",
          );
        } finally {
          setLoading(false);
        }
      };
      loadExistingSignature();
    }, [id]),
  );

  const handleOK = async (signature: string) => {
    if (!id || saving) return;
    try {
      setSaving(true);
      // signature is a base64-encoded PNG without the data URL prefix
      await saveSignatureForJob(id, signature);
       // keep local state in sync so if this screen stays mounted, we see latest signature
      setInitialDataUrl(
        signature.startsWith("data:")
          ? signature
          : `data:image/png;base64,${signature}`,
      );
      router.back();
    } catch (error) {
      console.error("Failed to save signature", error);
      Alert.alert("Error", "Could not save the signature. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEmpty = () => {
    Alert.alert("No signature", "Please draw a signature before saving.");
  };

  return (
    <View className="flex-1 bg-slate-50">
      <JobHeader
        title="Client Signature"
        onBack={() => router.back()}
        backDisabled={saving}
      />

      {loading && (
        <LoadingState message="Loading existing signature..." />
      )}

      {!loading && (
        <View className="m-4 flex-1 rounded-2xl shadow-md">
          <View className="flex-1 overflow-hidden rounded-2xl">
            <Signature
              ref={signatureRef}
              onOK={handleOK}
              onEmpty={handleEmpty}
              imageType="image/png"
              dataURL={initialDataUrl}
              webStyle={`
                .m-signature-pad--footer { display: none; }
                .m-signature-pad { box-shadow: none; border: 0; }
                body,html { margin:0; padding:0; }
                canvas { width:100% !important; height:100% !important; }
              `}
            />
          </View>

          {error && (
            <View className="px-4 pt-3">
              <Text className="text-xs text-amber-600">{error}</Text>
            </View>
          )}

          <View className="mt-4 mb-2 flex-row justify-between px-4">
            <TouchableOpacity
              className="mr-2 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
              disabled={saving}
              onPress={() => {
                if (signatureRef.current) {
                  signatureRef.current.clearSignature();
                }
              }}
            >
              <Text className="text-base font-semibold text-gray-700">
                Clear
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="ml-2 flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
              disabled={saving}
              onPress={() => {
                if (signatureRef.current) {
                  signatureRef.current.readSignature();
                }
              }}
            >
              <Text className="text-base font-semibold text-white">
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
