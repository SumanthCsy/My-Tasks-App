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
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
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

export default function AdminCourses() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  // Category form
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('folder');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Course form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isProgramming, setIsProgramming] = useState(false);
  const [programmingLanguage, setProgrammingLanguage] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const programmingLanguages = [
    'C',
    'C++',
    'Java',
    'JavaScript',
    'Python',
    'Go',
    'Rust',
    'Ruby',
  ];

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

  const handleAddCategory = async () => {
    if (!categoryName) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    try {
      await addDoc(collection(db, 'categories'), {
        name: categoryName,
        icon: categoryIcon,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Category added successfully');
      setCategoryName('');
      setCategoryIcon('folder');
      setShowCategoryModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }

    try {
      await updateDoc(doc(db, 'categories', editingCategory.id), {
        name: categoryName,
        icon: categoryIcon,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Category updated successfully');
      setCategoryName('');
      setCategoryIcon('folder');
      setEditingCategory(null);
      setShowEditCategoryModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Check if there are courses using this category
    const coursesWithCategory = courses.filter(course => course.categoryId === categoryId);
    
    if (coursesWithCategory.length > 0) {
      Alert.alert(
        'Cannot Delete',
        'This category has courses assigned to it. Please reassign or delete those courses first.'
      );
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'categories', categoryId));
              Alert.alert('Success', 'Category deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleAddCourse = async () => {
    if (!courseTitle || !courseDescription || !selectedCategory) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (isProgramming && !programmingLanguage) {
      Alert.alert('Error', 'Please select a programming language');
      return;
    }

    try {
      await addDoc(collection(db, 'courses'), {
        title: courseTitle,
        description: courseDescription,
        categoryId: selectedCategory,
        isProgramming,
        language: isProgramming ? programmingLanguage : null,
        premium: isPremium,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Course added successfully');
      resetCourseForm();
      setShowCourseModal(false);
      loadData();
    } catch (error) {
      console.error('Error adding course:', error);
      Alert.alert('Error', 'Failed to add course');
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !courseTitle || !courseDescription || !selectedCategory) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (isProgramming && !programmingLanguage) {
      Alert.alert('Error', 'Please select a programming language');
      return;
    }

    try {
      await updateDoc(doc(db, 'courses', editingCourse.id), {
        title: courseTitle,
        description: courseDescription,
        categoryId: selectedCategory,
        isProgramming,
        language: isProgramming ? programmingLanguage : null,
        premium: isPremium,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Course updated successfully');
      resetCourseForm();
      setEditingCourse(null);
      setShowEditCourseModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating course:', error);
      Alert.alert('Error', 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this course? This will also delete all associated tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'courses', courseId));
              Alert.alert('Success', 'Course deleted successfully');
              loadData();
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
            }
          },
        },
      ]
    );
  };

  const resetCourseForm = () => {
    setCourseTitle('');
    setCourseDescription('');
    setSelectedCategory('');
    setIsProgramming(false);
    setProgrammingLanguage('');
    setIsPremium(false);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon);
    setShowEditCategoryModal(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseDescription(course.description);
    setSelectedCategory(course.categoryId);
    setIsProgramming(course.isProgramming);
    setProgrammingLanguage(course.language || '');
    setIsPremium(course.premium);
    setShowEditCourseModal(true);
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#667eea" />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category.id} style={styles.categoryCard}>
                <Ionicons name={category.icon as any} size={24} color="#667eea" />
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openEditCategoryModal(category)}
                  >
                    <Ionicons name="pencil" size={16} color="#667eea" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteCategory(category.id)}
                  >
                    <Ionicons name="trash" size={16} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Courses</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCourseModal(true)}
            >
              <Ionicons name="add-circle" size={28} color="#667eea" />
            </TouchableOpacity>
          </View>

          {courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseDescription}>{course.description}</Text>
                <View style={styles.courseBadges}>
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
              <View style={styles.courseActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditCourseModal(course)}
                >
                  <Ionicons name="pencil" size={18} color="#667eea" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteCourse(course.id)}
                >
                  <Ionicons name="trash" size={18} color="#ff6b6b" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.tasksButton]}
                  onPress={() => router.push('/admin/tasks')}
                >
                  <Ionicons name="list" size={18} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              placeholderTextColor="#999"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleAddCategory}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Add</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Course Modal */}
      <Modal visible={showCourseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Course</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Course Title"
                placeholderTextColor="#999"
                value={courseTitle}
                onChangeText={setCourseTitle}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Course Description"
                placeholderTextColor="#999"
                value={courseDescription}
                onChangeText={setCourseDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Select Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === cat.id && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsProgramming(!isProgramming)}
              >
                <Ionicons
                  name={isProgramming ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#667eea"
                />
                <Text style={styles.checkboxLabel}>Programming Course</Text>
              </TouchableOpacity>

              {isProgramming && (
                <View>
                  <Text style={styles.label}>Select Language:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {programmingLanguages.map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.languageOption,
                          programmingLanguage === lang && styles.selectedLanguage,
                        ]}
                        onPress={() => setProgrammingLanguage(lang)}
                      >
                        <Text style={styles.languageText}>{lang}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsPremium(!isPremium)}
              >
                <Ionicons
                  name={isPremium ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#ffd700"
                />
                <Text style={styles.checkboxLabel}>Premium Course</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowCourseModal(false);
                    resetCourseForm();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleAddCourse}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Add Course</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal visible={showEditCategoryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              placeholderTextColor="#999"
              value={categoryName}
              onChangeText={setCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowEditCategoryModal(false);
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryIcon('folder');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleEditCategory}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Course Modal */}
      <Modal visible={showEditCourseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Course</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Course Title"
                placeholderTextColor="#999"
                value={courseTitle}
                onChangeText={setCourseTitle}
              />
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Course Description"
                placeholderTextColor="#999"
                value={courseDescription}
                onChangeText={setCourseDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Select Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      selectedCategory === cat.id && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsProgramming(!isProgramming)}
              >
                <Ionicons
                  name={isProgramming ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#667eea"
                />
                <Text style={styles.checkboxLabel}>Programming Course</Text>
              </TouchableOpacity>

              {isProgramming && (
                <View>
                  <Text style={styles.label}>Select Language:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {programmingLanguages.map((lang) => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.languageOption,
                          programmingLanguage === lang && styles.selectedLanguage,
                        ]}
                        onPress={() => setProgrammingLanguage(lang)}
                      >
                        <Text style={styles.languageText}>{lang}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setIsPremium(!isPremium)}
              >
                <Ionicons
                  name={isPremium ? 'checkbox' : 'square-outline'}
                  size={24}
                  color="#ffd700"
                />
                <Text style={styles.checkboxLabel}>Premium Course</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditCourseModal(false);
                    setEditingCourse(null);
                    resetCourseForm();
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleEditCourse}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
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
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  categoryActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 5,
    right: 5,
  },
  categoryName: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
  courseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  courseBadges: {
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
  courseActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  tasksButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
  categoryOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 15,
  },
  selectedCategory: {
    backgroundColor: '#667eea',
  },
  categoryOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 15,
  },
  selectedLanguage: {
    backgroundColor: '#667eea',
  },
  languageText: {
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
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
  },
});
