import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from "react-native";
import {
  RouteProp,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { CompanyDTO } from "../../types/company";
import { AttributesDTO } from "../../types/attributes";
import { api } from "../../services/api";
import useRighteousFont from "../../hooks/useFont";

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Company: {
    emp_codigo: number;
  };
  RequestTravel: {
    emp_codigo: number;
  };
};

type CompanyRouteProp = RouteProp<RootStackParamList, "Company">;
type CompanyNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Company"
>;

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export function Company() {
  const route = useRoute<CompanyRouteProp>();
  const navigation = useNavigation<CompanyNavigationProp>();
  const fontLoaded = useRighteousFont();

  const { emp_codigo } = route.params;

  const [company, setCompany] = useState<CompanyDTO | null>(null);
  const [attributes, setAttributes] = useState<AttributesDTO | null>(null);
  const [loading, setLoading] = useState(true);

  function handleRequest() {
    navigation.navigate("RequestTravel", {
      emp_codigo,
    });
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  }
  useEffect(() => {
    async function loadCompany() {
      try {
        const response = await api.get<ApiResponse<CompanyDTO>>(`/companies/${emp_codigo}`);

        const companyData = response.data.data;
        setCompany(companyData);
        // console.log(companyData)

        const attr = Array.isArray(companyData.atributos) ? companyData.atributos[0] : companyData.atributos ?? null;
        setAttributes(attr);
      } catch (error) {
        console.error("Erro ao carregar empresa:", error);
        setCompany(null);
        setAttributes(null);
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [emp_codigo]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return '#10B981';
      case 'inativa':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  if (!fontLoaded || loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0A0A0A" />
        <Text style={[styles.loadingText, { fontFamily: 'Righteous' }]}>
          Carregando empresa...
        </Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="business-outline" size={48} color="#9CA3AF" />
        </View>
        <Text style={[styles.errorTitle, { fontFamily: 'Righteous' }]}>
          Empresa não encontrada
        </Text>
        <Text style={styles.errorDescription}>
          A empresa que você está procurando não está disponível no momento.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          {company.emp_logotipo ? (
            <Image
              source={{ uri: company.emp_logotipo }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="business" size={40} color="#FFF" />
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={[styles.companyName, { fontFamily: 'Righteous' }]}>
              {company.emp_nome}
            </Text>

            <View style={styles.badgeContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(company.emp_status) }]} />
              <Text style={styles.statusText}>{company.emp_status}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>


      <View style={styles.content}>
        {attributes && (
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.9}
            onPress={handleRequest}
          >
            <LinearGradient
              colors={['#0A0A0A', '#2A2A2A']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.ctaText, { fontFamily: 'Righteous' }]}>
                Solicitar Serviço
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={styles.card}>
          {attributes ? (
            <BlurView intensity={80} tint="light" style={styles.priceCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="pricetag-outline" size={20} color="#0A0A0A" />
                <Text style={[styles.cardTitle, { fontFamily: 'Righteous' }]}>
                  Valores do Serviço
                </Text>
              </View>

              <View style={styles.priceContent}>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Valor Fixo</Text>
                  <Text style={[styles.priceValue, { fontFamily: 'Righteous' }]}>
                    R$ {attributes.atr_valor_fixo ?? '0,00'}
                  </Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Valor por KM</Text>
                  <Text style={[styles.priceValue, { fontFamily: 'Righteous' }]}>
                    R$ {attributes.atr_valor_km ?? '0,00'}
                  </Text>
                </View>
              </View>
            </BlurView>
          ) : (
            <View style={styles.emptyPriceCard}>
              <Ionicons name="alert-circle-outline" size={32} color="#9CA3AF" />
              <Text style={styles.emptyPriceText}>
                Não é possível solicitar um serviço para esta empresa no momento.
                
              </Text>
            </View>
          )}
          <View style={styles.cardHeader}>
            <Ionicons name="call-outline" size={20} color="#0A0A0A" />
            <Text style={[styles.cardTitle, { fontFamily: 'Righteous' }]}>
              Contato
            </Text>
          </View>

          <View style={styles.cardContent}>
            {company.emp_email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{company.emp_email}</Text>
              </View>
            )}

            {company.emp_telefone && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{company.emp_telefone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#0A0A0A" />
            <Text style={[styles.cardTitle, { fontFamily: 'Righteous' }]}>
              Endereço
            </Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.addressText}>
              {company.end_logradouro}, {company.end_numero}
            </Text>
            <Text style={styles.addressText}>
              {company.end_bairro}
            </Text>
            <Text style={styles.addressText}>
              {company.end_cidade} - CEP: {company.end_cep}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color="#0A0A0A" />
            <Text style={[styles.cardTitle, { fontFamily: 'Righteous' }]}>
              Dados da Empresa
            </Text>
          </View>

          <View style={styles.cardContent}>
            {company.emp_cnpj && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CNPJ</Text>
                <Text style={styles.detailValue}>{company.emp_cnpj}</Text>
              </View>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Parceira desde:</Text>
            <View>
              <Text style={styles.detailValue}>{formatDate(company.emp_created_at)}</Text>
            </View>
          </View>
        </View>
      </View>
      <StatusBar barStyle="light-content" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingBottom: 70,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },

  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  errorTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
  },

  backButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: "Righteous"
  },

  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFF',
  },

  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },

  companyName: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 8,
  },

  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  statusText: {
    fontSize: 12,
    fontFamily: 'Righteous',
    color: '#FFF',
    textTransform: 'capitalize',
  },

  content: {
    padding: 20,
    marginTop: -20,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    color: '#0A0A0A',
    marginLeft: 8,
    letterSpacing: 0.5,
    fontFamily: 'Righteous',
  },

  cardContent: {
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    fontFamily: 'Righteous',
  },

  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: 'Righteous',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Righteous',
  },

  priceCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  priceContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },

  priceItem: {
    flex: 1,
    alignItems: 'center',
  },

  priceLabel: {
    fontFamily: 'Righteous',
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  priceValue: {
    fontSize: 20,
    color: '#0A0A0A',
  },

  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  emptyPriceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    marginBottom: 16,
    alignItems: 'center',
    gap: 12,
  },

  emptyPriceText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  ctaButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  gradientButton: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },

  ctaText: {
    color: '#FFF',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});