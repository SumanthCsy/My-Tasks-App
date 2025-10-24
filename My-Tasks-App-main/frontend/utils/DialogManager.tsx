import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomDialog from '../app/components/CustomDialog';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

interface DialogContextType {
  showSuccessDialog: (title: string, message: string) => void;
  showErrorDialog: (title: string, message: string) => void;
  showEditProfileDialog: (userData: any, onSuccess: () => void) => void;
  showChangePasswordDialog: () => void;
  showLoginSuccessDialog: () => void;
  showNotificationDialog: (title: string, message: string) => void;
  showHelpSupportDialog: (message: string) => void;
  showLogoutConfirmationDialog: (onConfirm: () => Promise<void>) => void;
}

const DialogContext = createContext<DialogContextType>({} as DialogContextType);

export const useDialog = () => useContext(DialogContext);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState<any>({});

  // Show success dialog
  const showSuccessDialog = (title: string, message: string) => {
    setDialogProps({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
    });
    setDialogVisible(true);
  };

  // Show error dialog
  const showErrorDialog = (title: string, message: string) => {
    setDialogProps({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
    });
    setDialogVisible(true);
  };

  // Show login success dialog
  const showLoginSuccessDialog = () => {
    setDialogProps({
      title: 'Welcome Back',
      message: '',
      type: 'success',
      buttons: [{ text: 'Continue', onPress: () => {}, style: 'default' }],
    });
    setDialogVisible(true);
  };

  // Show edit profile dialog
  const showEditProfileDialog = (userData: any, onSuccess: () => void) => {
    // Initialize with userData values
    let currentName = userData?.name || '';
    let currentPhotoURL = userData?.photoURL || '';
    
    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showErrorDialog('Permission Required', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        currentPhotoURL = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // Update dialog with new photo URL
        updateDialogInputs();
      }
    };

    const updateProfile = async () => {
      if (!currentName.trim()) {
        showErrorDialog('Error', 'Name cannot be empty');
        return;
      }

      try {
        // Update user document in Firestore
        await updateDoc(doc(db, 'users', userData.uid), {
          name: currentName,
          photoURL: currentPhotoURL,
        });

        showSuccessDialog('Profile Updated', 'Your profile has been updated successfully!');
        onSuccess();
      } catch (error: any) {
        showErrorDialog('Update Failed', error.message || 'Failed to update profile');
      }
    };
    
    const updateDialogInputs = () => {
      setDialogProps({
        title: 'Edit Profile',
        type: 'form',
        inputs: [
          {
            label: 'Name',
            value: currentName,
            onChangeText: (text: string) => {
              currentName = text;
              updateDialogInputs();
            },
            placeholder: 'Enter your name',
          },
          {
            label: 'Profile Picture',
            value: currentPhotoURL ? 'Image selected' : 'No image selected',
            onChangeText: () => {},
            placeholder: 'Select an image',
            readOnly: true,
          },
        ],
        buttons: [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Select Image', onPress: pickImage, style: 'default' },
          { text: 'Save', onPress: updateProfile, style: 'default' },
        ],
      });
    };
    
    // Initial dialog setup
    updateDialogInputs();
    setDialogVisible(true);
  };

  // Show change password dialog
  const showChangePasswordDialog = () => {
    // Use regular variables instead of useState hooks
    let currentPassword = '';
    let newPassword = '';
    let confirmPassword = '';

    const changePassword = async () => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        showErrorDialog('Error', 'Please fill in all fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        showErrorDialog('Error', 'New passwords do not match');
        return;
      }

      if (newPassword.length < 6) {
        showErrorDialog('Error', 'Password must be at least 6 characters');
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          showErrorDialog('Error', 'User not authenticated');
          return;
        }

        // Re-authenticate user before changing password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Change password
        await updatePassword(user, newPassword);

        showSuccessDialog('Password Updated', 'Your password has been changed successfully!');
      } catch (error: any) {
        let errorMessage = 'Failed to change password';
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Current password is incorrect';
        }
        showErrorDialog('Update Failed', errorMessage);
      }
    };

    // Function to update dialog inputs when values change
    const updateDialogInputs = () => {
      setDialogProps({
        title: 'Change Password',
        type: 'form',
        inputs: [
          {
            label: 'Current Password',
            value: currentPassword,
            onChangeText: (text: string) => {
              currentPassword = text;
              updateDialogInputs();
            },
            placeholder: 'Enter current password',
            secureTextEntry: true,
          },
          {
            label: 'New Password',
            value: newPassword,
            onChangeText: (text: string) => {
              newPassword = text;
              updateDialogInputs();
            },
            placeholder: 'Enter new password',
            secureTextEntry: true,
          },
          {
            label: 'Confirm New Password',
            value: confirmPassword,
            onChangeText: (text: string) => {
              confirmPassword = text;
              updateDialogInputs();
            },
            placeholder: 'Confirm new password',
            secureTextEntry: true,
          },
        ],
        buttons: [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { text: 'Change Password', onPress: changePassword, style: 'default' },
        ],
      });
    };
    
    // Initial dialog setup
    updateDialogInputs();
    setDialogVisible(true);
  };

  // Show notification dialog
  const showNotificationDialog = (title: string, message: string) => {
    setDialogProps({
      title,
      message,
      type: 'alert',
      buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
    });
    setDialogVisible(true);
  };

  // Show help & support dialog
  const showHelpSupportDialog = (message: string) => {
    setDialogProps({
      title: 'Help & Support',
      message,
      type: 'alert',
      buttons: [{ text: 'OK', onPress: () => {}, style: 'default' }],
    });
    setDialogVisible(true);
  };

  // Show logout confirmation dialog
  const showLogoutConfirmationDialog = (onConfirm: () => Promise<void>) => {
    setDialogProps({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'alert',
      buttons: [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'Logout', onPress: onConfirm, style: 'destructive' },
      ],
    });
    setDialogVisible(true);
  };

  return (
    <DialogContext.Provider
      value={{
        showSuccessDialog,
        showErrorDialog,
        showEditProfileDialog,
        showChangePasswordDialog,
        showLoginSuccessDialog,
        showNotificationDialog,
        showHelpSupportDialog,
        showLogoutConfirmationDialog,
      }}
    >
      {children}
      <CustomDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        {...dialogProps}
      />
    </DialogContext.Provider>
  );
};