// components/JsonUploadFAB.tsx
import { useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export default function JsonUploadFAB({
  onUpload,
}: {
  onUpload: (data: any) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const handlePress = async () => {
    try {
      setUploading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (res.canceled || !res.assets?.[0]) return;

      const uri = res.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      const parsed = JSON.parse(content);

      await onUpload(parsed);
    } catch (err) {
      Alert.alert(
        "업로드 실패",
        err instanceof Error ? err.message : "알 수 없는 오류"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={handlePress}
      disabled={uploading}
      activeOpacity={0.8}
    >
      {uploading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <MaterialIcons name="add" size={28} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    backgroundColor: "#007aff",
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
