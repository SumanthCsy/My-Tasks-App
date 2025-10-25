import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useBackHandler } from '../../utils/useBackHandler';

export default function AdminLayout() {
  const router = useRouter();
  
  // Handle back button - go to home screen
  useBackHandler({
    onBack: () => {
      router.push('/');
      return true;
    }
  });
  
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#16213e',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerLeft: () => (
          <TouchableOpacity 
            style={{ marginLeft: 15 }}
            onPress={() => router.push('/')}
          >
            <Ionicons name="home" size={24} color="#667eea" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="webCompiler"
        options={{
          title: 'Compiler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="code-slash" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/');
          },
        }}
      />
    </Tabs>
  );
}
