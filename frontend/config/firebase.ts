import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;
