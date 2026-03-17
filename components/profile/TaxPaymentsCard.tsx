import { Card } from "@/components/Card";
import { Text, View } from "react-native";

type TaxPaymentRow = {
  id: string;
  amount: string;
  note: string | null;
  paidAt: string;
};

type TaxPaymentsCardProps = {
  payments: TaxPaymentRow[];
};

export function TaxPaymentsCard({ payments }: TaxPaymentsCardProps) {
  if (payments.length === 0) {
    return (
      <Card className="p-3">
        <Text className="text-sm text-gray-400">
          No tax payments recorded yet.
        </Text>
      </Card>
    );
  }

  return (
    <Card className="p-3">
      {payments.map((payment) => (
        <View
          key={payment.id}
          className="border-b border-slate-100 py-2 last:border-b-0"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold text-slate-800">
              {payment.amount}
            </Text>
            <Text className="text-xs text-gray-400">{payment.paidAt}</Text>
          </View>
          {payment.note && (
            <Text className="mt-1 text-xs text-gray-500">{payment.note}</Text>
          )}
        </View>
      ))}
    </Card>
  );
}

