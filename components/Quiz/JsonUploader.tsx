// components/JsonUploader.tsx

import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Button, View, Alert } from "react-native";

export default function JsonUploader({
  onJsonParsed,
}: {
  onJsonParsed: (data: any) => void;
}) {
  const pickJsonFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/json",
      });

      if (res.canceled || !res.assets?.[0]) return;

      const uri = res.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      const parsed = JSON.parse(content);

      onJsonParsed(parsed);
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("파일 업로드 실패", err.message);
      } else {
        Alert.alert("파일 업로드 실패", "알 수 없는 오류입니다.");
      }
    }
  };

  return (
    <View>
      <Button title="JSON 파일 업로드" onPress={pickJsonFile} />
    </View>
  );
}
