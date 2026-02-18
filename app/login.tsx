import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import {styles} from './login.styles'; // Assuming you have a separate styles file for the login screen
export default function LoginScreen() { // Main login/signup screen for user authentication
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {  // Handle both login and signup logic based on the type parameter
    if (!email || !password) return Alert.alert("Required", "Please enter email and password.");
    setLoading(true);
    try {
      if (type === 'login') { // Attempt to sign in the user with Firebase authentication
        await signInWithEmailAndPassword(auth, email, password);
        router.replace('/home'); 
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push('/howItWorks'); 
      }
    } catch (error: any) {
      Alert.alert("Auth Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return ( // Main UI for login screen with inputs for email and password, and buttons for login and signup actions
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2ECC71" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in to protect your essentials.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Ionicons name="mail-outline" size={20} color="#2ECC71" style={styles.icon} />
          <TextInput 
            placeholder="Email" 
            style={styles.input} 
            placeholderTextColor="#555" 
            autoCapitalize="none"
            onChangeText={setEmail} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#2ECC71" style={styles.icon} />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            placeholderTextColor="#555" 
            secureTextEntry 
            onChangeText={setPassword} 
          />
        </View>

        <TouchableOpacity 
          style={[styles.mainBtn, loading && { opacity: 0.7 }]} 
          onPress={() => handleAuth('login')}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? "Connecting..." : "Login"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signupBtn} 
          onPress={() => handleAuth('signup')}
          disabled={loading}
        >
          <Text style={styles.signupText}>New user? <Text style={styles.greenText}>Create Account</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

//  (Andy) i added styles for the login screen in a separate file called login.styles.ts to keep the login.tsx file cleaner and more focused on the logic and structure of the component.
