import * as Notifications from 'expo-notifications';

class PermissionsManager {
  /**
   * Request notification permissions from the user
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if permission was granted
   */
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only ask for permission if not already determined
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Configure notification settings if permissions granted
      if (finalStatus === 'granted') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule a local notification
   * @param {string} title - The notification title
   * @param {string} body - The notification body text
   * @param {Date} scheduledTime - When to show the notification
   * @returns {Promise<string>} The notification identifier
   */
  static async scheduleNotification(
    title: string,
    body: string,
    scheduledTime: Date
  ): Promise<string> {
    try {
      const hasPermission = await this.requestNotificationPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: scheduledTime,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param {string} notificationId - The ID of the notification to cancel
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
      throw error;
    }
  }
}

export default PermissionsManager;