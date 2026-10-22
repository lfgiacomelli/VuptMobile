import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    SectionList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";

import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import useRighteousFont from "../../hooks/useFont";
import { Header } from "../../components/Header";

import emptyAnimationBlue from "../../assets/animations/emptyAnimationBlue.json";

type ReviewItem = {
    ava_codigo: number;
    usu_codigo: number;
    via_codigo: number;
    ava_comentario?: string | null;
    ava_nota: number;
    created_at: string;
    updated_at?: string;
};

type ReviewSection = {
    title: string;
    rawDate: string;
    data: ReviewItem[];
};

if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const CustomLayoutAnimation = {
    duration: 320,
    create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
};

function StarRating({
    value,
    size = 18,
}: {
    value: number;
    size?: number;
}) {
    return (
        <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= value;

                return (
                    <Ionicons
                        key={star}
                        name={filled ? "star" : "star-outline"}
                        size={size}
                        color={filled ? "#FFB400" : "#D3D3D3"}
                    />
                );
            })}
        </View>
    );
}

function ReviewCard({
    item,
    isOpen,
    onToggle,
}: {
    item: ReviewItem;
    isOpen: boolean;
    onToggle: (id: number) => void;
}) {
    const hasComment =
        !!item.ava_comentario && item.ava_comentario.trim().length > 0;

    const ratingLabel = useMemo(() => {
        if (item.ava_nota === 5) return "Excelente";
        if (item.ava_nota === 4) return "Muito boa";
        if (item.ava_nota === 3) return "Boa";
        if (item.ava_nota === 2) return "Regular";
        return "Ruim";
    }, [item.ava_nota]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity
                activeOpacity={0.82}
                style={styles.card}
                onPress={() => onToggle(item.ava_codigo)}
            >
                <View style={styles.cardTopRow}>
                    <View style={styles.cardLeft}>
                        <View style={styles.iconBox}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#111" />
                        </View>

                        <View style={styles.cardInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1}>
                                Avaliação da viagem #{item.via_codigo}
                            </Text>

                            <Text style={styles.cardDate}>
                                {formatDateTime(item.created_at)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.cardRight}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{ratingLabel}</Text>
                        </View>

                        <Ionicons
                            name={isOpen ? "chevron-up" : "chevron-down"}
                            size={18}
                            color="#8B8B8B"
                        />
                    </View>
                </View>

                <View style={styles.ratingPreviewRow}>
                    <StarRating value={Number(item.ava_nota || 0)} size={20} />
                    <Text style={styles.ratingValue}>{Number(item.ava_nota).toFixed(1)}</Text>
                </View>

                {isOpen && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="star-outline" size={16} color="#FFB400" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>NOTA INFORMADA</Text>
                                <Text style={styles.detailValue}>
                                    {item.ava_nota} de 5 estrelas
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailIcon}>
                                <Ionicons name="receipt-outline" size={16} color="#4A4A4A" />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={styles.detailLabel}>CÓDIGO DA VIAGEM</Text>
                                <Text style={styles.detailValue}>#{item.via_codigo}</Text>
                            </View>
                        </View>

                        <View style={styles.commentBox}>
                            <Text style={styles.commentTitle}>Comentário</Text>
                            <Text style={styles.commentText}>
                                {hasComment
                                    ? item.ava_comentario
                                    : "Nenhum comentário foi adicionado nesta avaliação."}
                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

export function Reviews() {
    const { user } = useAuth();
    const usu_codigo = user?.usu_codigo;
    const fontLoaded = useRighteousFont();

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const lottieRef = useRef<LottieView>(null);

    const loadReviews = useCallback(async () => {
        if (!usu_codigo) return;

        try {
            const response = await api.get(`/reviews/${usu_codigo}`);
            const data: ReviewItem[] = response.data?.data || [];

            setReviews(data);

            if (data.length > 0) {
                setExpandedId((prev) => prev ?? data[0].ava_codigo);
            }
        } catch (error) {
            console.error("Erro ao carregar avaliações:", error);
        }
    }, [usu_codigo]);

    useEffect(() => {
        async function init() {
            setLoading(true);
            await loadReviews();
            setLoading(false);
        }

        init();
    }, [loadReviews]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadReviews();
        setRefreshing(false);
    }, [loadReviews]);

    const toggleCard = useCallback((id: number) => {
        LayoutAnimation.configureNext(CustomLayoutAnimation);
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const getDateKey = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatSectionDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const sections = useMemo<ReviewSection[]>(() => {
        const grouped = reviews.reduce<Record<string, ReviewItem[]>>((acc, review) => {
            const key = getDateKey(review.created_at);

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push(review);
            return acc;
        }, {});

        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => {
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            })
            .map(([rawDate, items]) => ({
                rawDate,
                title: formatSectionDate(rawDate),
                data: items.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ),
            }));
    }, [reviews]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;

        const total = reviews.reduce((sum, item) => sum + Number(item.ava_nota || 0), 0);
        return total / reviews.length;
    }, [reviews]);

    const renderItem = useCallback(
        ({ item }: { item: ReviewItem }) => (
            <ReviewCard
                item={item}
                isOpen={expandedId === item.ava_codigo}
                onToggle={toggleCard}
            />
        ),
        [expandedId, toggleCard]
    );

    const renderSectionHeader = useCallback(
        ({ section }: { section: ReviewSection }) => (
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>
        ),
        []
    );

    if (!fontLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Histórico de avaliações"
                contador={reviews.length > 0 ? reviews.length : null}
                subtitle={
                    reviews.length === 0
                        ? "NENHUMA AVALIAÇÃO REALIZADA"
                        : reviews.length === 1
                          ? "AVALIAÇÃO REALIZADA"
                          : "AVALIAÇÕES REALIZADAS"
                }
            />

            {reviews.length > 0 && !loading && (
                <View style={styles.summaryCard}>
                    <LinearGradient
                        colors={["#111111", "#242424"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.summaryGradient}
                    >
                        <View>
                            <Text style={styles.summaryLabel}>MÉDIA DAS AVALIAÇÕES</Text>
                            <Text style={styles.summaryValue}>{averageRating.toFixed(1)}</Text>
                        </View>

                        <View style={styles.summaryRight}>
                            <StarRating value={Math.round(averageRating)} size={18} />
                            <Text style={styles.summaryCount}>
                                {reviews.length === 1
                                    ? "1 avaliação"
                                    : `${reviews.length} avaliações`}
                            </Text>
                        </View>
                    </LinearGradient>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#111" />
                    <Text style={styles.loadingText}>Carregando avaliações...</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => String(item.ava_codigo)}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled={false}
                    contentContainerStyle={[
                        styles.listContent,
                        reviews.length === 0 && { flex: 1 },
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#111"]}
                            tintColor="#111"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <LottieView
                                ref={lottieRef}
                                source={emptyAnimationBlue}
                                autoPlay
                                loop
                                style={{ width: 220, height: 220 }}
                            />

                            <Text style={styles.emptyStateText}>
                                Nenhuma avaliação encontrada
                            </Text>

                            <Text style={styles.emptyStateSubtext}>
                                As avaliações realizadas aparecerão aqui{"\n"}
                                para você consultar depois
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F7F7",
    },
    summaryCard: {
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 8,
        borderRadius: 22,
        overflow: "hidden",
    },
    summaryGradient: {
        minHeight: 96,
        paddingHorizontal: 18,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryLabel: {
        color: "rgba(255,255,255,0.72)",
        fontSize: 11,
        letterSpacing: 0.6,
        marginBottom: 4,
        fontFamily: "Righteous",
    },
    summaryValue: {
        color: "#FFF",
        fontSize: 28,
        fontFamily: "Righteous",
    },
    summaryRight: {
        alignItems: "flex-end",
        gap: 6,
    },
    summaryCount: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 12,
        fontFamily: "Righteous",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 32,
    },
    sectionHeader: {
        marginTop: 14,
        marginBottom: 10,
    },
    sectionHeaderText: {
        fontSize: 13,
        color: "#666",
        fontFamily: "Righteous",
    },
    cardContainer: {
        marginBottom: 12,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "#ECECEC",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.04,
        shadowRadius: 18,
        elevation: 2,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    cardLeft: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 14,
        backgroundColor: "#F4F4F4",
        alignItems: "center",
        justifyContent: "center",
    },
    cardInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 15,
        color: "#111",
        fontFamily: "Righteous",
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: "#7A7A7A",
    },
    cardRight: {
        alignItems: "flex-end",
        gap: 8,
    },
    badge: {
        backgroundColor: "rgba(255,180,0,0.14)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    badgeText: {
        color: "#946700",
        fontSize: 11,
        fontFamily: "Righteous",
    },
    ratingPreviewRow: {
        marginTop: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingValue: {
        fontSize: 14,
        color: "#111",
        fontFamily: "Righteous",
    },
    expandedContent: {
        marginTop: 14,
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginBottom: 14,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 12,
    },
    detailIcon: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: "#F7F7F7",
        alignItems: "center",
        justifyContent: "center",
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: "#8C8C8C",
        marginBottom: 2,
        fontFamily: "Righteous",
    },
    detailValue: {
        fontSize: 14,
        color: "#111",
    },
    commentBox: {
        marginTop: 6,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#FAFAFA",
        borderWidth: 1,
        borderColor: "#EFEFEF",
    },
    commentTitle: {
        fontSize: 13,
        color: "#111",
        fontFamily: "Righteous",
        marginBottom: 8,
    },
    commentText: {
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 14,
        fontSize: 14,
        color: "#666",
        fontFamily: "Righteous",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 48,
    },
    emptyStateText: {
        marginTop: 8,
        fontSize: 20,
        color: "#111",
        fontFamily: "Righteous",
        textAlign: "center",
    },
    emptyStateSubtext: {
        marginTop: 8,
        fontSize: 14,
        color: "#777",
        textAlign: "center",
        lineHeight: 22,
    },
});