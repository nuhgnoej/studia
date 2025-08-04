// components/ArchiveList.tsx

import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { commonArchiveStyles } from "@/styles/archiveStyle";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export type ArchiveItem = {
  id: string;
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
  storagePath: string;
};

type Props = {
  data: ArchiveItem[];
  onRefresh: () => void;
  refreshing: boolean;
  onImport: (json: any) => void;
};

export default function ArchiveList({
  data,
  onRefresh,
  refreshing,
  onImport,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = data.filter(
    (item) => item.title.includes(query) || item.uploader.includes(query)
  );

  const handleDownload = async (item: ArchiveItem) => {
    try {
      setLoadingId(item.id);
      const fileRef = ref(storage, item.storagePath);
      const url = await getDownloadURL(fileRef);
      const localUri = `${FileSystem.documentDirectory}${item.title}.json`;
      const downloadRes = await FileSystem.downloadAsync(url, localUri);

      const content = await FileSystem.readAsStringAsync(downloadRes.uri);
      const json = JSON.parse(content);

      onImport(json);
    } catch (err) {
      console.error("다운로드 실패:", err);
      Alert.alert(
        "다운로드 실패",
        "파일 다운로드 또는 업로드 중 문제가 발생했습니다."
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleShare = async (item: ArchiveItem) => {
    try {
      setLoadingId(item.id);
      const fileRef = ref(storage, item.storagePath);
      const url = await getDownloadURL(fileRef);
      const localUri = `${FileSystem.documentDirectory}${item.title}.json`;
      const downloadRes = await FileSystem.downloadAsync(url, localUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri);
      } else {
        Alert.alert("공유 불가", "이 디바이스에서 공유를 지원하지 않습니다.");
      }
    } catch (err) {
      console.error("공유 실패:", err);
      Alert.alert("공유 실패", "파일 공유 중 문제가 발생했습니다.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View style={commonArchiveStyles.searchContainer}>
          <View style={commonArchiveStyles.searchInputWrapper}>
            <MaterialIcons
              name="search"
              size={20}
              color="#999"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="문제 제목 또는 업로더 검색"
              placeholderTextColor="#999"
              value={query}
              onChangeText={setQuery}
              style={commonArchiveStyles.searchInput}
            />
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View style={commonArchiveStyles.card}>
          <View style={{ flex: 1 }}>
            <Text style={commonArchiveStyles.title}>{item.title}</Text>
            <Text style={commonArchiveStyles.desc}>{item.description}</Text>
            <Text style={commonArchiveStyles.meta}>
              📦 {item.questionsCount}문제 · 업로더: {item.uploader}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TouchableOpacity
              style={commonArchiveStyles.downloadBtn}
              onPress={() => handleDownload(item)}
            >
              {loadingId === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="file-download" size={20} color="white" />
                  <Text style={{ color: "white", marginLeft: 6 }}>
                    다운로드
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={commonArchiveStyles.downloadBtn}
              onPress={() => handleShare(item)}
            >
              {loadingId === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="share" size={20} color="white" />
                  <Text style={{ color: "white", marginLeft: 6 }}>
                    공유하기
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
