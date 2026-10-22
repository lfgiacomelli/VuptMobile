import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";
import {
    View,
    ActivityIndicator,
    TextInput,
    TouchableOpacity,
    Text,
    Alert,
    Keyboard,
    Animated,
    PanResponder,
    Image,
    Easing,
} from "react-native";
import MapView, { Region, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Modalize } from "react-native-modalize";
import { useBatteryLevel } from "expo-battery";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { styles } from "./styles"

import useRighteousFont from "../../hooks/useFont";
import AnimatedRoute from "../../components/AnimatedRoute";

import loadingAnimationRow from "../../assets/animations/loadingAnimationRow.json";


const GEOAPIFY_KEY = "1cd1bdd5bfd24c1084943a7395672bd2";

import { RootStackParamList } from "../../routes/app.routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FavoritesButton } from "../../components/FavoriteButton";

import { useToast } from "../../contexts/ToastContext";
import LottieView from "lottie-react-native";

import mapAnimation from "../../assets/animations/mapAnimation.json";

type NavigationProps = NativeStackNavigationProp<
    RootStackParamList,
    "RequestTravel"
>;


type RouteParams = {
    emp_codigo: number;
};

type CompanyType = {
    emp_codigo: number;
    emp_nome: string;
    emp_cidade: string;
    emp_logotipo?: string;
    atributos: {
        atr_valor_fixo: string;
        atr_valor_km: string;
    }[];
};

type Coordinate = {
    latitude: number;
    longitude: number;
};

type PaymentMethod = "pix" | "credito" | "debito" | "dinheiro";

type PaymentMethodInfo = {
    type: PaymentMethod;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
};

const PAYMENT_METHODS: PaymentMethodInfo[] = [
    { type: "pix", label: "PIX", icon: "qr-code", color: "#32BCAD" },
    { type: "credito", label: "Cartão de Crédito", icon: "card", color: "#4A6FA5" },
    { type: "debito", label: "Cartão de Débito", icon: "card", color: "#4A6FA5" },
    { type: "dinheiro", label: "Dinheiro", icon: "cash", color: "#6B8E23" },
];

export function RequestTravel() {
    const { showToast } = useToast();
    const navigation = useNavigation<NavigationProps>();

    const route = useRoute();
    const { emp_codigo } = route.params as RouteParams;
    const { user } = useAuth();

    const lottieRef = useRef<LottieView>(null);
    const mapRef = useRef<MapView>(null);
    const modalRef = useRef<Modalize>(null);
    const paymentModalRef = useRef<Modalize>(null);
    const batteryLevel = useBatteryLevel();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [region, setRegion] = useState<Region | null>(null);
    const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
    const [originCoords, setOriginCoords] = useState<Coordinate | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<Coordinate | null>(null);
    const [company, setCompany] = useState<CompanyType | null>(null);

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [activeField, setActiveField] = useState<"origin" | "destination" | null>(null);

    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [durationMin, setDurationMin] = useState<number | null>(null);
    const [price, setPrice] = useState<number | null>(null);
    const [priceBreakdown, setPriceBreakdown] = useState<{
        base: number;
        battery: number;
        schedule: number;
        total: number;
    } | null>(null);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
    const [loadingRoute, setLoadingRoute] = useState(false);
    const [loadingRequest, setLoadingRequest] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(true);

    useEffect(() => {
        initialize();
    }, []);
    useEffect(() => {
        if (!origin || !destination) {
            resetRouteState();
        }
    }, [origin, destination]);


    const initialize = async () => {
        await Promise.all([loadLocation(), loadCompany()]);
    };

    const fontLoaded = useRighteousFont();

    const loadCompany = async () => {
        try {
            const response = await api.get(`/users/company/${emp_codigo}`);
            if (response.data.success) {
                setCompany(response.data.data);
            }
        } catch {
            Alert.alert("Erro", "Não foi possível carregar informações da empresa.");
        }
    };

    const loadLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permissão necessária",
                    "Precisamos da sua localização para funcionar corretamente."
                );
                setLoadingLocation(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const newRegion = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            };

            setRegion(newRegion);

            const address = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });

            if (address[0]) {
                const { street, streetNumber, city } = address[0];
                setOrigin(`${street || ''} ${streetNumber || ''}, ${city || ''}`.trim());
            }
        } catch (error) {
            Alert.alert("Erro", "Não foi possível obter sua localização.");
        } finally {
            setLoadingLocation(false);
        }
    };

    const searchAddress = async (text: string) => {
        if (!text || text.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    text
                )}&apiKey=${GEOAPIFY_KEY}&limit=5`
            );

            const data = await response.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const handleAddressSelect = async (feature: any, field: "origin" | "destination") => {
        const [lng, lat] = feature.geometry.coordinates;
        const address = feature.properties.formatted;

        if (field === "origin") {
            setOrigin(address);
            setOriginCoords({ latitude: lat, longitude: lng });
        } else {
            setDestination(address);
            setDestinationCoords({ latitude: lat, longitude: lng });
        }

        setSuggestions([]);
        setActiveField(null);
        Keyboard.dismiss();

        if ((field === "origin" && destinationCoords) ||
            (field === "destination" && originCoords)) {
            const originCoord = field === "origin" ? { latitude: lat, longitude: lng } : originCoords;
            const destCoord = field === "destination" ? { latitude: lat, longitude: lng } : destinationCoords;

            if (originCoord && destCoord) {
                await fetchRoute(originCoord, destCoord);
            }
        }
    };

    const geocode = async (address: string): Promise<Coordinate | null> => {
        const response = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
                address
            )}&apiKey=${GEOAPIFY_KEY}`
        );

        const data = await response.json();
        if (!data.features?.length) return null;

        const [lng, lat] = data.features[0].geometry.coordinates;
        return { latitude: lat, longitude: lng };
    };

    const calculatePrice = useCallback(
        (distance: number) => {
            if (!company) return;

            if (!company?.atributos?.length) return;

            const { atr_valor_fixo, atr_valor_km } = company.atributos[0];

            const valorFixo = Number(atr_valor_fixo);
            const valorKm = Number(atr_valor_km);


            const hour = new Date().getHours();

            const valorCorrida = valorFixo + distance * valorKm;

            let adicionalBateria = 0;
            let adicionalHorario = 0;

            const batteryPercent = (batteryLevel ?? 1) * 100;

            if (batteryPercent < 20) {
                adicionalBateria = valorCorrida * 0.2;
            } else if (batteryPercent < 50) {
                adicionalBateria = valorCorrida * 0.1;
            }

            if (hour >= 22 || hour < 6) {
                adicionalHorario = (valorCorrida + adicionalBateria) * 0.1;
            }

            const valorBaseFinal = valorCorrida + adicionalBateria;

            const total = valorBaseFinal + adicionalHorario;

            setPriceBreakdown({
                base: valorBaseFinal,
                battery: adicionalBateria,
                schedule: adicionalHorario,
                total: total,
            });

            setPrice(Number(total.toFixed(2)));
        },
        [company, batteryLevel]
    );


    const fetchRoute = async (
        originCoords: Coordinate,
        destinationCoords: Coordinate
    ) => {
        setLoadingRoute(true);

        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/routing?waypoints=${originCoords.latitude},${originCoords.longitude}|${destinationCoords.latitude},${destinationCoords.longitude}&mode=drive&apiKey=${GEOAPIFY_KEY}`
            );

            const data = await response.json();
            if (!data.features?.length) {
                Alert.alert("Rota não encontrada", "Não foi possível calcular uma rota entre esses pontos.");
                return;
            }

            const routeData = data.features[0];

            const distance = routeData.properties.distance / 1000;
            const duration = routeData.properties.time / 60;

            setDistanceKm(distance);
            setDurationMin(duration);
            calculatePrice(distance);

            const coordinates = routeData.geometry.coordinates[0].map(
                ([lng, lat]: number[]) => ({
                    latitude: lat,
                    longitude: lng,
                })
            );

            setRouteCoords(coordinates);

            if (mapRef.current) {
                mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: {
                        top: 100,
                        right: 50,
                        bottom: 300,
                        left: 50,
                    },
                    animated: true,
                });
            }

            Keyboard.dismiss();
            if (distance > 0) {
                modalRef.current?.open();
            }

        } catch (error) {
            Alert.alert("Erro", "Não foi possível calcular a rota. Tente novamente.");
        } finally {
            setLoadingRoute(false);
        }
    };

    const handleCalculateRoute = async () => {
        try {
            if (!origin || !destination || !company) {
                Alert.alert("Atenção", "Preencha a origem e o destino.");
                return;
            }
            setLoadingRoute(true);

            const originCoord = await geocode(`${origin}, ${company.emp_cidade}`);
            const destinationCoord = await geocode(`${destination}, ${company.emp_cidade}`);

            if (!originCoord || !destinationCoord) {
                Alert.alert(
                    "Endereço inválido",
                    "Não foi possível localizar os endereços informados."
                );
                return;
            }

            setOriginCoords(originCoord);
            setDestinationCoords(destinationCoord);

            await fetchRoute(originCoord, destinationCoord);

        } catch (error) {
            console.log("Erro ao calcular rota:", error);
            Alert.alert(
                "Erro",
                "Ocorreu um erro ao calcular a rota. Tente novamente."
            );
        } finally {
            setLoadingRoute(false);
        }
    };

    function ModalStateButton() {
        if (!isModalOpen && price && distanceKm) {
            return (
                <TouchableOpacity
                    style={styles.floatingButton}
                    activeOpacity={0.85}
                    onPress={() => modalRef.current?.open()}
                >
                    <Text style={styles.floatingButtonText}>
                        Continuar solicitando
                    </Text>
                </TouchableOpacity>
            );
        }

        return null;
    }

    const handleRequestTravel = async () => {
        console.log({price, distanceKm, company, user});
        const usu_codigo = user?.usu_codigo;
        const emp_codigo = company?.emp_codigo;
        if (!price || !distanceKm || !emp_codigo || !usu_codigo) return;
        if (distanceKm < 0.6) {
            showToast({
                title: "Distância mínima não atingida!",
                status: "error",
                subtitle: "A distância mínima deve ser de 600 metros"
            })

            return;
        }


        try {
            setLoadingRequest(true);
            const response = await api.post("/requests", {
                emp_codigo,
                usu_codigo,
                sol_origem: origin,
                sol_destino: destination,
                sol_forma_pagamento: paymentMethod,
                sol_distancia_km: distanceKm,
                sol_valor_estimado: price,
            });

            if (response.data.success) {
                const solCodigo = response.data.sol_codigo;

                modalRef.current?.close();
                setRouteCoords([]);
                setDistanceKm(null);
                setDurationMin(null);
                setPrice(null);
                setPriceBreakdown(null);

                navigation.navigate("PendingRequest", {
                    sol_codigo: solCodigo
                });
            }

        } catch (error) {
            Alert.alert("Erro", "Não foi possível solicitar a corrida. Tente novamente.");
        } finally {
            setLoadingRequest(false);
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${Math.round(minutes)} min`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}min`;
    };

    const resetRouteState = () => {
        setRouteCoords([]);
        setOriginCoords(null);
        setDestinationCoords(null);
        setDistanceKm(null);
        setDurationMin(null);
        setPrice(null);
        setPriceBreakdown(null);
        setSuggestions([]);
        setActiveField(null);

        modalRef.current?.close();
    };
    const SLIDER_WIDTH = 260;
    const HANDLE_SIZE = 52;

    const translateX = useRef(new Animated.Value(SLIDER_WIDTH - HANDLE_SIZE)).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 5;
            },

            onPanResponderMove: (_, gestureState) => {
                const newValue = SLIDER_WIDTH - HANDLE_SIZE + gestureState.dx;
                if (newValue >= 0 && newValue <= SLIDER_WIDTH - HANDLE_SIZE) {
                    translateX.setValue(newValue);
                }
            },

            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -SLIDER_WIDTH * 0.5) {
                    Animated.timing(translateX, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }).start(() => {
                        navigation.goBack();
                    });
                } else {
                    Animated.spring(translateX, {
                        toValue: SLIDER_WIDTH - HANDLE_SIZE,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const loadingMessages = [
        "Buscando sua localização atual...",
        "Montando o mapa para sua navegação...",
        "Verificando qual cidade você está...",
    ];

    const MapLoadingScreen = () => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const translateAnim = useRef(new Animated.Value(8)).current;
        const [messageIndex, setMessageIndex] = useState(0);

        useEffect(() => {
            const runTextAnimation = () => {
                fadeAnim.setValue(0);
                translateAnim.setValue(8);

                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 450,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: 0,
                        duration: 450,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]).start();
            };

            runTextAnimation();

            const interval = setInterval(() => {
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateAnim, {
                        toValue: -6,
                        duration: 300,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setMessageIndex((prev) => (prev + 1) % loadingMessages.length);

                    fadeAnim.setValue(0);
                    translateAnim.setValue(8);

                    Animated.parallel([
                        Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 450,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateAnim, {
                            toValue: 0,
                            duration: 450,
                            easing: Easing.out(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ]).start();
                });
            }, 2200);

            return () => clearInterval(interval);
        }, [fadeAnim, translateAnim]);

        return (
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 28,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        maxWidth: 360,
                        borderRadius: 28,
                        paddingVertical: 36,
                        paddingHorizontal: 24,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            width: 170,
                            height: 170,
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 18,
                        }}
                    >
                        <LottieView
                            source={mapAnimation}
                            autoPlay
                            loop
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                        />
                    </View>

                    <Text
                        style={{
                            fontSize: 22,
                            color: "#0F172A",
                            textAlign: "center",
                            marginBottom: 10,
                            fontFamily: "Righteous",
                        }}
                    >
                        Aguarde um instante
                    </Text>

                    <Animated.Text
                        style={{
                            fontSize: 15,
                            color: "#475569",
                            textAlign: "center",
                            lineHeight: 24,
                            fontFamily: "Righteous",
                            opacity: fadeAnim,
                            transform: [{ translateY: translateAnim }],
                            minHeight: 48,
                        }}
                    >
                        {loadingMessages[messageIndex]}
                    </Animated.Text>

                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            marginTop: 18,
                            gap: 10,
                        }}
                    >
                    </View>
                </View>
            </View>
        );
    };

    if (loadingLocation || !region) {
        return <MapLoadingScreen />;
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
            >
                {originCoords && (
                    <Marker
                        coordinate={originCoords}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.markerOrigin}>
                            <Ionicons name="location" size={24} color="#4CAF50" />
                        </View>
                    </Marker>
                )}

                {destinationCoords && (
                    <Marker
                        coordinate={destinationCoords}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.markerDestination}>
                            <Ionicons name="flag" size={24} color="#F44336" />
                        </View>
                    </Marker>
                )}

                {routeCoords.length > 0 && (
                    <AnimatedRoute routeCoords={routeCoords} />
                )}
            </MapView>

            <BlurView intensity={80} tint="dark" style={styles.header}>
                <View style={styles.headerContent}>

                    <View style={styles.logoWrapper}>
                        <Image
                            source={{ uri: company?.emp_logotipo }}
                            style={styles.logo}
                        />
                    </View>

                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {company?.emp_nome || "Carregando..."}
                    </Text>


                    {user?.usu_codigo !== undefined && (
                        <FavoritesButton
                            usu_codigo={user.usu_codigo}
                            origin={origin}
                            destination={destination}
                            setOrigin={setOrigin}
                            setDestination={setDestination}
                            navigation={navigation}
                        />
                    )}
                </View>

            </BlurView>

            <BlurView intensity={100} tint="light" style={styles.searchContainer}>
                <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                        <Ionicons name="ellipse" size={12} color="#4CAF50" />
                    </View>

                    <TextInput
                        placeholder="Local de partida"
                        placeholderTextColor="#999"
                        value={origin}
                        onChangeText={(text) => {
                            setOrigin(text);
                            searchAddress(text);
                            setActiveField("origin");
                        }}
                        onFocus={() => setActiveField("origin")}
                        style={[styles.input, { paddingRight: 40 }]}
                    />

                    {origin.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => {
                                setOrigin("");
                            }}

                        >
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.inputDivider} />

                <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                        <Ionicons name="square" size={12} color="#F44336" />
                    </View>

                    <TextInput
                        placeholder="Para onde vai?"
                        placeholderTextColor="#999"
                        value={destination}
                        onChangeText={(text) => {
                            setDestination(text);
                            searchAddress(text);
                            setActiveField("destination");
                        }}
                        onFocus={() => setActiveField("destination")}
                        style={[styles.input, { paddingRight: 40 }]}
                    />

                    {destination.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={() => setDestination("")}
                        >
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        {suggestions.map((feature, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() =>
                                    handleAddressSelect(feature, activeField!)
                                }
                            >
                                <Text>{feature.properties.formatted}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </BlurView>

            {!routeCoords.length && (
                <TouchableOpacity
                    style={styles.calculateButton}
                    onPress={handleCalculateRoute}
                    disabled={loadingRoute || !origin || !destination}
                >
                    <LinearGradient
                        colors={
                            loadingRoute
                                ? ['#fff', '#fff']
                                : origin && destination
                                    ? ['#000', '#000']
                                    : ['#fff', '#fff']
                        }
                        style={styles.gradientButton}
                    >
                        {loadingRoute ? (
                            <LottieView
                                ref={lottieRef}
                                source={loadingAnimationRow}
                                autoPlay
                                loop
                                style={{
                                    width: 100,
                                    height: 120,
                                }}
                            />
                        ) : (
                            <>
                                <Text style={origin && destination ? styles.calculateButtonText : { ...styles.calculateButtonText, color: '#999' }}>
                                    {origin && destination ? "Calcular rota" : "Preencha os endereços"}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color={origin && destination ? "#fff" : "#999"} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            )}

            <Modalize
                ref={modalRef}
                adjustToContentHeight
                modalStyle={styles.modal}
                handleStyle={styles.modalHandle}
                onOpen={() => setIsModalOpen(true)}
                onClosed={() => setIsModalOpen(false)}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Detalhes da viagem</Text>
                        <Text style={styles.companyName}>{company?.emp_nome}</Text>
                    </View>

                    <View style={styles.routeSummary}>
                        <View style={styles.routePoint}>
                            <Ionicons name="location" size={16} color="#4CAF50" />
                            <Text style={styles.routeText} numberOfLines={1}>{origin}</Text>
                        </View>
                        <View style={styles.routeLine} />
                        <View style={styles.routePoint}>
                            <Ionicons name="flag" size={16} color="#F44336" />
                            <Text style={styles.routeText} numberOfLines={1}>{destination}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <MaterialCommunityIcons name="map-marker-distance" size={24} color="#667eea" />
                            <Text style={styles.statValue}>{distanceKm?.toFixed(1)} km</Text>
                            <Text style={styles.statLabel}>Distância</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Ionicons name="time" size={24} color="#667eea" />
                            <Text style={styles.statValue}>
                                {durationMin ? formatDuration(durationMin) : '0 min'}
                            </Text>
                            <Text style={styles.statLabel}>Tempo</Text>
                        </View>
                    </View>

                    {priceBreakdown && (
                        <View style={styles.priceBreakdown}>
                            <Text style={styles.priceBreakdownTitle}>Composição do preço</Text>

                            <View style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>Valor base</Text>
                                <Text style={styles.breakdownValue}>R$ {priceBreakdown.base.toFixed(2)}</Text>
                            </View>

                            {priceBreakdown.schedule > 0 && (
                                <View style={styles.breakdownItem}>
                                    <Text style={styles.breakdownLabel}>Taxa noturna</Text>
                                    <Text style={styles.breakdownValue}>+ R$ {priceBreakdown.schedule.toFixed(2)}</Text>
                                </View>
                            )}

                            <View style={styles.breakdownTotal}>
                                <Text style={styles.breakdownTotalLabel}>Total estimado</Text>
                                <Text style={styles.price}>R$ {price?.toFixed(2)}</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={() => {
                            paymentModalRef.current?.open();
                        }}
                    >
                        <View style={styles.paymentButtonContent}>
                            <Ionicons name={PAYMENT_METHODS.find(m => m.type === paymentMethod)?.icon} size={24} color="#667eea" />
                            <Text style={styles.paymentButtonText}>
                                Pagamento: {PAYMENT_METHODS.find(m => m.type === paymentMethod)?.label}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#667eea" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.confirmButton, styles.gradientButton]}
                        onPress={handleRequestTravel}
                        disabled={loadingRequest}
                    >

                        {loadingRequest ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.confirmButtonText}>Confirmar corrida</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Modalize>

            <Modalize
                ref={paymentModalRef}
                adjustToContentHeight
                modalStyle={styles.modal}
                handleStyle={styles.modalHandle}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Forma de pagamento</Text>

                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity
                            key={method.type}
                            style={[
                                styles.paymentOption,
                                paymentMethod === method.type && styles.selectedPayment,
                            ]}
                            onPress={() => {
                                setPaymentMethod(method.type);
                                paymentModalRef.current?.close();
                            }}
                        >
                            <View style={styles.paymentOptionContent}>
                                <View style={[styles.paymentIcon, { backgroundColor: `${method.color}20` }]}>
                                    <Ionicons name={method.icon} size={24} color={method.color} />
                                </View>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentLabel}>{method.label}</Text>
                                    {method.type === 'pix' && (
                                        <Text style={styles.paymentDescription}>Pagamento instantâneo</Text>
                                    )}
                                </View>
                            </View>

                            {paymentMethod === method.type && (
                                <Ionicons name="checkmark-circle" size={24} color={method.color} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </Modalize>
            <View style={styles.backSliderWrapper}>
                <View style={styles.backSliderContainer}>

                    <Text style={styles.backSliderText}>
                        Arraste para voltar
                    </Text>

                    <Animated.View
                        style={[
                            styles.backSliderHandle,
                            { transform: [{ translateX }] },
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </Animated.View>

                </View>
            </View>

            <ModalStateButton />
        </View>
    );
}
