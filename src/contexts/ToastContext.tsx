import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ToastStatus = "success" | "info" | "error";

interface ToastData {
    title: string;
    subtitle?: string;
    status?: ToastStatus;
}

interface ToastContextType {
    showToast: (data: ToastData) => void;
}

const ToastContext = createContext<ToastContextType>(
    {} as ToastContextType
);

const { width } = Dimensions.get("window");

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const insets = useSafeAreaInsets();

    const [toast, setToast] = useState<ToastData | null>(null);
    const [visible, setVisible] = useState(false);

    const translateY = useRef(new Animated.Value(-120)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const showToast = (data: ToastData) => {
        setToast(data);
        setVisible(true);
    };

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -120,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            setToast(null);
        });
    };

    useEffect(() => {
        if (visible && toast) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            const timeout = setTimeout(() => {
                hideToast();
            }, 3000);

            return () => clearTimeout(timeout);
        }
    }, [visible, toast]);

    const theme = getTheme(toast?.status || "info");

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {visible && toast && (
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: theme.background,
                            borderLeftColor: theme.primary,
                            paddingTop: insets.top + 10,
                            transform: [{ translateY }],
                            opacity,
                        },
                    ]}
                >
                    <Ionicons
                        name={theme.icon}
                        size={22}
                        color={theme.primary}
                        style={{ marginRight: 12 }}
                    />

                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.title,
                                { color: theme.primary },
                            ]}
                        >
                            {toast.title}
                        </Text>

                        {toast.subtitle && (
                            <Text style={styles.subtitle}>
                                {toast.subtitle}
                            </Text>
                        )}
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    return useContext(ToastContext);
};

function getTheme(status: ToastStatus): { background: string; primary: string; icon: keyof typeof Ionicons.glyphMap } {
    switch (status) {
        case "success":
            return {
                background: "#E9F9F0",
                primary: "#27AE60",
                icon: "checkmark-circle",
            };
        case "error":
            return {
                background: "#FDECEC",
                primary: "#EB5757",
                icon: "close-circle",
            };
        default:
            return {
                background: "#EAF4FF",
                primary: "#2F80ED",
                icon: "information-circle",
            };
    }
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        width: width,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderLeftWidth: 5,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        zIndex: 9999,
    },
    title: {
        fontSize: 15,
        fontFamily: "Righteous",
        textAlign: "center"
    },
    subtitle: {
        fontFamily: "Righteous",
        fontSize: 13,
        color: "#555",
        marginTop: 2,
        textAlign: "center"
    },
});