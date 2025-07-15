import { Text, View } from "react-native";

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: "red", fontWeight: "bold" }}>{message}</Text>
    </View>
  );
}
