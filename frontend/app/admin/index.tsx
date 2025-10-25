import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import SoundManager from '../../utils/SoundManager';

export default function AdminDashboard() {
  const router = useRouter();
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalCategories: 0,
    activeUsers: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Use Promise.all to fetch all collections in parallel for better performance
      const [usersSnap, coursesSnap, categoriesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'categories'))
      ]);

      // Calculate active users (not blocked)
      const activeUsers = usersSnap.docs.filter(
        (doc) => doc.data() && !doc.data().isBlocked
      ).length;

      console.log('Stats loaded:', {
        users: usersSnap.size,
        courses: coursesSnap.size,
        categories: categoriesSnap.size
      });
      
      setStats({
        totalUsers: usersSnap.size,
        totalCourses: coursesSnap.size,
        totalCategories: categoriesSnap.size,
        activeUsers,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userData?.name}!</Text>
          <Text style={styles.subGreeting}>Welcome to Admin Dashboard</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="people" size={40} color="#fff" />
                <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={['#f093fb', '#f5576c']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="book" size={40} color="#fff" />
                <Text style={styles.statNumber}>{stats.totalCourses}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="folder" size={40} color="#fff" />
                <Text style={styles.statNumber}>{stats.totalCategories}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.statGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="checkmark-circle" size={40} color="#fff" />
                <Text style={styles.statNumber}>{stats.activeUsers}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/courses/add')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="add-circle" size={30} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Add Course</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/categories/add')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="folder-open" size={30} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Add Category</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/users')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={30} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Manage Users</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/admin/tasks')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="list" size={30} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Manage Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={async () => {
                try {
                  // Play notification sound and send notification
                  await SoundManager.playNotificationSound();
                  await SoundManager.sendNotification(
                    'Task Reminder',
                    'You have pending tasks to complete!',
                    { type: 'task_reminder' }
                  );
                } catch (error) {
                  console.error('Error sending notification:', error);
                }
              }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="notifications" size={30} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Send Reminder</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  actionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
