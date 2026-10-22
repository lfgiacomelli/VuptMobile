import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    ActivityIndicator,
    Animated,
    Linking,
    Alert,
    RefreshControl,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import { Header } from "../../components/Header";
import useRighteousFont from "../../hooks/useFont";
import { useToast } from "../../contexts/ToastContext";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

type PermissionStatusUI = "granted" | "denied" | "undetermined";

interface AppPreferences {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    autoRefreshEnabled: boolean;
    liveLocationEnabled: boolean;
}

const STORAGE_KEY = "@app_settings_preferences";

const DEFAULT_PREFERENCES: AppPreferences = {
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    autoRefreshEnabled: true,
    liveLocationEnabled: true,
};

function getPermissionConfig(status: PermissionStatusUI) {
    switch (status) {
        case "granted":
            return {
                label: "Permitido",
                color: "#16A34A",
                bg: "rgba(22, 163, 74, 0.10)",
                icon: "checkmark-circle",
            };
        case "denied":
            return {
                label: "Negado",
                color: "#DC2626",
                bg: "rgba(220, 38, 38, 0.10)",
                icon: "close-circle",
            };
        default:
            return {
                label: "Pendente",
                color: "#D97706",
                bg: "rgba(217, 119, 6, 0.10)",
                icon: "time",
            };
    }
}

function PermissionCard({
    title,
    subtitle,
    icon,
    status,
    onRequest,
    onOpenSettings,
    loading,
}: {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    status: PermissionStatusUI;
    onRequest: () => void;
    onOpenSettings: () => void;
    loading?: boolean;
}) {
    const config = getPermissionConfig(status);

    return (
        <View style={styles.permissionCard}>
            <View style={styles.permissionTopRow}>
                <View style={styles.permissionIconBox}>
                    <Ionicons name={icon} size={20} color="#2563EB" />
                </View>

                <View style={styles.permissionContent}>
                    <View style={styles.permissionHeaderRow}>
                        <Text style={styles.permissionTitle}>{title}</Text>

                        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                            <Ionicons name={config.icon as any} size={12} color={config.color} />
                            <Text style={[styles.statusBadgeText, { color: config.color }]}>
                                {config.label}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.permissionSubtitle}>{subtitle}</Text>
                </View>
            </View>

            <View style={styles.permissionActions}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.secondaryAction}
                    onPress={onOpenSettings}
                >
                    <Ionicons name="settings-outline" size={16} color="#475569" />
                    <Text style={styles.secondaryActionText}>Abrir ajustes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.primaryAction}
                    onPress={onRequest}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                            <Text style={styles.primaryActionText}>
                                {status === "granted" ? "Atualizar" : "Permitir"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

function PreferenceRow({
    icon,
    title,
    subtitle,
    value,
    onChange,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <View style={styles.preferenceRow}>
            <View style={styles.preferenceLeft}>
                <View style={styles.preferenceIconBox}>
                    <Ionicons name={icon} size={18} color="#0F172A" />
                </View>

                <View style={styles.preferenceTexts}>
                    <Text style={styles.preferenceTitle}>{title}</Text>
                    <Text style={styles.preferenceSubtitle}>{subtitle}</Text>
                </View>
            </View>

            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={value ? "#2563EB" : "#F8FAFC"}
            />
        </View>
    );
}

function MenuRow({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
}) {
    return (
        <TouchableOpacity activeOpacity={0.8} style={styles.menuRow} onPress={onPress}>
            <View style={styles.menuLeft}>
                <View
                    style={[
                        styles.menuIconBox,
                        danger && { backgroundColor: "rgba(220, 38, 38, 0.10)" },
                    ]}
                >
                    <Ionicons
                        name={icon}
                        size={18}
                        color={danger ? "#DC2626" : "#111827"}
                    />
                </View>

                <View style={styles.menuTexts}>
                    <Text style={[styles.menuTitle, danger && { color: "#DC2626" }]}>
                        {title}
                    </Text>
                    {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
                </View>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
    );
}

export function Settings() {
    const fontLoaded = useRighteousFont();
    const navigation = useNavigation<any>();
    const { showToast } = useToast();

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [loadingLocation, setLoadingLocation] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const [locationPermission, setLocationPermission] =
        useState<PermissionStatusUI>("undetermined");
    const [notificationPermission, setNotificationPermission] =
        useState<PermissionStatusUI>("undetermined");

    const [preferences, setPreferences] =
        useState<AppPreferences>(DEFAULT_PREFERENCES);

    const appVersion = useMemo(() => {
        return (
            Constants.expoConfig?.version ||
            Constants.manifest2?.extra?.expoClient?.version ||
            "1.0.0"
        );
    }, []);

    const runFadeIn = useCallback(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const savePreferences = useCallback(async (next: AppPreferences) => {
        setPreferences(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, []);

    const updatePreference = useCallback(
        async (key: keyof AppPreferences, value: boolean) => {
            const next = { ...preferences, [key]: value };
            await savePreferences(next);

            showToast({
                title: "Preferência atualizada",
                subtitle: "Suas configurações foram salvas",
                status: "success",
            });
        },
        [preferences, savePreferences, showToast]
    );

    const loadPreferences = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);

            if (stored) {
                const parsed = JSON.parse(stored) as AppPreferences;
                setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
            } else {
                setPreferences(DEFAULT_PREFERENCES);
            }
        } catch {
            setPreferences(DEFAULT_PREFERENCES);
        }
    }, []);

    const loadPermissionStatuses = useCallback(async () => {
        try {
            const location = await Location.getForegroundPermissionsAsync();
            setLocationPermission(location.status as PermissionStatusUI);

            const notifications = await Notifications.getPermissionsAsync();
            setNotificationPermission(notifications.status as PermissionStatusUI);
        } catch {
            showToast({
                title: "Erro ao verificar permissões",
                subtitle: "Não foi possível consultar os status do app",
                status: "error",
            });
        }
    }, [showToast]);

    const initScreen = useCallback(async () => {
        try {
            setInitialLoading(true);
            await Promise.all([loadPreferences(), loadPermissionStatuses()]);
            runFadeIn();
        } finally {
            setInitialLoading(false);
        }
    }, [loadPreferences, loadPermissionStatuses, runFadeIn]);

    useEffect(() => {
        initScreen();
    }, [initScreen]);

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await Promise.all([loadPreferences(), loadPermissionStatuses()]);
        } finally {
            setRefreshing(false);
        }
    }, [loadPreferences, loadPermissionStatuses]);

    const openSystemSettings = useCallback(async () => {
        try {
            await Linking.openSettings();
        } catch {
            Alert.alert(
                "Não foi possível abrir os ajustes",
                "Abra manualmente as configurações do aplicativo no seu dispositivo."
            );
        }
    }, []);

    const requestLocationPermission = useCallback(async () => {
        try {
            setLoadingLocation(true);

            const result = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(result.status as PermissionStatusUI);

            if (result.status === "granted") {
                showToast({
                    title: "Localização permitida",
                    subtitle: "O app já pode usar sua localização",
                    status: "success",
                });
                return;
            }

            showToast({
                title: "Permissão não concedida",
                subtitle: "Ative a localização nos ajustes do app",
                status: "info",
            });
        } catch {
            showToast({
                title: "Erro ao solicitar localização",
                subtitle: "Tente novamente em instantes",
                status: "error",
            });
        } finally {
            setLoadingLocation(false);
        }
    }, [showToast]);

    const requestNotificationPermission = useCallback(async () => {
        try {
            setLoadingNotifications(true);

            const result = await Notifications.requestPermissionsAsync();
            setNotificationPermission(result.status as PermissionStatusUI);

            if (result.status === "granted") {
                showToast({
                    title: "Notificações permitidas",
                    subtitle: "Você receberá alertas do aplicativo",
                    status: "success",
                });
                return;
            }

            showToast({
                title: "Permissão não concedida",
                subtitle: "Ative as notificações nos ajustes do app",
                status: "info",
            });
        } catch {
            showToast({
                title: "Erro ao solicitar notificações",
                subtitle: "Tente novamente em instantes",
                status: "error",
            });
        } finally {
            setLoadingNotifications(false);
        }
    }, [showToast]);

    const handleGoAddresses = useCallback(() => {
        navigation.navigate("Addresses");
    }, [navigation]);

    const handlePrivacy = useCallback(() => {
        Alert.alert(
            "Privacidade",
            "Aqui você pode direcionar para sua tela ou página de política de privacidade."
        );
    }, []);

    const handleTerms = useCallback(() => {
        Alert.alert(
            "Termos de uso",
            "Aqui você pode direcionar para sua tela ou página de termos de uso."
        );
    }, []);

    const handleHelp = useCallback(() => {
        Alert.alert(
            "Central de ajuda",
            "Aqui você pode abrir FAQ, WhatsApp de suporte ou chat de atendimento."
        );
    }, []);

    const handleAbout = useCallback(() => {
        Alert.alert(
            "Sobre o aplicativo",
            `Versão ${appVersion}\n\nTela de configurações com permissões, preferências e atalhos de suporte.`,
        );
    }, [appVersion]);

    if (!fontLoaded || initialLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Carregando configurações...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Configurações"
                subtitle="PERSONALIZE SUA EXPERIÊNCIA"
            />

            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={["#2563EB"]}
                            tintColor="#2563EB"
                        />
                    }
                >
                        <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Permissões do aplicativo</Text>
                        <Text style={styles.sectionDescription}>
                            Essas permissões impactam diretamente a experiência de uso do app.
                        </Text>

                        <PermissionCard
                            title="Localização"
                            subtitle="Permite detectar sua posição para rotas, origem e acompanhamento da viagem."
                            icon="location-outline"
                            status={locationPermission}
                            onRequest={requestLocationPermission}
                            onOpenSettings={openSystemSettings}
                            loading={loadingLocation}
                        />

                        <PermissionCard
                            title="Notificações"
                            subtitle="Permite receber alertas sobre atualizações, viagens, status e avisos importantes."
                            icon="notifications-outline"
                            status={notificationPermission}
                            onRequest={requestNotificationPermission}
                            onOpenSettings={openSystemSettings}
                            loading={loadingNotifications}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferências</Text>
                        <Text style={styles.sectionDescription}>
                            Configurações locais para melhorar usabilidade e comportamento do aplicativo.
                        </Text>

                        <View style={styles.groupCard}>
                            <PreferenceRow
                                icon="notifications-outline"
                                title="Notificações no app"
                                subtitle="Habilita o recebimento de alertas e avisos do sistema."
                                value={preferences.notificationsEnabled}
                                onChange={(value) =>
                                    updatePreference("notificationsEnabled", value)
                                }
                            />

                            <View style={styles.rowDivider} />

                            <PreferenceRow
                                icon="volume-high-outline"
                                title="Som"
                                subtitle="Reproduz som em notificações e interações importantes."
                                value={preferences.soundEnabled}
                                onChange={(value) => updatePreference("soundEnabled", value)}
                            />

                            <View style={styles.rowDivider} />

                            <PreferenceRow
                                icon="phone-portrait-outline"
                                title="Vibração"
                                subtitle="Ativa feedback tátil em notificações e ações do app."
                                value={preferences.vibrationEnabled}
                                onChange={(value) => updatePreference("vibrationEnabled", value)}
                            />

                            <View style={styles.rowDivider} />

                            <PreferenceRow
                                icon="refresh-outline"
                                title="Atualização automática"
                                subtitle="Mantém dados e status atualizados automaticamente."
                                value={preferences.autoRefreshEnabled}
                                onChange={(value) => updatePreference("autoRefreshEnabled", value)}
                            />

                            <View style={styles.rowDivider} />

                            <PreferenceRow
                                icon="navigate-outline"
                                title="Localização em tempo real"
                                subtitle="Melhora precisão de rotas e acompanhamento de deslocamento."
                                value={preferences.liveLocationEnabled}
                                onChange={(value) => updatePreference("liveLocationEnabled", value)}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Conta e dados</Text>

                        <View style={styles.groupCard}>
                            <MenuRow
                                icon="location-outline"
                                title="Endereços salvos"
                                subtitle="Gerencie seus endereços favoritos e locais frequentes."
                                onPress={handleGoAddresses}
                            />

                            <View style={styles.rowDivider} />

                            <MenuRow
                                icon="shield-outline"
                                title="Política de privacidade"
                                subtitle="Saiba como seus dados são utilizados e protegidos."
                                onPress={handlePrivacy}
                            />

                            <View style={styles.rowDivider} />

                            <MenuRow
                                icon="document-text-outline"
                                title="Termos de uso"
                                subtitle="Consulte as regras e condições de utilização do app."
                                onPress={handleTerms}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Suporte e sistema</Text>

                        <View style={styles.groupCard}>
                            <MenuRow
                                icon="help-circle-outline"
                                title="Central de ajuda"
                                subtitle="Acesse suporte, dúvidas frequentes e orientações."
                                onPress={handleHelp}
                            />

                            <View style={styles.rowDivider} />

                            <MenuRow
                                icon="settings-outline"
                                title="Ajustes do dispositivo"
                                subtitle="Abra as configurações do sistema para este aplicativo."
                                onPress={openSystemSettings}
                            />

                            <View style={styles.rowDivider} />

                            <MenuRow
                                icon="information-circle-outline"
                                title="Sobre o aplicativo"
                                subtitle={`Versão ${appVersion}`}
                                onPress={handleAbout}
                            />
                        </View>
                    </View>

                    <Text style={styles.footerText}>
                        Algumas permissões dependem das configurações do sistema operacional e
                        podem exigir ajuste manual no dispositivo.
                    </Text>
                </ScrollView>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        justifyContent: "center",
        alignItems: "center",
    },

    loadingText: {
        marginTop: 12,
        fontFamily: "Righteous",
        color: "#475569",
        fontSize: 14,
    },

    scrollContent: {
        padding: 16,
        paddingBottom: 36,
    },

    heroCard: {
        borderRadius: 22,
        padding: 18,
        marginBottom: 18,
        shadowColor: "#1D4ED8",
        shadowOpacity: 0.16,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },

    heroRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },

    heroIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.16)",
        alignItems: "center",
        justifyContent: "center",
    },

    heroTitle: {
        fontFamily: "Righteous",
        fontSize: 18,
        color: "#fff",
        marginBottom: 4,
    },

    heroSubtitle: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "rgba(255,255,255,0.88)",
        lineHeight: 18,
    },

    section: {
        marginBottom: 22,
    },

    sectionTitle: {
        fontFamily: "Righteous",
        fontSize: 16,
        color: "#0F172A",
        marginBottom: 6,
    },

    sectionDescription: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#64748B",
        lineHeight: 18,
        marginBottom: 12,
    },

    groupCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },

    permissionCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 12,
    },

    permissionTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    permissionIconBox: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "rgba(37, 99, 235, 0.10)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    permissionContent: {
        flex: 1,
    },

    permissionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 6,
    },

    permissionTitle: {
        fontFamily: "Righteous",
        fontSize: 15,
        color: "#111827",
        flex: 1,
    },

    permissionSubtitle: {
        fontFamily: "Righteous",
        fontSize: 12,
        color: "#64748B",
        lineHeight: 18,
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },

    statusBadgeText: {
        fontFamily: "Righteous",
        fontSize: 10,
    },

    permissionActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 14,
        gap: 10,
    },

    secondaryAction: {
        flex: 1,
        minHeight: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        backgroundColor: "#F8FAFC",
    },

    secondaryActionText: {
        fontFamily: "Righteous",
        color: "#475569",
        fontSize: 12,
    },

    primaryAction: {
        flex: 1,
        minHeight: 44,
        borderRadius: 14,
        backgroundColor: "#2563EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },

    primaryActionText: {
        fontFamily: "Righteous",
        color: "#fff",
        fontSize: 12,
    },

    preferenceRow: {
        minHeight: 76,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },

    preferenceLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },

    preferenceIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    preferenceTexts: {
        flex: 1,
    },

    preferenceTitle: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#111827",
        marginBottom: 4,
    },

    preferenceSubtitle: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#64748B",
        lineHeight: 16,
    },

    menuRow: {
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
    },

    menuLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },

    menuIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    menuTexts: {
        flex: 1,
    },

    menuTitle: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#111827",
        marginBottom: 4,
    },

    menuSubtitle: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#64748B",
        lineHeight: 16,
    },

    rowDivider: {
        height: 1,
        backgroundColor: "#E2E8F0",
    },

    footerText: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: 17,
        marginTop: 6,
        paddingHorizontal: 8,
    },
});