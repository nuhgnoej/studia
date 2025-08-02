import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
//@ts-ignore
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgS2-Ek5go3oQuRhcjoKlLe9e198nLEbI",
  authDomain: "studia-32dc7.firebaseapp.com",
  projectId: "studia-32dc7",
  storageBucket: "studia-32dc7.firebasestorage.app",
  messagingSenderId: "258669826284",
  appId: "1:258669826284:web:f5367caffa0b2693a9d5c9",
  measurementId: "G-CKH518D8MC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
