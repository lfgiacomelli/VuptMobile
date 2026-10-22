import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import { Modalize } from "react-native-modalize";

import { api } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import useRighteousFont from "../../../hooks/useFont";
import { useToast } from "../../../contexts/ToastContext";

import supportAnimation from "../../../assets/animations/supportAnimation.json";
import emptyAnimation from "../../../assets/animations/emptyAnimation.json";

type TravelItem = {
  via_codigo: number;
  via_status: string;
  via_data_inicio: string;
  via_valor_final?: number | string | null;

  sol_codigo: number;
  sol_origem: string;
  sol_destino: string;
  sol_forma_pagamento?: string;
  sol_status?: string;

  emp_codigo: number;
  emp_nome?: string;
  emp_logotipo?: string | null;

  mot_nome?: string | null;
  moto_modelo?: string | null;
  moto_marca?: string | null;
  moto_placa?: string | null;
};

const SUPPORT_REASONS = [
  "Problema com corrida",
  "Problema com pagamento",
  "Dúvida sobre atendimento",
  "Problema com mototaxista",
  "Objeto perdido",
  "Outro assunto",
];


type AddSupportRouteParams = {
  via_codigo?: number;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function AddSupport() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { via_codigo } = (route.params || {}) as AddSupportRouteParams;
  const hasFixedTravel = !!via_codigo;
  const { user } = useAuth();
  const fontLoaded = useRighteousFont();
  const { showToast } = useToast();

  const modalizeRef = useRef<Modalize>(null);

  const [travels, setTravels] = useState<TravelItem[]>([]);
  const [selectedTravel, setSelectedTravel] = useState<TravelItem | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");

  const [loadingTravels, setLoadingTravels] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const descriptionLength = description.trim().length;

  const isFormValid = useMemo(() => {
    return (
      !!selectedTravel &&
      !!selectedReason &&
      !!description.trim() &&
      !!user?.usu_codigo
    );
  }, [selectedTravel, selectedReason, description, user?.usu_codigo]);

  const formatCurrency = useCallback((value?: number | string | null) => {
    if (value === null || value === undefined || value === "") {
      return "Valor não informado";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return "Valor não informado";
    }

    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  const formatDate = useCallback((date?: string) => {
    if (!date) return "Data não informada";

    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const getStatusInfo = useCallback((status?: string) => {
    switch (status?.toUpperCase()) {
      case "EM_ANDAMENTO":
        return {
          label: "Em andamento",
          color: "#D97706",
          backgroundColor: "#FFF7ED",
          borderColor: "#FCD34D",
        };
      case "FINALIZADA":
      case "CONCLUIDA":
        return {
          label: "Finalizada",
          color: "#15803D",
          backgroundColor: "#F0FDF4",
          borderColor: "#86EFAC",
        };
      case "CANCELADA":
        return {
          label: "Cancelada",
          color: "#DC2626",
          backgroundColor: "#FEF2F2",
          borderColor: "#FCA5A5",
        };
      default:
        return {
          label: "Não informado",
          color: "#475569",
          backgroundColor: "#F8FAFC",
          borderColor: "#CBD5E1",
        };
    }
  }, []);

  const fetchTravels = useCallback(async () => {
    if (!user?.usu_codigo) {
      setTravels([]);
      setLoadingTravels(false);
      return;
    }

    try {
      setLoadingTravels(true);

      const response = await api.get(`supports/travels/${user.usu_codigo}`);
      const data: TravelItem[] = response?.data?.data || [];

      setTravels(data);
    } catch (error) {
      setTravels([]);
      showToast({
        title: "Erro ao carregar viagens.",
        status: "error",
      });
    } finally {
      setLoadingTravels(false);
    }
  }, [user?.usu_codigo, showToast]);
  useEffect(() => {
    if (!via_codigo || travels.length === 0) return;

    const matchedTravel = travels.find(
      (travel) => Number(travel.via_codigo) === Number(via_codigo)
    );

    if (matchedTravel) {
      setSelectedTravel(matchedTravel);
    } else {
      showToast({
        title: "A viagem informada não está disponível para suporte.",
        status: "info",
      });
    }
  }, [via_codigo, travels, showToast]);

  useEffect(() => {
    fetchTravels();
  }, [fetchTravels]);

  const openTravelSelector = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    modalizeRef.current?.open();
  }, []);

  const closeTravelSelector = useCallback(async () => {
    await Haptics.selectionAsync();
    modalizeRef.current?.close();
  }, []);

  const handleSelectTravel = useCallback(async (travel: TravelItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTravel(travel);
    modalizeRef.current?.close();
  }, []);

  const handleSelectReason = useCallback(async (reason: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reason);
  }, []);

  const handleCreateSupport = useCallback(async () => {
    if (!user?.usu_codigo) {
      showToast({
        title: "Usuário não identificado.",
        status: "error",
      });
      return;
    }

    if (!selectedTravel) {
      showToast({
        title: "Selecione a viagem do chamado.",
        status: "info",
      });
      return;
    }

    if (!selectedReason) {
      showToast({
        title: "Selecione o motivo do chamado.",
        status: "info",
      });
      return;
    }

    if (!description.trim()) {
      showToast({
        title: "Descreva o que aconteceu.",
        status: "info",
      });
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/supports", {
        emp_codigo: selectedTravel.emp_codigo,
        usu_codigo: user.usu_codigo,
        via_codigo: selectedTravel.via_codigo,
        sup_motivo: selectedReason,
        sup_descricao: description.trim(),
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      showToast({
        title: "Chamado criado com sucesso.",
        status: "success",
      });

      navigation.goBack();
    } catch (error: any) {
      console.log("Erro ao criar chamado:", error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Não foi possível criar o chamado.";

      showToast({
        title: message,
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    user?.usu_codigo,
    selectedTravel,
    selectedReason,
    description,
    showToast,
    navigation,
  ]);

  const renderTravelCard = useCallback(
    (
      travel: TravelItem,
      isSelected: boolean,
      onPress: () => void,
      compact = false
    ) => {
      const statusInfo = getStatusInfo(travel.via_status);

      return (
        <TouchableOpacity
          key={travel.via_codigo}
          activeOpacity={0.9}
          style={[
            styles.travelCard,
            compact && styles.travelCardCompact,
            isSelected && styles.travelCardSelected,
          ]}
          onPress={onPress}
        >
          <View style={styles.travelCardTop}>
            <View style={styles.travelHeaderLeft}>
              <View style={[styles.travelIconBox, isSelected && styles.travelIconBoxSelected]}>
                <Ionicons
                  name="car-sport-outline"
                  size={18}
                  color={isSelected ? "#FFFFFF" : "#0F172A"}
                />
              </View>

              <View style={styles.travelMainInfo}>
                <Text style={styles.travelCompany} numberOfLines={1}>
                  {travel.emp_nome || "Empresa não identificada"}
                </Text>

                <Text style={styles.travelCode} numberOfLines={1}>
                  Viagem #{travel.via_codigo}
                </Text>
              </View>
            </View>

            <View style={styles.travelHeaderRight}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusInfo.backgroundColor,
                    borderColor: statusInfo.borderColor,
                  },
                ]}
              >
                <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  isSelected && styles.radioOuterSelected,
                ]}
              >
                {isSelected ? <View style={styles.radioInner} /> : null}
              </View>
            </View>
          </View>

          <View style={styles.routeBlock}>
            <View style={styles.routeRow}>
              <View style={[styles.routePoint, styles.routePointOrigin]} />
              <Text style={styles.routeLabel}>Origem</Text>
            </View>

            <Text style={styles.routeText} numberOfLines={1}>
              {travel.sol_origem || "Origem não informada"}
            </Text>

            <View style={styles.routeConnector} />

            <View style={styles.routeRow}>
              <View style={[styles.routePoint, styles.routePointDestination]} />
              <Text style={styles.routeLabel}>Destino</Text>
            </View>

            <Text style={styles.routeText} numberOfLines={1}>
              {travel.sol_destino || "Destino não informado"}
            </Text>
          </View>

          <View style={styles.travelFooter}>
            <View style={styles.travelMetaBlock}>
              <Ionicons name="calendar-outline" size={13} color="#64748B" />
              <Text style={styles.travelFooterText}>
                {formatDate(travel.via_data_inicio)}
              </Text>
            </View>

            <View style={styles.travelMetaBlock}>
              <Ionicons name="wallet-outline" size={13} color="#64748B" />
              <Text style={styles.travelFooterText}>
                {formatCurrency(travel.via_valor_final)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [formatCurrency, formatDate, getStatusInfo]
  );

  if (!fontLoaded) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Novo chamado</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroAnimationWrapper}>
              <LottieView
                source={supportAnimation}
                autoPlay
                loop
                style={styles.heroAnimation}
              />
            </View>

            <Text style={styles.title}>Abrir solicitação de suporte</Text>

            <Text style={styles.subtitle}>
              Selecione a viagem relacionada ao ocorrido, escolha o motivo e
              descreva o que aconteceu com clareza para agilizar o atendimento.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Selecione a viagem</Text>
                <Text style={styles.sectionSubtitle}>
                  Escolha a viagem vinculada ao chamado de suporte.
                </Text>
              </View>
            </View>

            {loadingTravels ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator size="small" color="#0F172A" />
                <Text style={styles.inlineLoadingText}>Carregando viagens...</Text>
              </View>
            ) : travels.length === 0 ? (
              <View style={styles.emptyState}>
                <LottieView
                  source={emptyAnimation}
                  autoPlay
                  loop
                  style={styles.emptyAnimation}
                />
                <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
                <Text style={styles.emptySubtitle}>
                  Você precisa ter uma viagem registrada para abrir um chamado
                  de suporte vinculado a ela.
                </Text>
              </View>
            ) : (
              <>
                {!hasFixedTravel && (

                  <TouchableOpacity
                    activeOpacity={0.9}
                    style={styles.selectorButton}
                    onPress={openTravelSelector}
                  >
                    <View style={styles.selectorButtonLeft}>
                      <View style={styles.selectorButtonIcon}>
                        <Ionicons
                          name="briefcase-outline"
                          size={18}
                          color="#0F172A"
                        />
                      </View>

                      <View style={styles.selectorButtonTextWrapper}>
                        <Text style={styles.selectorButtonTitle}>
                          {selectedTravel
                            ? "Viagem selecionada para atendimento"
                            : "Selecionar viagem para reportar problema"}
                        </Text>

                        <Text
                          style={styles.selectorButtonSubtitle}
                          numberOfLines={1}
                        >
                          {selectedTravel
                            ? `#${selectedTravel.via_codigo} • ${selectedTravel.emp_nome || "Empresa não identificada"
                            }`
                            : "Toque para visualizar e escolher uma viagem"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.selectorButtonAction}>
                      <Text style={styles.selectorActionText}>
                        {selectedTravel ? "Alterar" : "Escolher"}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#64748B"
                      />
                    </View>
                  </TouchableOpacity>
                )}

                {selectedTravel ? (
                  <View style={styles.selectedTravelWrapper}>
                    <Text style={styles.selectedTravelLabel}>
                      {hasFixedTravel ? "Viagem vinculada automaticamente" : "Viagem escolhida"}
                    </Text>

                    {renderTravelCard(
                      selectedTravel,
                      true,
                      hasFixedTravel ? () => { } : openTravelSelector
                    )}
                  </View>
                ) : null}
              </>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Motivo do chamado</Text>
                <Text style={styles.sectionSubtitle}>
                  Selecione a opção que melhor representa sua solicitação.
                </Text>
              </View>
            </View>

            <View style={styles.reasonList}>
              {SUPPORT_REASONS.map((reason) => {
                const selected = selectedReason === reason;

                return (
                  <TouchableOpacity
                    key={reason}
                    activeOpacity={0.9}
                    style={[
                      styles.reasonCard,
                      selected && styles.reasonCardSelected,
                    ]}
                    onPress={() => handleSelectReason(reason)}
                  >
                    <View style={styles.reasonContent}>
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected ? <View style={styles.radioInner} /> : null}
                      </View>

                      <Text
                        style={[
                          styles.reasonText,
                          selected && styles.reasonTextSelected,
                        ]}
                      >
                        {reason}
                      </Text>
                    </View>

                    <Ionicons
                      name={selected ? "checkmark-circle" : "chevron-forward"}
                      size={18}
                      color={selected ? "#0F172A" : "#94A3B8"}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>3</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Descrição</Text>
                <Text style={styles.sectionSubtitle}>
                  Explique com detalhes o ocorrido para facilitar a análise.
                </Text>
              </View>
            </View>

            <View style={styles.textAreaWrapper}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva aqui o ocorrido..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                maxLength={500}
                style={styles.textArea}
              />
            </View>

            <View style={styles.counterRow}>
              <Text style={styles.counterText}>
                {descriptionLength}/500 caracteres
              </Text>
            </View>
          </View>

          <View style={styles.footerInfo}>
            <View style={styles.footerInfoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#475569"
              />
            </View>
            <Text style={styles.footerInfoText}>
              O chamado será vinculado à viagem selecionada e enviado para a
              equipe responsável pelo atendimento.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.submitButton,
              (!isFormValid || submitting || loadingTravels) &&
              styles.submitButtonDisabled,
            ]}
            onPress={handleCreateSupport}
            disabled={!isFormValid || submitting || loadingTravels}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.submitButtonText}>Confirmar chamado</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight={false}
        modalHeight={Math.min(SCREEN_HEIGHT * 0.82, 720)}
        handlePosition="inside"
        modalTopOffset={Platform.OS === "ios" ? 80 : 56}
        withOverlay
        panGestureEnabled
        closeSnapPointStraightEnabled={false}
        scrollViewProps={{
          showsVerticalScrollIndicator: false,
          contentContainerStyle: styles.modalContent,
          keyboardShouldPersistTaps: "handled",
        }}
        modalStyle={styles.modalStyle}
        handleStyle={styles.modalHandle}
        overlayStyle={styles.modalOverlay}
      >
        <View style={styles.modalHero}>
          <View style={styles.modalHeroContent}>
            <View style={styles.modalHeroIcon}>
              <Ionicons name="layers-outline" size={20} color="#0F172A" />
            </View>

            <View style={styles.modalHeroTexts}>
              <Text style={styles.modalTitle}>Selecionar viagem</Text>
              <Text style={styles.modalSubtitle}>
                Escolha a viagem relacionada ao problema que deseja reportar.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={closeTravelSelector}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={18} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalStatsCard}>
          <View style={styles.modalStatsIcon}>
            <Ionicons name="car-sport-outline" size={18} color="#0F172A" />
          </View>

          <View style={styles.modalStatsTexts}>
            <Text style={styles.modalStatsTitle}>Suas viagens disponíveis</Text>
            <Text style={styles.modalStatsSubtitle}>
              {travels.length} {travels.length === 1 ? "viagem encontrada" : "viagens encontradas"}
            </Text>
          </View>
        </View>

        {loadingTravels ? (
          <View style={styles.modalLoadingState}>
            <ActivityIndicator size="small" color="#0F172A" />
            <Text style={styles.inlineLoadingText}>Carregando viagens...</Text>
          </View>
        ) : travels.length === 0 ? (
          <View style={styles.emptyState}>
            <LottieView
              source={emptyAnimation}
              autoPlay
              loop
              style={styles.emptyAnimation}
            />
            <Text style={styles.emptyTitle}>Nenhuma viagem encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Assim que houver viagens registradas, elas aparecerão aqui.
            </Text>
          </View>
        ) : (
          <View style={styles.modalTravelList}>
            {travels.map((travel) =>
              renderTravelCard(
                travel,
                selectedTravel?.via_codigo === travel.via_codigo,
                () => handleSelectTravel(travel),
                true
              )
            )}
          </View>
        )}
      </Modalize>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 56 : 24,
    paddingBottom: 34,
  },

  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "Righteous",
    color: "#0F172A",
  },

  headerSpacer: {
    width: 44,
    height: 44,
  },

  hero: {
    alignItems: "center",
    marginBottom: 24,
  },

  heroAnimationWrapper: {
    width: 154,
    height: 154,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },

  heroAnimation: {
    width: 138,
    height: 138,
  },

  title: {
    fontSize: 24,
    fontFamily: "Righteous",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "Righteous",
    color: "#64748B",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 3,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  sectionNumber: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },

  sectionNumberText: {
    fontSize: 12,
    fontFamily: "Righteous",
    color: "#FFFFFF",
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  inlineLoading: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  inlineLoadingText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  emptyAnimation: {
    width: 140,
    height: 140,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: "Righteous",
    color: "#64748B",
    textAlign: "center",
  },

  selectorButton: {
    minHeight: 76,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectorButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  selectorButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  selectorButtonTextWrapper: {
    flex: 1,
  },

  selectorButtonTitle: {
    fontSize: 13,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 4,
  },

  selectorButtonSubtitle: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  selectorButtonAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },

  selectorActionText: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  selectedTravelWrapper: {
    marginTop: 14,
  },

  selectedTravelLabel: {
    fontSize: 12,
    fontFamily: "Righteous",
    color: "#64748B",
    marginBottom: 10,
  },

  travelCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FCFCFD",
    padding: 16,
  },

  travelCardCompact: {
    padding: 15,
  },

  travelCardSelected: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },

  travelCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  travelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  travelHeaderRight: {
    alignItems: "flex-end",
    gap: 10,
  },

  travelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  travelIconBoxSelected: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },

  travelMainInfo: {
    flex: 1,
  },

  travelCompany: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 4,
  },

  travelCode: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusBadgeText: {
    fontSize: 10,
    fontFamily: "Righteous",
  },

  routeBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  routePoint: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 8,
  },

  routePointOrigin: {
    backgroundColor: "#0F172A",
  },

  routePointDestination: {
    backgroundColor: "#64748B",
  },

  routeLabel: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  routeText: {
    fontSize: 12,
    fontFamily: "Righteous",
    color: "#334155",
    marginLeft: 17,
  },

  routeConnector: {
    width: 1,
    height: 14,
    backgroundColor: "#CBD5E1",
    marginLeft: 4,
    marginVertical: 7,
  },

  travelFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },

  travelMetaBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  travelFooterText: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  reasonList: {
    gap: 10,
  },

  reasonCard: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  reasonCardSelected: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },

  reasonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },

  radioOuterSelected: {
    borderColor: "#0F172A",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#0F172A",
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Righteous",
    color: "#334155",
  },

  reasonTextSelected: {
    color: "#0F172A",
  },

  textAreaWrapper: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 160,
  },

  textArea: {
    minHeight: 128,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: "Righteous",
    color: "#0F172A",
  },

  counterRow: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  counterText: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#94A3B8",
  },

  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 4,
  },

  footerInfoIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  footerInfoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  submitButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    fontSize: 14,
    fontFamily: "Righteous",
    color: "#FFFFFF",
  },

  modalStyle: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  modalHandle: {
    width: 54,
    height: 5,
    backgroundColor: "#CBD5E1",
    marginTop: 10,
  },

  modalOverlay: {
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },

  modalHero: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },

  modalHeroContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },

  modalHeroIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  modalHeroTexts: {
    flex: 1,
    paddingTop: 2,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  modalStatsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
  },

  modalStatsIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  modalStatsTexts: {
    flex: 1,
  },

  modalStatsTitle: {
    fontSize: 13,
    fontFamily: "Righteous",
    color: "#0F172A",
    marginBottom: 4,
  },

  modalStatsSubtitle: {
    fontSize: 11,
    fontFamily: "Righteous",
    color: "#64748B",
  },

  modalLoadingState: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
  },

  modalTravelList: {
    gap: 12,
  },
});