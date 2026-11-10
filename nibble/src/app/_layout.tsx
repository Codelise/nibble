import { useEffect, useState } from "react";
import { Stack } from "expo-router"; // for navigating screens
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
// View = container that supports layout with flexbox, style, some touch handling, and accessibility controls.
// Text =  component for displaying text.
// ActivityIndicator = Displays a circular loading indicator.
// StyleSheet = A StyleSheet is an abstraction similar to CSS StyleSheets.
import { InitializeDatabase } from "@/database/db"; // database from /database/db.ts
import { insertSampleData } from "@/database/repositories";

export default function RootLayout() {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null); // in js:const var = null;, holds null values

  // initialize DB
  useEffect(() => {
    async function setUpDb() {
      try {
        await InitializeDatabase();
        await insertSampleData(); // insert sample data for testing
        setIsDbReady(true);
      } catch (error: any) {
        console.error("Failed to initialize database:", error);
        setDbError(error.message || "Unknown database error");
      }
    }

    setUpDb();
  }, []);

  // Show a clean loading state while local SQLite boots up
  if (!isDbReady) {
    return (
      <View style={styles.loadingContainer}>
        {dbError ? (
          <Text style={styles.errorText}>Database Error: {dbError}</Text>
        ) : (
          <>
            <ActivityIndicator size="large" color="00B4D8" />
            <Text style={styles.loadingText}>
              Initializing Nibble Local Database...
            </Text>
          </>
        )}
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#CAF0F8", // Ocean Breeze background base
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#03045E",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#D90429",
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
