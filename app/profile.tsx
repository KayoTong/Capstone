import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function ProfileScreen() { // Main profile screen for user settings and profile picture management
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  useEffect(() => { // Load user profile data on component mount
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email || '');
      }
      const storedUri = await AsyncStorage.getItem('profilePicUri'); // Load profile picture URI from storage 
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
      await AsyncStorage.setItem('profilePicUri', uri);
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
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Profile Settings</Text>
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
        <Text style={{ marginTop: 10, color: '#666' }}>Tap to change profile picture</Text>
      </View>

      {/* Email */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={updateEmailHandler} style={{ backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Update Email</Text>
      </TouchableOpacity>

      {/* Password */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Change Password</Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Current Password</Text>
      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 15 }}
        autoCapitalize="none"
      />
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>New Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        secureTextEntry
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 10 }}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={updatePasswordHandler} style={{ backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Update Password</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity onPress={async () => { await auth.signOut(); router.replace('/'); }} style={{ backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}