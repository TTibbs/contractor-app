import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Modal } from "react-native";

type TaxSettingsModalProps = {
  visible: boolean;
  taxRateInput: string;
  taxRateError: string | null;
  savingTaxRate: boolean;
  onChangeTaxRateInput: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function TaxSettingsModal({
  visible,
  taxRateInput,
  taxRateError,
  savingTaxRate,
  onChangeTaxRateInput,
  onSave,
  onCancel,
}: TaxSettingsModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!savingTaxRate) {
          onCancel();
        }
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/30 px-6">
        <View className="w-full rounded-2xl bg-white p-5">
          <Text className="mb-1 text-base font-semibold text-slate-800">
            Tax settings
          </Text>
          <Text className="mb-4 text-xs text-gray-500">
            Set the tax rate used for your year-to-date estimates on this
            dashboard. This is a rough guide only and is not tax advice.
          </Text>

          <Text className="mb-1 text-xs text-gray-500">Tax rate (%)</Text>
          <TextInput
            className={`mb-1 rounded-lg border bg-white px-3 py-2 text-base text-slate-800 ${
              taxRateError ? "border-red-400" : "border-slate-300"
            }`}
            value={taxRateInput}
            onChangeText={onChangeTaxRateInput}
            placeholder="e.g., 20"
            keyboardType="decimal-pad"
          />
          {taxRateError && (
            <Text className="mb-2 text-xs text-red-500">{taxRateError}</Text>
          )}

          <View className="mt-3 flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
              onPress={onCancel}
              disabled={savingTaxRate}
            >
              <Text className="text-sm font-semibold text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
              onPress={onSave}
              disabled={savingTaxRate}
            >
              <Text className="text-sm font-semibold text-white">
                {savingTaxRate ? "Saving..." : "Save tax rate"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

