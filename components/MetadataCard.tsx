import { StyleSheet, Text, View } from "react-native";

export default function MetadataCard({ meta }: { meta: any }) {
  if (!meta) return null;

  return (
    <View style={metaStyles.card}>
      <Text style={metaStyles.title}>{meta.title}</Text>
      <Text style={metaStyles.description}>{meta.description}</Text>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>과목:</Text>
        <Text style={metaStyles.value}>{meta.subject}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>버전:</Text>
        <Text style={metaStyles.value}>{meta.version}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>작성일:</Text>
        <Text style={metaStyles.value}>{meta.created_at}</Text>
        <Text style={metaStyles.label}>수정일:</Text>
        <Text style={metaStyles.value}>{meta.updated_at}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>작성자:</Text>
        <Text style={metaStyles.value}>{meta.author}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>출처:</Text>
        <Text style={metaStyles.value}>{meta.source}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>라이선스:</Text>
        <Text style={metaStyles.value}>{meta.license}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>난이도:</Text>
        <Text style={metaStyles.value}>{meta.difficulty}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>카테고리:</Text>
        <Text style={metaStyles.value}>{meta.category}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>태그:</Text>
        <Text style={metaStyles.value}>{meta.tags}</Text>
      </View>

      <View style={metaStyles.row}>
        <Text style={metaStyles.label}>문제 수:</Text>
        <Text style={metaStyles.value}>{meta.num_questions}</Text>
      </View>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#e5e7eb",
    borderWidth: 1,
    marginTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  label: {
    fontWeight: "600",
    marginRight: 4,
    color: "#374151",
  },
  value: {
    color: "#374151",
  },
});
