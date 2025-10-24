import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [sidebarVisible, setSidebarVisible] = useState(false);

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

  // Handle explore courses navigation
  const handleExploreCourses = () => {
    if (user && userData) {
      router.push('/courses/explore');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#302b63', '#24243e']}
      style={styles.container}
    >
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setSidebarVisible(true)}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section with New Logo */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../public/taskslogo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
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

        {/* Explore Courses CTA */}
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={handleExploreCourses}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="compass" size={24} color="#fff" />
            <Text style={styles.exploreButtonText}>Explore Courses</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Designed & Developed By ❤️ Sumanth Csy</Text>
        </View>
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal
        visible={sidebarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
          />
          <View style={styles.sidebar}>
            <LinearGradient
              colors={['#1a1a2e', '#16213e']}
              style={styles.sidebarContent}
            >
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                <View style={styles.sidebarLogo}>
                  <Image 
                    source={require('../public/taskslogo.png')} 
                    style={styles.sidebarLogoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.sidebarTitle}>My Task</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSidebarVisible(false)}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Sidebar Menu */}
              <ScrollView style={styles.sidebarMenu}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/auth/login');
                  }}
                >
                  <Ionicons name="log-in-outline" size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    router.push('/auth/signup');
                  }}
                >
                  <Ionicons name="person-add-outline" size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>Create Account</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setSidebarVisible(false);
                    handleExploreCourses();
                  }}
                >
                  <Ionicons name="compass-outline" size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>Explore Courses</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="information-circle-outline" size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>About</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <Ionicons name="help-circle-outline" size={24} color="#667eea" />
                  <Text style={styles.menuItemText}>Help & Support</Text>
                </TouchableOpacity>
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    padding: 15,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  techIcon: {
    marginLeft: 10,
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
    marginBottom: 30,
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
  exploreButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  exploreButtonText: {
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
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '80%',
    maxWidth: 320,
  },
  sidebarContent: {
    flex: 1,
  },
  sidebarHeader: {
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sidebarLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  sidebarMenu: {
    flex: 1,
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 10,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  sidebarLogoImage: {
    width: 60,
    height: 60,
  },
});