import { Ionicons } from "@expo/vector-icons";
import { Tabs } from 'expo-router'

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#2ECC71' }}>
            <Tabs.Screen
            name = "home"
            options = {{ 
                title: 'Home', 
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home-outline" size={size} color={color} />
                ),
            }}
        />
        
        <Tabs.Screen
            name="history"
            options={{
                title: 'History',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="time" size={size} color={color} />
                ),
            }}
        />

        <Tabs.Screen
            name="dashboard"
            options={{
                title: 'Items',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="cube" size={size} color={color} />
                ),
            }}
        />

        <Tabs.Screen
            name="profile"
            options={{
                title: 'Profile',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="person" size={size} color={color} />
                ),
            }}
        />
    </Tabs>
    );
}