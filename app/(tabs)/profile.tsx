import {
  getRecentTaxPayments,
  getYearToDateExpenses,
  getYearToDateIncome,
  getYearToDateTaxPaid,
} from "@/database/db";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const DEFAULT_TAX_RATE = 0.2;

interface TaxSummary {
  income: number;
  expenses: number;
  profit: number;
  taxRate: number;
  estimatedTax: number;
  taxPaid: number;
  remainingTax: number;
}

interface TaxPayment {
  id: string;
  amount: number;
  note: string | null;
  paidAt: string;
}

export default function ProfileScreen() {
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const year = now.getFullYear();

      const [income, expenses, taxPaid, recentPayments] = await Promise.all([
        getYearToDateIncome(year),
        getYearToDateExpenses(year),
        getYearToDateTaxPaid(year),
        getRecentTaxPayments(5),
      ]);

      const profit = Math.max(income - expenses, 0);
      const estimatedTax = profit * DEFAULT_TAX_RATE;
      const remainingTax = Math.max(estimatedTax - taxPaid, 0);

      setSummary({
        income,
        expenses,
        profit,
        taxRate: DEFAULT_TAX_RATE,
        estimatedTax,
        taxPaid,
        remainingTax,
      });
      setPayments(recentPayments);
    } catch (e) {
      console.error("Failed to load business dashboard", e);
      setError("Failed to load business dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);

  if (loading && !summary) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-sm text-gray-400">
          Loading business dashboard...
        </Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-5">
        <Text className="mb-2 text-xl font-semibold text-red-500">
          Something went wrong
        </Text>
        <Text className="mb-4 text-center text-sm text-gray-400">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pt-4 pb-6">
        <Text className="mb-3 text-xl font-bold text-slate-800">
          Business Dashboard
        </Text>
        <Text className="mb-4 text-xs uppercase tracking-wide text-gray-400">
          Year to date overview
        </Text>

        {summary && (
          <View className="mb-6 rounded-2xl bg-white p-4 shadow-md">
            <Text className="mb-3 text-sm font-semibold text-slate-700">
              Income & Expenses
            </Text>
            <View className="mb-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-gray-500">Income (YTD)</Text>
                <Text className="text-lg font-semibold text-emerald-600">
                  {formatCurrency(summary.income)}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-gray-500">Expenses</Text>
                <Text className="text-lg font-semibold text-rose-500">
                  {formatCurrency(summary.expenses)}
                </Text>
              </View>
            </View>

            <View className="mb-4 border-t border-slate-100 pt-4">
              <Text className="mb-1 text-xs text-gray-500">
                Estimated Taxable Profit
              </Text>
              <Text className="text-xl font-semibold text-slate-800">
                {formatCurrency(summary.profit)}
              </Text>
            </View>

            <View className="mt-2 border-t border-slate-100 pt-4">
              <Text className="mb-1 text-xs text-gray-500">
                Estimated Tax (at{" "}
                {Math.round(summary.taxRate * 100)}
                %)
              </Text>
              <Text className="mb-2 text-lg font-semibold text-slate-800">
                {formatCurrency(summary.estimatedTax)}
              </Text>
              <View className="mt-1 flex-row justify-between">
                <View>
                  <Text className="text-xs text-gray-500">Tax Paid</Text>
                  <Text className="text-base font-semibold text-slate-800">
                    {formatCurrency(summary.taxPaid)}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-500">Remaining Tax</Text>
                  <Text className="text-base font-semibold text-amber-600">
                    {formatCurrency(summary.remainingTax)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-slate-800">
            Recent Tax Payments
          </Text>
          {payments.length === 0 ? (
            <Text className="text-sm text-gray-400">
              No tax payments recorded yet.
            </Text>
          ) : (
            <View className="rounded-2xl bg-white p-3 shadow-md">
              {payments.map((payment) => (
                <View
                  key={payment.id}
                  className="border-b border-slate-100 py-2 last:border-b-0"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-semibold text-slate-800">
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {payment.note && (
                    <Text className="mt-1 text-xs text-gray-500">
                      {payment.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {summary && (
          <Text className="mt-2 text-xs text-gray-400">
            This is an estimate only and does not constitute tax advice.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

