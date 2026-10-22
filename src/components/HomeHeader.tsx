import React, { useMemo } from "react";
import {
    Text,
    View,
    Image,
    StatusBar,
    StyleSheet,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../hooks/useAuth";
import useRighteousFont from "../hooks/useFont";

export function HomeHeader() {
    const { user } = useAuth();

    const fontLoaded = useRighteousFont();

    const insets = useSafeAreaInsets();

    const firstName = useMemo(() => {
        if (!user?.usu_nome) return "Visitante";

        return user.usu_nome
            .trim()
            .split(" ")[0];
    }, [user?.usu_nome]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();

        if (hour < 12) return "Bom dia,";
        if (hour < 18) return "Boa tarde,";

        return "Boa noite,";
    }, []);

    if (!fontLoaded) return null;

    return (
        <>
            <StatusBar
                translucent
                barStyle="light-content"
            />

            <LinearGradient
                colors={[
                    "#000000",
                    "#0A0A0A",
                    "#141414",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.container,
                    {
                        paddingTop:
                            insets.top + 10,
                    },
                ]}
            >
                <View style={styles.content}>
                    <View style={styles.textContainer}>
                        <Text
                            style={styles.greeting}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {greeting}{" "}

                            <Text
                                style={styles.name}
                            >
                                {firstName}!
                            </Text>
                        </Text>
                    </View>

                    {/* 
                    <Image
                        source={require("../assets/images/vuptWhite.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    */}
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 32,
        paddingHorizontal: 20,

        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 6,
        },

        shadowOpacity: 0.18,
        shadowRadius: 12,

        elevation: 10,
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        gap: 16,
    },

    textContainer: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: 16,
    },

    greeting: {
        fontSize: 24,
        color: "rgba(255,255,255,0.82)",
        letterSpacing: 0.2,
        fontFamily: "Righteous",
    },

    name: {
        color: "#FFFFFF",
    },

    logo: {
        width: 180,
        height: 55,
    },
});