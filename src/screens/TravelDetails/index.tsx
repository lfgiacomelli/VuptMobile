import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";

import { useToast } from "../../contexts/ToastContext";

import { api } from "../../services/api";
import useRighteousFont from "../../hooks/useFont";

import { useNavigation, NavigationProp } from "@react-navigation/native";

import { ComeBack } from "../../components/ComeBack";
import { useAuth } from "../../contexts/AuthContext";

import { Alert } from "react-native";
import { shareTravelPdf } from "../../utils/share";
import { getToken } from "../../storage/authUserStorage";

type TravelDetailsParamList = {
    TravelDetails: {
        via_codigo: number;
        comeTravels?: boolean;
    };
    RequestTravel: {
        emp_codigo: number;
    };
    RouteMap: {
        via_codigo?: number;
    };
    AddSupport: {
        via_codigo?: number;
    };
};

interface TravelDetailsResponse {
    viagem: {
        via_codigo: number;
        emp_codigo: number;
        emp_nome: string;
        emp_logotipo: string;
        mot_codigo: number;
        via_status: string;
        sol_origem: string;
        sol_destino: string;
        sol_distancia_km: number;
        sol_valor_estimado: number;
        sol_forma_pagamento: string;
        ava_codigo?: number | null;
        ava_nota?: number | null;
        ava_comentario?: string | null;
        via_data_inicio: string;
        via_data_fim: string;
    };
    empresa: {
        emp_codigo: number;
        emp_nome: string;
        emp_cidade: string;
    };
    mototaxista: {
        mot_codigo: number;
        mot_nome: string;
        mot_telefone: string;
        mot_email: string;
        mot_status: string | number;
    };
    motocicleta: {
        moto_codigo: number;
        moto_modelo: string;
        moto_marca: string;
        moto_placa: string;
        moto_ano: number;
    };
}

type ReviewState = {
    hasReview: boolean;
    ava_codigo: number | null;
    ava_nota: number | null;
    ava_comentario: string;
};

type ModalStep = "question" | "comment";

export function TravelDetails() {
    const route = useRoute<RouteProp<TravelDetailsParamList, "TravelDetails">>();
    const { user } = useAuth();
    const { showToast } = useToast();

    const navigation = useNavigation<NavigationProp<TravelDetailsParamList>>();

    const via_codigo = route.params.via_codigo;
    const comeTravels = route.params?.comeTravels;

    const fontLoaded = useRighteousFont();
    const modalizeRef = useRef<Modalize>(null);

    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [data, setData] = useState<TravelDetailsResponse | null>(null);
    const [error, setError] = useState(false);

    const [selectedRating, setSelectedRating] = useState(0);
    const [comment, setComment] = useState("");
    const [modalStep, setModalStep] = useState<ModalStep>("question");

    const [reviewState, setReviewState] = useState<ReviewState>({
        hasReview: false,
        ava_codigo: null,
        ava_nota: null,
        ava_comentario: "",
    });

    const usu_codigo = user?.usu_codigo;


    const fetchTravel = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            const response = await api.get(`/travels/byId/${via_codigo}`);
            const responseData: TravelDetailsResponse = response.data.data;

            setData(responseData);

            const ava_codigo = responseData?.viagem?.ava_codigo ?? null;
            const ava_nota = responseData?.viagem?.ava_nota ?? null;
            const ava_comentario = responseData?.viagem?.ava_comentario ?? "";

            const hasReview = ava_codigo !== null && ava_codigo !== undefined;

            setReviewState({
                hasReview,
                ava_codigo,
                ava_nota,
                ava_comentario: ava_comentario || "",
            });

            if (hasReview && ava_nota) {
                setSelectedRating(Number(ava_nota));
            } else {
                setSelectedRating(0);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [via_codigo]);

    useEffect(() => {
        fetchTravel();
    }, [fetchTravel]);

    function handleNavigateToSupport() {
        if (data?.viagem.via_status === "EM_ANDAMENTO") {
            showToast({
                title: "Aguarde a finalização da viagem",
                status: "info",
                subtitle: "Você poderá solicitar suporte após a conclusão da viagem."
            });
            return;
        }
        navigation.navigate("AddSupport", {
            via_codigo: data?.viagem.via_codigo
        });
    }

    const handleSharePdf = async () => {
        if (!data) return;

        try {
            const pdfData = {
                via_codigo: data.viagem.via_codigo,

                empresa: {
                    emp_nome: data.viagem.emp_nome,
                    emp_cidade: data.empresa.emp_nome
                },

                mototaxista: {
                    mot_nome: data.mototaxista.mot_nome,
                },

                motocicleta: {
                    moto_modelo: data.motocicleta.moto_modelo,
                    moto_placa: data.motocicleta.moto_placa,
                },

                sol_origem: data.viagem.sol_origem,
                sol_destino: data.viagem.sol_destino,
                sol_distancia_km: data.viagem.sol_distancia_km,
                sol_valor_estimado: data.viagem.sol_valor_estimado,
                sol_forma_pagamento: data.viagem.sol_forma_pagamento,
                via_data_inicio: data.viagem.via_data_inicio,
                via_data_fim: data.viagem.via_data_fim
            };
            await shareTravelPdf(pdfData);
        } catch (error) {
            Alert.alert(
                "Não foi possível compartilhar",
                "Ocorreu um erro ao gerar o PDF da viagem."
            );
        }
    };

    const statusInfo = useMemo(() => {
        switch (data?.viagem.via_status) {
            case "EM_ANDAMENTO":
                return {
                    color: "#f39c12",
                    label: "Em andamento"
                };

            case "CONCLUIDA":
            case "FINALIZADA":
                return {
                    color: "#27ae60",
                    label: "Finalizada"
                };

            case "CANCELADA":
                return {
                    color: "#e74c3c",
                    label: "Cancelada"
                };

            default:
                return {
                    color: "#555",
                    label: "Desconhecido"
                };
        }
    }, [data]);

    const canSubmitRatingSelection =
        selectedRating > 0 && !reviewState.hasReview && !submittingReview;

    function openReviewFlow() {
        if (!selectedRating) {
            showToast({
                title: "Escolha uma nota!",
                status: "info",
                subtitle: "Selecione de 1 a 5 estrelas para continuar"
            })
            return;
        }

        setModalStep("question");
        setComment("");
        modalizeRef.current?.open();
    }

    function handleRouteMap() {
        navigation.navigate("RouteMap", {
            via_codigo: data?.viagem?.via_codigo,
        })
    }

    async function handleSubmitReview(withComment: boolean) {
        try {
            if (!usu_codigo) {
                showToast({
                    title: "Ops, ocorreu um erro!",
                    status: "error",
                    subtitle: "Não foi possível identificar o usuário para enviar a avaliação."
                })
                return;
            }

            if (!data?.viagem?.via_codigo) {
                showToast({
                    title: "Ops, ocorreu um erro!",
                    status: "error",
                    subtitle: "Não foi possível identificar a viagem para enviar a avaliação."
                })
                return;
            }

            if (!selectedRating) {
                showToast({
                    title: "Selecione ao menos 1 estrela!",
                    status: "error",
                })
                return;
            }

            setSubmittingReview(true);

            const finalComment = withComment ? comment.trim() : "";

            const response = await api.post("/reviews/", {
                usu_codigo,
                via_codigo: data.viagem.via_codigo,
                ava_comentario: finalComment,
                ava_nota: selectedRating,
            });

            const returnedReviewCode =
                response?.data?.data?.ava_codigo ??
                response?.data?.ava_codigo ??
                Date.now();

            setReviewState({
                hasReview: true,
                ava_codigo: Number(returnedReviewCode),
                ava_nota: selectedRating,
                ava_comentario: finalComment,
            });

            setData((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    viagem: {
                        ...prev.viagem,
                        ava_codigo: Number(returnedReviewCode),
                        ava_nota: selectedRating,
                        ava_comentario: finalComment,
                    },
                };
            });

            modalizeRef.current?.close();

            showToast({
                title: "Avaliação enviada!",
                status: "success",
                subtitle: "Sua avaliação foi registrada com sucesso!"
            })
        } catch (err) {
            showToast({
                title: "Erro ao avaliar!",
                status: "error",
                subtitle: "Não foi possível enviar sua avaliação agora. Tente novamente."
            })
        } finally {
            setSubmittingReview(false);
        }
    }

    if (!fontLoaded) return null;

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
            </SafeAreaView>
        );
    }

    if (error || !data) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.errorText}>
                    Não foi possível carregar os dados.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Detalhes da Viagem</Text>

                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: statusInfo.color },
                            ]}
                        >
                            <Text style={styles.statusText}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Ações</Text>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.iconButton, styles.primaryIconButton]}
                                onPress={handleSharePdf}
                            >
                                <FontAwesome name="share-alt" size={16} color="#111111" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.iconButton}
                                onPress={() => { handleNavigateToSupport() }}
                            >
                                <Ionicons name="alert-circle-outline" size={18} color="#111111" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={styles.iconButton}
                                onPress={() =>
                                    navigation.navigate("RequestTravel", {
                                        emp_codigo: data.empresa.emp_codigo,
                                    })
                                }
                            >
                                <Ionicons name="refresh-outline" size={18} color="#111111" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, styles.primaryIconButton]}
                                onPress={() => { handleRouteMap() }}
                            >
                                <Ionicons name="map-outline" size={18} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            Informações relevantes
                        </Text>

                        <View style={styles.companyRow}>
                            <View style={styles.companyInfo}>
                                <InfoRow
                                    label="Empresa"
                                    value={data.viagem.emp_nome}
                                />
                            </View>

                            <View style={styles.logoContainer}>
                                <Image
                                    source={{ uri: data.viagem.emp_logotipo }}
                                    style={styles.companyLogo}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>
                            Informações da viagem
                        </Text>
                        <InfoRow
                            label="Origem"
                            value={data.viagem.sol_origem}
                        />
                        <InfoRow
                            label="Destino"
                            value={data.viagem.sol_destino}
                        />
                        <InfoRow
                            label="Valor"
                            value={data.viagem.sol_valor_estimado}
                        />
                        <InfoRow
                            label="Distânci"
                            value={data.viagem.sol_distancia_km}
                        />
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Mototaxista</Text>

                        <InfoRow label="Nome" value={data.mototaxista.mot_nome} />
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Motocicleta</Text>

                        <InfoRow
                            label="Modelo"
                            value={data.motocicleta.moto_modelo}
                        />
                        <InfoRow
                            label="Marca"
                            value={data.motocicleta.moto_marca}
                        />
                        <InfoRow
                            label="Placa"
                            value={data.motocicleta.moto_placa}
                        />
                        <InfoRow label="Ano" value={data.motocicleta.moto_ano} />
                    </View>
                    {data?.viagem?.via_status === "FINALIZADA" ?
                        (
                            <View style={styles.card}>
                                {!reviewState.hasReview ? (
                                    <>
                                        <View style={styles.reviewHeader}>
                                            <View style={styles.reviewHeaderIcon}>
                                                <Ionicons
                                                    name="star-outline"
                                                    size={18}
                                                    color="rgba(216, 185, 10, 0.9)"
                                                />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.sectionTitle}>
                                                    Avaliar corrida
                                                </Text>
                                                <Text style={styles.reviewSubtitle}>
                                                    Como foi sua experiência nesta viagem?
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.starsRow}>
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const active = star <= selectedRating;

                                                return (
                                                    <TouchableOpacity
                                                        key={star}
                                                        activeOpacity={0.85}
                                                        onPress={() => setSelectedRating(star)}
                                                        style={[
                                                            styles.starButton,
                                                            active && styles.starButtonActive,
                                                        ]}
                                                    >
                                                        <Ionicons
                                                            name={active ? "star" : "star-outline"}
                                                            size={28}
                                                            color={active ? "rgba(216, 185, 10, 0.9)" : "#6B7280"}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <View style={styles.ratingLegendWrapper}>
                                            <Text style={styles.ratingLegendText}>
                                                {selectedRating === 0 && "Selecione uma nota de 1 a 5"}
                                                {selectedRating === 1 && "Muito ruim"}
                                                {selectedRating === 2 && "Ruim"}
                                                {selectedRating === 3 && "Boa"}
                                                {selectedRating === 4 && "Muito boa"}
                                                {selectedRating === 5 && "Excelente"}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            style={[
                                                styles.primaryActionButton,
                                                !canSubmitRatingSelection &&
                                                styles.primaryActionButtonDisabled,
                                            ]}
                                            disabled={!canSubmitRatingSelection}
                                            onPress={openReviewFlow}
                                        >
                                            <Text style={styles.primaryActionButtonText}>
                                                Confirmar avaliação
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.reviewHeader}>
                                            <View style={styles.reviewHeaderIconDark}>
                                                <Ionicons
                                                    name="checkmark-outline"
                                                    size={18}
                                                    color="#FFFFFF"
                                                />
                                            </View>

                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.sectionTitle}>
                                                    Avaliação enviada
                                                </Text>
                                                <Text style={styles.reviewSubtitle}>
                                                    Obrigado por compartilhar sua experiência.
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.reviewSummaryBox}>
                                            <Text style={styles.reviewSummaryLabel}>
                                                Sua nota
                                            </Text>

                                            <View style={styles.summaryStarsRow}>
                                                {[1, 2, 3, 4, 5].map((star) => {
                                                    const active =
                                                        star <= (reviewState.ava_nota || 0);

                                                    return (
                                                        <Ionicons
                                                            key={star}
                                                            name={active ? "star" : "star-outline"}
                                                            size={22}
                                                            color={active ? "rgba(216, 185, 10, 0.9)" : "#A1A1AA"}
                                                            style={{ marginRight: 6 }}
                                                        />
                                                    );
                                                })}
                                            </View>

                                            {!!reviewState.ava_comentario?.trim() && (
                                                <View style={styles.commentBox}>
                                                    <Text style={styles.commentLabel}>
                                                        Seu comentário
                                                    </Text>
                                                    <Text style={styles.commentText}>
                                                        {reviewState.ava_comentario}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </>
                                )}
                            </View>
                        ) : null}
                </ScrollView>
            </KeyboardAvoidingView>
            <Modalize
                ref={modalizeRef}
                adjustToContentHeight
                handlePosition="inside"
                modalStyle={styles.modalize}
                handleStyle={styles.modalHandle}
            >
                <View style={styles.modalContent}>
                    {modalStep === "question" ? (
                        <>
                            <Text style={styles.modalTitle}>
                                Deseja adicionar um comentário?
                            </Text>
                            <Text style={styles.modalDescription}>
                                Você pode enviar somente a nota ou complementar
                                com um comentário rápido sobre a corrida.
                            </Text>

                            <View style={styles.modalRatingPreview}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const active = star <= selectedRating;

                                    return (
                                        <Ionicons
                                            key={star}
                                            name={active ? "star" : "star-outline"}
                                            size={24}
                                            color={active ? "rgba(216, 185, 10, 0.9)" : "#A1A1AA"}
                                            style={{ marginRight: 6 }}
                                        />
                                    );
                                })}
                            </View>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[
                                    styles.modalPrimaryButton,
                                    submittingReview &&
                                    styles.modalPrimaryButtonDisabled,
                                ]}
                                disabled={submittingReview}
                                onPress={() => setModalStep("comment")}
                            >
                                <Text style={styles.modalPrimaryButtonText}>
                                    Adicionar comentário
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.modalSecondaryButton}
                                disabled={submittingReview}
                                onPress={() => handleSubmitReview(false)}
                            >
                                {submittingReview ? (
                                    <ActivityIndicator size="small" color="#111" />
                                ) : (
                                    <Text style={styles.modalSecondaryButtonText}>
                                        Enviar sem comentário
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalTitle}>
                                Comentar avaliação
                            </Text>
                            <Text style={styles.modalDescription}>
                                Escreva algo breve sobre sua experiência.
                                Esse campo é opcional, mas ajuda bastante.
                            </Text>

                            <TextInput
                                value={comment}
                                onChangeText={setComment}
                                multiline
                                maxLength={300}
                                placeholder="Conte como foi sua corrida..."
                                placeholderTextColor="#8A8A8A"
                                style={styles.commentInput}
                                textAlignVertical="top"
                            />

                            <Text style={styles.characterCount}>
                                {comment.trim().length}/300
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                style={[
                                    styles.modalPrimaryButton,
                                    submittingReview &&
                                    styles.modalPrimaryButtonDisabled,
                                ]}
                                disabled={submittingReview}
                                onPress={() => handleSubmitReview(true)}
                            >
                                {submittingReview ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.modalPrimaryButtonText}>
                                        Enviar avaliação
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={styles.modalSecondaryButton}
                                disabled={submittingReview}
                                onPress={() => setModalStep("question")}
                            >
                                <Text style={styles.modalSecondaryButtonText}>
                                    Voltar
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modalize>
            {!comeTravels && <ComeBack />}
            <StatusBar barStyle='dark-content' />
        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
        paddingHorizontal: 20,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    header: {
        marginTop: 20,
        marginBottom: 25,
    },
    title: {
        fontSize: 28,
        fontFamily: "Righteous",
        color: "#111111",
        marginBottom: 10,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontFamily: "Righteous",
    },
    card: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 18,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: "Righteous",
        marginBottom: 8,
        color: "#222222",
    },
    companyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    companyInfo: {
        flex: 1,
        paddingRight: 10,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
    },
    companyLogo: {
        width: 60,
        height: 60,
    },
    infoRow: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: "#888888",
        marginBottom: 3,
        fontFamily: "Righteous",
    },
    value: {
        fontSize: 16,
        color: "#111111",
        fontFamily: "Righteous",
    },
    errorText: {
        color: "#E74C3C",
        fontSize: 16,
        fontFamily: "Righteous",
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 18,
    },
    reviewHeaderIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F2F4F7",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    reviewHeaderIconDark: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    reviewSubtitle: {
        fontSize: 13,
        lineHeight: 20,
        color: "#666666",
        fontFamily: "Righteous",
    },
    starsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    starButton: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ECECEC",
    },
    starButtonActive: {
        backgroundColor: "#FFFFFF",
        borderColor: "#",
    },
    ratingLegendWrapper: {
        backgroundColor: "#F8F8F8",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
    },
    ratingLegendText: {
        textAlign: "center",
        color: "#4B5563",
        fontSize: 13,
        fontFamily: "Righteous",
    },
    primaryActionButton: {
        height: 52,
        borderRadius: 16,
        backgroundColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
    },
    primaryActionButtonDisabled: {
        backgroundColor: "#B9BDC7",
    },
    primaryActionButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Righteous",
    },
    reviewSummaryBox: {
        backgroundColor: "#FAFAFA",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#EFEFEF",
    },
    reviewSummaryLabel: {
        fontSize: 13,
        color: "#666666",
        marginBottom: 10,
        fontFamily: "Righteous",
    },
    summaryStarsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    commentBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#EBEBEB",
    },
    commentLabel: {
        fontSize: 13,
        color: "#666666",
        marginBottom: 6,
        fontFamily: "Righteous",
    },
    commentText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#111111",
        fontFamily: "Righteous",
    },
    modalize: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingBottom: 20,
    },
    modalHandle: {
        width: 52,
        height: 5,
        backgroundColor: "#D8D8D8",
        marginTop: 12,
    },
    modalContent: {
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 28,
    },
    modalTitle: {
        fontSize: 22,
        color: "#111111",
        fontFamily: "Righteous",
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 14,
        lineHeight: 22,
        color: "#666666",
        fontFamily: "Righteous",
        marginBottom: 18,
    },
    modalRatingPreview: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 22,
    },
    modalPrimaryButton: {
        height: 52,
        borderRadius: 16,
        backgroundColor: "#111111",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    modalPrimaryButtonDisabled: {
        opacity: 0.7,
    },
    modalPrimaryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Righteous",
    },
    modalSecondaryButton: {
        height: 52,
        borderRadius: 16,
        backgroundColor: "#F4F4F5",
        alignItems: "center",
        justifyContent: "center",
    },
    modalSecondaryButtonText: {
        color: "#111111",
        fontSize: 14,
        fontFamily: "Righteous",
    },
    commentInput: {
        minHeight: 120,
        maxHeight: 180,
        borderRadius: 18,
        backgroundColor: "#F7F7F8",
        borderWidth: 1,
        borderColor: "#EAEAEA",
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: "#111111",
        fontFamily: "Righteous",
        marginBottom: 8,
    },
    characterCount: {
        textAlign: "right",
        fontSize: 12,
        color: "#888888",
        fontFamily: "Righteous",
        marginBottom: 18,
    },
    cardActions: {
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 24
    },

    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",

    },

    primaryIconButton: {
        borderColor: "rgba(0,0,0,0.1)",
    },
});