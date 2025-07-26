// styles/common.ts
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#fff",
  },
  scrollContainer: {
    // backgroundColor: "#fff",
    paddingBottom: 100,
  },
  header: {
    paddingTop: 50,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  headerWelcomeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  headerDescription: {
    fontSize: 16,
    color: "#333",
  },
  headerShadowWrapper: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4, // Android용
    position: "relative",
    zIndex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  fabWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 20, // paddingHorizontal과 맞추기
    top: 50, // paddingTop과 맞추기
    zIndex: 1000,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    // ✅ iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // ✅ Android elevation
    elevation: 4,
  },
  actionList: {
    position: "absolute",
    top: 60,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    minWidth: 130,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: "#007AFF",
  },
  actionText: {
    color: "#333",
    fontSize: 14,
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#eee",
  },
});
