import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Platform,
    TouchableOpacity,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import {
    RouteProp,
    useRoute,
    useNavigation,
    NavigationProp,
} from "@react-navigation/native";

import { api } from "../../services/api";
import useRighteousFont from "../../hooks/useFont";
import { styles } from "./styles";

const GEOAPIFY_KEY = "1cd1bdd5bfd24c1084943a7395672bd2";

type Coordinate = {
    latitude: number;
    longitude: number;
};

type RootStackParamList = {
    RouteMap: {
        via_codigo: number;
    };
};

type RouteMapRouteProp = RouteProp<RootStackParamList, "RouteMap">;

export function RouteMap() {
    const fontLoaded = useRighteousFont();
    const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
    const route = useRoute<RouteMapRouteProp>();
    const { via_codigo } = route.params;

    const mapRef = useRef<MapView | null>(null);

    const [loading, setLoading] = useState(true);
    const [originAddress, setOriginAddress] = useState("");
    const [destinationAddress, setDestinationAddress] = useState("");

    const [originCoords, setOriginCoords] = useState<Coordinate | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<Coordinate | null>(null);
    const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);

    const [distanceKm, setDistanceKm] = useState<number | null>(null);
    const [durationMin, setDurationMin] = useState<number | null>(null);

    const geocode = useCallback(async (address: string): Promise<Coordinate | null> => {
        try {
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
                    address
                )}&limit=1&apiKey=${GEOAPIFY_KEY}`
            );

            const data = await response.json();

            if (!data.features?.length) {
                return null;
            }

            const [lng, lat] = data.features[0].geometry.coordinates;

            return {
                latitude: lat,
                longitude: lng,
            };
        } catch (error) {
            console.log("Erro ao geocodificar endereço:", error);
            return null;
        }
    }, []);

    const fetchRoute = useCallback(
        async (origin: Coordinate, destination: Coordinate) => {
            try {
                const response = await fetch(
                    `https://api.geoapify.com/v1/routing?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${GEOAPIFY_KEY}`
                );

                const data = await response.json();

                if (!data.features?.length) {
                    Alert.alert(
                        "Rota não encontrada",
                        "Não foi possível calcular a rota da viagem selecionada."
                    );
                    return;
                }

                const routeData = data.features[0];

                const distance = routeData.properties.distance / 1000;
                const duration = routeData.properties.time / 60;

                setDistanceKm(distance);
                setDurationMin(duration);

                const coordinates = routeData.geometry.coordinates[0].map(
                    ([lng, lat]: number[]) => ({
                        latitude: lat,
                        longitude: lng,
                    })
                );

                setRouteCoords(coordinates);

                requestAnimationFrame(() => {
                    mapRef.current?.fitToCoordinates(coordinates, {
                        edgePadding: {
                            top: 180,
                            right: 60,
                            bottom: 260,
                            left: 60,
                        },
                        animated: true,
                    });
                });
            } catch (error) {
                console.log("Erro ao buscar rota:", error);
                Alert.alert(
                    "Erro",
                    "Não foi possível calcular a rota da viagem. Tente novamente."
                );
            }
        },
        []
    );

    const loadRouteData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api.get(`/travels/addresses/${via_codigo}`);
            const data = response?.data?.data;

            if (!data?.sol_origem || !data?.sol_destino) {
                Alert.alert(
                    "Dados incompletos",
                    "Não foi possível encontrar os endereços da viagem selecionada."
                );
                return;
            }

            setOriginAddress(data.sol_origem);
            setDestinationAddress(data.sol_destino);

            const origin = await geocode(data.sol_origem);
            const destination = await geocode(data.sol_destino);

            if (!origin || !destination) {
                Alert.alert(
                    "Endereço inválido",
                    "Não foi possível localizar os endereços desta viagem."
                );
                return;
            }

            setOriginCoords(origin);
            setDestinationCoords(destination);

            await fetchRoute(origin, destination);
        } catch (error) {
            console.log("Erro ao buscar endereços da viagem:", error);
            Alert.alert(
                "Erro",
                "Não foi possível carregar a rota da viagem selecionada."
            );
        } finally {
            setLoading(false);
        }
    }, [fetchRoute, geocode, via_codigo]);

    useEffect(() => {
        loadRouteData();
    }, [loadRouteData]);

    if (!fontLoaded) {
        return null;
    }

    const initialRegion = originCoords
        ? {
              latitude: originCoords.latitude,
              longitude: originCoords.longitude,
              latitudeDelta: 0.045,
              longitudeDelta: 0.045,
          }
        : {
              latitude: -22.1201,
              longitude: -51.3889,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
          };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={initialRegion}
                    showsUserLocation={false}
                    showsCompass
                    showsTraffic={false}
                    loadingEnabled
                >
                    {originCoords && (
                        <Marker
                            coordinate={originCoords}
                            title="Origem da viagem"
                            description={originAddress}
                        >
                            <View style={styles.markerOrigin}>
                                <Ionicons name="radio-button-on" size={18} color="#FFFFFF" />
                            </View>
                        </Marker>
                    )}

                    {destinationCoords && (
                        <Marker
                            coordinate={destinationCoords}
                            title="Destino da viagem"
                            description={destinationAddress}
                        >
                            <View style={styles.markerDestination}>
                                <Ionicons name="flag" size={16} color="#FFFFFF" />
                            </View>
                        </Marker>
                    )}

                    {routeCoords.length > 0 && (
                        <Polyline
                            coordinates={routeCoords}
                            strokeWidth={5}
                            strokeColor="#111111"
                            lineCap="round"
                            lineJoin="round"
                        />
                    )}
                </MapView>

                <TouchableOpacity
                    activeOpacity={0.86}
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <View style={styles.backButtonIcon}>
                        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
                    </View>

                    <View style={styles.backButtonTextWrapper}>
                        <Text style={styles.backButtonLabel}>Voltar</Text>
                        <Text style={styles.backButtonTitle}>Retornar para a viagem</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.topCard}>
                    <Text style={styles.topCardLabel}>Viagem selecionada</Text>
                    <Text style={styles.topCardTitle}>Rota completa da viagem</Text>
                    <Text style={styles.topCardDescription}>
                        Visualize o trajeto entre o ponto de origem e o destino informado.
                    </Text>
                </View>

                <View style={styles.bottomCard}>
                    <View style={styles.bottomHeader}>
                        <Text style={styles.bottomHeaderLabel}>Detalhes da rota</Text>
                        <Text style={styles.bottomHeaderTitle}>Endereços da viagem</Text>
                    </View>

                    <View style={styles.addressBlock}>
                        <View style={styles.addressIconWrapper}>
                            <View style={styles.originDot} />
                        </View>

                        <View style={styles.addressTextWrapper}>
                            <Text style={styles.addressLabel}>Origem da viagem</Text>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {originAddress || "Carregando origem da viagem..."}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.addressBlock}>
                        <View style={styles.addressIconWrapper}>
                            <Ionicons name="flag" size={15} color="#111111" />
                        </View>

                        <View style={styles.addressTextWrapper}>
                            <Text style={styles.addressLabel}>Destino da viagem</Text>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {destinationAddress || "Carregando destino da viagem..."}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.metricsRow}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Distância estimada</Text>
                            <Text style={styles.metricValue}>
                                {distanceKm !== null ? `${distanceKm.toFixed(1)} km` : "--"}
                            </Text>
                        </View>

                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Tempo estimado</Text>
                            <Text style={styles.metricValue}>
                                {durationMin !== null ? `${Math.round(durationMin)} min` : "--"}
                            </Text>
                        </View>
                    </View>
                </View>

                {loading && (
                    <View style={styles.loadingOverlay}>
                        <View style={styles.loadingCard}>
                            <ActivityIndicator size="large" color="#111111" />
                            <Text style={styles.loadingTitle}>Calculando rota da viagem</Text>
                            <Text style={styles.loadingSubtitle}>
                                Estamos preparando o trajeto da viagem selecionada para você.
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}