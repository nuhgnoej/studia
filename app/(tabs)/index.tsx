// index.tsx
import { questionFileMap } from "@/lib/questionFileMap";
import { useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const backgroundSource = require("../../assets/backgrounds/background-home.png");

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (filename: string, name: string) => {
    router.push(`/subject/${filename}?name=${name}`);
  };

  return (
    <ImageBackground
      source={backgroundSource}
      style={styles.background}
      imageStyle={{ opacity: 0.1 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>과목 선택(JSON)</Text>
        {Object.entries(questionFileMap).map(([filename, { name }]) => (
          <Pressable
            key={filename}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => handlePress(filename, name)}
          >
            <Text style={styles.buttonText}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  buttonText: {
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
});
