import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyArHOrWQlucQjB-U9umIihIGwSl2W60LLU",
  authDomain: "task-ea208.firebaseapp.com",
  projectId: "task-ea208",
  storageBucket: "task-ea208.firebasestorage.app",
  messagingSenderId: "192619876703",
  appId: "1:192619876703:web:b75723bf6449d2782c26ea",
  measurementId: "G-6CMYXK53N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    // For web, use default auth (browserLocalPersistence is default)
    auth = getAuth(app);
  } else {
    // For React Native, use AsyncStorage persistence
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} catch (error) {
  // If auth already initialized, just get it
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
