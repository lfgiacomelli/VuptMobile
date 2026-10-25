import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  StatusBar,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import useRighteousFont from "../../hooks/useFont";
import { api } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { useTravel } from "../../contexts/TravelContext";
import { ActiveTravelCard } from "../../components/ActiveTravelCard";
import { HomeHeader } from "../../components/HomeHeader";

import { styles } from "./styles";

type RootStackParamList = {
  Company: {
    emp_codigo: number;
  };
};

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  "Company"
>;

type Empresa = {
  emp_codigo: number;
  emp_nome: string;
  mail: string;
  emp_cnpj: string;
  emp_telefone: string;
  emp_status: string;
  emp_cidade: string;
  emp_logradouro: string;
  emp_bairro: string;
  emp_numero: string;
  emp_cep: string;
  emp_created_at: string;
  emp_updated_at: string;
  emp_logotipo?: string | null;
};

const GRID_GAP = 12;

function normalizeCity(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (!parts.length) return "E";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatStatus(status?: string) {
  if (!status) return "Indisponível";
  const value = status.trim().toLowerCase();

  if (value === "ativa" || value === "ativo") return "Ativo";
  if (value === "inativa" || value === "inativo") return "Inativo";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function isCompanyActive(status?: string) {
  if (!status) return false;
  const value = status.trim().toLowerCase();
  return value === "ativa" || value === "ativo";
}


export function App() {
  const navigation = useNavigation<NavigationProps>();
  const { activeTravel, refreshTravel } = useTravel();
  const { showToast } = useToast();
  const fontLoaded = useRighteousFont();

  const [cidade, setCidade] = useState("");
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [popularCompanies, setPopularCompanies] = useState<Empresa[]>([]);

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const cidadeLabel = useMemo(() => {
    if (!cidade) return "";
    return cidade.charAt(0).toUpperCase() + cidade.slice(1);
  }, [cidade]);

  const handleOpenCompany = useCallback(
    (emp_codigo: number) => {
      navigation.navigate("Company", { emp_codigo });
    },
    [navigation]
  );

  const buscarEmpresas = useCallback(async () => {
    if (!cidade) return;

    try {
      setLoadingCompanies(true);
      setError(null);

      const response = await api.get<{ success: boolean; data: Empresa[] }>(
        `/companies/${encodeURIComponent(cidade)}`
      );

      setEmpresas(response?.data?.data || []);
    } catch (err) {
      console.error(err);
      setEmpresas([]);
      setError("Não foi possível carregar as empresas da sua cidade.");
    } finally {
      setLoadingCompanies(false);
    }
  }, [cidade]);

  const buscarPopulares = useCallback(async () => {
    if (!cidade) return;

    try {
      setLoadingPopular(true);

      const response = await api.get<{ success: boolean; data: Empresa[] }>(
        `/companies/popular/${encodeURIComponent(cidade)}`
      );

      setPopularCompanies(response?.data?.data || []);
    } catch (err) {
      setPopularCompanies([]);
    } finally {
      setLoadingPopular(false);
    }
  }, [cidade]);

  const carregarLocalizacao = useCallback(async () => {
    try {
      setLoadingLocation(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permissão de localização negada.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const endereco = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const cidadeAtual =
        endereco[0]?.city || endereco[0]?.subregion || endereco[0]?.region || "";

      if (!cidadeAtual) {
        setError("Não foi possível identificar sua cidade.");
        return;
      }

      setCidade(normalizeCity(cidadeAtual));
    } catch (err) {
      console.error(err);
      setError("Erro ao obter sua localização.");
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    if (!cidade) return;

    try {
      setRefreshing(true);
      await Promise.all([buscarEmpresas(), buscarPopulares(), refreshTravel()]);
    } catch (err) {
      console.error(err);
      showToast({
        title: "Erro ao atualizar",
        subtitle: "Ocorreu um erro ao atualizar os dados. Tente novamente.",
        status: "error",
      });
    } finally {
      setRefreshing(false);
    }
  }, [buscarEmpresas, buscarPopulares, refreshTravel, cidade, showToast]);

  useEffect(() => {
    carregarLocalizacao();
  }, [carregarLocalizacao]);

  useEffect(() => {
    if (!cidade) return;
    buscarEmpresas();
    buscarPopulares();
  }, [cidade, buscarEmpresas, buscarPopulares]);

  useFocusEffect(
    useCallback(() => {
      refreshTravel();
    }, [refreshTravel])
  );

  const renderPopularItem = useCallback(
    ({ item }: { item: Empresa }) => {
      const active = isCompanyActive(item.emp_status);

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.popularCard}
          onPress={() => handleOpenCompany(item.emp_codigo)}
        >
          <View style={styles.popularLogoWrapper}>
            {item.emp_logotipo ? (
              <Image
                source={{ uri: item.emp_logotipo }}
                style={styles.popularLogo}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.popularFallback}>
                <Text style={styles.popularFallbackText}>
                  {getInitials(item.emp_nome)}
                </Text>
              </View>
            )}
            <View style={[
              styles.popularStatusDot,
              active ? styles.statusDotActive : styles.statusDotInactive
            ]} />
          </View>

          <Text style={styles.popularName} numberOfLines={1}>
            {item.emp_nome}
          </Text>

          <Text style={styles.popularMeta} numberOfLines={1}>
            {item.emp_bairro}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleOpenCompany]
  );

  const renderCompanyItem = useCallback(
    ({ item, index }: { item: Empresa; index: number }) => {
      const isLastItem = index === empresas.length - 1;
      const isOdd = empresas.length % 2 !== 0;
      const isFullWidth = isLastItem && isOdd;
      const isLeftColumn = index % 2 === 0;
      const active = isCompanyActive(item.emp_status);

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.companyCard,
            isFullWidth && styles.companyCardFullWidth,
            !isFullWidth && {
              marginRight: isLeftColumn ? GRID_GAP / 2 : 0,
              marginLeft: isLeftColumn ? 0 : GRID_GAP / 2,
            },
          ]}
          onPress={() => handleOpenCompany(item.emp_codigo)}
        >
          <View style={styles.companyImageArea}>
            {item.emp_logotipo ? (
              <Image
                source={{ uri: item.emp_logotipo }}
                style={styles.companyImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.companyImageFallback}>
                <Text style={styles.companyImageFallbackText}>
                  {getInitials(item.emp_nome)}
                </Text>
              </View>
            )}

            <View style={[
              styles.imageStatusBadge,
              active ? styles.imageStatusBadgeActive : styles.imageStatusBadgeInactive
            ]}>
              <View style={[
                styles.statusDotSmall,
                active ? styles.statusDotActive : styles.statusDotInactive
              ]} />
              <Text style={styles.imageStatusText}>
                {formatStatus(item.emp_status)}
              </Text>
            </View>
          </View>

          <View style={styles.companyContent}>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.emp_nome}
            </Text>

            <View style={styles.companyLocation}>
              <Ionicons name="location-outline" size={11} color="#8A9099" />
              <Text style={styles.companyLocationText} numberOfLines={1}>
                {item.emp_bairro}
              </Text>
            </View>

            <View style={styles.companyInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={10} color="#8A9099" />
                <Text style={styles.infoItemText} numberOfLines={1}>
                  {item.emp_telefone}
                </Text>
              </View>

              <View style={styles.infoDivider} />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [empresas.length, handleOpenCompany]
  );

  const ListHeader = useMemo(() => {
    return (
      <View>
        {activeTravel ? (
          <View style={styles.activeTravelWrapper}>
            <ActiveTravelCard />
          </View>
        ) : null}

        <View style={styles.section}>
          {loadingPopular ? (
            <View style={styles.popularLoadingContainer}>
              <ActivityIndicator size="small" color="#111" />
            </View>
          ) : popularCompanies.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionEyebrow}>Em destaque</Text>
                  <Text style={styles.sectionTitle}>Empresas populares hoje</Text>
                </View>
              </View>

              <FlatList
                data={popularCompanies}
                horizontal
                keyExtractor={(item) => String(item.emp_codigo)}
                renderItem={renderPopularItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularListContent}
              />
            </>
          ) : null}
        </View>
        <TouchableOpacity activeOpacity={0.9} style={styles.discoveryBanner}>
          <View style={styles.discoveryContent}>
            {/* <Text style={styles.discoveryEyebrow}>Mobilidade em {"sua cidade"}</Text> */}
            <Text style={styles.discoveryEyebrow}>Mobilidade em {cidadeLabel || "Sua cidade"}</Text>

            <Text style={styles.discoveryTitle}>
              Solicite sua corrida com praticidade
            </Text>

            <Text style={styles.discoveryDescription}>
              Escolha entre empresas disponíveis na sua cidade e acompanhe tudo com mais clareza.
            </Text>
          </View>

          <View style={styles.discoveryImageWrapper}>
            <Image
              source={require("../../assets/images/motorcycleIcon.png")}
              style={styles.discoveryImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Disponíveis em</Text>
              <Text style={styles.sectionTitle}>
                {cidadeLabel || "Sua cidade"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }, [
    activeTravel,
    cidadeLabel,
    loadingPopular,
    popularCompanies.length,
    empresas.length,
    renderPopularItem,
  ]);

  if (loadingLocation || !fontLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingTitle}>Pegando sua localização...</Text>
          <Text style={styles.loadingDescription}>
            Estamos preparando as empresas disponíveis para você.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Não foi possível continuar</Text>
          <Text style={styles.errorDescription}>{error}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.errorButton}
            onPress={carregarLocalizacao}
          >
            <Text style={styles.errorButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader />

      {loadingCompanies && empresas.length === 0 ? (
        <View style={styles.initialLoaderContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.initialLoaderText}>
            Carregando empresas disponíveis...
          </Text>
        </View>
      ) : (
        <FlatList
          data={empresas}
          keyExtractor={(item) => String(item.emp_codigo)}
          renderItem={renderCompanyItem}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.mainListContent}
          columnWrapperStyle={empresas.length > 1 ? styles.columnWrapper : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefreshAll} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma empresa encontrada</Text>
              <Text style={styles.emptyDescription}>
                Ainda não há empresas cadastradas para a cidade detectada.
              </Text>
            </View>
          }
        />
      )}
      <StatusBar
        barStyle="light-content"
      />
    </View>
  );
}
