import { Card } from "@/components/Card";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type ExpenseRow = {
  id: string;
  amount: string;
  note: string | null;
  createdAt: string;
  jobId: string | null;
  jobTitle: string | null;
  receiptCount: number;
};

type ExpensesCardProps = {
  expenses: ExpenseRow[];
};

export function ExpensesCard({ expenses }: ExpensesCardProps) {
  const router = useRouter();

  if (expenses.length === 0) {
    return (
      <Card className="p-3">
        <Text className="text-sm text-gray-400">No expenses recorded yet.</Text>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      {expenses.map((expense) => (
        <View
          key={expense.id}
          className="border-b border-slate-100 py-2 last:border-b-0"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-slate-800">
                {expense.amount}
              </Text>
              <Text className="text-xs text-gray-400">{expense.createdAt}</Text>
              {expense.note && (
                <Text className="mt-1 text-xs text-gray-500">
                  {expense.note}
                </Text>
              )}
              {expense.jobTitle && (
                <Text className="mt-1 text-xs text-gray-500">
                  Job: {expense.jobTitle}
                </Text>
              )}
              <Text className="mt-1 text-xs text-gray-500">
                Receipts: {expense.receiptCount}
              </Text>
            </View>
            {expense.jobId && (
              <TouchableOpacity
                className="items-center justify-center rounded-lg border border-slate-300 px-3 py-1"
                onPress={() => router.push(`/job/${expense.jobId}`)}
              >
                <Text className="text-sm font-semibold text-blue-600">
                  View job
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </Card>
  );
}
