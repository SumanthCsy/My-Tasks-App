import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  type?: 'alert' | 'success' | 'error' | 'form';
  inputs?: Array<{
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  }>;
}

const { width } = Dimensions.get('window');

export default function CustomDialog({
  visible,
  title,
  message,
  onClose,
  buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }],
  type = 'alert',
  inputs = [],
}: CustomDialogProps) {
  // Determine gradient colors based on dialog type
  const getGradientColors = () => {
    switch (type) {
      case 'success':
        return ['#43e97b', '#38f9d7'];
      case 'error':
        return ['#ff6b6b', '#ee5a6f'];
      case 'form':
        return ['#667eea', '#764ba2'];
      default:
        return ['#302b63', '#24243e'];
    }
  };

  // Get icon based on dialog type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={50} color="#fff" />;
      case 'error':
        return <Ionicons name="alert-circle" size={50} color="#fff" />;
      case 'form':
        return <Ionicons name="create-outline" size={50} color="#fff" />;
      default:
        return <Ionicons name="information-circle" size={50} color="#fff" />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialogContainer}>
              <LinearGradient
                colors={getGradientColors()}
                style={styles.dialog}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconContainer}>{getIcon()}</View>
                <Text style={styles.title}>{title}</Text>
                {message && <Text style={styles.message}>{message}</Text>}

                {inputs.length > 0 && (
                  <View style={styles.inputsContainer}>
                    {inputs.map((input, index) => (
                      <View key={index} style={styles.inputWrapper}>
                        <Text style={styles.inputLabel}>{input.label}</Text>
                        <TextInput
                          style={styles.input}
                          value={input.value}
                          onChangeText={input.onChangeText}
                          placeholder={input.placeholder}
                          placeholderTextColor="rgba(255, 255, 255, 0.5)"
                          secureTextEntry={input.secureTextEntry}
                          keyboardType={input.keyboardType || 'default'}
                        />
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.buttonsContainer}>
                  {buttons.map((button, index) => {
                    const buttonStyle =
                      button.style === 'destructive'
                        ? styles.destructiveButton
                        : button.style === 'cancel'
                        ? styles.cancelButton
                        : styles.defaultButton;

                    const textStyle =
                      button.style === 'destructive'
                        ? styles.destructiveButtonText
                        : button.style === 'cancel'
                        ? styles.cancelButtonText
                        : styles.defaultButtonText;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.button, buttonStyle]}
                        onPress={() => {
                          button.onPress();
                          if (button.style !== 'cancel') {
                            onClose();
                          }
                        }}
                      >
                        <Text style={[styles.buttonText, textStyle]}>{button.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </LinearGradient>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: width * 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dialog: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  defaultButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.7)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  defaultButtonText: {
    color: '#fff',
  },
  cancelButtonText: {
    color: '#ccc',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});