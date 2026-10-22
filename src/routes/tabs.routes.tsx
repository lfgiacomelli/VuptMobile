import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  LayoutChangeEvent,
  Platform,
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  Home,
  HomeOutline,
  Receipt,
  ReceiptOutline,
  User,
  UserOutline,
  Gear,
  GearOutline,
  SearchIcon,
  SearchOutline
} from "../components/TabIcons";

import { App } from "../screens/Home";
import { Company } from "../screens/Company";
import { Travels } from "../screens/Travels";
import { TravelDetails } from "../screens/TravelDetails";
import { Profile } from "../screens/Profile";
import { UpdateProfile } from "../screens/UpdateProfile";
import { Settings as SettingsScreen } from "../screens/Settings";
import { Search } from "../screens/Search";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ACTIVE_INDICATOR_WIDTH = 30;

const ICON_SIZE = 28;

const OPTICAL_OFFSETS: Record<string, number> = {
  HomeTab: 8,
  TravelsTab: 8,
  SearchTab: 8,
  ProfileTab: 8,
  SettingsTab: 8,
};

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8F9FC" },
      }}
    >
      <Stack.Screen name="Home" component={App} />
      <Stack.Screen
        name="Company"
        component={Company}
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}

function TravelsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8F9FC" },
      }}
    >
      <Stack.Screen name="Travels" component={Travels} />
      <Stack.Screen
        name="TravelDetails"
        component={TravelDetails}
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8F9FC" },
      }}
    >
      <Stack.Screen name="ProfileHome" component={Profile} />
      <Stack.Screen
        name="UpdateProfile"
        component={UpdateProfile}
        options={{
          animation: "slide_from_right",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F8F9FC" },
      }}
    >
      <Stack.Screen name="SearchTab" component={Search} />
    </Stack.Navigator>
  )
}

type CustomTabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

type TabLayout = {
  x: number;
  width: number;
};

function AnimatedTabItem({
  route,
  isFocused,
  label,
  onPress,
  renderIcon,
  onLayout,
}: {
  route: any;
  isFocused: boolean;
  label: string | null;
  onPress: () => void;
  renderIcon: (focused: boolean, color: string, size: number) => React.ReactNode;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const iconScale = useSharedValue(isFocused ? 1 : 0.96);
  const contentOpacity = useSharedValue(isFocused ? 1 : 0.72);

  useEffect(() => {
    iconScale.value = withSpring(isFocused ? 1 : 0.96, {
      damping: 18,
      stiffness: 240,
      mass: 0.8,
    });

    contentOpacity.value = withTiming(isFocused ? 1 : 0.72, {
      duration: 180,
    });
  }, [isFocused, iconScale, contentOpacity]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Pressable
      key={route.key}
      onPress={onPress}
      onLayout={onLayout}
      style={styles.tabItemPressable}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
    >
      <Animated.View
        style={[
          styles.tabItemInner,
          isFocused && styles.tabItemInnerFocused,
          animatedContentStyle,
        ]}
      >
        <View style={styles.iconContainer}>
          {renderIcon(isFocused, isFocused ? "#111111" : "#8E8E93", ICON_SIZE)}
        </View>

        {!!label && (
          <Text
            style={[
              styles.tabLabel,
              { color: isFocused ? "#111111" : "#8E8E93" },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const indicatorTranslateX = useSharedValue(0);
  const [tabLayouts, setTabLayouts] = useState<Record<string, TabLayout>>({});

  const tabBarHeight = Platform.OS === "ios" ? 72 : 68;

  const safeBottomInset = Platform.OS === "ios" ? Math.min(insets.bottom, 10) : 0;

  useEffect(() => {
    const currentRoute = state.routes[state.index];
    const currentLayout = tabLayouts[currentRoute.key];

    if (!currentLayout) return;

    const opticalOffset = OPTICAL_OFFSETS[currentRoute.name] ?? 0;

    const centeredX =
      currentLayout.x +
      currentLayout.width / 2 -
      ACTIVE_INDICATOR_WIDTH / 2 +
      opticalOffset;

    indicatorTranslateX.value = withSpring(centeredX, {
      damping: 20,
      stiffness: 220,
      mass: 0.9,
    });
  }, [state.index, state.routes, tabLayouts, indicatorTranslateX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorTranslateX.value }],
  }));

  const handleTabLayout =
    (routeKey: string) =>
      (event: LayoutChangeEvent): void => {
        const { x, width } = event.nativeEvent.layout;

        setTabLayouts((prev) => {
          const current = prev[routeKey];

          if (current && current.x === x && current.width === width) {
            return prev;
          }

          return {
            ...prev,
            [routeKey]: { x, width },
          };
        });
      };

  return (
    <View
      style={[
        styles.tabBarWrapper,
        {
          height: tabBarHeight + safeBottomInset,
          paddingBottom: 8 + safeBottomInset,
        },
      ]}
    >
      <BlurView intensity={60} tint="light" style={styles.blurLayer} />

      <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

      <View style={styles.tabsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title || null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const renderIcon = (
            focused: boolean,
            color: string,
            size: number
          ) =>
            options.tabBarIcon?.({
              focused,
              color,
              size,
            });

          return (
            <AnimatedTabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              label={label}
              onPress={onPress}
              onLayout={handleTabLayout(route.key)}
              renderIcon={renderIcon}
            />
          );
        })}
      </View>
    </View>
  );
}

export function TabsRoutes() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: "Início",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Home color={color} size={size} />
            ) : (
              <HomeOutline color={color} size={size} />
            ),
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{
          tabBarLabel: "Buscar",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <SearchIcon color={color} size={size} />
            ) : (
              <SearchOutline color={color} size={size} />
            ),
        }}
      />

      <Tab.Screen
        name="TravelsTab"
        component={TravelsStack}
        options={{
          tabBarLabel: "Viagens",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Receipt color={color} size={size} />
            ) : (
              <ReceiptOutline color={color} size={size} />
            ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: "Perfil",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <User color={color} size={size} />
            ) : (
              <UserOutline color={color} size={size} />
            ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Ajustes",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Gear color={color} size={size} />
            ) : (
              <GearOutline color={color} size={size} />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: Platform.OS === "ios" ? 16 : 14,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 0.8,
    borderColor: "rgba(17,17,17,0.05)",
    paddingHorizontal: 8,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
      },
      android: {
        elevation: 18,
      },
    }),
  },

  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },

  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },

  activeIndicator: {
    position: "absolute",
    top: 0,
    width: ACTIVE_INDICATOR_WIDTH,
    height: 3,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: "#111111",
    zIndex: 10,
  },

  tabItemPressable: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  tabItemInner: {
    width: "100%",
    minHeight: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    paddingBottom: 2,
  },

  tabItemInnerFocused: {
    backgroundColor: "rgba(17,17,17,0.035)",
  },

  iconContainer: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});