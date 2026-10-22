import { StyleSheet, Dimensions } from "react-native";


export const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
    },

    header: {
        marginTop: 40,
        alignItems: "center",
    },

    title: {
        fontSize: 24,
        color: "#1a1a1a",
        textAlign: "center",
        fontFamily: "Righteous",
    },

    subtitle: {
        fontSize: 14,
        color: "#7f8c8d",
        textAlign: "center",
        marginTop: 8,
        paddingHorizontal: 20,
        fontFamily: "Righteous",
    },

    visualArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    successIcon: {
        transform: [{ scale: 1.2 }],
    },

    detailsCard: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 30,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    pathLine: {
        alignItems: "center",
        marginRight: 15,
        marginTop: 5,
    },

    dotGreen: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#2ecc71",
    },

    dotBlack: {
        width: 10,
        height: 10,
        borderRadius: 2,
        backgroundColor: "#000",
    },

    line: {
        width: 2,
        height: 35,
        backgroundColor: "#f1f2f6",
        marginVertical: 4,
    },

    locationTextContainer: {
        flex: 1,
    },

    locationText: {
        fontSize: 15,
        color: "#2d3436",
        fontFamily: "Righteous",
    },

    divider: {
        height: 1,
        backgroundColor: "#f1f2f6",
        marginVertical: 20,
    },

    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    label: {
        fontSize: 12,
        color: "#95a5a6",
        textTransform: "uppercase",
        letterSpacing: 1,
        fontFamily: "Righteous",
    },

    priceValue: {
        fontSize: 22,
        color: "#000",
        fontFamily: "Righteous",
    },

    paymentBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },

    paymentText: {
        fontSize: 12,
        color: "#666",
        fontFamily: "Righteous",
    },

    footer: {
        marginBottom: 20,
    },

    primaryButton: {
        backgroundColor: "#000",
        height: 60,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },

    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontFamily: "Righteous",
    },

    secondaryButton: {
        height: 60,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#f1f2f6",
    },

    secondaryButtonText: {
        color: "#ff4757",
        fontSize: 15,
        fontFamily: "Righteous",
    },
});