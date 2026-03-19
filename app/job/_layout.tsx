import { Stack } from "expo-router";

export default function JobLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarStyle: "dark",
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen name="[id]" options={{ animation: "fade_from_bottom" }} />
      <Stack.Screen
        name="[id]/add-note"
        options={{ animation: "fade_from_bottom" }}
      />
      <Stack.Screen
        name="[id]/signature"
        options={{ animation: "fade_from_bottom" }}
      />
      <Stack.Screen
        name="[id]/invoice-preview"
        options={{ animation: "fade_from_bottom" }}
      />
    </Stack>
  );
}
