import {
    Text,
    View,
    SectionList,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
    Animated,
    Easing,
    Image,
    RefreshControl,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import { styles } from "./styles";

import emptyAnimationBlue from "../../assets/animations/emptyAnimationBlue.json";

import { api } from "../../services/api";
import { TravelProps } from "../../types/travels";
import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import useRighteousFont from "../../hooks/useFont";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";
import LottieView from "lottie-react-native";

type RootStackParamList = {
    TravelDetails: {
        via_codigo: number;
        comeTravels?: boolean
    };
    Home: undefined;
    Company: { emp_codigo: number };
    RequestTravel: { emp_codigo: number };
    PendingRequest: { sol_codigo: number };
};

type TravelItem = TravelProps & {
    avaliado?: number;
    ava_codigo?: number | null;
    ava_nota?: number | null;
    ava_comentario?: string | null;
};

type TravelSection = {
    title: string;
    rawDate: string;
    data: TravelItem[];
};

type ReviewModalStep = "question" | "comment";

if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const CustomLayoutAnimation = {
    duration: 400,
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

const statusConfig = {
    EM_ANDAMENTO: {
        label: "Em Andamento",
        color: "#FFA500",
        bgColor: "rgba(255, 165, 0, 0.1)",
        icon: "time-outline",
        gradient: ["#FFA500", "#FF8C00"] as const,
    },
    FINALIZADA: {
        label: "Finalizada",
        color: "#00CC70",
        bgColor: "rgba(0, 204, 112, 0.1)",
        icon: "checkmark-done-outline",
        gradient: ["#00CC70", "#00B05E"] as const,
    },
    CANCELADA: {
        label: "Cancelada",
        color: "#FF4444",
        bgColor: "rgba(255, 68, 68, 0.1)",
        icon: "close-outline",
        gradient: ["#FF4444", "#CC3333"] as const,
    },
};

const reviewInlineStyles = {
    wrapper: {
        marginTop: 16,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        backgroundColor: "#FAFAFA",
    },
    headerRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        marginBottom: 8,
        gap: 12,
    },
    title: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#111",
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
        lineHeight: 18,
        marginBottom: 12,
    },
    starsRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        gap: 6,
        marginBottom: 12
    },
    confirmButton: {
        borderRadius: 14,
        overflow: "hidden" as const,
    },
    confirmGradient: {
        minHeight: 46,
        paddingHorizontal: 14,
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        gap: 8,
    },
    confirmText: {
        color: "#FFF",
        fontSize: 13,
        fontFamily: "Righteous",
    },
    reviewedBox: {
        marginTop: 16,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "#F8FFF9",
        borderWidth: 1,
        borderColor: "rgba(0, 204, 112, 0.18)",
    },
    reviewedHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        marginBottom: 10,
    },
    reviewedTitle: {
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#0E8F52",
    },
    reviewedComment: {
        marginTop: 10,
        fontSize: 13,
        color: "#444",
        lineHeight: 20,
    },
};

const modalStyles = {
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end" as const,
    },
    sheet: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 26,
    },
    handle: {
        width: 54,
        height: 5,
        borderRadius: 999,
        backgroundColor: "#DDD",
        alignSelf: "center" as const,
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: "#111",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
        marginBottom: 16,
    },
    selectedStarsRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 6,
        marginBottom: 18
    },
    textArea: {
        minHeight: 120,
        maxHeight: 160,
        backgroundColor: "#F8F8F8",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 14,
        color: "#111",
        borderWidth: 1,
        borderColor: "#E9E9E9",
        textAlignVertical: "top" as const,
        marginBottom: 14,
    },
    actionsColumn: {
        gap: 10,
    },
    outlineButton: {
        minHeight: 50,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        alignItems: "center" as const,
        justifyContent: "center" as const,
        backgroundColor: "#FFF",
        paddingHorizontal: 16,
    },
    outlineButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#222",
    },
    primaryButton: {
        borderRadius: 16,
        overflow: "hidden" as const,
    },
    primaryGradient: {
        minHeight: 50,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        flexDirection: "row" as const,
        gap: 8,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFF",
    },
    cancelButton: {
        alignSelf: "center" as const,
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    cancelText: {
        fontSize: 13,
        color: "#777",
        fontFamily: "Righteous",
    },
};

const StarRating = memo(
    ({
        value,
        onChange,
        size = 28,
        disabled = false,
    }: {
        value: number;
        onChange?: (rating: number) => void;
        size?: number;
        disabled?: boolean;
    }) => {
        return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const filled = star <= value;

                    return (
                        <TouchableOpacity
                            key={star}
                            activeOpacity={disabled ? 1 : 0.7}
                            disabled={disabled}
                            onPress={() => onChange?.(star)}
                            style={{ padding: 2 }}
                        >
                            <Ionicons
                                name={filled ? "star" : "star-outline"}
                                size={size}
                                color={filled ? "#FFB400" : "#C9C9C9"}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
);

const TravelCard = memo(
    ({
        item,
        isOpen,
        onToggle,
        onOpenDetails,
        progressAnim,
        fadeAnim,
        draftRating,
        onSelectRating,
        onConfirmReview,
        isSubmittingReview,
    }: {
        item: TravelItem;
        isOpen: boolean;
        onToggle: (id: number) => void;
        onOpenDetails: (id: number, comeTravels?: boolean) => void;
        progressAnim?: Animated.Value;
        fadeAnim?: Animated.Value;
        draftRating: number;
        onSelectRating: (via_codigo: number, rating: number) => void;
        onConfirmReview: (travel: TravelItem) => void;
        isSubmittingReview: boolean;
    }) => {
        const status =
            statusConfig[item.via_status as keyof typeof statusConfig] ||
            statusConfig.FINALIZADA;

        const isInProgress = item.via_status === "EM_ANDAMENTO";
        const canReview = item.via_status === "FINALIZADA" && item.avaliado === 0;

        const truncate = (text?: string, limit = 38) => {
            if (!text) return "";
            if (text.length <= limit) return text;
            return text.substring(0, limit) + "...";
        };

        const translateX =
            progressAnim?.interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 300],
            }) || 0;

        const opacity =
            progressAnim?.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.2, 1, 0.2],
            }) || 1;

        const formatDate = (dateString: string) => {
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
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: fadeAnim || 1,
                        transform: [
                            {
                                translateY:
                                    fadeAnim?.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }) || 0,
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.card}>
                    {isInProgress && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <Animated.View
                                    style={[
                                        styles.progressIndicator,
                                        { transform: [{ translateX }], opacity },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={["#4CAF50", "#45A049", "#4CAF50"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.progressGradient}
                                    />
                                </Animated.View>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => onToggle(item.via_codigo)}
                        activeOpacity={0.7}
                        style={styles.cardHeader}
                    >
                        <View style={styles.headerLeft}>
                            <Image source={require("../../assets/images/motorcycleIcon.png")} style={{ height: 70, width: 80 }} resizeMode="contain" />


                            <View style={styles.headerInfo}>
                                <Text style={styles.driver} numberOfLines={1}>
                                    {item.mot_nome || "⏳ Aguardando motorista"}
                                </Text>

                                <View style={styles.headerRow}>
                                    <Text style={styles.model} numberOfLines={1}>
                                        {item.moto_modelo || "🚫 Moto não atribuída"}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.headerRight}>
                            <Text style={styles.price}>
                                R$ {Number(item.via_valor_final).toFixed(2)}
                            </Text>

                            <View style={styles.statusContainer}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: status.bgColor },
                                    ]}
                                >
                                    <Ionicons
                                        name={status.icon as any}
                                        size={10}
                                        color={status.color}
                                    />
                                    <Text
                                        style={[styles.statusText, { color: status.color }]}
                                    >
                                        {status.label}
                                    </Text>
                                </View>

                                <Ionicons
                                    name={isOpen ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color="#999"
                                />
                            </View>
                        </View>
                    </TouchableOpacity>

                    {isOpen && (
                        <View style={styles.details}>
                            <View style={styles.divider} />

                            <View style={styles.datesSection}>
                                <View style={styles.dateItem}>
                                    <View style={styles.dateIconContainer}>
                                        <Ionicons
                                            name="calendar-outline"
                                            size={16}
                                            color="#4CAF50"
                                        />
                                    </View>
                                    <View style={styles.dateContent}>
                                        <Text style={styles.dateLabel}>DATA DE INÍCIO</Text>
                                        <Text style={styles.dateValue}>
                                            {formatDate(item.via_data_inicio)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.dateItem}>
                                    <View style={styles.dateIconContainer}>
                                        <Ionicons
                                            name="flag-outline"
                                            size={16}
                                            color="#FF4444"
                                        />
                                    </View>
                                    <View style={styles.dateContent}>
                                        <Text style={styles.dateLabel}>FINALIZADA EM:</Text>
                                        <Text style={styles.dateValue}>
                                            {item.via_data_fim
                                                ? formatDate(item.via_data_fim)
                                                : "⏳ Não finalizado"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.locationSection}>
                                <View style={styles.locationItem}>
                                    <View style={styles.locationDot}>
                                        <View style={styles.locationInnerDot} />
                                    </View>

                                    <Text
                                        style={styles.locationText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {truncate(item.sol_origem)}
                                    </Text>
                                </View>

                                <View style={styles.locationLine} />

                                <View style={styles.locationItem}>
                                    <View
                                        style={[styles.locationDot, styles.destinationDot]}
                                    >
                                        <View
                                            style={[
                                                styles.locationInnerDot,
                                                styles.destinationInnerDot,
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={styles.locationText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {truncate(item.sol_destino)}
                                    </Text>
                                </View>
                            </View>

                            {canReview && (
                                <View style={reviewInlineStyles.wrapper}>
                                    <View style={reviewInlineStyles.headerRow}>
                                        <Text style={reviewInlineStyles.title}>
                                            Como foi sua experiência?
                                        </Text>

                                        <View
                                            style={{
                                                backgroundColor: "rgba(255,180,0,0.12)",
                                                paddingHorizontal: 10,
                                                paddingVertical: 5,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    color: "#946700",
                                                    fontFamily: "Righteous",
                                                }}
                                            >
                                                AVALIAÇÃO PENDENTE
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={reviewInlineStyles.subtitle}>
                                        Toque nas estrelas para avaliar esta corrida.
                                    </Text>

                                    <View style={reviewInlineStyles.starsRow}>
                                        <StarRating
                                            value={draftRating}
                                            onChange={(rating) =>
                                                onSelectRating(item.via_codigo, rating)
                                            }
                                            size={30}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        activeOpacity={draftRating > 0 ? 0.8 : 1}
                                        disabled={draftRating <= 0 || isSubmittingReview}
                                        style={[
                                            reviewInlineStyles.confirmButton,
                                            {
                                                opacity:
                                                    draftRating > 0 && !isSubmittingReview
                                                        ? 1
                                                        : 0.55,
                                            },
                                        ]}
                                        onPress={() => onConfirmReview(item)}
                                    >
                                        <LinearGradient
                                            colors={["#111", "#2B2B2B"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={reviewInlineStyles.confirmGradient}
                                        >
                                            {isSubmittingReview ? (
                                                <ActivityIndicator color="#FFF" size="small" />
                                            ) : (
                                                <>
                                                    <Ionicons
                                                        name="star-outline"
                                                        size={16}
                                                        color="#FFF"
                                                    />
                                                    <Text style={reviewInlineStyles.confirmText}>
                                                        Confirmar avaliação
                                                    </Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {item.avaliado === 1 && (
                                <View style={reviewInlineStyles.reviewedBox}>
                                    <View style={reviewInlineStyles.reviewedHeader}>
                                        <Text style={reviewInlineStyles.reviewedTitle}>
                                            Avaliação enviada
                                        </Text>

                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 4,
                                            }}
                                        >
                                            <StarRating
                                                value={Number(item.ava_nota || 0)}
                                                disabled
                                                size={20}
                                            />
                                        </View>
                                    </View>

                                    {!!item.ava_comentario && (
                                        <Text style={reviewInlineStyles.reviewedComment}>
                                            “{item.ava_comentario}”
                                        </Text>
                                    )}
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.detailsButton,
                                    { marginTop: 16 },
                                ]}
                                onPress={() => onOpenDetails(item.via_codigo, true)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={
                                        isInProgress
                                            ? ["#4CAF50", "#45A049"]
                                            : ["#333", "#1A1A1A"]
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradient}
                                >
                                    <Ionicons name="eye-outline" size={18} color="#fff" />
                                    <Text style={styles.detailsButtonText}>
                                        Ver detalhes completos
                                    </Text>
                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>
        );
    }
);

export function Travels() {
    const { user } = useAuth();
    const usu_codigo = user?.usu_codigo;

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const fontLoaded = useRighteousFont();

    const [refreshing, setRefreshing] = useState(false);
    const [travels, setTravels] = useState<TravelItem[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const [draftRatings, setDraftRatings] = useState<Record<number, number>>({});
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewModalStep, setReviewModalStep] =
        useState<ReviewModalStep>("question");
    const [selectedTravel, setSelectedTravel] = useState<TravelItem | null>(null);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const lottieRef = useRef<LottieView>(null);

    const progressAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;
    const fadeAnimations = useRef<{ [key: number]: Animated.Value }>({}).current;


    const loadTravels = useCallback(async () => {
        if (!usu_codigo) return;

        try {
            const response = await api.get(`/travels/${usu_codigo}`);
            const data: TravelItem[] = response.data.data || [];

            setTravels(data);

            setDraftRatings((prev) => {
                const next = { ...prev };

                data.forEach((travel) => {
                    if (travel.avaliado) {
                        next[travel.via_codigo] = Number(travel.ava_nota || 0);
                    } else if (next[travel.via_codigo] == null) {
                        next[travel.via_codigo] = 0;
                    }
                });

                return next;
            });

            if (data.length > 0) {
                setExpandedId((prev) => prev ?? data[0].via_codigo);
            }

            data.forEach((travel: TravelItem) => {
                if (
                    travel.via_status === "EM_ANDAMENTO" &&
                    !progressAnimations[travel.via_codigo]
                ) {
                    progressAnimations[travel.via_codigo] = new Animated.Value(0);
                    fadeAnimations[travel.via_codigo] = new Animated.Value(1);
                }

                if (!fadeAnimations[travel.via_codigo]) {
                    fadeAnimations[travel.via_codigo] = new Animated.Value(1);
                }
            });
        } catch (error) {
            console.error("Erro ao carregar viagens:", error);
        }
    }, [usu_codigo, progressAnimations, fadeAnimations]);

    useEffect(() => {
        async function init() {
            setLoading(true);
            await loadTravels();
            setLoading(false);
        }

        init();
    }, [loadTravels]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadTravels();
        setRefreshing(false);
    }, [loadTravels]);

    useEffect(() => {
        travels.forEach((travel) => {
            if (travel.via_status === "EM_ANDAMENTO") {
                const anim = progressAnimations[travel.via_codigo];

                if (anim) {
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(anim, {
                                toValue: 1,
                                duration: 2000,
                                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                                useNativeDriver: true,
                            }),
                            Animated.timing(anim, {
                                toValue: 0,
                                duration: 2000,
                                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                                useNativeDriver: true,
                            }),
                        ])
                    ).start();
                }
            }
        });

        return () => {
            Object.values(progressAnimations).forEach((anim) => {
                anim.stopAnimation();
            });
        };
    }, [travels, progressAnimations]);

    const toggleCard = useCallback((id: number) => {
        LayoutAnimation.configureNext(CustomLayoutAnimation);
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const openDetails = useCallback(
        (via_codigo: number, comeTravels?: boolean) => {
            navigation.navigate("TravelDetails", {
                via_codigo,
                comeTravels,
            });
        },
        [navigation]
    );

    const selectRating = useCallback((via_codigo: number, rating: number) => {
        setDraftRatings((prev) => ({
            ...prev,
            [via_codigo]: rating,
        }));
    }, []);

    const openReviewFlow = useCallback(
        (travel: TravelItem) => {
            const rating = draftRatings[travel.via_codigo] || 0;

            if (!rating) {
                Alert.alert("Avaliação", "Selecione de 1 a 5 estrelas para continuar.");
                return;
            }

            setSelectedTravel(travel);
            setReviewComment("");
            setReviewModalStep("question");
            setReviewModalVisible(true);
        },
        [draftRatings]
    );

    const closeReviewModal = useCallback(() => {
        if (submittingReview) return;

        setReviewModalVisible(false);
        setReviewModalStep("question");
        setSelectedTravel(null);
        setReviewComment("");
    }, [submittingReview]);

    const submitReview = useCallback(
        async (comment: string = "") => {
            if (!selectedTravel || !usu_codigo) return;

            const ava_nota = draftRatings[selectedTravel.via_codigo] || 0;

            if (!ava_nota) {
                Alert.alert("Avaliação", "Selecione uma nota antes de enviar.");
                return;
            }

            try {
                setSubmittingReview(true);

                await api.post("/reviews/", {
                    usu_codigo,
                    via_codigo: selectedTravel.via_codigo,
                    ava_comentario: comment.trim(),
                    ava_nota,
                });

                setTravels((prev) =>
                    prev.map((travel) =>
                        travel.via_codigo === selectedTravel.via_codigo
                            ? {
                                ...travel,
                                avaliado: 1,
                                ava_nota,
                                ava_comentario: comment.trim(),
                            }
                            : travel
                    )
                );

                setDraftRatings((prev) => ({
                    ...prev,
                    [selectedTravel.via_codigo]: ava_nota,
                }));

                closeReviewModal();

                Alert.alert("Sucesso", "Sua avaliação foi enviada com sucesso.");
            } catch (error) {
                console.error("Erro ao enviar avaliação:", error);
                Alert.alert(
                    "Erro",
                    "Não foi possível enviar sua avaliação. Tente novamente."
                );
            } finally {
                setSubmittingReview(false);
            }
        },
        [selectedTravel, usu_codigo, draftRatings, closeReviewModal]
    );

    const formatSectionDate = (dateString: string) => {
        const date = new Date(dateString);

        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getDateKey = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const sections = useMemo<TravelSection[]>(() => {
        const grouped = travels.reduce<Record<string, TravelItem[]>>((acc, travel) => {
            const key = getDateKey(travel.via_data_inicio);

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push(travel);
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
                        new Date(b.via_data_inicio).getTime() -
                        new Date(a.via_data_inicio).getTime()
                ),
            }));
    }, [travels]);

    const renderItem = useCallback(
        ({ item }: { item: TravelItem }) => (
            <TravelCard
                item={item}
                isOpen={expandedId === item.via_codigo}
                onToggle={toggleCard}
                onOpenDetails={openDetails}
                progressAnim={progressAnimations[item.via_codigo]}
                fadeAnim={fadeAnimations[item.via_codigo]}
                draftRating={draftRatings[item.via_codigo] || 0}
                onSelectRating={selectRating}
                onConfirmReview={openReviewFlow}
                isSubmittingReview={
                    submittingReview &&
                    selectedTravel?.via_codigo === item.via_codigo
                }
            />
        ),
        [
            expandedId,
            toggleCard,
            openDetails,
            progressAnimations,
            fadeAnimations,
            draftRatings,
            selectRating,
            openReviewFlow,
            submittingReview,
            selectedTravel,
        ]
    );

    const renderSectionHeader = useCallback(
        ({ section }: { section: TravelSection }) => (
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
                title="Histórico de atividades"
                contador={travels.length > 0 ? travels.length : null}
                subtitle={
                    travels.length === 0
                        ? "NENHUMA VIAGEM REALIZADA"
                        : travels.length === 1
                            ? "VIAGEM REALIZADA"
                            : "VIAGENS REALIZADAS"
                }
            />

            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.via_codigo)}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={[
                    styles.listContent,
                    travels.length === 0 && { flex: 1 },
                ]}
                removeClippedSubviews
                maxToRenderPerBatch={5}
                windowSize={5}
                initialNumToRender={5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#4CAF50"]}
                        tintColor="#4CAF50"
                    />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <LottieView
                                ref={lottieRef}
                                source={emptyAnimationBlue}
                                autoPlay
                                loop
                                style={{ width: 220, height: 220 }}
                            />

                            <Text style={styles.emptyStateText}>
                                Nenhuma viagem encontrada
                            </Text>

                            <Text style={styles.emptyStateSubtext}>
                                Suas viagens aparecerão aqui assim que você{"\n"}
                                realizar uma solicitação
                            </Text>
                        </View>
                    ) : null
                }
            />

            <Modal
                visible={reviewModalVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={closeReviewModal}
            >
                <KeyboardAvoidingView
                    style={modalStyles.overlay}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ flex: 1 }}
                        onPress={closeReviewModal}
                    />

                    <View style={modalStyles.sheet}>
                        <View style={modalStyles.handle} />

                        <Text style={modalStyles.modalTitle}>
                            {reviewModalStep === "question"
                                ? "Deseja adicionar um comentário?"
                                : "Escreva um comentário"}
                        </Text>

                        <Text style={modalStyles.modalSubtitle}>
                            {reviewModalStep === "question"
                                ? "Sua nota já está pronta. Você pode enviar agora ou complementar com um comentário opcional."
                                : "Seu comentário é opcional. Você pode enviar mesmo deixando este campo vazio."}
                        </Text>

                        <View style={modalStyles.selectedStarsRow}>
                            <StarRating
                                value={
                                    selectedTravel
                                        ? draftRatings[selectedTravel.via_codigo] || 0
                                        : 0
                                }
                                disabled
                                size={26}
                            />
                        </View>

                        {reviewModalStep === "comment" && (
                            <TextInput
                                value={reviewComment}
                                onChangeText={setReviewComment}
                                placeholder="Conte como foi sua corrida..."
                                placeholderTextColor="#999"
                                multiline
                                maxLength={300}
                                style={modalStyles.textArea}
                                editable={!submittingReview}
                            />
                        )}

                        <View style={modalStyles.actionsColumn}>
                            {reviewModalStep === "question" ? (
                                <>
                                    <TouchableOpacity
                                        style={modalStyles.primaryButton}
                                        activeOpacity={0.85}
                                        disabled={submittingReview}
                                        onPress={() => submitReview("")}
                                    >
                                        <LinearGradient
                                            colors={["#111", "#2B2B2B"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={modalStyles.primaryGradient}
                                        >
                                            {submittingReview ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#FFF"
                                                />
                                            ) : (
                                                <>
                                                    <Ionicons
                                                        name="send-outline"
                                                        size={16}
                                                        color="#FFF"
                                                    />
                                                    <Text
                                                        style={
                                                            modalStyles.primaryButtonText
                                                        }
                                                    >
                                                        Enviar sem comentário
                                                    </Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={modalStyles.outlineButton}
                                        activeOpacity={0.8}
                                        disabled={submittingReview}
                                        onPress={() => setReviewModalStep("comment")}
                                    >
                                        <Text style={modalStyles.outlineButtonText}>
                                            Quero escrever um comentário
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={modalStyles.primaryButton}
                                        activeOpacity={0.85}
                                        disabled={submittingReview}
                                        onPress={() => submitReview(reviewComment)}
                                    >
                                        <LinearGradient
                                            colors={["#111", "#2B2B2B"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={modalStyles.primaryGradient}
                                        >
                                            {submittingReview ? (
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#FFF"
                                                />
                                            ) : (
                                                <>
                                                    <Ionicons
                                                        name="checkmark-outline"
                                                        size={16}
                                                        color="#FFF"
                                                    />
                                                    <Text
                                                        style={
                                                            modalStyles.primaryButtonText
                                                        }
                                                    >
                                                        Confirmar e enviar
                                                    </Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={modalStyles.outlineButton}
                                        activeOpacity={0.8}
                                        disabled={submittingReview}
                                        onPress={() => submitReview("")}
                                    >
                                        <Text style={modalStyles.outlineButtonText}>
                                            Enviar sem comentário
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>

                        <TouchableOpacity
                            style={modalStyles.cancelButton}
                            activeOpacity={0.8}
                            disabled={submittingReview}
                            onPress={closeReviewModal}
                        >
                            <Text style={modalStyles.cancelText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}