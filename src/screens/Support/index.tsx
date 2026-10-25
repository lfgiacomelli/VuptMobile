import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import LottieView from "lottie-react-native";
import * as Haptics from "expo-haptics";

import { useToast } from "../../contexts/ToastContext";

import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import useRighteousFont from "../../hooks/useFont";

import supportAnimation from "../../assets/animations/supportAnimation.json";
import emptyAnimation from "../../assets/animations/emptyAnimation.json";
import { Header } from "../../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";

type SupportItem = {
    sup_codigo: number;
    emp_codigo: number;
    usu_codigo: number;
    ate_codigo: number | null;
    sup_motivo: string;
    sup_descricao: string | null;
    sup_status:
    | "aberto"
    | "em_atendimento"
    | "em_andamento"
    | "finalizado"
    | "cancelado";
    sup_created_at: string;
    sup_updated_at: string;
    sup_finalizado_at: string | null;
    emp_nome?: string;
    ate_nome?: string | null;
};

const statusConfig = {
    aberto: {
        label: "Aberto",
        color: "#15803D",
        background: "#DCFCE7",
        icon: "time-outline",
    },
    em_atendimento: {
        label: "Em atendimento",
        color: "#B45309",
        background: "#FEF3C7",
        icon: "chatbubble-ellipses-outline",
    },
    finalizado: {
        label: "Finalizado",
        color: "#4B5563",
        background: "#E5E7EB",
        icon: "checkmark-done-circle-outline",
    },
    cancelado: {
        label: "Cancelado",
        color: "#B91C1C",
        background: "#FEE2E2",
        icon: "close-circle-outline",
    },
} as const;

export function Support() {
    const navigation = useNavigation<any>();
    const modalizeRef = useRef<Modalize>(null);
    const { user } = useAuth();
    const fontLoaded = useRighteousFont();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [supports, setSupports] = useState<SupportItem[]>([]);

    const fetchSupports = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await api.get(`/supports/user/${user?.usu_codigo}`);
            const data: SupportItem[] = response?.data?.data || [];

            setSupports(data);
        } catch (error) {
            console.log("Erro ao buscar chamados:", error);
            setSupports([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.usu_codigo]);

    useFocusEffect(
        useCallback(() => {
            fetchSupports();
        }, [fetchSupports])
    );

    const openCount = supports.length;

    const summaryText = useMemo(() => {
        if (openCount === 0) return "Nenhum chamado aberto no momento";
        if (openCount === 1) return "1 chamado aberto aguardando andamento";
        return `${openCount} chamados abertos aguardando andamento`;
    }, [openCount]);

    const handleRefresh = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        fetchSupports(true);
    }, [fetchSupports]);

    const handleOpenConfirmation = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const openSupports = supports.filter(
            (s) => s.sup_status === "aberto" || s.sup_status === "em_atendimento"
        );
        if (openSupports.length >= 3) {
            showToast({
                title: "Limite de chamados abertos atingido",
                subtitle: "Você já possui 3 ou mais chamados abertos. Por favor, aguarde o andamento dos seus chamados atuais antes de abrir novos.",
            });
            return;
        }
        modalizeRef.current?.open();
    }, []);

    const handleGoToAddSupport = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        modalizeRef.current?.close();
        navigation.navigate("AddSupport");
    }, [navigation]);

    const formatFullDate = (date: string) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getRelativeTime = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffMs = now.getTime() - created.getTime();

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Agora";
        if (minutes < 60) return `${minutes} min`;
        if (hours < 24) return `${hours}h`;
        return `${days}d`;
    };

    const renderSupportCard = ({ item }: { item: SupportItem }) => {
        const status =
            statusConfig[item.sup_status as keyof typeof statusConfig] ||
            statusConfig.aberto;

        const isChatAvailable = item.sup_status === "em_atendimento" || item.sup_status === "em_andamento";
        const handleOpenSupport = async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            if (isChatAvailable) {
                navigation.navigate("ChatSupport", {
                    sup_codigo: item.sup_codigo,
                });
                console.log(item.sup_codigo);
                return;
            }

            if (item.sup_status === "aberto") {
                showToast({
                    title: "Chamado ainda não está em atendimento",
                    subtitle: "Aguarde um atendente assumir seu chamado para iniciar o chat.",
                })
            }

        };

        return (
            <TouchableOpacity
                activeOpacity={0.86}
                style={styles.card}
                onPress={handleOpenSupport}
            >
                <View style={styles.cardTopRow}>
                    <View style={styles.cardIconBox}>
                        <MaterialIcons name="support-agent" size={24} color="black" />
                    </View>

                    <View style={styles.cardMainContent}>
                        <View style={styles.cardTitleRow}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                {item.sup_motivo}
                            </Text>

                            <View style={styles.timePill}>
                                <Text style={styles.timePillText}>
                                    {getRelativeTime(item.sup_created_at)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.companyRow}>
                            <Ionicons name="business-outline" size={13} color="#9CA3AF" />
                            <Text style={styles.companyText} numberOfLines={1}>
                                {item.emp_nome || "Empresa não identificada"}
                            </Text>
                        </View>
                    </View>
                </View>

                {!!item.sup_descricao && (
                    <Text style={styles.cardDescription} numberOfLines={2}>
                        {item.sup_descricao}
                    </Text>
                )}

                <View style={styles.cardBottomRow}>
                    <View style={[styles.statusPill, { backgroundColor: status.background }]}>
                        <Ionicons
                            name={status.icon as any}
                            size={13}
                            color={status.color}
                        />
                        <Text style={[styles.statusPillText, { color: status.color }]}>
                            {status.label}
                        </Text>
                    </View>

                    <View style={styles.metaInfo}>
                        <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                        <Text style={styles.metaText}>
                            {formatFullDate(item.sup_created_at)}
                        </Text>
                    </View>
                </View>

                <View style={styles.attendantRow}>
                    {item.ate_nome ? (
                        <>
                            <Ionicons name="person-outline" size={13} color="#6B7280" />
                            <Text style={styles.attendantText} numberOfLines={1}>
                                Em atendimento com {item.ate_nome}
                            </Text>
                        </>
                    ) : (
                        <>
                            <View style={styles.waitingDot} />
                            <Text style={styles.waitingText}>
                                Aguardando atendimento
                            </Text>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const Loading = () => (
        <View style={styles.headerContent}>
            <View style={styles.heroSection}>
                <LottieView
                    source={supportAnimation}
                    autoPlay
                    loop
                    style={styles.heroAnimation}
                />

                <Text style={styles.heroTitle}>
                    Central de suporte
                </Text>
            </View>

            <View style={styles.summaryCard}>
                <View style={styles.summaryLeft}>
                    <Text style={styles.summaryTitle}>Seus chamados abertos</Text>
                    <Text style={styles.summaryDescription}>{summaryText}</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.primaryActionButton}
                    onPress={handleOpenConfirmation}
                >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionButtonText}>Novo</Text>
                </TouchableOpacity>
            </View>

            {openCount > 0 && (
                <Text style={styles.listLabel}>
                    Últimos 3 chamados abertos
                </Text>
            )}
        </View>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <LottieView
                source={emptyAnimation}
                autoPlay
                loop
                style={styles.emptyAnimation}
            />

            <Text style={styles.emptyTitle}>
                Nenhum chamado em aberto
            </Text>

            <Text style={styles.emptySubtitle}>
                Você ainda não possui solicitações abertas. Quando precisar,
                abra um novo chamado para falar com o suporte.
            </Text>

            <TouchableOpacity
                activeOpacity={0.88}
                style={styles.emptyPrimaryButton}
                onPress={handleOpenConfirmation}
            >
                <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#FFFFFF"
                />
                <Text style={styles.emptyPrimaryButtonText}>
                    Abrir chamado
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (!fontLoaded) {
        return (
            <View style={styles.centeredState}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Loading />
                <View style={styles.centeredState}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Carregando seus chamados...</Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Suporte" subtitle="Precisa de ajuda?" showBack />
            <FlatList
                data={supports}
                keyExtractor={(item) => String(item.sup_codigo)}
                renderItem={renderSupportCard}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={<Loading />}
                ListEmptyComponent={<EmptyState />}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#111827"
                    />
                }
            />

            <Modalize
                ref={modalizeRef}
                adjustToContentHeight
                handlePosition="inside"
                modalStyle={styles.modal}
                handleStyle={styles.modalHandle}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalIconBox}>
                        <Ionicons
                            name="chatbubble-ellipses-outline"
                            size={28}
                            color="#111827"
                        />
                    </View>

                    <Text style={styles.modalTitle}>
                        Abrir novo chamado
                    </Text>

                    <Text style={styles.modalDescription}>
                        Deseja realmente abrir uma nova solicitação de suporte?
                        Você será direcionado para a tela de criação do chamado.
                    </Text>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            activeOpacity={0.88}
                            style={styles.modalSecondaryButton}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                modalizeRef.current?.close();
                            }}
                        >
                            <Text style={styles.modalSecondaryButtonText}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.88}
                            style={styles.modalPrimaryButton}
                            onPress={handleGoToAddSupport}
                        >
                            <Text style={styles.modalPrimaryButtonText}>
                                Confirmar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modalize>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    listContent: {
        paddingTop: Platform.OS === "ios" ? 18 : 14,
        paddingBottom: 34,
    },

    headerContent: {
        paddingHorizontal: 10,
        paddingBottom: 18,
    },

    heroSection: {
        alignItems: "center",
        marginBottom: 22,
    },

    heroAnimation: {
        width: 170,
        height: 170,
        marginBottom: 6,
    },

    heroTitle: {
        fontSize: 25,
        fontFamily: "Righteous",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
    },

    summaryCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
        elevation: 2,
        marginBottom: 18,
    },

    summaryLeft: {
        flex: 1,
        paddingRight: 12,
    },

    summaryTitle: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: "#111827",
        marginBottom: 6,
    },

    summaryDescription: {
        fontSize: 12,
        lineHeight: 19,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    primaryActionButton: {
        minWidth: 92,
        height: 46,
        borderRadius: 10,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        paddingHorizontal: 14,
    },

    primaryActionButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },

    listLabel: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#111827",
        marginBottom: 2,
    },

    separator: {
        height: 12,
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 16,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },

    cardTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },

    cardIconBox: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },

    cardMainContent: {
        flex: 1,
    },

    cardTitleRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
    },

    cardTitle: {
        flex: 1,
        fontSize: 15,
        fontFamily: "Righteous",
        color: "#111827",
    },

    timePill: {
        backgroundColor: "#F3F4F6",
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    timePillText: {
        fontSize: 10,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    companyRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },

    companyText: {
        flex: 1,
        fontSize: 12,
        fontFamily: "Righteous",
        color: "#9CA3AF",
    },

    cardDescription: {
        marginTop: 14,
        marginBottom: 14,
        fontSize: 12,
        lineHeight: 20,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    cardBottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
    },

    statusPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },

    statusPillText: {
        fontSize: 11,
        fontFamily: "Righteous",
    },

    metaInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    metaText: {
        fontSize: 11,
        fontFamily: "Righteous",
        color: "#9CA3AF",
    },

    attendantRow: {
        minHeight: 18,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },

    attendantText: {
        flex: 1,
        fontSize: 11,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    waitingDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: "#F59E0B",
    },

    waitingText: {
        flex: 1,
        fontSize: 11,
        fontFamily: "Righteous",
        color: "#B45309",
    },

    centeredState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
    },

    emptyAnimation: {
        width: 165,
        height: 165,
        marginBottom: 8,
    },

    emptyTitle: {
        fontSize: 19,
        fontFamily: "Righteous",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 13,
        lineHeight: 21,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 22,
    },

    emptyPrimaryButton: {
        height: 48,
        borderRadius: 16,
        backgroundColor: "#111827",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    emptyPrimaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },

    modal: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
    },

    modalHandle: {
        width: 46,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#D1D5DB",
        marginTop: 10,
    },

    modalContent: {
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 30,
    },

    modalIconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 18,
    },

    modalTitle: {
        fontSize: 22,
        fontFamily: "Righteous",
        color: "#111827",
        textAlign: "center",
        marginBottom: 10,
    },

    modalDescription: {
        fontSize: 13,
        lineHeight: 21,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
    },

    modalActions: {
        flexDirection: "row",
        gap: 12,
    },

    modalSecondaryButton: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },

    modalSecondaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#6B7280",
    },

    modalPrimaryButton: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
    },

    modalPrimaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },
});