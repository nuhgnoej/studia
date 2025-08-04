// components/ArchiveList.tsx

import {
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { commonArchiveStyles } from "@/styles/archiveStyle";

export type ArchiveItem = {
  id: string;
  title: string;
  uploader: string;
  description: string;
  questionsCount: number;
};

type Props = {
  data: ArchiveItem[];
  onRefresh: () => void;
  refreshing: boolean;
};

export default function ArchiveList({ data, onRefresh, refreshing }: Props) {
  const [query, setQuery] = useState("");

  const filtered = data.filter(
    (item) => item.title.includes(query) || item.uploader.includes(query)
  );

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
          <TouchableOpacity
            style={commonArchiveStyles.downloadBtn}
            onPress={() => {
              Alert.alert("아카이브 다운로드 서비스는 구현 중입니다.");
            }}
          >
            <MaterialIcons name="file-download" size={20} color="white" />
            <Text style={{ color: "white", marginLeft: 6 }}>다운로드</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}
