import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type HeaderProps = {
    title: string;
    contador?: number | null;
    subtitle: any;
    showBack?: boolean;
};

export function Header({ title, contador, subtitle, showBack = true }: HeaderProps) {

    const navigation = useNavigation<any>();

    return (
        <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.header}
        >

            <View style={styles.row}>

                {showBack && (
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                )}

                <View style={styles.textContainer}>

                    <Text style={styles.titleHeader}>
                        {title}
                    </Text>

                    <Text style={styles.subtitle}>
                        {contador ? `${contador} ${subtitle}` : subtitle}
                    </Text>

                </View>

            </View>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)"
    },

    row: {
        flexDirection: "row",
        alignItems: "center"
    },

    backButton: {
        marginRight: 12,
        padding: 6
    },

    textContainer: {
        flex: 1
    },

    titleHeader: {
        fontSize: 26,
        fontFamily: "Righteous",
        color: "#1A1A1A"
    },

    subtitle: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#999"
    }

});