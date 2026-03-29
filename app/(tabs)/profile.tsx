// Created '(tabs)' folder to group pages from tab bar into a uniform
// navigation that the user can navigate through

import { checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../../firebaseConfig';
import { styles } from '../../src/styles/login.styles';

export default function ProfileScreen() { // Main profile screen for user settings and profile picture management
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);
  const profileKey = (uid?: string) => `profilePicUri_${uid || auth.currentUser?.uid || 'anon'}`;

  useEffect(() => { // Load user profile data on component mount
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
      }
      const storedUri = await AsyncStorage.getItem(profileKey(user?.uid)); // Load profile picture URI from storage 
      if (storedUri) {
        setProfilePicUri(storedUri);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => { // Handle profile picture selection and storage
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ // Open image picker
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) { // If user selected an image, save its URI to state and storage
      const uri = result.assets[0].uri;
      setProfilePicUri(uri);
      await AsyncStorage.setItem(profileKey(), uri);
    }
  };

  const updateEmailHandler = async () => { // Handle email update with Firebase authentication
    if (!email) return;
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'User not found');
        return;
      }
      await updateEmail(user, email);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const updatePasswordHandler = async () => { // Handle password update with reauthentication for security
    if (!password || !currentPassword) {
      Alert.alert('Error', 'Please enter both current and new password');
      return;
    }
    try {
      const user = auth.currentUser; 
      if (!user || !user.email) {
        Alert.alert('Error', 'User not found');
        return;
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Now update the password
      await updatePassword(user, password);
      Alert.alert('Success', 'Password updated successfully');
      setPassword('');
      setCurrentPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return ( // Main UI for profile screen with sections for profile picture, email, and password management
    <ScrollView style={{ flex: 1, backgroundColor: '#6B7A74', padding: 20, paddingTop: 60 }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>Profile Settings</Text>
      </View>

      {/* Profile Picture */}
      <View style={{ alignItems: 'center', marginBottom: 30 }}>
        <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
          {profilePicUri ? (
            <Image source={{ uri: profilePicUri }} style={{ width: 100, height: 100, borderRadius: 50 }} />
          ) : (
            <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0e0d0', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person" size={40} color="#666" />
            </View>
          )}
          <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2ECC71', borderRadius: 15, padding: 5 }}>
            <Ionicons name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={{ marginTop: 10, color: '#fff' }}>Tap to change profile picture</Text>
      </View>

      {/* Email */}
      <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Email
      </Text>

      <View style={styles.inputGroup}>
        <Ionicons name="mail-outline" 
                  size={20} 
                  color="#2ECC71" 
                  style={styles.icon}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#000"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity onPress={updateEmailHandler} style={styles.mainBtn}>
        <Text style={styles.btnText}>Update Email</Text>
      </TouchableOpacity>

      {/* Password */}
      <Text style = {{ 
        fontSize: 18, 
        color: '#fff', 
        fontWeight: 'bold', 
        marginBottom: 16,
        marginTop: 10
        }}
      >
        Change Password
      </Text>

      <Text style = {{ 
        fontSize: 14, 
        color: '#fff', 
        fontWeight: 'bold', 
        marginBottom: 8,
      }}
      >
        Current Password
      </Text>

      <View style={[styles.inputGroup, {marginBottom: 18}]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#2ECC71"
          style={styles.icon}
      />
      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter Current Password"
        placeholderTextColor="#000"
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
      </View>

      <Text
        style={{
          fontSize: 14,
          color: '#fff',
          fontWeight: 'bold',
          marginBottom: 8,
        }}
      >
        New Password
      </Text>

      <View style={[styles.inputGroup, { marginBottom: 20 }]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#2ECC71"
          style={styles.icon}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter New Password"
        placeholderTextColor="#000"
        secureTextEntry
        style={styles.input}
        autoCapitalize="none"
      />
    </View>

    <TouchableOpacity onPress={updatePasswordHandler} style={styles.mainBtn}>
      <Text style={styles.btnText}>Update Password</Text>
    </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity onPress={async () => {
          await auth.signOut();
          await checklistStore.clear();
          // also clear stored picture so next user starts fresh
          await AsyncStorage.removeItem(profileKey());
          router.replace('/');
        }} style={{ backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 40 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}