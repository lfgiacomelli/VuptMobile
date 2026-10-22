import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        marginBottom: 45
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },

    title: {
        fontSize: 28,
        fontFamily: "Righteous",
        color: "#1A1A1A",
        marginBottom: 4,
    },

    subtitle: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#999",
    },

    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },

    listContent: {
        padding: 20,
    },

    cardContainer: {
        marginBottom: 16,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 24,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
        overflow: "hidden",
    },

    progressContainer: {
        height: 4,
        backgroundColor: "#F0F0F0",
    },

    progressTrack: {
        flex: 1,
        overflow: "hidden",
    },

    progressIndicator: {
        width: "60%",
        height: "100%",
        position: "absolute",
    },

    progressGradient: {
        width: "100%",
        height: "100%",
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
    },

    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },

    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    iconImage: {
        width: 28,
        height: 28,
        resizeMode: "contain",
    },

    headerInfo: {
        flex: 1,
    },

    driver: {
        fontSize: 20,
        fontFamily: "Righteous",
        color: "#1A1A1A",
        marginBottom: 4,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    model: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#999",
    },

    headerRight: {
        alignItems: "flex-end",
    },

    price: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: "#4CAF50",
        marginBottom: 4,
    },

    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },

    statusText: {
        fontSize: 10,
        fontFamily: "Righteous",
    },

    details: {
        padding: 16,
        paddingTop: 0,
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.05)",
        marginBottom: 16,
    },

    datesSection: {
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        gap: 16,
    },

    dateItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    dateIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },

    dateContent: {
        flex: 1,
    },

    dateLabel: {
        fontSize: 10,
        fontFamily: "Righteous",
        color: "#999",
        marginBottom: 2,
    },

    dateValue: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#1A1A1A",
    },

    locationSection: {
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },

    locationItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },

    locationDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
    },

    locationInnerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#4CAF50",
    },

    destinationDot: {
        backgroundColor: "rgba(255, 68, 68, 0.1)",
    },

    destinationInnerDot: {
        backgroundColor: "#FF4444",
    },

    locationLine: {
        width: 1,
        height: 20,
        backgroundColor: "#E0E0E0",
        marginLeft: 10,
        marginVertical: 4,
    },

    locationText: {
        flex: 1,
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#666",
        lineHeight: 18,
    },

    observationSection: {
        flexDirection: "row",
        backgroundColor: "#F8F9FA",
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        gap: 12,
    },

    observationText: {
        flex: 1,
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#666",
        lineHeight: 18,
    },

    detailsButton: {
        borderRadius: 16,
        overflow: "hidden",
    },

    gradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 8,
    },

    detailsButtonText: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#fff",
    },

    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    emptyStateIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },

    emptyStateText: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: "#999",
        marginBottom: 8,
        textAlign: "center",
    },

    emptyStateSubtext: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#ccc",
        textAlign: "center",
        lineHeight: 20,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 8,
        backgroundColor: "#F8F9FA",
    },

    sectionHeaderText: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#4CAF50",
    },
});