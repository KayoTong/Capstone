import { checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';
import { styles } from '../src/styles/login.styles'; // Assuming you have a separate styles file for the login screen
export default function LoginScreen() { // Main login/signup screen for user authentication
  const [email, setEmail] = useState(''); //Email is a variable that holds the user's email as a string, setEmail is a function that allows the app to update or change the email, and useState is a tool that saves the changes made so the user can see what they just typed in the email input field by calling the phone's screen to refresh the current page.
  const [password, setPassword] = useState(''); // This behaves the same as the previous line of code
  const [loading, setLoading] = useState(false); //When a user clicks a button, the app will load. Loading stores whether the app is in a loading state(the app is busy:true) or the app isn't(the app is ready to be used:false). setLoading allows the app to change the loading state. useState(false) the app that it starts with the app being ready by default
  const router = useRouter(); //router is a variable that allows us to switch between different screens in our app. useRouter is a tool used to connect code with the naviagtion so we can switch between screens when certain buttons are pressed.

  const handleAuth = async (type: 'login' | 'signup') => {  // Handle both login and signup logic based on the type parameter
    if (!email || !password) return Alert.alert("Required", "Please enter email and password."); // An if statement to detect the user didn't enter any email address nor password. It will notify the user that you need to include both information
    setLoading(true); //Setting loading to true prevents the user from clicking the login or signing button multiple times while the app is still processing the first click.
    try {
      if (type === 'login') { // Attempt to sign in the user with Firebase authentication
        const cred = await signInWithEmailAndPassword(auth, email, password); //cred holds the user's credentials after they successfully signed in sufh as the user id. It proves to the app that you are officially logged in. To do this, await tell the phone to wait for the sign in process to complete while signInWithEmailandPassword is a pre-built in tool from Firebase that connects the app to Firebase for user authentication 
        // reload data for this user
        await checklistStore.loadFromDisk(cred.user.uid);
        router.replace('/home'); 
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // new user – nothing stored yet, but clear any anonymous data
        await checklistStore.clear(cred.user.uid);
        router.push('/howItWorks'); 
      }
    } catch (error: any) {
      Alert.alert("Auth Error", error.message);
    } finally {
      setLoading(false); // At the end of authentication, we set loading to false because that process was completed, and we want the user to connect to the app again.
    }
  };

  return ( // Main UI for login screen with inputs for email and password, and buttons for login and signup actions
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
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
            placeholderTextColor="#000" 
            autoCapitalize="none"
            onChangeText={setEmail} 
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed-outline" size={20} color="#2ECC71" style={styles.icon} />
          <TextInput 
            placeholder="Password" 
            style={styles.input} 
            placeholderTextColor="#000" 
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
