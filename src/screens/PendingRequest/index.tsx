import React, {
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    BackHandler,
    Animated,
    Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
    useRoute,
    useNavigation,
    useFocusEffect,
} from "@react-navigation/native";

import useRighteousFont from "../../hooks/useFont";
import { api } from "../../services/api";
import { useRideStatus } from "../../hooks/useRideStatus";
import { RadarView } from "../../components/RadarView";
import { styles } from "./styles";
import { useToast } from "../../contexts/ToastContext";
import LottieView from "lottie-react-native";

import rejectAnimation from "../../assets/animations/rejectAnimation.json";
import acceptAnimation from "../../assets/animations/acceptAnimation.json";

import * as Notifications from "expo-notifications";

export function PendingRequest() {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

    const { showToast } = useToast();
    const fontLoaded = useRighteousFont();

    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { sol_codigo } = route.params;

    const { request, loading, status } = useRideStatus(sol_codigo);

    const [isCancelling, setIsCancelling] = useState(false);
    const [viaCodigo, setViaCodigo] = useState<number | null>(null);
    const [loadingTravelId, setLoadingTravelId] = useState(false);
    const [motorcycleData, setMotorcycleData] = useState<any>(null);
    const [allowExit, setAllowExit] = useState(false);

    const lottieRef = useRef<LottieView>(null);

    const previousStatus = useRef<string | null>(null);
    const hasFetchedTravelId = useRef(false);
    const hasFetchedMotorcycle = useRef(false);
    const hasSentAcceptedNotification = useRef(false);
    const hasSentRejectedNotification = useRef(false);
    const hasHandledCanceledNavigation = useRef(false);

    const isPending = status === "pendente";
    const isAccepted = status === "aceito";
    const isRejected = status === "recusado";
    const isCanceled = status === "cancelada";

    const stopPulseAnimation = useCallback(() => {
        if (pulseLoopRef.current) {
            pulseLoopRef.current.stop();
            pulseLoopRef.current = null;
        }
        pulseAnim.stopAnimation();
        pulseAnim.setValue(0);
    }, [pulseAnim]);

    const startPulseAnimation = useCallback(() => {
        if (pulseLoopRef.current) return;

        pulseLoopRef.current = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        pulseLoopRef.current.start();
    }, [pulseAnim]);

    useFocusEffect(
        useCallback(() => {
            if (!isPending || allowExit) return;

            const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
                e.preventDefault();

                showToast({
                    title: "Aguarde!",
                    subtitle:
                        "Você não pode sair enquanto a solicitação estiver pendente.",
                    status: "info",
                });
            });

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                () => {
                    showToast({
                        title: "Aguarde!",
                        subtitle:
                            "Você não pode sair enquanto a solicitação estiver pendente.",
                        status: "info",
                    });
                    return true;
                }
            );

            return () => {
                unsubscribe();
                backHandler.remove();
            };
        }, [navigation, isPending, allowExit, showToast])
    );

    useEffect(() => {
        if (!isAccepted) {
            hasFetchedTravelId.current = false;
            return;
        }

        if (viaCodigo || hasFetchedTravelId.current) return;

        const fetchTravelId = async () => {
            try {
                hasFetchedTravelId.current = true;
                setLoadingTravelId(true);

                const response = await api.get(`/requests/travel-id/${sol_codigo}`);
                const travelId = response.data?.data?.via_codigo;

                if (travelId) {
                    setViaCodigo(travelId);
                }
            } catch (error) {
                hasFetchedTravelId.current = false;
                showToast({
                    title: "Erro",
                    subtitle: "Não foi possível carregar os dados da viagem.",
                    status: "error",
                });
            } finally {
                setLoadingTravelId(false);
            }
        };

        fetchTravelId();
    }, [isAccepted, sol_codigo, viaCodigo, showToast]);

    useEffect(() => {
        if (!viaCodigo) {
            hasFetchedMotorcycle.current = false;
            hasSentAcceptedNotification.current = false;
            return;
        }

        if (hasFetchedMotorcycle.current) return;

        const getMotorcycle = async () => {
            try {
                hasFetchedMotorcycle.current = true;

                const response = await api.get(`/travels/motorcycle/${viaCodigo}`);
                const motorcycle = response.data?.data;

                setMotorcycleData(motorcycle);

                if (!hasSentAcceptedNotification.current) {
                    const motNome = motorcycle?.mot_nome ?? "Seu motorista";
                    const motoModelo = motorcycle?.moto_modelo ?? "";
                    const motoPlaca = motorcycle?.moto_placa ?? "";

                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Solicitação aceita",
                            body: `${motNome} está a caminho com ${motoModelo} (${motoPlaca})`,
                            sound: true,
                        },
                        trigger: null,
                    });

                    hasSentAcceptedNotification.current = true;
                }
            } catch (error) {
                hasFetchedMotorcycle.current = false;
                console.log("Erro ao buscar mototaxista:", error);
            }
        };

        getMotorcycle();
    }, [viaCodigo]);

    useEffect(() => {
        if (status !== "recusado") {
            hasSentRejectedNotification.current = false;
            return;
        }

        if (hasSentRejectedNotification.current) return;

        const notifyRejected = async () => {
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "❌ Corrida recusada",
                        body: "Sua solicitação foi recusada. Tente novamente.",
                        sound: true,
                    },
                    trigger: null,
                });

                hasSentRejectedNotification.current = true;
            } catch (error) {
                console.log("Erro ao notificar recusa:", error);
            }
        };

        notifyRejected();
    }, [status]);

    useEffect(() => {
        const statusChanged = previousStatus.current !== status;

        if (!statusChanged) return;

        if (status === "cancelada" && !hasHandledCanceledNavigation.current) {
            hasHandledCanceledNavigation.current = true;
            setAllowExit(true);

            showToast({
                title: "Corrida cancelada",
                subtitle: "Sua solicitação foi cancelada.",
                status: "info",
            });

            navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
            });
        }

        previousStatus.current = status ?? null;
    }, [status, navigation, showToast]);

    useEffect(() => {
        if (viaCodigo && !loadingTravelId) {
            startPulseAnimation();
        } else {
            stopPulseAnimation();
        }

        return () => {
            stopPulseAnimation();
        };
    }, [viaCodigo, loadingTravelId, startPulseAnimation, stopPulseAnimation]);

    const scale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.9, 1],
    });

    const formattedPrice = useMemo(() => {
        if (!request?.sol_valor_estimado) return "0,00";
        return Number(request.sol_valor_estimado).toFixed(2);
    }, [request?.sol_valor_estimado]);

    const handleCancel = useCallback(() => {
        Alert.alert(
            "Cancelar Corrida",
            "Deseja realmente cancelar sua solicitação?",
            [
                { text: "Manter", style: "cancel" },
                {
                    text: "Sim, cancelar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsCancelling(true);

                            await api.patch(`requests/cancel/${sol_codigo}`);

                            setAllowExit(true);

                            navigation.reset({
                                index: 0,
                                routes: [{ name: "Home" }],
                            });
                        } catch {
                            Alert.alert(
                                "Erro",
                                "Não foi possível cancelar a solicitação."
                            );
                        } finally {
                            setIsCancelling(false);
                        }
                    },
                },
            ]
        );
    }, [navigation, sol_codigo]);

    const handleRetry = useCallback(() => {
        navigation.navigate("Home");
    }, [navigation]);

    const handleGoToTravelDetails = useCallback(() => {
        if (!viaCodigo) return;

        navigation.navigate("TravelDetails", {
            via_codigo: viaCodigo,
            comeTravels: false,
        });
    }, [navigation, viaCodigo]);

    if (!fontLoaded) return null;

    if (loading && !request) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isAccepted
                        ? `${motorcycleData?.mot_nome ?? "Motorista"} a caminho!`
                        : isRejected
                            ? "Solicitação Recusada"
                            : isCanceled
                                ? "Solicitação Cancelada"
                                : "Solicitação em andamento..."}
                </Text>

                <Text style={styles.subtitle}>
                    {isAccepted
                        ? `${motorcycleData?.mot_nome ?? "Seu motorista"} está indo até você com ${motorcycleData?.moto_modelo ?? "a moto"
                        } (${motorcycleData?.moto_placa ?? ""}).`
                        : isRejected
                            ? "Infelizmente, sua solicitação foi recusada."
                            : isCanceled
                                ? "Sua solicitação foi cancelada com sucesso."
                                : "Estamos conectando você à empresa!"}
                </Text>
            </View>

            <View style={styles.visualArea}>
                {isAccepted ? (
                    <LottieView
                        ref={lottieRef}
                        source={acceptAnimation}
                        autoPlay
                        loop={false}
                        style={{ width: 220, height: 220 }}
                    />
                ) : isRejected || isCanceled ? (
                    <LottieView
                        ref={lottieRef}
                        source={rejectAnimation}
                        autoPlay
                        loop={false}
                        style={{ width: 220, height: 220 }}
                    />
                ) : (
                    <RadarView />
                )}
            </View>

            {request && !isRejected && (
                <View style={styles.detailsCard}>
                    <View style={styles.locationRow}>
                        <View style={styles.pathLine}>
                            <View style={styles.dotGreen} />
                            <View style={styles.line} />
                            <View style={styles.dotBlack} />
                        </View>

                        <View style={styles.locationTextContainer}>
                            <Text numberOfLines={1} style={styles.locationText}>
                                {request.sol_origem}
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={[styles.locationText, { marginTop: 24 }]}
                            >
                                {request.sol_destino}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <View>
                            <Text style={styles.label}>Total Estimado</Text>
                            <Text style={styles.priceValue}>
                                R$ {formattedPrice}
                            </Text>
                        </View>

                        <View style={styles.paymentBadge}>
                            <Ionicons
                                name="card-outline"
                                size={16}
                                color="#666"
                            />
                            <Text style={styles.paymentText}>
                                {request.sol_forma_pagamento?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <View style={styles.footer}>
                {isAccepted ? (
                    <Animated.View
                        style={{
                            transform: [{ scale }],
                            opacity
                        }}
                    >
                        <TouchableOpacity
                            style={[
                                styles.primaryButton,
                                (!viaCodigo || loadingTravelId) && { opacity: 0.5 }
                            ]}
                            onPress={handleGoToTravelDetails}
                            disabled={!viaCodigo || loadingTravelId}
                            activeOpacity={0.85}
                        >
                            {loadingTravelId ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    Ver informações da corrida
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                ) : isRejected ? (
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleRetry}
                    >
                        <Text style={styles.primaryButtonText}>
                            Solicitar novamente
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={handleCancel}
                        disabled={isCancelling}
                    >
                        {isCancelling ? (
                            <ActivityIndicator color="#ff4757" />
                        ) : (
                            <Text style={styles.secondaryButtonText}>
                                Cancelar Solicitação
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}