// Primary action button component.
// we are creating a reusable button component for primary actions in our application.

import { Pressable, Text, StyleSheet } from "react-native";

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#22C55E", // green
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
// This component can be used throughout the app for any primary action buttons.