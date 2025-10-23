import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function Compiler() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('# Write your code here\nprint("Hello, World!")');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const languages = [
    { id: 'python', name: 'Python', icon: 'logo-python', sample: '# Write your code here\nprint("Hello, World!")' },
    { id: 'javascript', name: 'JavaScript', icon: 'logo-javascript', sample: '// Write your code here\nconsole.log("Hello, World!");' },
    { id: 'java', name: 'Java', icon: 'logo-java', sample: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
    { id: 'cpp', name: 'C++', icon: 'code', sample: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
    { id: 'c', name: 'C', icon: 'code', sample: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  ];

  const selectLanguage = (langId: string) => {
    const lang = languages.find((l) => l.id === langId);
    if (lang) {
      setLanguage(langId);
      setCode(lang.sample);
      setOutput('');
    }
  };

  const runCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please write some code first');
      return;
    }

    setLoading(true);
    setOutput('Running code...');

    try {
      // Using JDoodle API for code execution
      const response = await fetch('https://api.jdoodle.com/v1/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: '89cba5f9e5bdc8857d0c2d4679fb6b34', // Public demo key
          clientSecret: 'caf727efea77d0b2e670d8b9cf57b0f4e16e0433f01d6fd9c46f44428a2e21f', // Public demo key
          script: code,
          language: language === 'cpp' ? 'cpp17' : language === 'c' ? 'c' : language,
          versionIndex: '0',
        }),
      });

      const result = await response.json();
      
      if (result.output) {
        setOutput(result.output);
      } else if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput('No output generated');
      }
    } catch (error) {
      console.error('Compiler error:', error);
      setOutput(`Error: ${error}`);
      Alert.alert('Error', 'Failed to execute code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Code Compiler</Text>
        <Text style={styles.subtitle}>Practice your programming skills</Text>

        <Text style={styles.label}>Select Language:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.languageScroll}
        >
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[
                styles.languageButton,
                language === lang.id && styles.selectedLanguageButton,
              ]}
              onPress={() => selectLanguage(lang.id)}
            >
              <Ionicons
                name={lang.icon as any}
                size={24}
                color={language === lang.id ? '#fff' : '#999'}
              />
              <Text
                style={[
                  styles.languageButtonText,
                  language === lang.id && styles.selectedLanguageText,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <Ionicons name="code-slash" size={20} color="#667eea" />
            <Text style={styles.editorTitle}>Code Editor</Text>
          </View>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            multiline
            placeholder="Write your code here..."
            placeholderTextColor="#666"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={styles.runButton}
          onPress={runCode}
          disabled={loading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="#fff" />
                <Text style={styles.runButtonText}>Run Code</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.outputContainer}>
          <View style={styles.outputHeader}>
            <Ionicons name="terminal" size={20} color="#43e97b" />
            <Text style={styles.outputTitle}>Output</Text>
          </View>
          <ScrollView style={styles.outputScroll}>
            <Text style={styles.outputText}>{output || 'Output will appear here...'}</Text>
          </ScrollView>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  languageScroll: {
    marginBottom: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedLanguageButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  languageButtonText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 8,
  },
  selectedLanguageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editorContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  editorTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  codeInput: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    padding: 15,
    minHeight: 250,
  },
  runButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  outputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(67, 233, 123, 0.3)',
    minHeight: 200,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(67, 233, 123, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(67, 233, 123, 0.2)',
  },
  outputTitle: {
    color: '#43e97b',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  outputScroll: {
    padding: 15,
    maxHeight: 200,
  },
  outputText: {
    color: '#43e97b',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
