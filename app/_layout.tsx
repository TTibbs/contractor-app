import { initDatabase } from "@/database/db";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "./global.css";

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error("Failed to initialize database", error);
      }
    })();
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
