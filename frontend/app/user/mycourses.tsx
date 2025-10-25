import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Task {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  isProgramming: boolean;
  language?: string;
  premium: boolean;
}

export default function MyCourses() {
  const { userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<{ [key: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      // Filter courses based on premium access
      const filteredCourses = coursesData.filter(
        (course) => !course.premium || userData?.premiumAccess
      );
      setCourses(filteredCourses);

      // Load tasks for each course
      const tasksData: { [key: string]: Task[] } = {};
      for (const course of filteredCourses) {
        const tasksSnap = await getDocs(
          query(collection(db, 'tasks'), where('courseId', '==', course.id))
        );
        tasksData[course.id] = tasksSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
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
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>{courses.length} courses available</Text>

        {courses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={80} color="#666" />
            <Text style={styles.emptyText}>No courses available yet</Text>
          </View>
        ) : (
          courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <TouchableOpacity
                style={styles.courseHeader}
                onPress={() => toggleCourse(course.id)}
              >
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDescription}>{course.description}</Text>
                  <View style={styles.badges}>
                    {course.isProgramming && (
                      <View style={styles.badge}>
                        <Ionicons name="code" size={12} color="#667eea" />
                        <Text style={styles.badgeText}>{course.language}</Text>
                      </View>
                    )}
                    {course.premium && (
                      <View style={[styles.badge, styles.premiumBadge]}>
                        <Ionicons name="star" size={12} color="#ffd700" />
                        <Text style={styles.badgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={expandedCourse === course.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>

              {expandedCourse === course.id && (
                <View style={styles.tasksContainer}>
                  <Text style={styles.tasksTitle}>Tasks:</Text>
                  {tasks[course.id]?.length > 0 ? (
                    tasks[course.id].map((task) => (
                      <View key={task.id} style={styles.taskCard}>
                        <View style={styles.taskInfo}>
                          <Ionicons name="document-text" size={20} color="#667eea" />
                          <View style={styles.taskDetails}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <Text style={styles.taskDescription}>{task.description}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={styles.viewButton}>
                          <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noTasksText}>No tasks available yet</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
  },
  tasksContainer: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  taskDetails: {
    marginLeft: 10,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
  },
  viewButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noTasksText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
