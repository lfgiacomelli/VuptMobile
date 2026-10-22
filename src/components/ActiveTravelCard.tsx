import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTravel } from "../contexts/TravelContext";
import useRighteousFont from "../hooks/useFont";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

import pendingTravel from "../assets/animations/pendingTravel.json";

export function ActiveTravelCard() {
  const { activeTravel } = useTravel();
      const lottieRef = useRef<LottieView>(null);
  
  const navigation = useNavigation<any>();
  const fontLoaded = useRighteousFont();

  const [expanded, setExpanded] = useState(false);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const expandAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnimation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnimation, {
          toValue: 0,
          duration: 1500,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (!activeTravel || !fontLoaded) return null;

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;

    Animated.timing(expandAnimation, {
      toValue,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    setExpanded(!expanded);
  };

  const translateX = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  const opacity = progressAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const animatedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });

  const animatedOpacity = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const rotateArrow = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleSeeDetails = () => {
    navigation.navigate("TravelDetails", {
      via_codigo: activeTravel.via_codigo,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressIndicator,
              { transform: [{ translateX }], opacity },
            ]}
          >
            <LinearGradient
              colors={["#00FF88", "#00CC70", "#00FF88"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleIconContainer}>
            <LottieView
              ref={lottieRef}
              source={pendingTravel}
              autoPlay
              loop
              style={{ width:50, height: 50 }}
            />
          </View>
          <Text style={[styles.title, { fontFamily: "Righteous" }]}>
            Viagem em Andamento
          </Text>
        </View>

        <View style={styles.rightHeader}>
          <Animated.Text
            style={[styles.arrow, { transform: [{ rotate: rotateArrow }] }]}
          >
            <Ionicons name="chevron-down" size={32} color="#666" />
          </Animated.Text>
        </View>
      </TouchableOpacity>

      <Animated.View
        style={{
          height: animatedHeight,
          opacity: animatedOpacity,
          overflow: "hidden",
        }}
      >
        <View style={styles.locationSection}>
          <Text style={styles.locationLabel}>ORIGEM</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {activeTravel.sol_origem}
          </Text>

          <View style={{ height: 10 }} />

          <Text style={styles.locationLabel}>DESTINO</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {activeTravel.sol_destino}
          </Text>
        </View>

        <View style={styles.driverSection}>
          <Text style={styles.driverLabel}>MOTOTAXISTA</Text>
          <Text style={styles.driverName}>
            {activeTravel.mot_nome}
          </Text>

          <Text style={styles.motoLabel}>MOTO</Text>
          <Text style={styles.motoModel}>
            {activeTravel.moto_modelo}
          </Text>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>VALOR TOTAL</Text>
            <Text style={styles.priceValue}>
              R$ {Number(activeTravel.via_valor_final).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleSeeDetails}
          >
            <LinearGradient
              colors={["#00FF88", "#00CC70"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.detailsButtonText}>
                Ver detalhes
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },

  progressContainer: {
    height: 4,
    backgroundColor: "#E0E0E0",
  },

  progressTrack: {
    flex: 1,
    overflow: "hidden",
  },

  progressIndicator: {
    width: "60%",
    height: "100%",
    position: "absolute",
  },

  progressGradient: {
    width: "100%",
    height: "100%",
  },

  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  titleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    color: "#1A1A1A",
  },

  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  arrow: {
    fontSize: 14,
    color: "#666",
    marginRight: 3
  },

  locationSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  locationLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Righteous",
  },

  locationText: {
    fontSize: 15,
    color: "#1A1A1A",
    fontFamily: "Righteous",
    marginTop: 4,
  },

  driverSection: {
    paddingHorizontal: 20,
    paddingTop: 16,

  },

  driverLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Righteous",
  },

  driverName: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 10,
    fontFamily: "Righteous",
  },

  motoLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Righteous",
  },

  motoModel: {
    fontSize: 14,
    color: "#444",
    fontFamily: "Righteous",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },

  priceLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Righteous",
  },

  priceValue: {
    fontSize: 22,
    color: "#00CC70",
    fontFamily: "Righteous",
  },

  detailsButton: {
    borderRadius: 16,
    overflow: "hidden",
  },

  gradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  detailsButtonText: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#1A1A1A",
  },
});