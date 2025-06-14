// app/(tabs)/analytics.tsx
import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, ViewStyle } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { getDatabase } from "@/lib/db";
import { questionFileMap } from "@/lib/questionFileMap";

type SubjectStats = {
  subject_id: string;
  subject_name: string;
  total_questions: number;
  total_attempts: number;
  correct_count: number;
  objective_count: number;
  subjective_count: number;
};

type QuestionStats = {
  id: number;
  subject_id: string;
  question: string;
  type: string;
  total_attempts: number;
  correct_count: number;
};

export default function AnalyticsScreen() {
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [questionStats, setQuestionStats] = useState<QuestionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const fetchStats = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const db = await getDatabase();
          if (!db) {
            throw new Error("데이터베이스 연결에 실패했습니다.");
          }

          // 과목별 통계 가져오기
          const stats = await db.getAllAsync<SubjectStats>(`
            SELECT 
              s.id as subject_id,
              s.name as subject_name,
              COUNT(DISTINCT q.id) as total_questions,
              COUNT(a.id) as total_attempts,
              SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
              SUM(CASE WHEN q.type = 'objective' THEN 1 ELSE 0 END) as objective_count,
              SUM(CASE WHEN q.type = 'subjective' THEN 1 ELSE 0 END) as subjective_count
            FROM subjects s
            LEFT JOIN questions q ON s.id = q.subject_id
            LEFT JOIN answers a ON q.id = a.question_id AND q.subject_id = a.subject_id
            GROUP BY s.id, s.name
            ORDER BY s.name
          `);

          if (isMounted) {
            setSubjectStats(stats || []);
          }
        } catch (error) {
          console.error("통계 로딩 에러:", error);
          if (isMounted) {
            setError(error instanceof Error ? error.message : "통계를 불러오는 중 오류가 발생했습니다.");
            Alert.alert(
              "오류",
              "통계를 불러오는 중 문제가 발생했습니다. 앱을 다시 시작해주세요."
            );
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchStats();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const handleSubjectPress = async (subjectId: string) => {
    try {
      setLoading(true);
      const db = await getDatabase();
      
      const stats = await db.getAllAsync<QuestionStats>(`
        SELECT 
          q.id,
          q.subject_id,
          q.question,
          q.type,
          COUNT(a.id) as total_attempts,
          SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id AND q.subject_id = a.subject_id
        WHERE q.subject_id = ?
        GROUP BY q.id, q.subject_id
        ORDER BY q.id
      `, [subjectId]);

      setQuestionStats(stats || []);
      setSelectedSubject(subjectId);
    } catch (error) {
      console.error("문제별 통계 로딩 에러:", error);
      Alert.alert("오류", "문제별 통계를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectCard = (subject: SubjectStats) => {
    const accuracy = subject.total_attempts > 0 
      ? (subject.correct_count / subject.total_attempts * 100).toFixed(1)
      : "0.0";
    
    const progressWidth = `${accuracy}%` as ViewStyle["width"];
    
    return (
      <Pressable
        key={subject.subject_id}
        style={[
          styles.subjectCard,
          selectedSubject === subject.subject_id && styles.selectedSubjectCard
        ]}
        onPress={() => handleSubjectPress(subject.subject_id)}
      >
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectName}>{subject.subject_name}</Text>
          <FontAwesome 
            name={selectedSubject === subject.subject_id ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#666" 
          />
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{subject.total_questions}</Text>
            <Text style={styles.statLabel}>전체 문제</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{subject.objective_count}</Text>
            <Text style={styles.statLabel}>객관식</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{subject.subjective_count}</Text>
            <Text style={styles.statLabel}>주관식</Text>
          </View>
        </View>

        {subject.total_attempts > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>전체 정답률</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: progressWidth }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{accuracy}%</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderQuestionCard = (question: QuestionStats) => {
    const accuracy = question.total_attempts > 0 
      ? (question.correct_count / question.total_attempts * 100).toFixed(1)
      : "0.0";
    
    const mastered = Number(accuracy) >= 80 && question.total_attempts >= 3;

    return (
      <View key={`${question.subject_id}-${question.id}`} style={styles.questionCard}>
        <Text style={styles.questionText}>{question.question}</Text>
        <View style={styles.questionStats}>
          <Text style={styles.questionType}>
            {question.type === "objective" ? "객관식" : "주관식"}
          </Text>
          <Text style={styles.questionAttempts}>
            시도: {question.total_attempts}회
          </Text>
          <Text style={[
            styles.questionAccuracy,
            mastered && styles.masteredText
          ]}>
            정답률: {accuracy}% {mastered ? "✅" : "🔄"}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>통계를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 학습 현황 분석</Text>
      
      {subjectStats.length > 0 ? (
        <>
          {subjectStats.map(renderSubjectCard)}
          {selectedSubject && questionStats.length > 0 && (
            <View style={styles.questionsSection}>
              <Text style={styles.sectionTitle}>문제별 학습 현황</Text>
              {questionStats.map(renderQuestionCard)}
            </View>
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>아직 풀이한 문제가 없습니다.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#f44336",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
    color: "#666",
  },
  subjectCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSubjectCard: {
    borderColor: "#4CAF50",
    borderWidth: 2,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  questionsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  questionStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionType: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  questionAttempts: {
    fontSize: 14,
    color: "#666",
  },
  questionAccuracy: {
    fontSize: 14,
    color: "#666",
  },
  masteredText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
