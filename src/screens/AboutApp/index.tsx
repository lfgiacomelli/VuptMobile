import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    StatusBar,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Platform,
    Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import useRighteousFont from "../../hooks/useFont";
import { api } from "../../services/api";
import { PartnersCarousel } from "../../components/PartnersCarousel";

const { width, height } = Dimensions.get("window");

type Review = {
    ava_codigo: number;
    ava_comentario: string;
    ava_nota: number;
    usu_nome: string;
    created_at: string;
};

type CarouselReview = Review & {
    __uniqueKey: string;
};

const CARD_WIDTH = width * 0.82;
const SPACING = 18;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;
const SIDE_PADDING = (width - CARD_WIDTH) / 2;

export function AboutApp() {
    const navigation = useNavigation<any>();
    const fontLoaded = useRighteousFont();

    const [introDone, setIntroDone] = useState(false);
    const [showMainContent, setShowMainContent] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [carouselData, setCarouselData] = useState<CarouselReview[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    const flatListRef = useRef<FlatList<CarouselReview>>(null);
    const autoScrollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentIndexRef = useRef(0);

    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollX = useRef(new Animated.Value(0)).current;

    const introOpacity = useRef(new Animated.Value(1)).current;
    const introScale = useRef(new Animated.Value(1)).current;

    const vortexRotate = useRef(new Animated.Value(0)).current;
    const vortexRotateReverse = useRef(new Animated.Value(0)).current;
    const vortexScale = useRef(new Animated.Value(0.2)).current;
    const vortexOpacity = useRef(new Animated.Value(0)).current;

    const inkSweepScale = useRef(new Animated.Value(0.15)).current;
    const inkSweepOpacity = useRef(new Animated.Value(0)).current;

    const centerPulse = useRef(new Animated.Value(0.8)).current;
    const centerGlow = useRef(new Animated.Value(0.35)).current;

    const introTextOpacity = useRef(new Animated.Value(0)).current;
    const introTextTranslateY = useRef(new Animated.Value(28)).current;

    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(40)).current;

    const heroTagOpacity = useRef(new Animated.Value(0)).current;
    const heroTagTranslateY = useRef(new Animated.Value(20)).current;

    const heroTitleOpacity = useRef(new Animated.Value(0)).current;
    const heroTitleTranslateY = useRef(new Animated.Value(28)).current;

    const heroTextOpacity = useRef(new Animated.Value(0)).current;
    const heroTextTranslateY = useRef(new Animated.Value(30)).current;

    const teaserOpacity = useRef(new Animated.Value(0)).current;
    const teaserTranslateY = useRef(new Animated.Value(24)).current;

    const sectionOpacity = useRef(new Animated.Value(0)).current;
    const sectionTranslateY = useRef(new Animated.Value(30)).current;

    const finalCtaOpacity = useRef(new Animated.Value(0)).current;
    const finalCtaTranslateY = useRef(new Animated.Value(30)).current;

    const orbFloatY1 = useRef(new Animated.Value(0)).current;
    const orbFloatY2 = useRef(new Animated.Value(0)).current;

    const aboutTexts = useMemo(
        () => [
            "Criado para simplificar a vida dos nossos clientes, colocando tudo o que você precisa na palma da mão, em instantes.",
            "Solicite mototáxis com rapidez, acompanhe cada etapa com transparência e tenha controle total do seu trajeto, do início ao fim.",
            "Uma experiência pensada para quem valoriza agilidade, praticidade e confiança em cada solicitação.",
        ],
        []
    );
    const teaserText = useMemo(
        () =>
            "Continue vendo",
        []
    );


    const getInitials = useCallback((name: string) => {
        const parts = String(name || "")
            .trim()
            .split(" ")
            .filter(Boolean);

        if (!parts.length) return "US";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }, []);

    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);

            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "Data indisponível";
        }
    }, []);

    const normalizeRating = useCallback((rating: number) => {
        if (typeof rating !== "number" || Number.isNaN(rating)) return 5;
        return Math.max(0, Math.min(5, rating));
    }, []);

    const buildInfiniteData = useCallback((base: Review[]) => {
        if (!base.length) return [];

        const repeated = Array.from({ length: 12 }, (_, blockIndex) =>
            base.map((item, itemIndex) => ({
                ...item,
                __uniqueKey: `${item.ava_codigo}-${blockIndex}-${itemIndex}`,
            }))
        ).flat();

        return repeated;
    }, []);

    const fetchReviews = useCallback(async () => {
        try {
            setLoadingReviews(true);

            const response = await api.get("/reviews/to-explain/");

            const rawData = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                    ? response.data.data
                    : [];

            const parsed: Review[] = rawData
                .filter((item: any) => item?.ava_codigo)
                .slice(0, 10)
                .map((item: any) => ({
                    ava_codigo: Number(item.ava_codigo),
                    ava_comentario: String(
                        item.ava_comentario ??
                        "Uma experiência moderna, rápida e muito agradável de usar."
                    ),
                    ava_nota: Number(item.ava_nota ?? 5),
                    usu_nome: String(item.usu_nome ?? "Usuário"),
                    created_at: String(item.created_at ?? new Date().toISOString()),
                }));

            const fallback: Review[] = parsed.length
                ? parsed
                : [
                    {
                        ava_codigo: 1,
                        ava_comentario:
                            "Gostei muito da sensação de fluidez. O app passa profissionalismo logo no primeiro uso.",
                        ava_nota: 5,
                        usu_nome: "Mariana Silva",
                        created_at: new Date().toISOString(),
                    },
                    {
                        ava_codigo: 2,
                        ava_comentario:
                            "A interface é limpa, bonita e muito intuitiva. Dá para perceber o cuidado em cada detalhe.",
                        ava_nota: 5,
                        usu_nome: "Carlos Eduardo",
                        created_at: new Date().toISOString(),
                    },
                    {
                        ava_codigo: 3,
                        ava_comentario:
                            "É o tipo de aplicativo que faz a experiência parecer mais simples e sofisticada ao mesmo tempo.",
                        ava_nota: 4,
                        usu_nome: "Fernanda Costa",
                        created_at: new Date().toISOString(),
                    },
                ];

            setReviews(fallback);
            setCarouselData(buildInfiniteData(fallback));
        } catch (error) {
            const fallback: Review[] = [
                {
                    ava_codigo: 1,
                    ava_comentario:
                        "Gostei muito da sensação de fluidez. O app passa profissionalismo logo no primeiro uso.",
                    ava_nota: 5,
                    usu_nome: "Mariana Silva",
                    created_at: new Date().toISOString(),
                },
                {
                    ava_codigo: 2,
                    ava_comentario:
                        "A interface é limpa, bonita e muito intuitiva. Dá para perceber o cuidado em cada detalhe.",
                    ava_nota: 5,
                    usu_nome: "Carlos Eduardo",
                    created_at: new Date().toISOString(),
                },
                {
                    ava_codigo: 3,
                    ava_comentario:
                        "É o tipo de aplicativo que faz a experiência parecer mais simples e sofisticada ao mesmo tempo.",
                    ava_nota: 4,
                    usu_nome: "Fernanda Costa",
                    created_at: new Date().toISOString(),
                },
            ];

            setReviews(fallback);
            setCarouselData(buildInfiniteData(fallback));
        } finally {
            setLoadingReviews(false);
        }
    }, [buildInfiniteData]);

    useEffect(() => {
        if (!fontLoaded) return;
        fetchReviews();
    }, [fontLoaded, fetchReviews]);

    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);
    useEffect(() => {
        if (!fontLoaded) return;

        Animated.loop(
            Animated.timing(vortexRotate, {
                toValue: 1,
                duration: 2600,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.timing(vortexRotateReverse, {
                toValue: 1,
                duration: 3400,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(centerPulse, {
                    toValue: 1.16,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(centerPulse, {
                    toValue: 0.88,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(centerGlow, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(centerGlow, {
                    toValue: 0.4,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orbFloatY1, {
                    toValue: -18,
                    duration: 2600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(orbFloatY1, {
                    toValue: 16,
                    duration: 2600,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(orbFloatY2, {
                    toValue: 14,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(orbFloatY2, {
                    toValue: -14,
                    duration: 3000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.sequence([
            Animated.parallel([
                Animated.timing(vortexOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(inkSweepOpacity, {
                    toValue: 1,
                    duration: 450,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(introTextOpacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(introTextTranslateY, {
                    toValue: 0,
                    duration: 700,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(vortexScale, {
                    toValue: 1.15,
                    duration: 1100,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(inkSweepScale, {
                    toValue: 1.45,
                    duration: 1200,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(550),
            Animated.parallel([
                Animated.timing(vortexScale, {
                    toValue: 5.8,
                    duration: 1000,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(inkSweepScale, {
                    toValue: 7.2,
                    duration: 1050,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(introTextOpacity, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(introOpacity, {
                    toValue: 0,
                    duration: 850,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(introScale, {
                    toValue: 1.05,
                    duration: 850,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            setIntroDone(true);
            setShowMainContent(true);

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(contentOpacity, {
                        toValue: 1,
                        duration: 650,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(contentTranslateY, {
                        toValue: 0,
                        duration: 650,
                        easing: Easing.out(Easing.exp),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.stagger(110, [
                    Animated.parallel([
                        Animated.timing(heroTagOpacity, {
                            toValue: 1,
                            duration: 450,
                            useNativeDriver: true,
                        }),
                        Animated.timing(heroTagTranslateY, {
                            toValue: 0,
                            duration: 450,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(heroTitleOpacity, {
                            toValue: 1,
                            duration: 520,
                            useNativeDriver: true,
                        }),
                        Animated.timing(heroTitleTranslateY, {
                            toValue: 0,
                            duration: 520,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(heroTextOpacity, {
                            toValue: 1,
                            duration: 580,
                            useNativeDriver: true,
                        }),
                        Animated.timing(heroTextTranslateY, {
                            toValue: 0,
                            duration: 580,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(teaserOpacity, {
                            toValue: 1,
                            duration: 580,
                            useNativeDriver: true,
                        }),
                        Animated.timing(teaserTranslateY, {
                            toValue: 0,
                            duration: 580,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(sectionOpacity, {
                            toValue: 1,
                            duration: 620,
                            useNativeDriver: true,
                        }),
                        Animated.timing(sectionTranslateY, {
                            toValue: 0,
                            duration: 620,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(finalCtaOpacity, {
                            toValue: 1,
                            duration: 620,
                            useNativeDriver: true,
                        }),
                        Animated.timing(finalCtaTranslateY, {
                            toValue: 0,
                            duration: 620,
                            easing: Easing.out(Easing.exp),
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start();
        });
    }, [
        fontLoaded,
        centerGlow,
        centerPulse,
        contentOpacity,
        contentTranslateY,
        finalCtaOpacity,
        finalCtaTranslateY,
        heroTagOpacity,
        heroTagTranslateY,
        heroTextOpacity,
        heroTextTranslateY,
        heroTitleOpacity,
        heroTitleTranslateY,
        inkSweepOpacity,
        inkSweepScale,
        introOpacity,
        introScale,
        introTextOpacity,
        introTextTranslateY,
        orbFloatY1,
        orbFloatY2,
        sectionOpacity,
        sectionTranslateY,
        teaserOpacity,
        teaserTranslateY,
        vortexOpacity,
        vortexRotate,
        vortexRotateReverse,
        vortexScale,
    ]);

    useEffect(() => {
        if (!showMainContent || carouselData.length <= 1) return;

        const middleIndex = Math.floor(carouselData.length / 2);

        setTimeout(() => {
            currentIndexRef.current = middleIndex;

            flatListRef.current?.scrollToOffset({
                offset: middleIndex * SNAP_INTERVAL,
                animated: false,
            });
        }, 250);

        autoScrollRef.current = setInterval(() => {
            currentIndexRef.current += 1;

            flatListRef.current?.scrollToOffset({
                offset: currentIndexRef.current * SNAP_INTERVAL,
                animated: true,
            });

            if (currentIndexRef.current >= carouselData.length - 4) {
                const safeIndex = Math.floor(carouselData.length / 2);

                setTimeout(() => {
                    currentIndexRef.current = safeIndex;
                    flatListRef.current?.scrollToOffset({
                        offset: safeIndex * SNAP_INTERVAL,
                        animated: false,
                    });
                }, 350);
            }
        }, 3600);

        return () => {
            if (autoScrollRef.current) clearInterval(autoScrollRef.current);
        };
    }, [showMainContent, carouselData]);

    const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        currentIndexRef.current = Math.round(offsetX / SNAP_INTERVAL);

        if (currentIndexRef.current >= carouselData.length - 3) {
            const safeIndex = Math.floor(carouselData.length / 2);

            setTimeout(() => {
                currentIndexRef.current = safeIndex;
                flatListRef.current?.scrollToOffset({
                    offset: safeIndex * SNAP_INTERVAL,
                    animated: false,
                });
            }, 100);
        }
    };

    const vortexSpin = vortexRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    const vortexSpinReverse = vortexRotateReverse.interpolate({
        inputRange: [0, 1],
        outputRange: ["360deg", "0deg"],
    });

    const headerParallax = scrollY.interpolate({
        inputRange: [0, 250],
        outputRange: [0, -35],
        extrapolate: "clamp",
    });

    const headerOpacityOnScroll = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0.86],
        extrapolate: "clamp",
    });

    const renderStars = (rating: number) => {
        const safe = normalizeRating(rating);

        return (
            <View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, index) => (
                    <Ionicons
                        key={`star-${index}`}
                        name={index < safe ? "star" : "star-outline"}
                        size={15}
                        color={index < safe ? "#FFFFFF" : "rgba(255,255,255,0.35)"}
                        style={{ marginRight: 4 }}
                    />
                ))}
            </View>
        );
    };

    const renderReviewCard = ({ item, index }: { item: CarouselReview; index: number }) => {
        const inputRange = [
            (index - 2) * SNAP_INTERVAL,
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
            (index + 2) * SNAP_INTERVAL,
        ];

        const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 0.95, 1, 0.95, 0.9],
            extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.28, 0.58, 1, 0.58, 0.28],
            extrapolate: "clamp",
        });

        const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [22, 12, 0, 12, 22],
            extrapolate: "clamp",
        });

        return (
            <Animated.View
                style={[
                    styles.cardItemWrapper,
                    {
                        width: CARD_WIDTH,
                        marginRight: SPACING,
                        opacity,
                        transform: [{ scale }, { translateY }],
                    },
                ]}
            >
                <LinearGradient
                    colors={[
                        "rgba(255,255,255,0.14)",
                        "rgba(255,255,255,0.08)",
                        "rgba(255,255,255,0.04)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                >
                    <BlurView intensity={30} tint="dark" style={styles.cardBlur}>
                        <View style={styles.cardTopGlow} />

                        <View style={styles.cardHeader}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials(item.usu_nome)}</Text>
                            </View>

                            <View style={styles.cardHeaderInfo}>
                                <Text style={styles.cardUserName} numberOfLines={1}>
                                    {item.usu_nome}
                                </Text>
                                <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
                            </View>

                            <View style={styles.notePill}>
                                <Text style={styles.notePillText}>{normalizeRating(item.ava_nota).toFixed(1)}</Text>
                            </View>
                        </View>

                        <View style={styles.cardStars}>{renderStars(item.ava_nota)}</View>

                        <Text style={styles.cardComment} numberOfLines={5}>
                            “{item.ava_comentario}”
                        </Text>

                        <View style={styles.cardBottom}>
                            <View style={styles.cardBadge}>
                                <Ionicons name="sparkles-outline" size={14} color="#FFFFFF" />
                                <Text style={styles.cardBadgeText}>Avaliação em destaque</Text>
                            </View>

                            <Text style={styles.reviewCode}>#{item.ava_codigo}</Text>
                        </View>
                    </BlurView>
                </LinearGradient>
            </Animated.View>
        );
    };

    if (!fontLoaded) {
        return (
            <View style={styles.loaderScreen}>
                <LinearGradient colors={["#020202", "#0A0A0A", "#111111"]} style={StyleSheet.absoluteFillObject} />
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <LinearGradient
                colors={["#010101", "#050505", "#090909", "#0E0E0E"]}
                locations={[0, 0.34, 0.7, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.bgOrbTop,
                    {
                        transform: [{ translateY: orbFloatY1 }],
                    },
                ]}
            />

            <Animated.View
                pointerEvents="none"
                style={[
                    styles.bgOrbBottom,
                    {
                        transform: [{ translateY: orbFloatY2 }],
                    },
                ]}
            />

            {!introDone && (
                <Animated.View
                    style={[
                        styles.introOverlay,
                        {
                            opacity: introOpacity,
                            transform: [{ scale: introScale }],
                        },
                    ]}
                >

                    <LinearGradient
                        colors={["#020202", "#060606", "#0A0A0A", "#111111"]}
                        style={StyleSheet.absoluteFillObject}
                    />

                    <Animated.View
                        style={[
                            styles.vortexLayerOuter,
                            {
                                opacity: vortexOpacity,
                                transform: [{ rotate: vortexSpin }, { scale: vortexScale }],
                            },
                        ]}
                    >
                        <View style={styles.vortexBlobOne} />
                        <View style={styles.vortexBlobTwo} />
                        <View style={styles.vortexBlobThree} />
                        <View style={styles.vortexBlobFour} />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.vortexLayerInner,
                            {
                                opacity: vortexOpacity,
                                transform: [{ rotate: vortexSpinReverse }, { scale: vortexScale }],
                            },
                        ]}
                    >
                        <View style={styles.vortexInkOne} />
                        <View style={styles.vortexInkTwo} />
                        <View style={styles.vortexInkThree} />
                        <View style={styles.vortexInkFour} />
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.inkSweepCore,
                            {
                                opacity: inkSweepOpacity,
                                transform: [{ scale: inkSweepScale }],
                            },
                        ]}
                    />

                    <Animated.Image
                        source={{ uri: "https://www.portalbueno.com.br/uploads/news/03_11_2023_065141_338.png" }}
                        style={{
                            position: "absolute",
                            width: 320,
                            height: 320,
                            alignSelf: "center",
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        }}
                        resizeMode="contain"
                    />

                    <Animated.View
                        style={[
                            styles.introCoreLight,
                            {
                                opacity: centerGlow,
                                transform: [{ scale: centerPulse }],
                            },
                        ]}
                    />

                    <Animated.View
                        style={[
                            styles.introTextBlock,
                            {
                                opacity: introTextOpacity,
                                transform: [{ translateY: introTextTranslateY }],
                            },
                        ]}
                    >
                        <Text style={styles.introOverline}>Conheça sobre nós</Text>
                        <Text style={styles.introDescription}>
                            Agilidade, profissionalismo e segurança, tudo na palma da sua mão!
                        </Text>
                    </Animated.View>
                </Animated.View>
            )}

            {showMainContent && (
                <SafeAreaView style={styles.safeArea}>
                    <Animated.ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        style={{
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslateY }],
                        }}
                    >
                        <Animated.View
                            style={[
                                styles.heroSection,
                                {
                                    opacity: headerOpacityOnScroll,
                                    transform: [{ translateY: headerParallax }],
                                },
                            ]}
                        >
                            
                            <View style={{justifyContent: "center", alignItems: "center"}}>
                                <Image
                                    source={{ uri: "https://www.portalbueno.com.br/uploads/news/03_11_2023_065141_338.png" }}
                                    style={{
                                        width: "100%",
                                        height: 145,
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                />
                            </View>
                            <PartnersCarousel />
                            <Animated.View
                                style={{
                                    opacity: heroTitleOpacity,
                                    transform: [{ translateY: heroTitleTranslateY }],
                                }}
                            >

                                <Text style={styles.heroTitle}>
                                    Criado para agilizar processos!
                                </Text>
                            </Animated.View>

                            <Animated.View
                                style={{
                                    opacity: heroTextOpacity,
                                    transform: [{ translateY: heroTextTranslateY }],
                                }}
                            >
                                {aboutTexts.map((text, index) => (
                                    <Text key={`about-text-${index}`} style={styles.heroParagraph}>
                                        {text}
                                    </Text>
                                ))}
                            </Animated.View>

                            <Animated.View
                                style={[
                                    styles.scrollTeaserBox,
                                    {
                                        opacity: teaserOpacity,
                                        transform: [{ translateY: teaserTranslateY }],
                                    },
                                ]}
                            >
                                <Ionicons name="arrow-down-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.scrollTeaserText}>{teaserText}</Text>
                            </Animated.View>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.featureSection,
                                {
                                    opacity: sectionOpacity,
                                    transform: [{ translateY: sectionTranslateY }],
                                },
                            ]}
                        >
                            <Text style={styles.sectionEyebrow}>O QUE DEFINE A EXPERIÊNCIA</Text>
                            <Text style={styles.sectionTitle}>Três pilares que nos sustentam</Text>

                            <View style={styles.featureList}>
                                <View style={styles.featureCard}>
                                    <LinearGradient
                                        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)"]}
                                        style={styles.featureCardGradient}
                                    >
                                        <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
                                        <Text style={styles.featureCardTitle}>Agilidade real</Text>
                                        <Text style={styles.featureCardDescription}>
                                            Menos fricção, menos dúvidas e mais rapidez para que você possa concluir o que precisa.
                                        </Text>
                                    </LinearGradient>
                                </View>

                                <View style={styles.featureCard}>
                                    <LinearGradient
                                        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)"]}
                                        style={styles.featureCardGradient}
                                    >
                                        <Ionicons name="shield-checkmark-outline" size={20} color="#FFFFFF" />

                                        <Text style={styles.featureCardTitle}>Confiança</Text>

                                        <Text style={styles.featureCardDescription}>
                                            Arquitetura sólida, construída com tecnologia moderna e atenção a cada detalhe,
                                            garantindo segurança, estabilidade e total confiabilidade em cada solicitação.
                                        </Text>
                                    </LinearGradient>
                                </View>

                                <View style={styles.featureCard}>
                                    <LinearGradient
                                        colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)"]}
                                        style={styles.featureCardGradient}
                                    >
                                        <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
                                        <Text style={styles.featureCardTitle}>Percepção premium</Text>
                                        <Text style={styles.featureCardDescription}>
                                            O objetivo não é apenas funcionar bem, mas fazer com que você sinta a diferença.
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.reviewsSection,
                                {
                                    opacity: sectionOpacity,
                                    transform: [{ translateY: sectionTranslateY }],
                                },
                            ]}
                        >
                            <View style={styles.reviewsHeader}>
                                <View>
                                    <Text style={styles.sectionEyebrow}>AVALIAÇÕES REAIS</Text>
                                    <Text style={styles.reviewsTitle}>O que dizem sobre nós?</Text>
                                </View>

                                <View style={styles.liveBadge}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveBadgeText}>Destaques</Text>
                                </View>
                            </View>

                            {loadingReviews ? (
                                <View style={styles.reviewsLoaderBox}>
                                    <ActivityIndicator size="large" color="#FFFFFF" />
                                    <Text style={styles.reviewsLoaderText}>Carregando avaliações...</Text>
                                </View>
                            ) : (
                                <Animated.FlatList
                                    ref={flatListRef}
                                    data={carouselData}
                                    horizontal
                                    keyExtractor={(item) => item.__uniqueKey}
                                    renderItem={renderReviewCard}
                                    showsHorizontalScrollIndicator={false}
                                    bounces={false}
                                    decelerationRate="fast"
                                    snapToInterval={SNAP_INTERVAL}
                                    disableIntervalMomentum
                                    contentContainerStyle={{
                                        paddingLeft: SIDE_PADDING,
                                        paddingRight: SIDE_PADDING - SPACING,
                                    }}
                                    onMomentumScrollEnd={handleMomentumEnd}
                                    onScroll={Animated.event(
                                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                                        { useNativeDriver: true }
                                    )}
                                    scrollEventThrottle={16}
                                    getItemLayout={(_, index) => ({
                                        length: SNAP_INTERVAL,
                                        offset: SNAP_INTERVAL * index,
                                        index,
                                    })}
                                />
                            )}
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.finalSection,
                                {
                                    opacity: finalCtaOpacity,
                                    transform: [{ translateY: finalCtaTranslateY }],
                                },
                            ]}
                        >
                            <Text style={styles.finalSectionTitle}>Tudo foi desenhado para deixar uma impressão.</Text>
                            <Text style={styles.finalSectionText}>
                                Quando performance, clareza e apresentação caminham juntas, o aplicativo deixa de
                                ser apenas uma ferramenta e passa a ser uma experiência.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.88}
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <LinearGradient
                                    colors={["#FFFFFF", "#D9D9D9"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.backButtonGradient}
                                >
                                    <Ionicons name="arrow-back-outline" size={18} color="#050505" />
                                    <Text style={styles.backButtonText}>Voltar</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.ScrollView>
                </SafeAreaView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#050505",
    },

    safeArea: {
        flex: 1,
    },

    loaderScreen: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#050505",
    },

    bgOrbTop: {
        position: "absolute",
        top: height * 0.07,
        right: -90,
        width: 240,
        height: 240,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.04)",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.12,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 0 },
    },

    bgOrbBottom: {
        position: "absolute",
        bottom: height * 0.12,
        left: -110,
        width: 260,
        height: 260,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.035)",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.08,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 0 },
    },

    /**
     * INTRO
     */
    introOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    vortexLayerOuter: {
        position: "absolute",
        width: width * 1.15,
        height: width * 1.15,
        justifyContent: "center",
        alignItems: "center",
    },

    vortexLayerInner: {
        position: "absolute",
        width: width * 0.92,
        height: width * 0.92,
        justifyContent: "center",
        alignItems: "center",
    },

    vortexBlobOne: {
        position: "absolute",
        width: width * 0.88,
        height: width * 0.36,
        borderRadius: 999,
        backgroundColor: "#0B0B0B",
        transform: [{ rotate: "0deg" }],
    },

    vortexBlobTwo: {
        position: "absolute",
        width: width * 0.78,
        height: width * 0.3,
        borderRadius: 999,
        backgroundColor: "#101010",
        transform: [{ rotate: "55deg" }],
    },

    vortexBlobThree: {
        position: "absolute",
        width: width * 0.84,
        height: width * 0.34,
        borderRadius: 999,
        backgroundColor: "#060606",
        transform: [{ rotate: "110deg" }],
    },

    vortexBlobFour: {
        position: "absolute",
        width: width * 0.74,
        height: width * 0.28,
        borderRadius: 999,
        backgroundColor: "#131313",
        transform: [{ rotate: "165deg" }],
    },

    vortexInkOne: {
        position: "absolute",
        width: width * 0.68,
        height: width * 0.26,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        transform: [{ rotate: "15deg" }],
    },

    vortexInkTwo: {
        position: "absolute",
        width: width * 0.72,
        height: width * 0.22,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.05)",
        transform: [{ rotate: "75deg" }],
    },

    vortexInkThree: {
        position: "absolute",
        width: width * 0.64,
        height: width * 0.24,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.04)",
        transform: [{ rotate: "130deg" }],
    },

    vortexInkFour: {
        position: "absolute",
        width: width * 0.58,
        height: width * 0.18,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
        transform: [{ rotate: "190deg" }],
    },

    inkSweepCore: {
        position: "absolute",
        width: width * 0.52,
        height: width * 0.52,
        borderRadius: 999,
        backgroundColor: "#080808",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.12,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 0 },
    },

    introCoreLight: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.1)",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.45,
        shadowRadius: 36,
        shadowOffset: { width: 0, height: 0 },
    },

    introTextBlock: {
        position: "absolute",
        alignItems: "center",
        width: "84%",
        bottom: height * 0.14,
    },

    introOverline: {
        fontFamily: "Righteous",
        color: "rgba(255,255,255,0.56)",
        fontSize: 11,
        letterSpacing: 2.8,
        marginBottom: 12,
        textAlign: "center",
    },

    introDescription: {
        marginTop: 14,
        color: "rgba(255,255,255,0.74)",
        fontSize: 14,
        lineHeight: 23,
        textAlign: "center",
        paddingHorizontal: 6,
    },

    /**
     * CONTEÚDO
     */
    scrollContent: {
        paddingTop: Platform.OS === "android" ? 28 : 20,
        paddingBottom: 60,
    },

    heroSection: {
        paddingHorizontal: 22,
        paddingTop: 10,
    },

    heroTag: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginBottom: 18,
    },

    heroTagText: {
        marginLeft: 8,
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "Righteous",
        letterSpacing: 0.4,
    },

    heroTitle: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 22,
        lineHeight: 40,
        letterSpacing: 0.5,
    },

    heroParagraph: {
        marginTop: 16,
        color: "rgba(255,255,255,0.76)",
        fontSize: 15,
        lineHeight: 26,
    },

    scrollTeaserBox: {
        marginTop: 24,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
        flexDirection: "row",
        alignItems: "flex-start",
    },

    scrollTeaserText: {
        marginLeft: 10,
        flex: 1,
        color: "#FFFFFF",
        fontSize: 13,
        lineHeight: 22,
        fontFamily: "Righteous",
    },

    featureSection: {
        marginTop: 34,
        paddingHorizontal: 22,
    },

    sectionEyebrow: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 12,
        letterSpacing: 2.2,
        fontFamily: "Righteous",
        marginBottom: 8,
    },

    sectionTitle: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 22,
        lineHeight: 32,
    },

    featureList: {
        marginTop: 18,
        gap: 14,
    },

    featureCard: {
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    featureCardGradient: {
        padding: 18,
    },

    featureCardTitle: {
        marginTop: 14,
        color: "#FFFFFF",
        fontSize: 18,
        fontFamily: "Righteous",
    },

    featureCardDescription: {
        marginTop: 8,
        color: "rgba(255,255,255,0.72)",
        fontSize: 14,
        lineHeight: 22,
    },

    reviewsSection: {
        marginTop: 36,
    },

    reviewsHeader: {
        paddingHorizontal: 22,
        marginBottom: 18,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
    },

    reviewsTitle: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 22,
        lineHeight: 30,
        maxWidth: width * 0.66,
    },

    liveBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        marginTop: 4,
    },

    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        marginRight: 8,
    },

    liveBadgeText: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 12,
    },

    reviewsLoaderBox: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },

    reviewsLoaderText: {
        marginTop: 14,
        color: "rgba(255,255,255,0.72)",
        fontSize: 14,
    },

    cardItemWrapper: {
        paddingVertical: 10,
    },

    cardGradient: {
        minHeight: 320,
        borderRadius: 28,
        overflow: "hidden",
    },

    cardBlur: {
        minHeight: 320,
        padding: 18,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.04)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    cardTopGlow: {
        position: "absolute",
        top: -38,
        right: -16,
        width: 120,
        height: 120,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.06)",
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    avatar: {
        width: 52,
        height: 52,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },

    avatarText: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 16,
    },

    cardHeaderInfo: {
        flex: 1,
        marginLeft: 12,
    },

    cardUserName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontFamily: "Righteous",
    },

    cardDate: {
        marginTop: 4,
        color: "rgba(255,255,255,0.52)",
        fontSize: 12,
    },

    notePill: {
        minWidth: 56,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.09)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.07)",
    },

    notePillText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: "Righteous",
    },

    cardStars: {
        marginTop: 18,
    },

    starsRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    cardComment: {
        marginTop: 18,
        color: "rgba(255,255,255,0.86)",
        fontSize: 15,
        lineHeight: 25,
        minHeight: 126,
    },

    cardBottom: {
        marginTop: "auto",
        paddingTop: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    cardBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.07)",
    },

    cardBadgeText: {
        marginLeft: 8,
        color: "#FFFFFF",
        fontSize: 12,
        fontFamily: "Righteous",
    },

    reviewCode: {
        color: "rgba(255,255,255,0.52)",
        fontSize: 12,
        fontFamily: "Righteous",
    },

    finalSection: {
        marginTop: 40,
        paddingHorizontal: 22,
        alignItems: "center",
    },

    finalSectionTitle: {
        color: "#FFFFFF",
        fontSize: 27,
        lineHeight: 34,
        fontFamily: "Righteous",
        textAlign: "center",
    },

    finalSectionText: {
        marginTop: 16,
        color: "rgba(255,255,255,0.74)",
        fontSize: 15,
        lineHeight: 25,
        textAlign: "center",
    },

    backButton: {
        marginTop: 28,
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#FFFFFF",
        shadowOpacity: 0.14,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
    },

    backButtonGradient: {
        height: 58,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },

    backButtonText: {
        color: "#050505",
        fontFamily: "Righteous",
        fontSize: 16,
        letterSpacing: 0.4,
    },
});