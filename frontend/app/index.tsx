import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && userData) {
        // Route based on role
        if (userData.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/user');
        }
      } else {
        // Not logged in, go to login
        setTimeout(() => {
          router.replace('/auth/login');
        }, 2000);
      }
    }
  }, [user, userData, loading]);

  return (
    <LinearGradient
      colors={['#1a0033', '#330066', '#6600cc']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#fff" />
        </View>
        <Text style={styles.title}>My Task</Text>
        <Text style={styles.subtitle}>Your Personal Learning Companion</Text>
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});
