import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

class PermissionsManager {
  static async requestNotificationPermissions() {
    if (Platform.OS === 'web') {
      // Web platform uses browser notifications
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
          } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
          }
        }
        return true;
      }
      return false;
    } else {
      // Mobile platforms use expo-notifications
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // Only ask if permissions have not already been determined
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        return finalStatus === 'granted';
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return false;
      }
    }
  }

  static async requestCameraPermissions() {
    try {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      return cameraStatus === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async requestMediaLibraryPermissions() {
    try {
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return mediaLibraryStatus === 'granted';
    } catch (error) {
      console.error('Error requesting media library permissions:', error);
      return false;
    }
  }

  static async requestAllPermissions() {
    const notificationPermission = await this.requestNotificationPermissions();
    const cameraPermission = await this.requestCameraPermissions();
    const mediaLibraryPermission = await this.requestMediaLibraryPermissions();

    return {
      notifications: notificationPermission,
      camera: cameraPermission,
      mediaLibrary: mediaLibraryPermission
    };
  }
}

export default PermissionsManager;