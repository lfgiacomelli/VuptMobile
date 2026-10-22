import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        borderRadius: 24,
        padding: 18,
    },
    sectionTitle: {
        fontFamily: "Righteous",
        fontSize: 17,
        color: "#111827",
        marginTop: 6,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#6B7280",
        lineHeight: 18,
        marginBottom: 14,
    },
    fieldContainer: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#DC2626",
    },
    inputWrapper: {
        minHeight: 58,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
    },
    inputWrapperFocused: {
        borderColor: "#111827",
    },
    inputWrapperError: {
        borderColor: "#DC2626",
    },
    inputWrapperDisabled: {
        backgroundColor: "#F3F4F6",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 54,
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#111827",
        paddingVertical: 0,
    },
    inputDisabled: {
        color: "#6B7280",
    },
    errorText: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#DC2626",
        marginTop: 6,
        marginLeft: 2,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    numberColumn: {
        flex: 2,
    },
    ufColumn: {
        flex: 1,
    },
    rightLoading: {
        marginLeft: 8,
    },
    button: {
        height: 56,
        borderRadius: 18,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#FFFFFF",
    },
    footerInfo: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    footerInfoText: {
        flex: 1,
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#6B7280",
        lineHeight: 16,
    },
});