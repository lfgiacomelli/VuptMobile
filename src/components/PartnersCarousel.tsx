import React, {
    useEffect,
    useMemo,
    useRef,
} from "react";

import {
    Animated,
    Dimensions,
    Easing,
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

/*
    Logos maiores
*/
const LOGO_SIZE = 92;

/*
    Espaçamento entre logos
*/
const GAP = 22;

const ITEM_SIZE = LOGO_SIZE + GAP;

/*
    Quanto MAIOR o valor,
    mais lento fica o scroll
*/
const ANIMATION_DURATION = 10000;

interface PartnerItem {
    id: number;
    logo: string;
}


const mockPartners: PartnerItem[] = [
    {
        id: 1,
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPi6qR1UqfSzpW4bDL8-O--GCQGVDFWYplQQ&s",
        //PITSTOP
    },
    {
        id: 2,
        logo: "https://scontent.fppb9-1.fna.fbcdn.net/v/t39.30808-6/487978249_1179163010886893_4935235991571800396_n.jpg?stp=cp6_dst-jpg_s960x960_tt6&_nc_cat=105&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=hkKz50xlnMUQ7kNvwE0e8Bj&_nc_oc=Adq08Iqz8iIA_REMcKJRFNVly-5H7zLtcKc2XpGwtd5wY5YljWnhbicN_kie-m6foD8&_nc_zt=23&_nc_ht=scontent.fppb9-1.fna&_nc_gid=btYhykiwJz2-8aEExTwlVQ&_nc_ss=7b2a8&oh=00_Af50vsAMens9OihJGqO9rhj4gnzL4QyW7T4uF1zO60mTUg&oe=6A09B636",
        //COYOTE MOTOS
    
    },
    {
        id: 3,
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7CpZA7dQyqJTfbBunRqDGWhGKrLFc4rB5uA&s",
        //GEMINHO
    },
    {
        id: 4,
        logo: "https://instagram.fppb9-1.fna.fbcdn.net/v/t51.82787-19/572578021_17847880434591657_2429338537610693506_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fppb9-1.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2gFR3OV2z0mpxOgL6ccm8VdTDAF5BFtCfB9v4n2bc3WE1YiuWhUN6H48_7ZkAv1_Zsk&_nc_ohc=vkNB_2h3zHgQ7kNvwEck47R&_nc_gid=ve4z7PBXPRn95oYPRb519A&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af4H8vruqnsyfKGAdWXpjEc9fz-CQNYaZjjWsaEG-GitKg&oe=6A099CC7&_nc_sid=7a9f4b",
        //SABOR & ART
    },
    {
        id: 5,
        logo: "https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwM2NmOGE0MmY0ODE5MWI2NDVkYzJkMDIyMmM5OTk6ZmlsZV8wMDAwMDAwMDI1NWM3MjBlOGVlNzcwZWEwNDgyYjA1ZiIsInRzIjoiMjA1ODYiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImRmOTQwNDBhNDExMTg5NjZlNDMwYTM2ZjBiMzQwZTRkN2NlYTUwNjdmMjllOGI1ODRhYjE3YzIwYjFlMDVlNTAiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0="
        //PPB SEGUROS
    }
];

export function PartnersCarousel() {
    const scrollX = useRef(
        new Animated.Value(0)
    ).current;

    const partners = useMemo(() => {
        return [...mockPartners, ...mockPartners];
    }, []);

    useEffect(() => {
        const totalWidth =
            ITEM_SIZE * mockPartners.length;

        let isMounted = true;

        const animate = () => {
            scrollX.setValue(0);

            Animated.timing(scrollX, {
                toValue: -totalWidth,
                duration: ANIMATION_DURATION,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => {
                if (isMounted) {
                    animate();
                }
            });
        };

        animate();

        return () => {
            isMounted = false;
        };
    }, [scrollX]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Parceiros do aplicativo
            </Text>

            <View style={styles.carouselWrapper}>
                <Animated.View
                    style={[
                        styles.track,
                        {
                            width:
                                partners.length *
                                ITEM_SIZE,

                            transform: [
                                {
                                    translateX:
                                        scrollX,
                                },
                            ],
                        },
                    ]}
                >
                    {partners.map(
                        (
                            partner,
                            index
                        ) => (
                            <View
                                key={`${partner.id}-${index}`}
                                style={
                                    styles.logoContainer
                                }
                            >
                                <Image
                                    source={{
                                        uri: partner.logo,
                                    }}
                                    style={
                                        styles.logo
                                    }
                                    resizeMode="cover"
                                />

                            </View>
                        )
                    )}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginTop: 28,
    },

    title: {
        color: "#FFFFFF",
        fontFamily: "Righteous",
        fontSize: 22,
        lineHeight: 32,
        letterSpacing: 0.5,
        marginBottom: 22,
        paddingHorizontal: 20,
    },

    carouselWrapper: {
        width,
        overflow: "hidden",
    },

    track: {
        flexDirection: "row",
        alignItems: "center",
    },

    logoContainer: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,

        borderRadius:
            LOGO_SIZE / 2,

        marginRight: GAP,

        backgroundColor: "#FFFFFF",

        justifyContent: "center",
        alignItems: "center",

        overflow: "hidden",

        elevation: 6,

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 4,
        },

        shadowOpacity: 0.15,
        shadowRadius: 6,
    },

    logo: {
        width: "100%",
        height: "100%",
    },
});