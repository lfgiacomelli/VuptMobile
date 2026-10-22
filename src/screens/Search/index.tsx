import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
    Keyboard,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../../services/api";

type Empresa = {
    emp_codigo: number;
    emp_nome: string;
    emp_bairro?: string | null;
    emp_cidade?: string | null;
    emp_logotipo?: string | null;
};

type RootNavigation = {
    navigate: (screen: "Company", params: { emp_codigo: number }) => void;
};

function normalizeText(value: string = "") {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function getSimilarityScore(company: Empresa, query: string) {
    const normalizedQuery = normalizeText(query);
    const name = normalizeText(company.emp_nome || "");
    const district = normalizeText(company.emp_bairro || "");
    const city = normalizeText(company.emp_cidade || "");

    if (!normalizedQuery) return 0;

    if (name === normalizedQuery) return 100;
    if (name.startsWith(normalizedQuery)) return 94;
    if (name.includes(normalizedQuery)) return 84;
    if (district.startsWith(normalizedQuery)) return 72;
    if (district.includes(normalizedQuery)) return 62;
    if (city.includes(normalizedQuery)) return 48;

    const queryWords = normalizedQuery.split(" ").filter(Boolean);
    const nameWords = name.split(" ").filter(Boolean);
    const districtWords = district.split(" ").filter(Boolean);
    const cityWords = city.split(" ").filter(Boolean);

    let score = 0;

    queryWords.forEach((word) => {
        if (nameWords.some((item) => item.startsWith(word))) score += 24;
        else if (nameWords.some((item) => item.includes(word))) score += 17;
        else if (districtWords.some((item) => item.startsWith(word))) score += 12;
        else if (districtWords.some((item) => item.includes(word))) score += 8;
        else if (cityWords.some((item) => item.startsWith(word))) score += 6;
    });

    return score;
}

function getCompanyImage(item: Empresa) {
    return item.emp_logotipo || null;
}

export function Search() {
    const navigation = useNavigation<RootNavigation>();

    const [city, setCity] = useState("");
    const [search, setSearch] = useState("");
    const [companies, setCompanies] = useState<Empresa[]>([]);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [cancelWidth, setCancelWidth] = useState(0);

    const inputRef = useRef<TextInput>(null);

    const headerTranslateY = useRef(new Animated.Value(0)).current;
    const reserveRightSpace = useRef(new Animated.Value(0)).current;
    const cancelOpacity = useRef(new Animated.Value(0)).current;
    const cancelTranslateX = useRef(new Animated.Value(8)).current;
    const searchShadow = useRef(new Animated.Value(0)).current;
    const listOpacityAnim = useRef(new Animated.Value(0)).current;
    const listTranslateAnim = useRef(new Animated.Value(18)).current;

    const animateSearchOpen = useCallback(() => {
        const space = cancelWidth > 0 ? cancelWidth + 12 : 86;

        Animated.parallel([
            Animated.timing(reserveRightSpace, {
                toValue: space,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(cancelOpacity, {
                toValue: 1,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(cancelTranslateX, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(searchShadow, {
                toValue: 1,
                duration: 220,
                useNativeDriver: false,
            }),
            Animated.timing(headerTranslateY, {
                toValue: -2,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start();
    }, [cancelOpacity, cancelTranslateX, cancelWidth, headerTranslateY, reserveRightSpace, searchShadow]);

    const animateSearchClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(reserveRightSpace, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(cancelOpacity, {
                toValue: 0,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(cancelTranslateX, {
                toValue: 8,
                duration: 160,
                useNativeDriver: true,
            }),
            Animated.timing(searchShadow, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [cancelOpacity, cancelTranslateX, headerTranslateY, reserveRightSpace, searchShadow]);

    const animateListIn = useCallback(() => {
        listOpacityAnim.setValue(0);
        listTranslateAnim.setValue(18);

        Animated.parallel([
            Animated.timing(listOpacityAnim, {
                toValue: 1,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(listTranslateAnim, {
                toValue: 0,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, [listOpacityAnim, listTranslateAnim]);

    const fetchCompaniesByCity = useCallback(async (cidade: string) => {
        try {
            setLoadingCompanies(true);
            setErrorMessage("");

            const response = await api.get<{ success: boolean; data: Empresa[] }>(
                `/users/companies/${encodeURIComponent(cidade)}`
            );

            const data = Array.isArray(response?.data?.data) ? response.data.data : [];
            setCompanies(data);
            animateListIn();
        } catch (error) {
            console.log("Erro ao buscar empresas:", error);
            setCompanies([]);
            setErrorMessage("Não foi possível carregar as empresas da sua cidade.");
        } finally {
            setLoadingCompanies(false);
            setRefreshing(false);
        }
    }, [animateListIn]);

    const getCurrentCity = useCallback(async () => {
        try {
            setLoadingLocation(true);
            setErrorMessage("");

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setErrorMessage("Permissão de localização não concedida.");
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const reverse = await Location.reverseGeocodeAsync({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
            });

            const detectedCity =
                reverse?.[0]?.city ||
                reverse?.[0]?.subregion ||
                reverse?.[0]?.region ||
                "";

            if (!detectedCity) {
                setErrorMessage("Não foi possível identificar sua cidade.");
                return;
            }

            setCity(detectedCity);
            await fetchCompaniesByCity(detectedCity);
        } catch (error) {
            console.log("Erro ao obter cidade:", error);
            setErrorMessage("Não foi possível obter sua localização atual.");
        } finally {
            setLoadingLocation(false);
        }
    }, [fetchCompaniesByCity]);

    useEffect(() => {
        getCurrentCity();
    }, [getCurrentCity]);

    const filteredCompanies = useMemo(() => {
        if (!search.trim()) return companies;

        return [...companies]
            .map((company) => ({
                ...company,
                __score: getSimilarityScore(company, search),
            }))
            .filter((company) => company.__score > 0)
            .sort((a, b) => b.__score - a.__score);
    }, [companies, search]);

    const onRefresh = useCallback(() => {
        if (!city) return;
        setRefreshing(true);
        fetchCompaniesByCity(city);
    }, [city, fetchCompaniesByCity]);

    const handleFocusSearch = useCallback(() => {
        animateSearchOpen();
    }, [animateSearchOpen]);

    const handleBlurSearch = useCallback(() => {
        if (search.trim()) return;
        animateSearchClose();
    }, [animateSearchClose, search]);

    const handleCancelSearch = useCallback(() => {
        setSearch("");
        Keyboard.dismiss();
        animateSearchClose();
    }, [animateSearchClose]);

    const renderItem = useCallback(
        ({ item }: { item: Empresa }) => {
            const imageUri = getCompanyImage(item);

            return (
                <TouchableOpacity
                    activeOpacity={0.72}
                    style={styles.rowTouchable}
                    onPress={() => navigation.navigate("Company", { emp_codigo: item.emp_codigo })}
                >
                    <View style={styles.row}>
                        <View style={styles.logoWrap}>
                            {imageUri ? (
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.logo}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.logoFallback}>
                                    <Ionicons name="business-outline" size={18} color="#98A2B3" />
                                </View>
                            )}
                        </View>

                        <View style={styles.rowContent}>
                            <Text style={styles.companyName} numberOfLines={1}>
                                {item.emp_nome}
                            </Text>

                            <View style={styles.metaRow}>
                                <Ionicons name="location-outline" size={13} color="#98A2B3" />
                                <Text style={styles.companyMeta} numberOfLines={1}>
                                    {item.emp_bairro || item.emp_cidade || "Localização indisponível"}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.rowAction}>
                            <Ionicons name="chevron-forward" size={17} color="#C2C8D0" />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [navigation]
    );

    const showInitialLoader =
        loadingLocation || (loadingCompanies && !refreshing && companies.length === 0);

    const searchElevation = searchShadow.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const searchShadowOpacity = searchShadow.interpolate({
        inputRange: [0, 1],
        outputRange: [0.04, 0.08],
    });

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerTranslateY }],
                    },
                ]}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Empresas próximas</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                        {city ? `Empresas disponíveis em ${city}` : "Identificando sua cidade..."}
                    </Text>
                </View>

                <View style={styles.searchRow}>
                    <Animated.View
                        style={[
                            styles.searchBox,
                            {
                                marginRight: reserveRightSpace,
                                shadowOpacity: searchShadowOpacity,
                                elevation: searchElevation,
                            },
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={19}
                            color="#94A3B8"
                            style={styles.searchIcon}
                        />

                        <TextInput
                            ref={inputRef}
                            value={search}
                            onChangeText={setSearch}
                            onFocus={handleFocusSearch}
                            onBlur={handleBlurSearch}
                            placeholder="Buscar empresa ou bairro"
                            placeholderTextColor="#A8B0BB"
                            style={styles.searchInput}
                            returnKeyType="search"
                            selectionColor="#111827"
                        />

                        {!!search && (
                            <TouchableOpacity
                                onPress={() => setSearch("")}
                                activeOpacity={0.8}
                                style={styles.clearButton}
                            >
                                <Ionicons name="close-circle" size={18} color="#A8B0BB" />
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </View>
            </Animated.View>

            {showInitialLoader ? (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.centerStateText}>Preparando sua busca...</Text>
                </View>
            ) : errorMessage ? (
                <View style={styles.centerState}>
                    <View style={styles.errorIcon}>
                        <Ionicons name="location-outline" size={22} color="#667085" />
                    </View>

                    <Text style={styles.centerStateTitle}>Não foi possível continuar</Text>
                    <Text style={styles.centerStateText}>{errorMessage}</Text>

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={getCurrentCity}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Animated.View
                    style={[
                        styles.listWrapper,
                        {
                            opacity: listOpacityAnim,
                            transform: [{ translateY: listTranslateAnim }],
                        },
                    ]}
                >
                    <FlatList
                        data={filteredCompanies}
                        keyExtractor={(item) => String(item.emp_codigo)}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.listContent,
                            filteredCompanies.length === 0 && styles.listContentEmpty,
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#111827"
                            />
                        }
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons name="search-outline" size={24} color="#98A2B3" />
                                </View>
                                <Text style={styles.emptyTitle}>Nenhuma empresa encontrada</Text>
                                <Text style={styles.emptyText}>
                                    Tente buscar por outro nome ou bairro para encontrar resultados
                                    parecidos.
                                </Text>
                            </View>
                        }
                    />
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingBottom: 100
    },

    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 10 : 4,
        paddingBottom: 10,
        backgroundColor: "#F8FAFC",
    },

    headerTop: {
        marginBottom: 16,
    },

    headerTitle: {
        fontSize: 28,
        color: "#111827",
        fontFamily: "Righteous",
    },

    headerSubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: "#98A2B3",
        fontFamily: "Righteous",
    },

    searchRow: {
        position: "relative",
        justifyContent: "center",
        minHeight: 56,
    },

    searchBox: {
        height: 54,
        width: "100%",
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#111827",
        fontFamily: "Righteous",
        paddingVertical: 0,
    },

    clearButton: {
        marginLeft: 8,
    },

    cancelContainer: {
        position: "absolute",
        right: 0,
        height: 54,
        justifyContent: "center",
        alignItems: "flex-end",
    },

    cancelText: {
        fontSize: 14,
        color: "#111827",
        fontFamily: "Righteous",
    },

    listWrapper: {
        flex: 1,
    },

    listContent: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 32,
    },

    listContentEmpty: {
        flexGrow: 1,
        justifyContent: "center",
    },

    rowTouchable: {
        borderRadius: 18,
    },

    row: {
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    logoWrap: {
        width: 54,
        height: 54,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#EEF2F6",
        justifyContent: "center",
        alignItems: "center",
    },

    logo: {
        width: "100%",
        height: "100%",
    },

    logoFallback: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#EEF2F6",
    },

    rowContent: {
        flex: 1,
        marginLeft: 14,
        justifyContent: "center",
    },

    companyName: {
        fontSize: 16,
        color: "#111827",
        fontFamily: "Righteous",
        marginBottom: 5,
    },

    metaRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    companyMeta: {
        marginLeft: 5,
        fontSize: 12,
        color: "#98A2B3",
        fontFamily: "Righteous",
        flexShrink: 1,
    },

    rowAction: {
        marginLeft: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    separator: {
        height: 1,
        backgroundColor: "#EEF2F6",
        marginLeft: 68,
    },

    centerState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },

    errorIcon: {
        width: 56,
        height: 56,
        borderRadius: 18,
        backgroundColor: "#EEF2F6",
        justifyContent: "center",
        alignItems: "center",
    },

    centerStateTitle: {
        marginTop: 14,
        fontSize: 18,
        color: "#111827",
        textAlign: "center",
        fontFamily: "Righteous",
    },

    centerStateText: {
        marginTop: 10,
        fontSize: 13,
        lineHeight: 20,
        color: "#98A2B3",
        textAlign: "center",
        fontFamily: "Righteous",
    },

    retryButton: {
        marginTop: 18,
        backgroundColor: "#111827",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 12,
    },

    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontFamily: "Righteous",
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    emptyIcon: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#EEF2F6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
    },

    emptyTitle: {
        fontSize: 18,
        color: "#111827",
        textAlign: "center",
        fontFamily: "Righteous",
    },

    emptyText: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 20,
        color: "#98A2B3",
        textAlign: "center",
        fontFamily: "Righteous",
    },
});