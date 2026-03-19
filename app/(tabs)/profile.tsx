import { BusinessSummaryCard } from "@/components/profile/BusinessSummaryCard";
import { ExpensesCard } from "@/components/profile/ExpensesCard";
import { TaxPaymentsCard } from "@/components/profile/TaxPaymentsCard";
import { TaxSettingsModal } from "@/components/profile/TaxSettingsModal";
import { ErrorState } from "@/components/ScreenState/ErrorState";
import { LoadingState } from "@/components/ScreenState/LoadingState";
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
import { ExpenseRow, TaxPayment, TaxSummary } from "@/types/profile";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

export default function ProfileScreen() {
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
    return <LoadingState message="Loading business dashboard..." />;
  }

  if (error && !summary) {
    return <ErrorState message={error} />;
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
      <ScrollView className="flex-1 bg-slate-50 mt-12">
        <View className="px-4 pt-4 pb-6">
          <Text className="mb-4 text-xs uppercase tracking-wide text-gray-400">
            Year to date overview
          </Text>

          {summary && (
            <BusinessSummaryCard
              income={formatCurrency(summary.income)}
              expenses={formatCurrency(summary.expenses)}
              profit={formatCurrency(summary.profit)}
              taxRatePercent={Math.round(summary.taxRate * 100)}
              estimatedTax={formatCurrency(summary.estimatedTax)}
              taxPaid={formatCurrency(summary.taxPaid)}
              remainingTax={formatCurrency(summary.remainingTax)}
              paidTotal={formatCurrency(paidTotal)}
              unpaidTotal={formatCurrency(unpaidTotal)}
              taxPaymentAmount={taxPaymentAmount}
              taxPaymentError={taxPaymentError}
              savingTaxPayment={savingTaxPayment}
              onChangeTaxPaymentAmount={(text) => {
                setTaxPaymentAmount(text);
                if (taxPaymentError) {
                  setTaxPaymentError(null);
                }
              }}
              onSaveTaxPayment={handleSaveTaxPayment}
              onOpenTaxSettings={() => setShowTaxSettings(true)}
            />
          )}

          <View className="my-4">
            <Text className="mb-2 text-sm font-semibold text-slate-800">
              All Expenses
            </Text>
            <ExpensesCard
              expenses={expensesList.map((expense) => ({
                id: expense.id,
                amount: formatCurrency(expense.amount),
                note: expense.note,
                createdAt: new Date(expense.createdAt).toLocaleDateString(),
                jobId: expense.jobId,
                jobTitle: expense.jobTitle,
                receiptCount: expense.receiptCount,
              }))}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-slate-800">
              Recent Tax Payments
            </Text>
            <TaxPaymentsCard
              payments={payments.map((payment) => ({
                id: payment.id,
                amount: formatCurrency(payment.amount),
                note: payment.note,
                paidAt: new Date(payment.paidAt).toLocaleDateString(),
              }))}
            />
          </View>

          {summary && (
            <Text className="mt-2 text-xs text-gray-400">
              This is an estimate only and does not constitute tax advice.
            </Text>
          )}
        </View>
      </ScrollView>

      <TaxSettingsModal
        visible={showTaxSettings}
        taxRateInput={taxRateInput}
        taxRateError={taxRateError}
        savingTaxRate={savingTaxRate}
        onChangeTaxRateInput={(text) => {
          setTaxRateInput(text);
          if (taxRateError) {
            setTaxRateError(null);
          }
        }}
        onSave={handleSaveConfiguredTaxRate}
        onCancel={() => {
          if (!savingTaxRate) {
            setShowTaxSettings(false);
            setTaxRateError(null);
          }
        }}
      />
    </>
  );
}
