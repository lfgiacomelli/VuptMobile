import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
    TouchableOpacity,
    RefreshControl,
} from "react-native";

import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import emptyAnimation from "../../assets/animations/emptyAnimation.json";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Header } from "../../components/Header";
import LottieView from "lottie-react-native";
import { LinearGradient } from "expo-linear-gradient";

const SWIPE_TUTORIAL_KEY = "@addresses_swipe_tutorial";

if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface Address {
    end_codigo: number;
    end_apelido: string;
    end_logradouro: string;
    end_numero: string;
    end_bairro: string;
    end_cidade: string;
    end_uf: string;
    end_complemento?: string;
}

interface AddressesResponse {
    success: boolean;
    data: Address[];
}

interface AddressItemProps {
    item: Address;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    swipeRefExternal?: React.RefObject<Swipeable | null>;
}

const AddressItem = memo(
    ({ item, onDelete, onEdit, swipeRefExternal }: AddressItemProps) => {
        const internalRef = useRef<Swipeable>(null);
        const swipeRef = swipeRefExternal ?? internalRef;


        const handleDelete = () => {
            swipeRef.current?.close();
            onDelete(item.end_codigo);
        };

        const renderRightActions = () => (
            <View style={styles.deleteWrapper}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.deleteContainer}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                    <Text style={styles.deleteText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        );

        return (
            <Swipeable
                ref={swipeRef}
                renderRightActions={renderRightActions}
                friction={2}
                rightThreshold={40}
                overshootRight={false}
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onEdit(item.end_codigo)}
                    style={styles.addressRow}
                >
                    <View style={styles.iconBox}>
                        <Ionicons name="location" size={18} color="#4CAF50" />
                    </View>

                    <View style={styles.addressInfo}>
                        <Text style={styles.title}>{item.end_apelido}</Text>

                        <Text style={styles.address}>
                            {item.end_logradouro}, {item.end_numero}
                        </Text>

                        <Text style={styles.address}>
                            {item.end_bairro} • {item.end_cidade}/{item.end_uf}
                        </Text>

                        {item.end_complemento ? (
                            <Text style={styles.extra}>{item.end_complemento}</Text>
                        ) : null}
                    </View>

                    <View style={styles.chevronBox}>
                        <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    }
);

export function Addresses() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigation = useNavigation<any>();

    const usu_codigo = user?.usu_codigo;

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [reloading, setReloading] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const firstItemSwipeRef = useRef<Swipeable | null>(null);
    const lottieRef = useRef<LottieView>(null);
    const scale = useRef(new Animated.Value(1)).current;
    const hasLoadedOnce = useRef(false);

    function handleClearAsync() {
        AsyncStorage.removeItem(SWIPE_TUTORIAL_KEY);
    }
    const pressIn = () => {
        Animated.spring(scale, {
            toValue: 0.94,
            useNativeDriver: true,
        }).start();
    };

    const pressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            tension: 120,
            useNativeDriver: true,
        }).start();
    };

    const loadAddresses = useCallback(
        async ({ silent = false }: { silent?: boolean } = {}) => {
            if (!usu_codigo) {
                setInitialLoading(false);
                return;
            }

            try {
                if (!hasLoadedOnce.current) {
                    setInitialLoading(true);
                } else if (!silent) {
                    setRefreshing(true);
                } else {
                    setReloading(true);
                }

                const response = await api.get<AddressesResponse>(`/addresses/${usu_codigo}`);
                const newAddresses = response.data?.data || [];

                setAddresses(newAddresses);
                hasLoadedOnce.current = true;
            } catch {
                showToast({
                    title: "Erro ao carregar endereços",
                    status: "error",
                });
            } finally {
                setInitialLoading(false);
                setRefreshing(false);
                setReloading(false);
            }
        },
        [usu_codigo, showToast]
    );

    useFocusEffect(
        useCallback(() => {
            loadAddresses({ silent: hasLoadedOnce.current });
        }, [loadAddresses])
    );

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const runSwipeTutorial = useCallback(async () => {
        try {
            const shown = await AsyncStorage.getItem(SWIPE_TUTORIAL_KEY);

            if (shown || addresses.length === 0) return;

            setTimeout(() => {
                firstItemSwipeRef.current?.openRight();

                setTimeout(() => {
                    firstItemSwipeRef.current?.close();
                }, 1200);
            }, 600);

            showToast({
                title: "Arraste um endereço para deletar",
                status: "info",
            });

            await AsyncStorage.setItem(SWIPE_TUTORIAL_KEY, "true");
        } catch {}
    }, [addresses.length, showToast]);

    useEffect(() => {
        if (!initialLoading && addresses.length > 0) {
            runSwipeTutorial();
        }
    }, [initialLoading, addresses.length, runSwipeTutorial]);

    async function deleteAddress(end_codigo: number) {
        try {
            if(addresses.length === 1){
                await api.delete(`/addresses/${end_codigo}`);
                AsyncStorage.removeItem(SWIPE_TUTORIAL_KEY);
            }
            await api.delete(`/addresses/${end_codigo}`);

            await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

            setAddresses((prev) =>
                prev.filter((addr) => addr.end_codigo !== end_codigo)
            );

            showToast({
                title: "Endereço removido",
                status: "success",
            });
        } catch {
            showToast({
                title: "Erro ao remover endereço",
                status: "error",
            });
        }
    }

    function handleEditAddress(end_codigo: number) {
        navigation.navigate("EditAddress", { end_codigo });
    }

    const onRefresh = async () => {
        await loadAddresses({ silent: false });
    };

    const renderItem = useCallback(
        ({ item, index }: { item: Address; index: number }) => (
            <AddressItem
                item={item}
                onDelete={deleteAddress}
                onEdit={handleEditAddress}
                swipeRefExternal={index === 0 ? firstItemSwipeRef : undefined}
            />
        ),
        []
    );

    function handleAddAddress() {
        if (addresses.length === 4) {
            showToast({
                title: "Você só pode cadastrar mais 1 endereço. O limite é 5.",
                status: "info",
            });
        }

        if (addresses.length >= 5) {
            showToast({
                title: "Limite de endereços atingido",
                status: "error",
            });
            return;
        }

        navigation.navigate("AddAddress");
    }

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Carregando endereços...</Text>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <Header
                    title="Endereços favoritos"
                    contador={addresses.length > 0 ? addresses.length : null}
                    subtitle={
                        addresses.length === 0
                            ? "NENHUM ENDEREÇO CADASTRADO"
                            : addresses.length === 1
                            ? "ENDEREÇO CADASTRADO"
                            : "ENDEREÇOS CADASTRADOS"
                    }
                />

                <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                    {reloading && addresses.length > 0 ? (
                        <View style={styles.topLoader}>
                            <ActivityIndicator size="small" color="#4CAF50" />
                        </View>
                    ) : null}

                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => String(item.end_codigo)}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        initialNumToRender={6}
                        windowSize={10}
                        removeClippedSubviews
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#4CAF50"]}
                            />
                        }
                        ListEmptyComponent={() => (
                            <View style={styles.empty}>
                                <LottieView
                                    ref={lottieRef}
                                    source={emptyAnimation}
                                    autoPlay
                                    loop
                                    style={{ width: 220, height: 220 }}
                                />

                                <Text style={styles.emptyText}>
                                    Você ainda não salvou nenhum endereço
                                </Text>

                                <Animated.View style={{ transform: [{ scale }] }}>
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPressIn={pressIn}
                                        onPressOut={pressOut}
                                        onPress={handleAddAddress}
                                        style={styles.shadow}
                                    >
                                        <LinearGradient
                                            colors={["#4CAF50", "#43A047"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.button}
                                        >
                                            <Ionicons name="add" size={20} color="#fff" />
                                            <Text style={styles.text}>
                                                Adicionar endereço
                                            </Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        )}
                    />

                    {addresses.length > 0 ? (
                        <Animated.View style={[styles.fab, { transform: [{ scale }] }]}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPressIn={pressIn}
                                onPressOut={pressOut}
                                onPress={handleAddAddress}
                                disabled={addresses.length >= 5}
                                style={{
                                    opacity: addresses.length >= 5 ? 0.5 : 1,
                                }}
                            >
                                <LinearGradient
                                    colors={["#4CAF50", "#43A047"]}
                                    style={styles.fabButton}
                                >
                                    <Ionicons name="add" size={26} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ) : null}
                </Animated.View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
    },

    listContent: {
        paddingTop: 10,
        paddingBottom: 40,
    },

    topLoader: {
        paddingTop: 8,
        paddingBottom: 4,
        alignItems: "center",
        justifyContent: "center",
    },

    addressRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#ECECEC",
        backgroundColor: "#FFF",
    },

    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#E8F5E9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    addressInfo: {
        flex: 1,
    },

    title: {
        fontSize: 15,
        fontFamily: "Righteous",
        color: "#000",
        marginBottom: 2,
    },

    address: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#5F5F5F",
    },

    extra: {
        fontSize: 12,
        fontFamily: "Righteous",
        color: "#999",
    },

    chevronBox: {
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center",
    },

    deleteWrapper: {
        justifyContent: "center",
    },

    deleteContainer: {
        width: 90,
        backgroundColor: "#E53935",
        justifyContent: "center",
        alignItems: "center",
        height: 120
    },

    deleteText: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#fff",
        marginTop: 3,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F9FA",
    },

    loadingText: {
        fontFamily: "Righteous",
        marginTop: 10,
        color: "#555",
    },

    empty: {
        marginTop: 70,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        fontFamily: "Righteous",
        fontSize: 16,
        marginTop: 10,
        color: "#888",
    },

    shadow: {
        marginTop: 25,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 14,
        gap: 8,
    },

    text: {
        color: "#FFF",
        fontSize: 15,
        fontFamily: "Righteous",
    },

    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
    },

    fabButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },
});