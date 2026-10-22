import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
    },
    loadingGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
        fontFamily: "Righteous"
    },
    map: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 30,
        left: 20,
        right: 20,
        borderRadius: 30,
        overflow: "hidden",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
    },

    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    logoWrapper: {
        width: 38,
        height: 38,
        borderRadius: 19,
        overflow: "hidden",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },

    logo: {
        width: "100%",
        height: "100%",
    },

    headerTitle: {
        flex: 1,
        textAlign: "center",
        color: "#fff",
        fontSize: 16,
        fontFamily: "Righteous",
        marginHorizontal: 10,
        letterSpacing: 0.5,
    },

    rightSpacer: {
        width: 38,
    },
    batteryLevel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 120 : 100,
        left: 20,
        right: 20,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    inputIcon: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 0,
        fontFamily: "Righteous",
    },
    inputDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 52,
    },
    suggestionsContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    suggestionText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#333',

    },
    calculateButton: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        borderRadius: 16,
        overflow: 'hidden',
        maxHeight: 60,
        justifyContent: "center"
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: "#007bff",
        textAlign: 'center',
    },
    calculateButtonText: {
        color: '#fff',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: 16,
        fontFamily: "Righteous",
        marginRight: 8,
    },
    markerOrigin: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    markerDestination: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modal: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: '#fff',
    },
    modalHandle: {
        backgroundColor: '#ddd',
        width: 40,
        height: 4,
        marginTop: 20,
    },
    modalContent: {
        padding: 24,
    },
    modalHeader: {
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontFamily: "Righteous",
        color: '#333',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Righteous",
    },
    routeSummary: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    routePoint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    routeText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontFamily: "Righteous"
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#ddd',
        marginLeft: 7,
        marginVertical: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#ddd',
    },
    statValue: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontFamily: "Righteous",

    },
    priceBreakdown: {
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    priceBreakdownTitle: {
        fontSize: 16,
        fontFamily: "Righteous",
        color: '#333',
        marginBottom: 12,
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    breakdownLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: "Righteous"
    },
    breakdownValue: {
        fontSize: 14,
        color: '#333',
        fontFamily: "Righteous"
    },
    breakdownTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    breakdownTotalLabel: {
        fontSize: 16,
        fontFamily: "Righteous",
        color: '#333',
    },
    price: {
        fontSize: 24,
        fontFamily: "Righteous",
        color: '#667eea',
    },
    paymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    paymentButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentButtonText: {
        fontSize: 16,
        color: '#333',
        fontFamily: "Righteous"
    },
    confirmButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: "Righteous",
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    paymentOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentInfo: {
        gap: 4,
    },
    paymentLabel: {
        fontSize: 16,
        fontFamily: "Righteous",
        color: '#333',
    },
    paymentDescription: {
        fontSize: 12,
        color: '#666',
    },
    selectedPayment: {
        backgroundColor: '#f8f9fa',
    },
    floatingButton: {
        position: "absolute",
        bottom: 30,
        right: 20,

        backgroundColor: "#111",
        paddingVertical: 14,
        paddingHorizontal: 22,
        borderRadius: 30,

        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },

    floatingButtonText: {
        color: "#FFF",
        fontSize: 14,
        fontFamily: "Righteous",
        letterSpacing: 0.5,
    },
    clearButton: {
        top: 20,
        position: "absolute",
        right: 10,
        transform: [{ translateY: -10 }],
        zIndex: 10,
    },
    returnButtonContainer: {
        left: 20,
        position: "static",
        zIndex: 10,
    },

    returnButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    backSliderWrapper: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        width: "100%",
        alignItems: "center",
        zIndex: 999,
    },

    backSliderContainer: {
        width: 260,
        height: 52,
        borderRadius: 30,
        backgroundColor: "#F2F2F2",
        justifyContent: "center",
        overflow: "hidden",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 6,
    },

    backSliderText: {
        alignSelf: "center",
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
        letterSpacing: 0.5,
    },

    backSliderHandle: {
        position: "absolute",
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
    },


});