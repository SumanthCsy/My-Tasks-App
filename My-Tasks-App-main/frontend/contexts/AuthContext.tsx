import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SoundManager from '../utils/SoundManager';

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
    // Initialize sound manager
    SoundManager.init();
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
    try {
      // Check if it's admin trying to login
      if (email === 'admin@mytasks.com' && password === 'mytasks@admin') {
        try {
          // Try to create admin account first
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
          setUser(userCredential.user);
          setUserData(adminData);
          await SoundManager.playLoginSound();
          return;
        } catch (createError: any) {
          // If account already exists, continue with normal login
          if (createError.code !== 'auth/email-already-in-use') {
            throw createError;
          }
        }
      }

      // Normal login (including admin if account exists)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        if (data.isBlocked) {
          await signOut(auth);
          throw new Error('Your account has been blocked. Please contact admin.');
        }
        setUser(userCredential.user);
        setUserData(data);
        await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
        await AsyncStorage.setItem('userData', JSON.stringify(data));
        await SoundManager.playLoginSound();
        
        // Notify admin about new user login (only for regular users)
        if (data.role === 'user') {
          // Find admin user by role instead of hardcoded ID
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const adminUser = usersSnapshot.docs.find(doc => doc.data().role === 'admin');
          
          if (adminUser) {
            await SoundManager.sendNotification(
              'New User Login',
              `${data.name} has just logged in`,
              { type: 'user_login', userId: data.uid }
            );
          }
        }
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
        setUser(userCredential.user);
        setUserData(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        await SoundManager.playLoginSound();
        

      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password');
      }
      throw error;
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
