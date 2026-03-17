import { ReactNode } from "react";
import { View } from "react-native";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <View
      className={`rounded-2xl bg-white p-4 shadow-md shadow-black/5 ${className ?? ""}`}
    >
      {children}
    </View>
  );
}

