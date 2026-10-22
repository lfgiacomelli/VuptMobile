import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const GRID_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        paddingBottom: 60,
    },

    mainListContent: {
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 8,
        paddingBottom: 34,
    },

    activeTravelWrapper: {
        marginBottom: 16,
    },

    section: {
        marginBottom: 24,
    },

    sectionHeader: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    sectionEyebrow: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#8A9099",
        marginBottom: 2,
        letterSpacing: 0.5,
    },

    sectionTitle: {
        fontFamily: "Righteous",
        fontSize: 20,
        color: "#1A1C1E",
    },

    companyCount: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#8A9099",
    },

    popularLoadingContainer: {
        borderRadius: 24,
        paddingVertical: 28,
        alignItems: "center",
        justifyContent: "center",
    },

    popularListContent: {
        paddingRight: 10,
    },

    popularCard: {
        width: 100,
        marginRight: 12,
        alignItems: "center",
    },

    popularLogoWrapper: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#FFFFFF",
        padding: 3,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
        position: "relative",
    },

    popularLogo: {
        width: "100%",
        height: "100%",
        borderRadius: 45,
    },

    popularFallback: {
        width: "100%",
        height: "100%",
        borderRadius: 45,
        backgroundColor: "#1A1C1E",
        alignItems: "center",
        justifyContent: "center",
    },

    popularFallbackText: {
        fontFamily: "Righteous",
        fontSize: 18,
        color: "#FFFFFF",
    },

    popularStatusDot: {
        position: "absolute",
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    popularName: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#1A1C1E",
        textAlign: "center",
        marginBottom: 2,
    },

    popularMeta: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#8A9099",
        textAlign: "center",
    },

    columnWrapper: {
        justifyContent: "space-between",
    },

    companyCard: {
        width: CARD_WIDTH,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    companyCardFullWidth: {
        width: "100%",
        marginLeft: 0,
        marginRight: 0,
    },

    companyImageArea: {
        height: 110,
        backgroundColor: "#F0F2F4",
        position: "relative",
    },

    companyImage: {
        width: "100%",
        height: "100%",
    },

    companyImageFallback: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1C1E",
    },

    companyImageFallbackText: {
        fontFamily: "Righteous",
        fontSize: 24,
        color: "#FFFFFF",
    },

    imageStatusBadge: {
        position: "absolute",
        top: 8,
        right: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.75)",
    },

    imageStatusBadgeActive: {
        backgroundColor: "rgba(34,197,94,0.9)",
    },

    imageStatusBadgeInactive: {
        backgroundColor: "rgba(239,68,68,0.9)",
    },

    imageStatusText: {
        fontFamily: "Righteous",
        fontSize: 9,
        color: "#FFFFFF",
    },

    statusDotSmall: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },

    companyContent: {
        padding: 10,
    },

    companyName: {
        fontFamily: "Righteous",
        fontSize: 13,
        color: "#1A1C1E",
        marginBottom: 6,
    },

    companyLocation: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 8,
    },

    companyLocationText: {
        flex: 1,
        fontFamily: "Righteous",
        fontSize: 10,
        color: "#8A9099",
    },

    companyInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        flex: 1,
    },

    infoItemText: {
        flex: 1,
        fontFamily: "Righteous",
        fontSize: 9,
        color: "#6B7280",
    },

    infoDivider: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#D1D5DB",
    },

    statusDotActive: {
        backgroundColor: "#22C55E",
    },

    statusDotInactive: {
        backgroundColor: "#EF4444",
    },

    emptyState: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 32,
        paddingHorizontal: 20,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },

    emptyTitle: {
        fontFamily: "Righteous",
        fontSize: 16,
        color: "#1A1C1E",
        marginBottom: 8,
        textAlign: "center",
    },

    emptyDescription: {
        fontFamily: "Righteous",
        fontSize: 12,
        lineHeight: 18,
        color: "#8A9099",
        textAlign: "center",
    },

    loadingScreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "#F8F9FA",
    },

    loadingCard: {
        width: "100%",
        borderRadius: 24,
        paddingVertical: 30,
        paddingHorizontal: 22,
        alignItems: "center",
    },

    loadingTitle: {
        fontFamily: "Righteous",
        fontSize: 18,
        color: "#1A1C1E",
        marginTop: 18,
        marginBottom: 8,
        textAlign: "center",
    },

    loadingDescription: {
        fontFamily: "Righteous",
        fontSize: 12,
        lineHeight: 18,
        color: "#8A9099",
        textAlign: "center",
    },

    errorCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 22,
        alignItems: "center",
    },

    errorTitle: {
        fontFamily: "Righteous",
        fontSize: 18,
        color: "#1A1C1E",
        marginBottom: 8,
        textAlign: "center",
    },

    errorDescription: {
        fontFamily: "Righteous",
        fontSize: 12,
        lineHeight: 18,
        color: "#8A9099",
        textAlign: "center",
        marginBottom: 20,
    },

    errorButton: {
        backgroundColor: "#1A1C1E",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 12,
    },

    errorButtonText: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#FFFFFF",
    },

    initialLoaderContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    initialLoaderText: {
        fontFamily: "Righteous",
        fontSize: 13,
        color: "#6B7280",
        marginTop: 14,
        textAlign: "center",
    },
    discoveryBanner: {
        backgroundColor: "#111111",
        borderRadius: 24,
        marginBottom: 24,
        paddingVertical: 18,
        paddingLeft: 18,
        paddingRight: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        overflow: "hidden",
    },

    discoveryContent: {
        flex: 1,
        paddingRight: 12,
    },

    discoveryEyebrow: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "rgba(255,255,255,0.60)",
        marginBottom: 6,
        letterSpacing: 0.3,
    },

    discoveryTitle: {
        fontFamily: "Righteous",
        fontSize: 20,
        color: "#FFFFFF",
        lineHeight: 28,
        marginBottom: 8,
    },

    discoveryDescription: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "rgba(255,255,255,0.72)",
        lineHeight: 17,
        marginBottom: 14,
        maxWidth: "95%",
    },

    discoveryAction: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 999,
    },

    discoveryActionText: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#FFFFFF",
    },

    discoveryImageWrapper: {
        width: 96,
        height: 96,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    discoveryImage: {
        width: 140,
        height: 140,
    },
});