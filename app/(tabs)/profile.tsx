import {
  addTaxPayment,
  getAllExpenses,
  getPaidVsUnpaidJobTotals,
  getRecentTaxPayments,
  getTaxRate,
  getYearToDateExpenses,
  getYearToDateIncome,
  getYearToDateTaxPaid,
  setTaxRate,
} from "@/database/db";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

interface ExpenseRow {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  jobId: string | null;
  jobTitle: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [taxPaymentAmount, setTaxPaymentAmount] = useState("");
  const [taxPaymentError, setTaxPaymentError] = useState<string | null>(null);
  const [savingTaxPayment, setSavingTaxPayment] = useState(false);
  const [paidTotal, setPaidTotal] = useState(0);
  const [unpaidTotal, setUnpaidTotal] = useState(0);
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  const [taxRateInput, setTaxRateInput] = useState("");
  const [taxRateError, setTaxRateError] = useState<string | null>(null);
  const [savingTaxRate, setSavingTaxRate] = useState(false);
  const [expensesList, setExpensesList] = useState<ExpenseRow[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const year = now.getFullYear();

      const [
        income,
        expenses,
        taxPaid,
        recentPayments,
        paidVsUnpaid,
        taxRate,
        allExpenses,
      ] = await Promise.all([
        getYearToDateIncome(year),
        getYearToDateExpenses(year),
        getYearToDateTaxPaid(year),
        getRecentTaxPayments(5),
        getPaidVsUnpaidJobTotals(year),
        getTaxRate(),
        getAllExpenses(),
      ]);

      const profit = Math.max(income - expenses, 0);
      const estimatedTax = profit * taxRate;
      const remainingTax = Math.max(estimatedTax - taxPaid, 0);

      setSummary({
        income,
        expenses,
        profit,
        taxRate,
        estimatedTax,
        taxPaid,
        remainingTax,
      });
      setPayments(recentPayments);
      setPaidTotal(paidVsUnpaid.paidTotal);
      setUnpaidTotal(paidVsUnpaid.unpaidTotal);
      setTaxRateInput(String(Math.round(taxRate * 100 * 100) / 100));
      setExpensesList(allExpenses);
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

  const handleSaveConfiguredTaxRate = async () => {
    const trimmed = taxRateInput.trim();
    if (!trimmed) {
      setTaxRateError("Tax rate is required.");
      return;
    }

    const numeric = Number(trimmed.replace(/,/g, ""));
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      setTaxRateError("Enter a percentage between 0 and 100.");
      return;
    }

    const decimalRate = numeric / 100;

    try {
      setSavingTaxRate(true);
      setTaxRateError(null);
      await setTaxRate(decimalRate);
      await loadData();
      setShowTaxSettings(false);
      Alert.alert(
        "Tax rate updated",
        `Your estimated tax calculations now use ${numeric}% tax.`,
      );
    } catch (e) {
      console.error("Failed to save tax rate", e);
      setTaxRateError("Something went wrong while saving. Please try again.");
    } finally {
      setSavingTaxRate(false);
    }
  };

  const handleSaveTaxPayment = async () => {
    const trimmedAmount = taxPaymentAmount.trim();
    if (!trimmedAmount) {
      setTaxPaymentError("Amount is required.");
      return;
    }

    const numeric = Number(trimmedAmount.replace(/,/g, ""));
    if (Number.isNaN(numeric) || numeric < 0) {
      setTaxPaymentError("Enter a valid, non-negative number.");
      return;
    }

    try {
      setSavingTaxPayment(true);
      setTaxPaymentError(null);

      await addTaxPayment({
        amount: numeric,
      });

      setTaxPaymentAmount("");
      await loadData();

      Alert.alert("Tax payment recorded", "Your tax payment has been saved.");
    } catch (e) {
      console.error("Failed to save tax payment", e);
      setTaxPaymentError(
        "Something went wrong while saving. Please try again.",
      );
    } finally {
      setSavingTaxPayment(false);
    }
  };

  return (
    <>
      <ScrollView className="flex-1 bg-slate-50">
        <View className="px-4 pt-4 pb-6">
          <View className="mb-3">
            <Text className="text-xl font-bold text-slate-800">
              Business Dashboard
            </Text>
          </View>
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
                  <Text className="mt-1 text-[11px] text-gray-500">
                    Paid: {formatCurrency(paidTotal)} · Unpaid:{" "}
                    {formatCurrency(unpaidTotal)}
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
                  Estimated Tax (at {Math.round(summary.taxRate * 100)}
                  %)
                </Text>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-slate-800">
                    {formatCurrency(summary.estimatedTax)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTaxSettings(true)}
                    className="rounded-full border border-slate-300 px-3 py-1"
                  >
                    <Text className="text-xs font-semibold text-slate-700">
                      Adjust
                    </Text>
                  </TouchableOpacity>
                </View>
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

                <View className="mt-4">
                  <Text className="mb-1 text-xs text-gray-500">
                    Record Tax Payment
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1">
                      <TextInput
                        className={`rounded-lg border bg-white px-3 py-2 text-base text-slate-800 ${
                          taxPaymentError
                            ? "border-red-400"
                            : "border-slate-300"
                        }`}
                        value={taxPaymentAmount}
                        onChangeText={(text) => {
                          setTaxPaymentAmount(text);
                          if (taxPaymentError) {
                            setTaxPaymentError(null);
                          }
                        }}
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
                      className="items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
                      onPress={handleSaveTaxPayment}
                      disabled={savingTaxPayment}
                    >
                      <Text className="text-xs font-semibold text-white">
                        {savingTaxPayment ? "Saving..." : "Add"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-800">
              All Expenses
            </Text>
            {expensesList.length === 0 ? (
              <Text className="text-sm text-gray-400">
                No expenses recorded yet.
              </Text>
            ) : (
              <View className="rounded-2xl bg-white p-3 shadow-md">
                {expensesList.map((expense) => (
                  <View
                    key={expense.id}
                    className="border-b border-slate-100 py-2 last:border-b-0"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="text-base font-semibold text-slate-800">
                          {formatCurrency(expense.amount)}
                        </Text>
                        <Text className="text-xs text-gray-400">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </Text>
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
                      </View>
                      {expense.jobId && (
                        <TouchableOpacity
                          className="items-center justify-center rounded-full border border-slate-300 px-3 py-1"
                          onPress={() => router.push(`/job/${expense.jobId}`)}
                        >
                          <Text className="text-xs font-semibold text-blue-600">
                            View job
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

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

      <Modal
        transparent
        visible={showTaxSettings}
        animationType="slide"
        onRequestClose={() => {
          if (!savingTaxRate) {
            setShowTaxSettings(false);
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
              onChangeText={(text) => {
                setTaxRateInput(text);
                if (taxRateError) {
                  setTaxRateError(null);
                }
              }}
              placeholder="e.g., 20"
              keyboardType="decimal-pad"
            />
            {taxRateError && (
              <Text className="mb-2 text-xs text-red-500">{taxRateError}</Text>
            )}

            <View className="mt-3 flex-row gap-2">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3"
                onPress={() => {
                  if (!savingTaxRate) {
                    setShowTaxSettings(false);
                    setTaxRateError(null);
                  }
                }}
                disabled={savingTaxRate}
              >
                <Text className="text-sm font-semibold text-gray-600">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-3"
                onPress={handleSaveConfiguredTaxRate}
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
    </>
  );
}
