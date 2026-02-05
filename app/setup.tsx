import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import PrimaryButton from "@/src/components/buttons/PrimaryButton";
// Setup screen prompting user to add their first essential item.
export default function SetupScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#0B0F0E", padding: 24 }}>
      <View style={{ paddingTop: 120 }}>
        <Text style={{ color: "#22C55E", marginBottom: 8 }}>
          Step 1 of 2
        </Text>

        <Text style={{ fontSize: 32, fontWeight: "700", color: "white" }}>
          Set Up Your Essentials
        </Text>

        <Text
          style={{
            color: "#9CA3AF",
            fontSize: 16,
            marginTop: 12,
            marginBottom: 40,
          }}
        >
          Add your first essential item so we can remind you before you leave
          home.
        </Text>

        <PrimaryButton
          title="Add First Item"
          onPress={() => router.push("/addItem")}
        />
      </View>
    </View>
  );
}
