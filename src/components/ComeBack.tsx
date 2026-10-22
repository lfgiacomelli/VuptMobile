import React, { useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import useRighteousFont from "../hooks/useFont";

type RootStackParamList = {
    Home: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "Home">;

export function ComeBack() {
    const navigation = useNavigation<NavigationProps>();
    const fontLoaded = useRighteousFont();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const isSmallScreen = width < 360;
    const isTablet = width >= 768;

    const dynamicValues = useMemo(() => {
        return {
            horizontalPadding: isTablet ? 28 : isSmallScreen ? 16 : 20,
            topPadding: isSmallScreen ? 12 : 14,
            bottomPadding:
                Platform.OS === "ios"
                    ? Math.max(insets.bottom, 12)
                    : Math.max(insets.bottom, 10),
            titleFontSize: isTablet ? 20 : isSmallScreen ? 16 : 18,
            labelFontSize: isSmallScreen ? 11 : 12,
            buttonHorizontal: isTablet ? 24 : isSmallScreen ? 18 : 22,
            buttonVertical: isTablet ? 14 : isSmallScreen ? 12 : 13,
            iconSize: isTablet ? 22 : isSmallScreen ? 18 : 20,
            buttonRadius: isSmallScreen ? 16 : 18,
        };
    }, [insets.bottom, isSmallScreen, isTablet]);

    if (!fontLoaded) return null;

    function handleGoHome() {
        navigation.navigate("Home");
    }

    return (
        <View pointerEvents="box-none" style={styles.wrapper}>
            <View
                style={[
                    styles.container,
                    {
                        paddingTop: dynamicValues.topPadding,
                        paddingBottom: dynamicValues.bottomPadding,
                        paddingHorizontal: dynamicValues.horizontalPadding,
                    },
                ]}
            >
                <View style={styles.handle} />

                <View style={styles.content}>
                    <View style={styles.textBlock}>
                        <Text
                            style={[
                                styles.label,
                                { fontSize: dynamicValues.labelFontSize },
                            ]}
                            numberOfLines={1}
                        >
                            Navegação rápida
                        </Text>

                        <Text
                            style={[
                                styles.title,
                                {
                                    fontFamily: "Righteous",
                                    fontSize: dynamicValues.titleFontSize,
                                },
                            ]}
                            numberOfLines={2}
                        >
                            Voltar para início
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleGoHome}
                        style={[
                            styles.buttonWrapper,
                            { borderRadius: dynamicValues.buttonRadius },
                        ]}
                    >
                        <LinearGradient
                            colors={["#111111", "#000000"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.button,
                                {
                                    paddingHorizontal:
                                        dynamicValues.buttonHorizontal,
                                    paddingVertical:
                                        dynamicValues.buttonVertical,
                                    borderRadius: dynamicValues.buttonRadius,
                                },
                            ]}
                        >
                            <Ionicons
                                name="home"
                                size={dynamicValues.iconSize}
                                color="#FFF"
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        elevation: 999,
    },

    container: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 20,
    },

    handle: {
        width: 48,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#E0E0E0",
        alignSelf: "center",
        marginBottom: 18,
    },

    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },

    textBlock: {
        flex: 1,
        minWidth: 0,
        paddingRight: 8,
    },

    label: {
        color: "#777",
        marginBottom: 4,
        letterSpacing: 0.4,
    },

    title: {
        color: "#111",
    },

    buttonWrapper: {
        overflow: "hidden",
        flexShrink: 0,
    },

    button: {
        minWidth: 58,
        alignItems: "center",
        justifyContent: "center",
    },
});