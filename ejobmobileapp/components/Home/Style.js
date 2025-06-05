// screens/Home/Style.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  searchContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  filterCard: {
    marginBottom: 20,
  },
  filterTitle: {
    marginBottom: 12,
  },
  formInputCustom: {
    marginBottom: 16,
  },
  jobCard: {
    marginBottom: 12,
  },
  jobImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  jobTitle: {
    fontSize: 16,
  },
  jobCompany: {
    fontSize: 14,
    color: "#555",
  },
  jobLocationSalary: {
    color: "#888",
    marginTop: 4,
  },
  noResultsText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});
