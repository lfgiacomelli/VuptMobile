import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    map: {
        flex: 1,
    },

    backButton: {
        position: "absolute",
        top: Platform.OS === "ios" ? 16 : 18,
        left: 16,
        right: 16,
        zIndex: 20,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(17,17,17,0.96)",
        borderRadius: 24,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.16,
                shadowRadius: 20,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    backButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.12)",
        marginRight: 12,
    },

    backButtonTextWrapper: {
        flex: 1,
    },

    backButtonLabel: {
        fontSize: 11,
        color: "rgba(255,255,255,0.72)",
        fontFamily: "Righteous",
        marginBottom: 2,
    },

    backButtonTitle: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: "Righteous",
    },

    topCard: {
        position: "absolute",
        top: Platform.OS === "ios" ? 96 : 98,
        left: 16,
        right: 16,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "rgba(17,17,17,0.06)",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.06,
                shadowRadius: 18,
            },
            android: {
                elevation: 5,
            },
        }),
    },

    topCardLabel: {
        fontSize: 11,
        color: "#7A7A7A",
        marginBottom: 6,
        fontFamily: "Righteous",
    },

    topCardTitle: {
        fontSize: 18,
        color: "#111111",
        marginBottom: 6,
        fontFamily: "Righteous",
    },

    topCardDescription: {
        fontSize: 12,
        lineHeight: 18,
        color: "#666666",
        fontFamily: "Righteous",
    },

    bottomCard: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Platform.OS === "ios" ? 18 : 16,
        backgroundColor: "rgba(255,255,255,0.97)",
        borderRadius: 28,
        padding: 18,
        borderWidth: 1,
        borderColor: "rgba(17,17,17,0.06)",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 14 },
                shadowOpacity: 0.08,
                shadowRadius: 24,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    bottomHeader: {
        marginBottom: 16,
    },

    bottomHeaderLabel: {
        fontSize: 11,
        color: "#808080",
        marginBottom: 4,
        fontFamily: "Righteous",
    },

    bottomHeaderTitle: {
        fontSize: 17,
        color: "#111111",
        fontFamily: "Righteous",
    },

    addressBlock: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    addressIconWrapper: {
        width: 28,
        alignItems: "center",
        paddingTop: 3,
    },

    addressTextWrapper: {
        flex: 1,
        paddingLeft: 4,
    },

    addressLabel: {
        fontSize: 11,
        color: "#8A8A8A",
        marginBottom: 4,
        fontFamily: "Righteous",
    },

    addressText: {
        fontSize: 13,
        lineHeight: 19,
        color: "#111111",
        fontFamily: "Righteous",
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(17,17,17,0.08)",
        marginVertical: 14,
    },

    metricsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 18,
    },

    metricCard: {
        flex: 1,
        backgroundColor: "#F7F7F7",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },

    metricLabel: {
        fontSize: 11,
        color: "#7A7A7A",
        marginBottom: 6,
        fontFamily: "Righteous",
    },

    metricValue: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Righteous",
    },

    originDot: {
        width: 12,
        height: 12,
        borderRadius: 999,
        backgroundColor: "#111111",
        marginTop: 2,
    },

    markerOrigin: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#111111",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    markerDestination: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2C2C2C",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.72)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    loadingCard: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        paddingVertical: 26,
        paddingHorizontal: 22,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(17,17,17,0.06)",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
            },
            android: {
                elevation: 6,
            },
        }),
    },

    loadingTitle: {
        marginTop: 14,
        fontSize: 17,
        color: "#111111",
        textAlign: "center",
        fontFamily: "Righteous",
    },

    loadingSubtitle: {
        marginTop: 8,
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        color: "#6F6F6F",
        fontFamily: "Righteous",
    },
});