import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NotFoundScreenProps {
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function NotFoundScreen({
  message = 'The page you are looking for does not exist',
  buttonText = 'Go Back',
  onButtonPress,
}: NotFoundScreenProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      router.back();
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
            style={styles.iconBackground}
          >
            <Ionicons name="alert-circle-outline" size={80} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    width: '60%',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});