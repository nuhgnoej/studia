import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { commonArchiveStyles } from "../../styles/archiveStyle";

const mockData = [
  {
    id: "1",
    title: "복합발전운전원 기출 세트 2024",
    uploader: "odineyes",
    description: "2024년 기출을 기반으로 구성된 복합 발전 문제 세트입니다.",
    questionsCount: 120,
  },
  {
    id: "2",
    title: "전기이론 기본 세트",
    uploader: "user123",
    description: "전기이론 개념 및 계산 문제 위주로 구성된 세트입니다.",
    questionsCount: 80,
  },
  {
    id: "3",
    title: "전기기기 핵심 문제 세트",
    uploader: "elecMaster",
    description: "변압기, 유도기, 동기기 등 전기기기 문제 수록.",
    questionsCount: 95,
  },
  {
    id: "4",
    title: "제어공학 연습 문제 세트",
    uploader: "ctl_engineer",
    description: "제어 시스템 해석 및 제어기 설계 관련 문제 모음.",
    questionsCount: 100,
  },
  {
    id: "5",
    title: "전력공학 기출 세트",
    uploader: "powertest",
    description: "송배전, 발전 방식, 안정도 관련 기출 위주 세트.",
    questionsCount: 110,
  },
  {
    id: "6",
    title: "전기설비 기준 세트",
    uploader: "user456",
    description: "전기설비 기술기준과 판단기준 중심 문제집.",
    questionsCount: 70,
  },
  {
    id: "7",
    title: "기출 + 예상 문제 종합 세트",
    uploader: "smartquiz",
    description: "최근 출제경향 기반 예상 문제 포함한 종합 세트.",
    questionsCount: 150,
  },
  {
    id: "8",
    title: "전기응용 및 전기전자기초 세트",
    uploader: "elecEdu",
    description: "기초 회로, 전자 기초 문제 포함.",
    questionsCount: 85,
  },
  {
    id: "9",
    title: "기사 대비 실전 모의고사 세트",
    uploader: "examplus",
    description: "전기기사 실전 대비용 모의고사 구성.",
    questionsCount: 200,
  },
  {
    id: "10",
    title: "전기직 공무원 대비 세트",
    uploader: "govprep",
    description: "공무원 시험 대비를 위한 전기 문제 정리.",
    questionsCount: 140,
  },
  {
    id: "11",
    title: "기초 이론 완성 세트",
    uploader: "beginner123",
    description: "처음 공부하는 사람을 위한 쉬운 설명 중심 세트.",
    questionsCount: 60,
  },
];

export default function CommunityArchive() {
  return (
    <View style={commonArchiveStyles.container}>
      {/* 문제 카드 목록 렌더링 */}
      {/* <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
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
      /> */}
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
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
    </View>
  );
}
