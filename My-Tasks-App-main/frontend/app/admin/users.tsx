import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  isBlocked?: boolean;
  premiumAccess?: boolean;
  role: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersData = usersSnap.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData.filter((u) => u.role !== 'admin'));
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isBlocked: !currentStatus,
      });
      Alert.alert('Success', `User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling user block:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        premiumAccess: !currentStatus,
      });
      Alert.alert('Success', `Premium access ${!currentStatus ? 'granted' : 'revoked'}`);
      loadUsers();
    } catch (error) {
      console.error('Error toggling premium:', error);
      Alert.alert('Error', 'Failed to update premium status');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Manage Users</Text>
        <Text style={styles.subtitle}>{users.length} registered users</Text>

        {users.map((user) => (
          <View key={user.uid} style={styles.userCard}>
            <View style={styles.userInfo}>
              {user.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={30} color="#999" />
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.badges}>
                  {user.premiumAccess && (
                    <View style={styles.premiumBadge}>
                      <Ionicons name="star" size={12} color="#ffd700" />
                      <Text style={styles.badgeText}>Premium</Text>
                    </View>
                  )}
                  {user.isBlocked && (
                    <View style={styles.blockedBadge}>
                      <Ionicons name="ban" size={12} color="#ff6b6b" />
                      <Text style={styles.badgeText}>Blocked</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, user.isBlocked && styles.activeButton]}
                onPress={() => toggleBlockUser(user.uid, user.isBlocked || false)}
              >
                <Ionicons
                  name={user.isBlocked ? 'checkmark-circle' : 'ban'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, user.premiumAccess && styles.premiumButton]}
                onPress={() => togglePremium(user.uid, user.premiumAccess || false)}
              >
                <Ionicons name="star" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: '#999',
    marginTop: 3,
  },
  badges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.5)',
  },
  premiumButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
  },
});
