import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  isProgramming: boolean;
  language?: string;
  premium: boolean;
}

interface CourseProgress {
  courseId: string;
  userId: string;
  completed: boolean;
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
}

export default function UserDashboard() {
  const { userData } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseProgress, setCourseProgress] = useState<{ [key: string]: CourseProgress }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoriesData);

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

      // Load course progress for each course
      const progressData: { [key: string]: CourseProgress } = {};
      if (userData) {
        for (const course of filteredCourses) {
          const progressDoc = await getDoc(doc(db, 'courseProgress', `${userData.uid}_${course.id}`));
          if (progressDoc.exists()) {
            progressData[course.id] = progressDoc.data() as CourseProgress;
          }
        }
      }
      setCourseProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesByCategory = (categoryId: string) => {
    return courses.filter((course) => course.categoryId === categoryId);
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
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userData?.name}!</Text>
          <Text style={styles.subGreeting}>Let's continue learning</Text>
        </View>

        {userData?.premiumAccess && (
          <View style={styles.premiumCard}>
            <LinearGradient
              colors={['#ffd700', '#ffed4e']}
              style={styles.premiumGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={30} color="#000" />
              <Text style={styles.premiumText}>Premium Member</Text>
            </LinearGradient>
          </View>
        )}

        <Text style={styles.sectionTitle}>Categories</Text>
        {categories.map((category) => {
          const categoryCourses = getCoursesByCategory(category.id);
          if (categoryCourses.length === 0) return null;

          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Ionicons name={category.icon as any} size={24} color="#667eea" />
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.coursesScroll}
              >
                {categoryCourses.map((course) => (
                  <TouchableOpacity key={course.id} style={styles.courseCard}>
                    <LinearGradient
                      colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
                      style={styles.courseGradient}
                    >
                      <View style={styles.courseContent}>
                        {course.isProgramming && (
                          <View style={styles.languageBadge}>
                            <Ionicons name="code" size={16} color="#667eea" />
                            <Text style={styles.languageText}>{course.language}</Text>
                          </View>
                        )}
                        {course.premium && (
                          <View style={styles.premiumCourseBadge}>
                            <Ionicons name="star" size={16} color="#ffd700" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseDescription} numberOfLines={2}>
                        {course.description}
                      </Text>
                      <TouchableOpacity
                        style={styles.startButton}
                        onPress={() => {
                          router.push(`/courses/${course.id}`);
                        }}
                      >
                        <Text style={styles.startButtonText}>Start Learning</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                      </TouchableOpacity>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}
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
    marginBottom: 20,
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
  premiumCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  premiumGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  premiumText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  coursesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  courseCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  courseGradient: {
    padding: 20,
    minHeight: 200,
  },
  courseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  languageText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  premiumCourseBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 15,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
});
