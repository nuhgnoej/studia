// lib/db/bootstrap.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initDatabase } from ".";


const INIT_KEY = "db_initialized";

export async function ensureDatabaseInitialized() {
  const initialized = await AsyncStorage.getItem(INIT_KEY);
  if (!initialized) {
    await initDatabase();
    await AsyncStorage.setItem(INIT_KEY, "true");
    console.log("✅ Database initialized.");
  } else {
    console.log("ℹ️ Database already initialized.");
  }
}
