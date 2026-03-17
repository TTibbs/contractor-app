import { Expense } from "@/types/job";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type JobExpensesSectionProps = {
  showExpenseForm: boolean;
  expenseAmount: string;
  expenseNote: string;
  expenseError: string | null;
  expenses: Expense[];
  onChangeAmount: (value: string) => void;
  onChangeNote: (value: string) => void;
  onClearError: () => void;
  onToggleForm: (visible: boolean) => void;
  onSaveExpense: () => void;
};

export function JobExpensesSection({
  showExpenseForm,
  expenseAmount,
  expenseNote,
  expenseError,
  expenses,
  onChangeAmount,
  onChangeNote,
  onClearError,
  onToggleForm,
  onSaveExpense,
}: JobExpensesSectionProps) {
  return (
    <View className="px-4 py-4">
      <Text className="mb-3 text-lg font-semibold text-slate-800">Expenses</Text>
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
                onChangeAmount(text);
                if (expenseError) {
                  onClearError();
                }
              }}
              placeholder="e.g., 45.50"
              keyboardType="decimal-pad"
            />
            {expenseError && (
              <Text className="mt-1 text-xs text-red-500">{expenseError}</Text>
            )}
          </View>
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-500">Note</Text>
            <TextInput
              className="h-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-800"
              value={expenseNote}
              onChangeText={onChangeNote}
              placeholder="Optional details about this expense..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
              onPress={() => onToggleForm(false)}
            >
              <Text className="text-sm font-semibold text-gray-600">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
              onPress={onSaveExpense}
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
          onPress={() => onToggleForm(true)}
        >
          <Text className="text-sm font-semibold text-blue-500">
            Record an Expense for this Job
          </Text>
        </TouchableOpacity>
      )}

      {expenses.length > 0 && (
        <View className="mt-4 rounded-2xl bg-white p-4 shadow-md">
          <Text className="mb-2 text-sm font-semibold text-slate-800">
            Expense breakdown
          </Text>
          {expenses.map((expense) => (
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
  );
}

