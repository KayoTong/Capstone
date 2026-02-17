import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) return Alert.alert("Required", "Please enter email and password.");
    setLoading(true);
    try {
      if (type === 'login') {
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

  return (
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 30, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 25 },
  header: { marginBottom: 40 },
  title: { color: 'white', fontSize: 42, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 8 },
  form: { width: '100%' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1a12', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#1a2e21' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'white', paddingVertical: 18, fontSize: 16 },
  mainBtn: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  btnText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 18 },
  signupBtn: { marginTop: 25, alignItems: 'center' },
  signupText: { color: '#888', fontSize: 15 },
  greenText: { color: '#2ECC71', fontWeight: 'bold' }
});