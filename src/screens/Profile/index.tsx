import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity
} from "react-native";

import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { RowProfile } from "../../components/RowProfile";

import { Modalize } from "react-native-modalize";

import { styles } from "./styles";
import { PagerAds } from "../../components/PagerAds";

export function Profile() {
    const modalRef = useRef<Modalize>(null);

    const navigation = useNavigation<any>();
    const { user, signOut } = useAuth();

    function openModalize() {
        modalRef.current?.open();
    }

    async function handleSignOut() {
        try {
            modalRef.current?.close();
            await signOut();
        } catch (error) {
            throw new Error("Erro ao sair");
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>

                    <View style={styles.avatar}>
                        <Ionicons name="person" size={32} color="#fff" />
                    </View>

                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>
                            {user?.usu_nome ?? "Usuário"}
                        </Text>

                        <Text style={styles.userEmail}>
                            {user?.usu_email}
                        </Text>
                    </View>

                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Conta
                    </Text>

                    <RowProfile
                        icon="pencil-outline"
                        title="Editar perfil"
                        onPress={() => navigation.navigate("UpdateProfile")}
                    />
                    <RowProfile
                        icon="star-outline"
                        title="Minhas avaliações"
                        onPress={() => navigation.navigate("Reviews")}
                    />
                    <RowProfile
                        icon="map-outline"
                        title="Minhas atividades"
                        onPress={() => navigation.navigate("Travels")}
                    />
                    <RowProfile
                        icon="location-outline"
                        title="Endereços favoritos"
                        onPress={() => navigation.navigate("Addresses")}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Preferências
                    </Text>

                    {/* <RowProfile
                        icon="card-outline"
                        title="Formas de pagamento"
                        onPress={() => navigation.navigate("PaymentMethods")}
                    /> */}

                    <RowProfile
                        icon="help-circle-outline"
                        title="Suporte"
                        onPress={() => navigation.navigate("Support")}
                    />


                    <RowProfile
                        icon="settings-outline"
                        title="Configurações"
                        onPress={() => navigation.navigate("Settings")}
                    />
                </View>
                <PagerAds />

                <View style={styles.section}>
                    <RowProfile
                        icon="log-out-outline"
                        title="Sair da conta"
                        color="#ff4d4f"
                        onPress={openModalize}
                    />
                </View>

                <StatusBar style="dark" />
            </ScrollView>

            <Modalize
                ref={modalRef}
                withReactModal
                adjustToContentHeight
                handleStyle={styles.handle}
                modalStyle={styles.modal}
            >
                <View style={styles.modalContent}>

                    <View style={styles.modalIconWrapper}>
                        <Ionicons name="log-out-outline" size={28} color="#ff4d4f" />
                    </View>

                    <Text style={styles.modalTitle}>
                        Deseja sair da conta?
                    </Text>

                    <Text style={styles.modalSubtitle}>
                        Você precisará entrar novamente para acessar sua conta e continuar utilizando o aplicativo.
                    </Text>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            activeOpacity={0.8}
                            onPress={handleSignOut}
                        >
                            <Ionicons name="log-out-outline" size={18} color="#fff" />
                            <Text style={styles.logoutButtonText}>
                                Sair da conta
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.8}
                            onPress={() => modalRef.current?.close()}
                        >
                            <Text style={styles.cancelButtonText}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modalize>
        </SafeAreaView>
    );
}
