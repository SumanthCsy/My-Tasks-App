import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useRouter } from 'expo-router';
import { useBackHandler } from '../../utils/useBackHandler';

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

export default function ExploreCourses() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle back button - go to home screen
  useBackHandler({
    onBack: () => {
      router.push('/');
      return true;
    }
  });

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
      setCourses(coursesData);
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image 
              source={require('../../public/taskslogo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Explore Courses</Text>
          </View>
        </View>

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
                  <TouchableOpacity
                    key={course.id}
                    style={styles.courseCard}
                    onPress={() => router.push(`/courses/${course.id}`)}
                  >
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
                          <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={16} color="#ffd700" />
                          </View>
                        )}
                      </View>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                      <Text style={styles.courseDescription} numberOfLines={2}>
                        {course.description}
                      </Text>
                      <TouchableOpacity style={styles.startButton}>
                        <Text style={styles.startButtonText}>Learn More</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
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
  premiumBadge: {
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
    gap: 5,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 15,
  },
});