import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, userData } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user && userData) {
      if (userData.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/user');
      }
    }
  }, [user, userData]);

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
          </View>
          <Text style={styles.title}>My Task</Text>
          <Text style={styles.tagline}>Your Personal Learning Companion</Text>
          <Text style={styles.description}>
            Master new skills, complete tasks, and grow with our comprehensive learning platform
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <LinearGradient
              colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
              style={styles.featureGradient}
            >
              <Ionicons name="book" size={40} color="#667eea" />
              <Text style={styles.featureTitle}>Structured Courses</Text>
              <Text style={styles.featureDescription}>
                Learn from organized courses designed for your success
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.featureCard}>
            <LinearGradient
              colors={['rgba(240, 147, 251, 0.3)', 'rgba(245, 87, 108, 0.3)']}
              style={styles.featureGradient}
            >
              <Ionicons name="code-slash" size={40} color="#f093fb" />
              <Text style={styles.featureTitle}>In-App Compiler</Text>
              <Text style={styles.featureDescription}>
                Practice coding in multiple programming languages
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.featureCard}>
            <LinearGradient
              colors={['rgba(67, 233, 123, 0.3)', 'rgba(56, 249, 215, 0.3)']}
              style={styles.featureGradient}
            >
              <Ionicons name="trophy" size={40} color="#43e97b" />
              <Text style={styles.featureTitle}>Track Progress</Text>
              <Text style={styles.featureDescription}>
                Monitor your learning journey and achievements
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>Login</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.signupButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Designed & Developed By ❤️ Sumanth Csy</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 20,
    color: '#667eea',
    marginBottom: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
  },
  featureGradient: {
    padding: 25,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  ctaSection: {
    marginBottom: 40,
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  signupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
});