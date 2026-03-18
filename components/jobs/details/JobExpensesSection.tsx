import { PhotoThumbnail } from "@/components/PhotoThumbnail";
import { Camera, Trash2 } from "lucide-react-native";
import { Expense, ExpenseReceipt } from "@/types/job";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type ReceiptThumbnailLike = { uri: string; createdAt: string };

type JobExpensesSectionProps = {
  showExpenseForm: boolean;
  expenseAmount: string;
  expenseNote: string;
  expenseError: string | null;
  expenses: Expense[];
  expenseReceiptsByExpenseId: Record<string, ExpenseReceipt[]>;
  pendingExpenseReceiptThumbnails: ReceiptThumbnailLike[];
  onTakeExpenseReceiptPhoto: () => void;
  onAddExpenseReceiptPhoto: () => void;
  onRemovePendingExpenseReceipt: (index: number) => void;
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
  expenseReceiptsByExpenseId,
  pendingExpenseReceiptThumbnails,
  onTakeExpenseReceiptPhoto,
  onAddExpenseReceiptPhoto,
  onRemovePendingExpenseReceipt,
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

          <View className="mb-3">
            <Text className="mb-2 text-xs text-gray-500">Receipt photos</Text>

            {pendingExpenseReceiptThumbnails.length > 0 && (
              <View className="mb-3 flex-row flex-wrap">
                {pendingExpenseReceiptThumbnails.map((receipt, index) => (
                  <View
                    key={`${receipt.uri}-${index}`}
                    style={{ position: "relative", marginRight: 8, marginBottom: 8 }}
                  >
                    <PhotoThumbnail photo={receipt} />
                    <TouchableOpacity
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => onRemovePendingExpenseReceipt(index)}
                      style={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        width: 26,
                        height: 26,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        backgroundColor: "#ef4444",
                        zIndex: 2,
                      }}
                    >
                      <Trash2 size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
                onPress={onTakeExpenseReceiptPhoto}
              >
                <Camera size={20} color="#3b82f6" />
                <Text className="text-sm font-semibold text-blue-500">
                  Take
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3"
                onPress={onAddExpenseReceiptPhoto}
              >
                <Camera size={20} color="#3b82f6" />
                <Text className="text-sm font-semibold text-blue-500">
                  Choose
                </Text>
              </TouchableOpacity>
            </View>
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

              {(
                expenseReceiptsByExpenseId[expense.id] ?? []
              ).length > 0 && (
                <View className="mt-2 flex-row flex-wrap">
                  {(
                    expenseReceiptsByExpenseId[expense.id] ?? []
                  ).map((receipt) => (
                    <View
                      key={receipt.id}
                      style={{ position: "relative", marginRight: 8, marginBottom: 8 }}
                    >
                      <PhotoThumbnail photo={receipt} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

