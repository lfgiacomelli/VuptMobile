import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type RowProfileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export function RowProfile({
  icon,
  title,
  onPress,
  color = "#222",
  subtitle,
  rightElement,
}: RowProfileProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color={color} />

        <View style={styles.textContainer}>
          <Text style={[styles.text, { color }]}>{title}</Text>

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {rightElement}

        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  textContainer: {
    marginLeft: 12,
    flex: 1,
  },

  text: {
    fontSize: 15,
    fontFamily: "Righteous",
  },

  subtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontFamily: "Righteous",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});