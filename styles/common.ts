// styles/common.ts
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
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
});
