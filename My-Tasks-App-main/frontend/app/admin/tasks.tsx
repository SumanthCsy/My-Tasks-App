import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useRouter } from 'expo-router';
import NotFoundScreen from '../components/NotFoundScreen';

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  isProgramming: boolean;
  language?: string;
  premium: boolean;
}

interface Task {
  id: string;
  courseId: string;
  title: string;
  description: string;
  status?: string;
  order?: number;
}

export default function AdminTasks() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      setCourses(coursesData);

      const tasksSnap = await getDocs(collection(db, 'tasks'));
      const tasksData = tasksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading data:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskTitle || !taskDescription || !selectedCourse) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      // Get the current highest order for tasks in this course
      const courseTasks = tasks.filter(task => task.courseId === selectedCourse);
      const highestOrder = courseTasks.length > 0 
        ? Math.max(...courseTasks.map(task => task.order || 0))
        : 0;

      await addDoc(collection(db, 'tasks'), {
        title: taskTitle,
        description: taskDescription,
        courseId: selectedCourse,
        status: 'active',
        order: highestOrder + 1,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Task added successfully');
      resetTaskForm();
      setShowTaskModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'Failed to add task');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !taskTitle || !taskDescription) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      await updateDoc(doc(db, 'tasks', editingTask.id), {
        title: taskTitle,
        description: taskDescription,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Task updated successfully');
      resetTaskForm();
      setShowEditTaskModal(false);
      setEditingTask(null);
      loadData();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tasks', taskId));
              Alert.alert('Success', 'Task deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setShowEditTaskModal(true);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setSelectedCourse('');
  };

  const getTasksByCourse = (courseId: string) => {
    return tasks
      .filter((task) => task.courseId === courseId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getCourseById = (courseId: string) => {
    return courses.find((course) => course.id === courseId);
  };

  if (notFound) {
    return (
      <NotFoundScreen 
        message="Could not load tasks. Please try again later."
        buttonText="Go to Dashboard"
        onButtonPress={() => router.push('/admin')}
      />
    );
  }

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Tasks</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tasks by Course</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTaskModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#667eea" />
            </TouchableOpacity>
          </View>

          {courses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={60} color="#666" />
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          ) : (
            courses.map((course) => {
              const courseTasks = getTasksByCourse(course.id);
              return (
                <View key={course.id} style={styles.courseSection}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
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

                  {courseTasks.length === 0 ? (
                    <Text style={styles.noTasksText}>No tasks for this course</Text>
                  ) : (
                    courseTasks.map((task) => (
                      <View key={task.id} style={styles.taskCard}>
                        <View style={styles.taskInfo}>
                          <Ionicons name="document-text" size={20} color="#667eea" />
                          <View style={styles.taskDetails}>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            <Text style={styles.taskDescription}>{task.description}</Text>
                          </View>
                        </View>
                        <View style={styles.taskActions}>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => openEditTaskModal(task)}
                          >
                            <Ionicons name="pencil" size={18} color="#667eea" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteTask(task.id)}
                          >
                            <Ionicons name="trash" size={18} color="#ff6b6b" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Task Modal */}
      <Modal visible={showTaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              placeholderTextColor="#999"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              placeholderTextColor="#999"
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Select Course:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {courses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseOption,
                    selectedCourse === course.id && styles.selectedCourse,
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                >
                  <Text style={styles.courseOptionText}>{course.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTaskModal(false);
                  resetTaskForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddTask}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Add Task</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={showEditTaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Title"
              placeholderTextColor="#999"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Task Description"
              placeholderTextColor="#999"
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              numberOfLines={4}
            />

            {editingTask && (
              <Text style={styles.courseLabel}>
                Course: {getCourseById(editingTask.courseId)?.title}
              </Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                  resetTaskForm();
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleEditTask}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    padding: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
  },
  courseSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  courseHeader: {
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
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
  noTasksText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 15,
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
  taskActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  courseLabel: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  courseOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 15,
  },
  selectedCourse: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  courseOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientButton: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});