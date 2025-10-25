import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useBackHandler } from '../../utils/useBackHandler';
import SoundManager from '../../utils/SoundManager';

export default function WebCompiler() {
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const webViewRef = React.useRef<WebView>(null);
  const router = useRouter();
  const trophyScale = React.useRef(new Animated.Value(0)).current;

  // Handle back button - go back in WebView if possible, otherwise go to admin dashboard
  useBackHandler({
    onBack: () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      router.push('/admin');
      return true;
    }
  });

  // Reset WebView when component mounts to prevent navigation issues
  React.useEffect(() => {
    setWebViewKey(prev => prev + 1);
  }, []);

  const handleCompleteTask = () => {
    setShowCompleteModal(true);
    // Play task complete sound
    SoundManager.playTaskCompleteSound();
    // Animate trophy
    Animated.spring(trophyScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    trophyScale.setValue(0);
  };

  // JavaScript to inject for theme customization
  const injectedJavaScript = `
    (function() {
      // Apply dark theme to Programiz compiler
      const style = document.createElement('style');
      style.textContent =
        "body, .container, .editor-container, .output-container {" +
        "  background-color: #24243e !important;" +
        "  color: #fff !important;" +
        "}" +
        ".editor-container, .output-container {" +
        "  border-color: rgba(255, 255, 255, 0.2) !important;" +
        "}" +
        ".output-container {" +
        "  border-color: rgba(67, 233, 123, 0.3) !important;" +
        "}" +
        ".code-editor {" +
        "  background-color: rgba(0, 0, 0, 0.3) !important;" +
        "  color: #fff !important;" +
        "}" +
        ".header, .footer {" +
        "  background-color: #302b63 !important;" +
        "  color: #fff !important;" +
        "}" +
        "button, .run-button {" +
        "  background: linear-gradient(to right, #667eea, #764ba2) !important;" +
        "  color: #fff !important;" +
        "}";
      document.head.appendChild(style);

      // Handle all link clicks to stay within WebView
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link) {
          e.preventDefault();
          window.location.href = link.href;
        }
      }, true);

      // Hide unnecessary elements
      const elementsToHide = [
        '.header-right',
        '.sidebar',
        '.mobile-top-bar',
        '.mobile-nav-btn',
        '.footer',
        '.ads-container',
        '.header-wrapper .logo-wrapper',
        '.header-wrapper .searchbar-wrapper',
      ];

      elementsToHide.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (el) el.style.display = 'none';
        });
      });

      // Adjust main container
      const mainContainer = document.querySelector('.container');
      if (mainContainer) {
        mainContainer.style.padding = '10px';
        mainContainer.style.maxWidth = '100%';
      }

      // Make editor take full width
      const editorContainer = document.querySelector('.editor-container');
      if (editorContainer) {
        editorContainer.style.width = '100%';
      }

      true; // Required for injectedJavaScript to work properly
    })();
  `;

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Programming Compiler</Text>
          <Text style={styles.subtitle}>Compile Your Code Here</Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading compiler...</Text>
        </View>
      )}

      <WebView
        key={webViewKey}
        ref={webViewRef}
        source={{ uri: 'https://www.programiz.com/c-programming/online-compiler/' }}
        style={[styles.webView, isLoading && styles.hidden]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onShouldStartLoadWithRequest={(request) => {
          // Allow all navigation but handle it within the WebView
          return true;
        }}
        onError={(error) => {
          console.log('WebView Error:', error);
          setIsLoading(false);
        }}
        onHttpError={(error) => {
          console.log('WebView HTTP Error:', error);
          setIsLoading(false);
        }}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteTask}
        >
          <LinearGradient
            colors={['#43e97b', '#38f9d7']}
            style={styles.gradientButton}
          >
            <Ionicons name="trophy" size={24} color="#fff" />
            <Text style={styles.buttonText}>Complete Task</Text>
          </LinearGradient>
        </TouchableOpacity>

        {canGoBack && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              if (webViewRef.current) {
                webViewRef.current.goBack();
              }
            }}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.gradientButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.buttonText}>Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Complete Task Modal */}
      <Modal visible={showCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View style={[styles.trophyContainer, { transform: [{ scale: trophyScale }] }]}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </Animated.View>
            <Text style={styles.completeTitle}>Task Completed!</Text>
            <Text style={styles.completeMessage}>Congratulations on completing your programming task!</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeCompleteModal}>
              <LinearGradient
                colors={['#43e97b', '#38f9d7']}
                style={styles.closeGradient}
              >
                <Text style={styles.closeButtonText}>Continue</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hidden: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 12, 41, 0.7)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  completeButton: {
    borderRadius: 15,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 5,
  },
  navButton: {
    borderRadius: 15,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#43e97b',
  },
  trophyContainer: {
    marginBottom: 20,
  },
  trophyEmoji: {
    fontSize: 80,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  completeMessage: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  closeButton: {
    borderRadius: 15,
    overflow: 'hidden',
    minWidth: 150,
  },
  closeGradient: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
