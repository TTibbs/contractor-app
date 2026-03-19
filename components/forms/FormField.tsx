import { Text, TextInput, TextInputProps, View } from "react-native";

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: TextInputProps["keyboardType"];
  containerClassName?: string;
  inputClassName?: string;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  numberOfLines,
  keyboardType,
  containerClassName,
  inputClassName,
}: FormFieldProps) {
  const baseContainerClasses = "mb-4";
  const baseInputClasses =
    "rounded-lg border bg-white px-3 py-3 text-base text-slate-800";

  return (
    <View className={`${baseContainerClasses} ${containerClassName ?? ""}`}>
      <Text className="mb-2 text-sm font-semibold text-slate-700">{label}</Text>
      <TextInput
        className={`${baseInputClasses} ${
          error ? "border-red-400" : "border-slate-300"
        } ${inputClassName ?? ""}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
      />
      {error && (
        <Text className="mt-1 text-xs text-red-500" numberOfLines={2}>
          {error}
        </Text>
      )}
    </View>
  );
}
