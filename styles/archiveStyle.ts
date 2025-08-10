import { StyleSheet } from "react-native";

export const commonArchiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  content: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: "#666",
  },
  meta: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  downloadBtn: {
    marginTop: 12,
    backgroundColor: "#444",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    marginBottom: 10,
  },

  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // 그림자
    shadowColor: "#000", // 그림자 색상
    shadowOffset: { width: 0, height: 2 }, // 위치 (x, y)
    shadowOpacity: 0.2, // 투명도 (0 ~ 1)
    shadowRadius: 4, // 퍼짐 정도 (blur)
    elevation: 3,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
});
