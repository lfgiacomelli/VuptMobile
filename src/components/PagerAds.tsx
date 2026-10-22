import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
} from "react-native";

import PagerView from "react-native-pager-view";

const { width } = Dimensions.get("window");

const BANNER_WIDTH = width - 24;
const BANNER_HEIGHT = 185;

interface AdItem {
    anu_codigo: number;
    anu_banner_url: string;
    anu_titulo?: string;
}

export function PagerAds() {
    const pagerRef = useRef<PagerView>(null);

    const [paginaAtual, setPaginaAtual] =
        useState<number>(0);

    const anuncios: AdItem[] = useMemo(
        () => [
            {
                anu_codigo: 1,
                anu_banner_url:
                    "https://www.blogdotoninho.com.br/wp-content/uploads/2022/03/Pit-Stop-Motos.png",
            },
            {
                anu_codigo: 2,
                anu_banner_url:
                    "https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwM2NmOGE0MmY0ODE5MWI2NDVkYzJkMDIyMmM5OTk6ZmlsZV8wMDAwMDAwMDI1NWM3MjBlOGVlNzcwZWEwNDgyYjA1ZiIsInRzIjoiMjA1ODYiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImRmOTQwNDBhNDExMTg5NjZlNDMwYTM2ZjBiMzQwZTRkN2NlYTUwNjdmMjllOGI1ODRhYjE3YzIwYjFlMDVlNTAiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0=",
            },
            {
                anu_codigo: 3,
                anu_banner_url:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTmjPWc9Z1oTpcL99AEjlmjbEjun2-OzkKZw&s",
            },
        ],
        []
    );

    useEffect(() => {
        if (anuncios.length <= 1) return;

        const interval = setInterval(() => {
            setPaginaAtual((prev) => {
                const proximaPagina =
                    prev + 1 >= anuncios.length
                        ? 0
                        : prev + 1;

                pagerRef.current?.setPage(
                    proximaPagina
                );

                return proximaPagina;
            });
        }, 4000);

        return () =>
            clearInterval(interval);
    }, [anuncios.length]);

    return (
        <View style={styles.container}>
            <View style={styles.bannerContainer}>
                <PagerView
                    ref={pagerRef}
                    style={styles.banner}
                    initialPage={0}
                    onPageSelected={(e) =>
                        setPaginaAtual(
                            e.nativeEvent.position
                        )
                    }
                >
                    {anuncios.map((item) => (
                        <TouchableOpacity
                            key={
                                item.anu_codigo
                            }
                            activeOpacity={
                                0.92
                            }
                            style={styles.page}
                        >
                            <Image
                                source={{
                                    uri: item.anu_banner_url,
                                }}
                                style={
                                    styles.image
                                }
                                resizeMode="cover"
                            />

                            
                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={
                                        styles.title
                                    }
                                >
                                    {
                                        item.anu_titulo
                                    }
                                </Text>
                        </TouchableOpacity>
                    ))}
                </PagerView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",

        marginTop: 12,
        height: BANNER_HEIGHT,
    },

    bannerContainer: {
        width: BANNER_WIDTH,
    },

    banner: {
        width: "100%",
        height: BANNER_HEIGHT,

        borderRadius: 22,
        overflow: "hidden",

        backgroundColor: "#DDD",
        flex: 0,
        elevation: 5,

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.18,
        shadowRadius: 8,
    },

    page: {
        flex: 1,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    title: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Righteous",
    },
});