import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, collection, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useBackHandler } from '../../utils/useBackHandler';

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  isProgramming: boolean;
  language?: string;
  premium: boolean;
  content?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  courseId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  completed?: boolean;
}

interface CourseProgress {
  courseId: string;
  userId: string;
  completed: boolean;
  completedAt?: string;
  progress: number; // 0-100
  tasksCompleted: number;
  totalTasks: number;
}

export default function CourseDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userData } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle back button - go to courses explore
  useBackHandler({
    onBack: () => {
      router.push('/courses/explore');
      return true;
    }
  });

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      if (!id) {
        Alert.alert('Error', 'Course not found');
        router.push('/courses/explore');
        return;
      }

      const courseDoc = await getDoc(doc(db, 'courses', id as string));
      if (courseDoc.exists()) {
        const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
        
        // Check if user has access to premium content
        if (courseData.premium && !userData?.premiumAccess) {
          Alert.alert('Premium Content', 'This course requires premium access');
          router.push('/courses/explore');
          return;
        }
        
        setCourse(courseData);
        
        // Load tasks for this course
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        const courseTasks = tasksSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Task))
          .filter(task => task.courseId === id);
        setTasks(courseTasks);

        // Load course progress for this user
        if (userData) {
          const progressDoc = await getDoc(doc(db, 'courseProgress', `${userData.uid}_${id}`));
          if (progressDoc.exists()) {
            setCourseProgress(progressDoc.data() as CourseProgress);
          } else {
            // Create initial progress
            const initialProgress: CourseProgress = {
              courseId: id as string,
              userId: userData.uid,
              completed: false,
              progress: 0,
              tasksCompleted: 0,
              totalTasks: courseTasks.length,
            };
            await setDoc(doc(db, 'courseProgress', `${userData.uid}_${id}`), initialProgress);
            setCourseProgress(initialProgress);
          }
        }
      } else {
        Alert.alert('Error', 'Course not found');
        router.push('/courses/explore');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Error', 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const markCourseCompleted = async () => {
    if (!userData || !courseProgress) return;

    try {
      const updatedProgress: CourseProgress = {
        ...courseProgress,
        completed: true,
        completedAt: new Date().toISOString(),
        progress: 100,
      };

      await updateDoc(doc(db, 'courseProgress', `${userData.uid}_${id}`), updatedProgress);
      setCourseProgress(updatedProgress);
      
      Alert.alert(
        'Congratulations! 🎉',
        `You have successfully completed "${course?.title}"!`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error marking course as completed:', error);
      Alert.alert('Error', 'Failed to mark course as completed');
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    if (!userData || !courseProgress) return;

    try {
      // Toggle task completion status
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTasks(updatedTasks);

      // Update course progress
      const completedTasks = updatedTasks.filter(task => task.completed).length;
      const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      const updatedProgress: CourseProgress = {
        ...courseProgress,
        tasksCompleted: completedTasks,
        progress: Math.round(progress),
        completed: completedTasks === tasks.length,
        completedAt: completedTasks === tasks.length ? new Date().toISOString() : undefined,
      };

      await updateDoc(doc(db, 'courseProgress', `${userData.uid}_${id}`), updatedProgress);
      setCourseProgress(updatedProgress);

      if (completedTasks === tasks.length && tasks.length > 0) {
        Alert.alert(
          'Great Job! 🎉',
          'You have completed all tasks! You can now mark this course as completed.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error updating task completion:', error);
      Alert.alert('Error', 'Failed to update task completion');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </LinearGradient>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/courses/explore')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image 
              source={require('../../public/taskslogo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.courseHeader}>
          <Text style={styles.title}>{course.title}</Text>
          <View style={styles.badges}>
            {course.isProgramming && (
              <View style={styles.badge}>
                <Ionicons name="code" size={16} color="#667eea" />
                <Text style={styles.badgeText}>{course.language}</Text>
              </View>
            )}
            {course.premium && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Ionicons name="star" size={16} color="#ffd700" />
                <Text style={styles.badgeText}>Premium</Text>
              </View>
            )}
            {courseProgress?.completed && (
              <View style={[styles.badge, styles.completedBadge]}>
                <Ionicons name="checkmark-circle" size={16} color="#43e97b" />
                <Text style={styles.badgeText}>Completed</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{course.description}</Text>
          
          {/* Progress Section */}
          {courseProgress && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progress</Text>
                <Text style={styles.progressText}>
                  {courseProgress.tasksCompleted}/{courseProgress.totalTasks} tasks completed
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${courseProgress.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>{courseProgress.progress}%</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.contentTitle}>Course Content</Text>
          <Text style={styles.contentText}>{course.content || 'Content coming soon...'}</Text>
        </View>

        {/* Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#667eea" />
            <Text style={styles.tasksTitle}>Course Tasks</Text>
            <Text style={styles.tasksCount}>({tasks.length})</Text>
          </View>
          
          {tasks.length > 0 ? (
            <View style={styles.tasksList}>
              {tasks.map((task, index) => (
                <TouchableOpacity key={task.id} style={styles.taskCard}>
                  <LinearGradient
                    colors={['rgba(102, 126, 234, 0.2)', 'rgba(118, 75, 162, 0.2)']}
                    style={styles.taskGradient}
                  >
                    <View style={styles.taskHeader}>
                      <TouchableOpacity 
                        style={styles.taskCheckbox}
                        onPress={() => toggleTaskCompletion(task.id)}
                      >
                        <Ionicons 
                          name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={task.completed ? "#43e97b" : "#999"} 
                        />
                      </TouchableOpacity>
                      <View style={styles.taskNumber}>
                        <Text style={styles.taskNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.completed && styles.completedTaskTitle]}>
                          {task.title}
                        </Text>
                        <Text style={[styles.taskDescription, task.completed && styles.completedTaskDescription]} numberOfLines={2}>
                          {task.description}
                        </Text>
                      </View>
                      <View style={styles.taskBadges}>
                        <View style={[styles.difficultyBadge, styles[`${task.difficulty}Badge`]]}>
                          <Text style={styles.difficultyText}>{task.difficulty}</Text>
                        </View>
                        <View style={styles.pointsBadge}>
                          <Ionicons name="star" size={16} color="#ffd700" />
                          <Text style={styles.pointsText}>{task.points}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.taskFooter}>
                      <TouchableOpacity
                        style={styles.startTaskButton}
                        onPress={() => {
                          if (course.isProgramming) {
                            router.push('/user/webCompiler');
                          } else {
                            // Handle non-programming tasks if needed
                            console.log('Non-programming task clicked');
                          }
                        }}
                      >
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          style={styles.startTaskGradient}
                        >
                          <Ionicons name="play" size={16} color="#fff" />
                          <Text style={styles.startTaskText}>Start Task</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      {task.completed && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark" size={16} color="#43e97b" />
                          <Text style={styles.completedText}>Completed</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noTasksContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#999" />
              <Text style={styles.noTasksText}>No tasks available yet</Text>
              <Text style={styles.noTasksSubtext}>Tasks will be added soon!</Text>
            </View>
          )}
        </View>

        {/* Course Completion Button */}
        {courseProgress && !courseProgress.completed && tasks.length > 0 && (
          <View style={styles.completionSection}>
            <TouchableOpacity 
              style={styles.completeCourseButton}
              onPress={markCourseCompleted}
              disabled={courseProgress.tasksCompleted < tasks.length}
            >
              <LinearGradient
                colors={courseProgress.tasksCompleted === tasks.length ? ['#43e97b', '#38d9a9'] : ['#999', '#666']}
                style={styles.completeCourseGradient}
              >
                <Ionicons 
                  name="trophy" 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.completeCourseText}>
                  {courseProgress.tasksCompleted === tasks.length 
                    ? 'Mark Course as Completed' 
                    : `Complete ${tasks.length - courseProgress.tasksCompleted} more tasks`
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  courseHeader: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  badges: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 10,
  },
  premiumBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  completedBadge: {
    backgroundColor: 'rgba(67, 233, 123, 0.2)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  progressSection: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#43e97b',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#43e97b',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  tasksSection: {
    marginTop: 30,
  },
  tasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tasksTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  tasksCount: {
    fontSize: 16,
    color: '#999',
    marginLeft: 5,
  },
  tasksList: {
    gap: 15,
  },
  taskCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
  },
  taskGradient: {
    padding: 20,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  taskNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  taskNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
    marginRight: 15,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  taskBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  easyBadge: {
    backgroundColor: 'rgba(67, 233, 123, 0.3)',
  },
  mediumBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
  },
  hardBadge: {
    backgroundColor: 'rgba(220, 53, 69, 0.3)',
  },
  difficultyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startTaskButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  startTaskGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 5,
  },
  startTaskText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(67, 233, 123, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  completedText: {
    color: '#43e97b',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
  },
  noTasksText: {
    fontSize: 18,
    color: '#999',
    marginTop: 15,
    fontWeight: '600',
  },
  noTasksSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskCheckbox: {
    marginRight: 10,
    padding: 2,
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  completedTaskDescription: {
    opacity: 0.7,
  },
  completionSection: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  completeCourseButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  completeCourseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 10,
  },
  completeCourseText: {
    color: '#fff',
    fontSize: 16,
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
  },
});