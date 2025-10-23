import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  photoURL?: string;
  isBlocked?: boolean;
  premiumAccess?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, photoURL?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    // Check if it's admin trying to login for first time
    if (email === 'admin@mytasks.com' && password === 'mytasks@admin') {
      try {
        // Try to create admin account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await updateProfile(userCredential.user, {
          displayName: 'Sumanth Csy'
        });

        const adminData: UserData = {
          uid: userCredential.user.uid,
          email: 'admin@mytasks.com',
          name: 'Sumanth Csy',
          role: 'admin',
          isBlocked: false,
          premiumAccess: true,
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), adminData);
        setUserData(adminData);
        return;
      } catch (createError: any) {
        // If account already exists, continue with normal login
        if (createError.code !== 'auth/email-already-in-use') {
          throw createError;
        }
      }
    }

    // Normal login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      if (data.isBlocked) {
        await signOut(auth);
        throw new Error('Your account has been blocked. Please contact admin.');
      }
      setUserData(data);
    } else {
      // If user document doesn't exist, create it
      const userData: UserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email || '',
        name: userCredential.user.displayName || 'User',
        role: 'user',
        isBlocked: false,
        premiumAccess: false,
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setUserData(userData);
    }
  };

  const signup = async (email: string, password: string, name: string, photoURL?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: photoURL || null
    });

    const userData: UserData = {
      uid: userCredential.user.uid,
      email: email,
      name: name,
      role: 'user',
      photoURL: photoURL || '',
      isBlocked: false,
      premiumAccess: false
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    setUserData(userData);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    await AsyncStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
