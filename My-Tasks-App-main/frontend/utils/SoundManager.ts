import { Audio } from 'expo-av';
import { Platform, Alert } from 'react-native';

class SoundManager {
  private static loginSound: Audio.Sound | null = null;
  private static notificationSound: Audio.Sound | null = null;
  private static taskCompleteSound: Audio.Sound | null = null;

  static async init() {
    try {
      // First try loading from public folder for web
      if (Platform.OS === 'web') {
        try {
          console.log('Loading sounds from web public folder...');
          const [loginSound, notificationSound, taskCompleteSound] = await Promise.all([
            Audio.Sound.createAsync('/login.mp3', { shouldPlay: false }),
            Audio.Sound.createAsync('/notification.mp3', { shouldPlay: false }),
            Audio.Sound.createAsync('/notification.mp3', { shouldPlay: false }), // Using notification sound for task complete
          ]);

          this.loginSound = loginSound.sound;
          this.notificationSound = notificationSound.sound;
          this.taskCompleteSound = taskCompleteSound.sound;
          console.log('Successfully loaded sounds from web public folder');
          return;
        } catch (webError) {
          console.error('Error loading sounds from web public folder:', webError);
        }
      }

      // For mobile platforms or if web loading failed, try from assets
      try {
        console.log('Loading sounds from assets...');
        // Use require for mobile platforms
        const loginSoundModule = require('../assets/sounds/login.mp3');
        const notificationSoundModule = require('../assets/sounds/notification.mp3');

        const [loginSound, notificationSound, taskCompleteSound] = await Promise.all([
          Audio.Sound.createAsync(loginSoundModule, { shouldPlay: false }),
          Audio.Sound.createAsync(notificationSoundModule, { shouldPlay: false }),
          Audio.Sound.createAsync(notificationSoundModule, { shouldPlay: false }), // Using notification sound for task complete
        ]);

        this.loginSound = loginSound.sound;
        this.notificationSound = notificationSound.sound;
        this.taskCompleteSound = taskCompleteSound.sound;
        console.log('Successfully loaded sounds from assets');
      } catch (assetError) {
        console.error('Error loading sounds from assets:', assetError);

        // If both methods fail, provide a more helpful error message
        console.warn('Sound files may be missing or corrupted. Please ensure valid MP3 files exist in the public and assets directories.');
      }
    } catch (error) {
      console.error('Error initializing sounds:', error);
    }
  }

  static async playLoginSound() {
    try {
      if (this.loginSound) {
        await this.loginSound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing login sound:', error);
    }
  }

  static async playNotificationSound() {
    try {
      if (this.notificationSound) {
        await this.notificationSound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  static async playTaskCompleteSound() {
    try {
      if (this.taskCompleteSound) {
        await this.taskCompleteSound.replayAsync();
      }
    } catch (error) {
      console.error('Error playing task complete sound:', error);
    }
  }

  static async sendNotification(title: string, body: string, data?: any) {
    try {
      // Play notification sound
      await this.playNotificationSound();

      // Show alert on mobile platforms
      if (Platform.OS !== 'web') {
        Alert.alert(title, body);
      } else {
        // For web, use browser notification if available
        if (typeof window !== 'undefined' && 'Notification' in window) {
          // Check if permission is granted
          if (Notification.permission === 'granted') {
            new Notification(title, { body });
          } else if (Notification.permission !== 'denied') {
            // Request permission
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification(title, { body });
              }
            });
          }
        } else {
          console.log('Browser notifications not supported');
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  static async cleanup() {
    try {
      if (this.loginSound) {
        await this.loginSound.unloadAsync();
      }
      if (this.notificationSound) {
        await this.notificationSound.unloadAsync();
      }
      if (this.taskCompleteSound) {
        await this.taskCompleteSound.unloadAsync();
      }
    } catch (error) {
      console.error('Error cleaning up sounds:', error);
    }
  }
}

export default SoundManager;
