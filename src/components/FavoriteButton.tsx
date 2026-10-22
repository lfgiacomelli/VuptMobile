import React, { useEffect, useState, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Modalize } from "react-native-modalize";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";
import { useToast } from "../contexts/ToastContext";
import useRighteousFont from "../hooks/useFont";

type Address = {
  end_codigo: number;
  end_apelido: string;
  end_logradouro: string;
  end_numero: string;
  end_bairro: string;
  end_cidade: string;
};

type Props = {
  usu_codigo: number;
  origin: string;
  destination: string;
  setOrigin: (v: string) => void;
  setDestination: (v: string) => void;
  navigation: any;
};

export function FavoritesButton({
  usu_codigo,
  origin,
  destination,
  setOrigin,
  setDestination,
  navigation
}: Props) {

  const { showToast } = useToast();

  const modalRef = useRef<Modalize>(null);
  const fieldModalRef = useRef<Modalize>(null);

  const fontLoaded = useRighteousFont();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    showHint();
  }, []);

  async function showHint() {

    const shown = await AsyncStorage.getItem("@favorites_hint");

    if (!shown) {

      showToast({
        title: "Use a estrela para acessar seus favoritos",
        status: "info"
      });

      await AsyncStorage.setItem("@favorites_hint", "true");
    }
  }

  async function openFavorites() {

    try {

      const response = await api.get(`/addresses/${usu_codigo}`);

      const data = response.data?.data || [];

      setAddresses(data);

      modalRef.current?.open();

    } catch {

      showToast({
        title: "Erro ao carregar favoritos",
        status: "error"
      });
    }
  }

  function handleSelect(address: Address) {

    setSelectedAddress(address);

    modalRef.current?.close();

    setTimeout(() => {
      fieldModalRef.current?.open();
    }, 250);
  }

  function applyAddress(type: "origin" | "destination") {

    if (!selectedAddress) return;

    const formatted =
      `${selectedAddress.end_logradouro}, ${selectedAddress.end_numero} - ${selectedAddress.end_bairro}, ${selectedAddress.end_cidade}`;

    if (type === "origin") {

      if (origin) {
        showToast({
          title: "Origem substituída",
          status: "info"
        });
      }

      setOrigin(formatted);

    } else {

      if (destination) {
        showToast({
          title: "Destino substituído",
          status: "info"
        });
      }

      setDestination(formatted);
    }

    fieldModalRef.current?.close();
  }

  if (!fontLoaded) return null;

  return (
    <>

      <TouchableOpacity
        style={styles.starButton}
        onPress={openFavorites}
        activeOpacity={0.8}
      >
        <Ionicons name="star" size={22} color="#FFD700" />
      </TouchableOpacity>



      <Modalize
        ref={modalRef}
        withReactModal
        modalHeight={520}
        handleStyle={styles.handle}
        modalStyle={styles.modal}
        flatListProps={{
          data: addresses,
          keyExtractor: (item: Address) => String(item.end_codigo),
          showsVerticalScrollIndicator: false,

          ListHeaderComponent: (
            <Text style={styles.title}>
              Endereços favoritos
            </Text>
          ),

          ListEmptyComponent: (
            <View style={styles.emptyContainer}>

              <Ionicons
                name="star-outline"
                size={40}
                color="#bbb"
              />

              <Text style={styles.emptyText}>
                Você ainda não possui
              </Text>

              <Text style={styles.emptyText}>
                endereços favoritos
              </Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  modalRef.current?.close();
                  navigation.navigate("AddAddress");
                }}
              >

                <Ionicons
                  name="add-circle"
                  size={18}
                  color="#fff"
                />

                <Text style={styles.addButtonText}>
                  Adicionar endereço
                </Text>

              </TouchableOpacity>

            </View>
          ),

          renderItem: ({ item }) => (

            <TouchableOpacity
              style={styles.addressCard}
              onPress={() => handleSelect(item)}
              activeOpacity={0.85}
            >

              <View style={styles.addressIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color="#4CAF50"
                />
              </View>

              <View style={styles.addressInfo}>

                <Text style={styles.addressTitle}>
                  {item.end_apelido}
                </Text>

                <Text style={styles.addressSubtitle}>
                  {item.end_logradouro}, {item.end_numero}
                </Text>

                <Text style={styles.addressCity}>
                  {item.end_bairro} • {item.end_cidade}
                </Text>

              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#aaa"
              />

            </TouchableOpacity>

          ),

          contentContainerStyle: {
            padding: 20,
            paddingBottom: 40
          }
        }}
      />


      {/* MODAL ESCOLHER CAMPO */}

      <Modalize
        ref={fieldModalRef}
        withReactModal
        adjustToContentHeight
        handleStyle={styles.handle}
        modalStyle={styles.modal}
      >

        <View style={styles.container}>

          <Text style={styles.title}>
            Substituir qual campo?
          </Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => applyAddress("origin")}
          >
            <Ionicons name="ellipse" size={14} color="#4CAF50" />
            <Text style={styles.optionText}>Origem</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => applyAddress("destination")}
          >
            <Ionicons name="square" size={14} color="#F44336" />
            <Text style={styles.optionText}>Destino</Text>
          </TouchableOpacity>

        </View>

      </Modalize>

    </>
  );
}

const styles = StyleSheet.create({

  starButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#fff"
  },

  handle: {
    backgroundColor: "#ccc",
    width: 60
  },

  container: {
    padding: 20
  },

  title: {
    fontSize: 20,
    fontFamily: "Righteous",
    marginBottom: 20,
    color: "#222"
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40
  },

  emptyText: {
    fontFamily: "Righteous",
    fontSize: 14,
    color: "#888"
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 20
  },

  addButtonText: {
    fontFamily: "Righteous",
    color: "#fff",
    marginLeft: 8,
    fontSize: 14
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },

  addressInfo: {
    flex: 1
  },

  addressTitle: {
    fontFamily: "Righteous",
    fontSize: 15,
    color: "#222"
  },

  addressSubtitle: {
    fontFamily: "Righteous",
    fontSize: 13,
    color: "#555"
  },

  addressCity: {
    fontFamily: "Righteous",
    fontSize: 12,
    color: "#999"
  },

  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  optionText: {
    fontFamily: "Righteous",
    fontSize: 15,
    marginLeft: 10
  }

});