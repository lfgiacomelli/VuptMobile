import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff",
    },

    scrollContent: {
        paddingTop: 20,
        paddingBottom: 60,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 30
    },

    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#111",
        alignItems: "center",
        justifyContent: "center"
    },

    userInfo: {
        marginLeft: 15
    },

    userName: {
        fontSize: 20,
        fontFamily: "Righteous",
        color: "#111"
    },

    userEmail: {
        fontSize: 14,
        color: "#777",
        marginTop: 2,
        fontFamily: "Righteous"
    },

    section: {
        marginBottom: 25
    },

    sectionTitle: {
        fontSize: 13,
        color: "#999",
        marginBottom: 10,
        paddingHorizontal: 20,
        textTransform: "uppercase",
        letterSpacing: 1,
        fontFamily: "Righteous"
    },

    modal: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: "#fff",
        paddingBottom: 30
    },

    handle: {
        backgroundColor: "#D6D6D6",
        width: 56,
        height: 5,
    },

    modalContent: {
        paddingHorizontal: 28,
        paddingTop: 10,
        paddingBottom: 20,
        alignItems: "center"
    },

    modalIconWrapper: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: "#FFF1F1",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18
    },

    modalTitle: {
        fontSize: 22,
        fontFamily: "Righteous",
        color: "#111",
        textAlign: "center",
        marginBottom: 10
    },

    modalSubtitle: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#777",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24
    },

    modalButtons: {
        width: "100%",
        gap: 12
    },

    cancelButton: {
        height: 52,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E6E6E6",
        backgroundColor: "#FAFAFA",
        justifyContent: "center",
        alignItems: "center"
    },

    cancelButtonText: {
        fontSize: 15,
        fontFamily: "Righteous",
        color: "#444"
    },

    logoutButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: "#ff4d4f",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#ff4d4f",
        shadowOpacity: 0.22,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4
    },

    logoutButtonText: {
        fontSize: 15,
        fontFamily: "Righteous",
        color: "#fff"
    }

});