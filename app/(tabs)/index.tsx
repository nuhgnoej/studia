import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { Button, Text, View, StyleSheet, Pressable, Modal, TextInput, Alert } from "react-native";
import { questionFileMap } from "@/lib/questionFileMap";
import { loadQuestionsFromFile } from "@/lib/loadQuestionsFromFile";
import { getDatabase } from "@/lib/db";
import { FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';

type DocumentPickerResult = {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  }>;
};

export default function IndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPickerResult | null>(null);

  // 앱 최초 실행 시 데이터베이스 테이블 존재 여부 확인
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const db = await getDatabase();
        const tableCheck = await db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='questions'"
        );
        
        if (!tableCheck || tableCheck.count === 0) {
          // 테이블이 없을 경우에만 초기화
          const { initDatabase } = require("@/lib/db");
          await initDatabase();
        }
      } catch (error) {
        console.error("데이터베이스 확인 중 오류:", error);
      }
    };
    
    checkDatabase();
  }, []);

  const loadSetAndNavigate = async (filename: string) => {
    try {
      setLoading(true);
      await loadQuestionsFromFile(filename);
      router.push(`/subject/${filename}`);
    } catch (error) {
      console.error("문제 세트 로드 에러:", error);
      Alert.alert("오류", "문제 세트를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      // 파일명에서 확장자 제거
      const fileNameWithoutExt = file.name.replace('.json', '');
      setNewSetName(fileNameWithoutExt);
      setSelectedFile(result);
    } catch (error) {
      console.error("파일 선택 에러:", error);
      Alert.alert("오류", "파일을 선택하는 중 오류가 발생했습니다.");
    }
  };

  const handleAddSet = async () => {
    if (!selectedFile || selectedFile.canceled || !selectedFile.assets?.[0]) {
      Alert.alert("알림", "JSON 파일을 선택해주세요.");
      return;
    }

    if (!newSetName.trim()) {
      Alert.alert("알림", "문제 세트 이름을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const db = await getDatabase();
      
      // 파일명 생성 (공백 제거 및 특수문자 처리)
      const sanitizedName = newSetName.trim().replace(/[^a-zA-Z0-9가-힣]/g, "");
      const filename = `${sanitizedName}.json`;
      
      // 이미 존재하는 파일명인지 확인
      if (questionFileMap[filename as keyof typeof questionFileMap]) {
        Alert.alert("알림", "이미 존재하는 문제 세트 이름입니다.");
        return;
      }

      // 선택된 파일을 앱의 assets/questions 디렉토리로 복사
      const file = selectedFile.assets[0];
      // TODO: 실제 파일 시스템에 파일을 복사하는 로직 구현 필요
      // 현재는 임시로 파일 내용을 읽어서 처리
      const response = await fetch(file.uri);
      const jsonData = await response.json();

      // subjects 테이블에 새 과목 추가
      await db.runAsync(
        "INSERT INTO subjects (id, name) VALUES (?, ?)",
        [filename, newSetName.trim()]
      );

      // questions 테이블에 문제 데이터 추가
      for (const question of jsonData.data) {
        await db.runAsync(
          "INSERT INTO questions (id, subject_id, question, type, options, answer) VALUES (?, ?, ?, ?, ?, ?)",
          [
            question.id,
            filename,
            question.question,
            question.type,
            JSON.stringify(question.options || []),
            question.answer
          ]
        );
      }

      // 모달 닫기 및 상태 초기화
      setShowAddModal(false);
      setNewSetName("");
      setSelectedFile(null);

      Alert.alert(
        "성공",
        "새로운 문제 세트가 추가되었습니다.",
        [
          {
            text: "확인",
            onPress: () => {
              router.replace("/");
            }
          }
        ]
      );
    } catch (error) {
      console.error("문제 세트 추가 에러:", error);
      Alert.alert("오류", "문제 세트를 추가하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>문제 세트를 선택하세요</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
          disabled={loading}
        >
          <FontAwesome name="plus" size={16} color="white" />
          <Text style={styles.addButtonText}>새 문제 세트</Text>
        </Pressable>
      </View>

      {Object.entries(questionFileMap).map(([filename, entry], idx) => (
        <Pressable
          key={idx}
          style={styles.setCard}
          onPress={() => loadSetAndNavigate(filename)}
          disabled={loading}
        >
          <View style={styles.setInfo}>
            <Text style={styles.setName}>{entry.name}</Text>
            <Text style={styles.setMeta}>
              {entry.data.length}문제 · {filename.includes("주관식") ? "주관식" : "객관식"}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={16} color="#666" />
        </Pressable>
      ))}

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      )}

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>새 문제 세트 추가</Text>
            
            <Pressable
              style={styles.filePickerButton}
              onPress={pickFile}
            >
              <FontAwesome name="file" size={20} color="#4CAF50" />
              <Text style={styles.filePickerText}>
                {selectedFile?.assets?.[0]?.name || "JSON 파일 선택"}
              </Text>
            </Pressable>

            <Text style={styles.inputLabel}>문제 세트 이름</Text>
            <TextInput
              style={styles.input}
              value={newSetName}
              onChangeText={setNewSetName}
              placeholder="예: 복합발전운전"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewSetName("");
                  setSelectedFile(null);
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.addSetButton]}
                onPress={handleAddSet}
                disabled={loading}
              >
                <Text style={styles.addSetButtonText}>추가</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsTitle}>📊 나의 풀이 기록</Text>
        <Pressable
          style={styles.analyticsButton}
          onPress={() => router.push("/(tabs)/analytics")}
        >
          <Text style={styles.analyticsButtonText}>풀이 결과 분석 보기</Text>
          <FontAwesome name="bar-chart" size={16} color="#4CAF50" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  setCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  setMeta: {
    fontSize: 14,
    color: "#666",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  addSetButton: {
    backgroundColor: "#4CAF50",
  },
  addSetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  analyticsSection: {
    marginTop: 40,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  analyticsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
  },
  analyticsButtonText: {
    fontSize: 14,
    color: "#333",
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  filePickerText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
});
