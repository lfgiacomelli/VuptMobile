import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fb",
        paddingHorizontal: 20,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 20,
    },
    header: {
        marginTop: 20,
        marginBottom: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontFamily: "Righteous",
        color: "#111",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontFamily: "Righteous",
        letterSpacing: 1,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    locationBlock: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#333",
    },
    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 15,
    },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#777",
    },
    value: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#222",
    },
    price: {
        fontSize: 16,
        fontFamily: "Righteous",
        color: "#27ae60",
    },
    errorText: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#e74c3c",
        textAlign: "center",
    },
});