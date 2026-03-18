import { Card } from "@/components/Card";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type BusinessSummaryCardProps = {
  income: string;
  expenses: string;
  profit: string;
  taxRatePercent: number;
  estimatedTax: string;
  taxPaid: string;
  remainingTax: string;
  paidTotal: string;
  unpaidTotal: string;
  taxPaymentAmount: string;
  taxPaymentError: string | null;
  savingTaxPayment: boolean;
  onChangeTaxPaymentAmount: (value: string) => void;
  onSaveTaxPayment: () => void;
  onOpenTaxSettings: () => void;
};

export function BusinessSummaryCard({
  income,
  expenses,
  profit,
  taxRatePercent,
  estimatedTax,
  taxPaid,
  remainingTax,
  paidTotal,
  unpaidTotal,
  taxPaymentAmount,
  taxPaymentError,
  savingTaxPayment,
  onChangeTaxPaymentAmount,
  onSaveTaxPayment,
  onOpenTaxSettings,
}: BusinessSummaryCardProps) {
  return (
    <Card className="mb-6">
      <Text className="mb-3 text-sm font-semibold text-slate-700">
        Income & Expenses
      </Text>
      <View className="mb-4 flex-row justify-between">
        <View>
          <Text className="text-xs text-gray-500">Income (YTD)</Text>
          <Text className="text-lg font-semibold text-emerald-600">
            {income}
          </Text>
          <Text className="mt-1 text-[11px] text-gray-500">
            Paid: {paidTotal} · Unpaid: {unpaidTotal}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-gray-500">Expenses</Text>
          <Text className="text-lg font-semibold text-rose-500">
            {expenses}
          </Text>
        </View>
      </View>

      <View className="mb-4 border-t border-slate-100 pt-4">
        <Text className="mb-1 text-xs text-gray-500">
          Estimated Taxable Profit
        </Text>
        <Text className="text-xl font-semibold text-slate-800">{profit}</Text>
      </View>

      <View className="mt-2 border-t border-slate-100 pt-4">
        <Text className="mb-1 text-xs text-gray-500">
          Estimated Tax (at {taxRatePercent}%)
        </Text>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-slate-800">
            {estimatedTax}
          </Text>
          <TouchableOpacity
            onPress={onOpenTaxSettings}
            className="rounded-lg border border-slate-300 px-3 py-1"
          >
            <Text className="text-sm font-semibold text-slate-700">Adjust</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-1 flex-row justify-between">
          <View>
            <Text className="text-xs text-gray-500">Tax Paid</Text>
            <Text className="text-base font-semibold text-slate-800">
              {taxPaid}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Remaining Tax</Text>
            <Text className="text-base font-semibold text-amber-600">
              {remainingTax}
            </Text>
          </View>
        </View>

        <View className="mt-4">
          <Text className="mb-1 text-xs text-gray-500">Record Tax Payment</Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-1 w-40">
              <TextInput
                className={`rounded-lg border bg-white px-3 py-2 text-base text-slate-800 ${
                  taxPaymentError ? "border-red-400" : "border-slate-300"
                }`}
                value={taxPaymentAmount}
                onChangeText={onChangeTaxPaymentAmount}
                placeholder="Amount paid (e.g., 500)"
                keyboardType="decimal-pad"
              />
              {taxPaymentError && (
                <Text className="mt-1 text-xs text-red-500">
                  {taxPaymentError}
                </Text>
              )}
            </View>
            <TouchableOpacity
              className="items-center justify-center rounded-lg bg-blue-500 px-4 py-3 ml-2"
              onPress={onSaveTaxPayment}
              disabled={savingTaxPayment}
            >
              <Text className="text-xs font-bold text-white">
                {savingTaxPayment ? "Saving..." : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );
}
