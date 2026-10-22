import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { useToast } from "../../contexts/ToastContext";
import { api } from "../../services/api";
import { Header } from "../../components/Header";
import { styles } from "../AddAddress/styles";
import useRighteousFont from "../../hooks/useFont";

interface AddressForm {
    end_apelido: string;
    end_cep: string;
    end_logradouro: string;
    end_numero: string;
    end_bairro: string;
    end_cidade: string;
    end_uf: string;
    end_complemento: string;
    end_referencia: string;
}

interface AddressData extends AddressForm {
    end_codigo: number;
    usu_codigo: number;
    created_at?: string;
    updated_at?: string;
}

interface AddressByIdResponse {
    success: boolean;
    data: AddressData;
}

interface FieldValidation {
    required?: boolean;
    pattern?: RegExp;
    message?: string;
}

type RootStackParamList = {
    EditAddress: {
        end_codigo: number;
    };
};

const FIELD_VALIDATIONS: Record<keyof AddressForm, FieldValidation> = {
    end_apelido: {
        required: true,
        message: "Apelido é obrigatório",
    },
    end_cep: {
        required: true,
        pattern: /^\d{5}-?\d{3}$/,
        message: "CEP inválido",
    },
    end_logradouro: { required: false },
    end_numero: {
        required: true,
        message: "Número é obrigatório",
    },
    end_bairro: { required: false },
    end_cidade: { required: false },
    end_uf: {
        required: false,
        pattern: /^[A-Z]{2}$/,
        message: "UF inválida",
    },
    end_complemento: { required: false },
    end_referencia: { required: false },
};

export function EditAddress() {
    useRighteousFont();

    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RootStackParamList, "EditAddress">>();
    const { showToast } = useToast();

    const { end_codigo } = route.params;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchingCep, setSearchingCep] = useState(false);
    const [focusedField, setFocusedField] = useState<keyof AddressForm | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({});
    const [touchedFields, setTouchedFields] = useState<Set<keyof AddressForm>>(new Set());

    const scrollViewRef = useRef<ScrollView>(null);
    const fieldRefs = useRef<Record<string, TextInput | null>>({});
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [form, setForm] = useState<AddressForm>({
        end_apelido: "",
        end_cep: "",
        end_logradouro: "",
        end_numero: "",
        end_bairro: "",
        end_cidade: "",
        end_uf: "",
        end_complemento: "",
        end_referencia: "",
    });

    const formatCep = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 9);
    };

    useEffect(() => {
        loadAddress();
    }, [end_codigo]);

    useEffect(() => {
        if (!initialLoading) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [initialLoading, fadeAnim]);

    async function loadAddress() {
        try {
            setInitialLoading(true);

            const response = await api.get<AddressByIdResponse>(`/addresses/by-id/${end_codigo}`);
            const address = response.data?.data;

            if (!address) {
                throw new Error("Endereço não encontrado");
            }

            setForm({
                end_apelido: address.end_apelido || "",
                end_cep: formatCep(address.end_cep || ""),
                end_logradouro: address.end_logradouro || "",
                end_numero: String(address.end_numero || ""),
                end_bairro: address.end_bairro || "",
                end_cidade: address.end_cidade || "",
                end_uf: (address.end_uf || "").toUpperCase(),
                end_complemento: address.end_complemento || "",
                end_referencia: address.end_referencia || "",
            });
        } catch {
            showToast({
                title: "Erro ao carregar",
                subtitle: "Não foi possível buscar os dados do endereço",
                status: "error",
            });

            navigation.goBack();
        } finally {
            setInitialLoading(false);
        }
    }

    const updateField = (field: keyof AddressForm, value: string) => {
        let processedValue = value;

        if (field === "end_cep") {
            processedValue = formatCep(value);
        }

        if (field === "end_uf") {
            processedValue = value.toUpperCase().slice(0, 2);
        }

        setForm((prev) => ({ ...prev, [field]: processedValue }));

        if (touchedFields.has(field)) {
            validateField(field, processedValue);
        }
    };

    const validateField = (field: keyof AddressForm, value: string): boolean => {
        const validation = FIELD_VALIDATIONS[field];

        if (validation.required && !value.trim()) {
            setErrors((prev) => ({
                ...prev,
                [field]: validation.message || "Campo obrigatório",
            }));
            return false;
        }

        if (validation.pattern && value && !validation.pattern.test(value)) {
            setErrors((prev) => ({
                ...prev,
                [field]: validation.message || "Formato inválido",
            }));
            return false;
        }

        setErrors((prev) => ({ ...prev, [field]: undefined }));
        return true;
    };

    const handleFieldBlur = (field: keyof AddressForm) => {
        setFocusedField(null);
        setTouchedFields((prev) => new Set(prev).add(field));
        validateField(field, form[field]);
    };

    const handleFocus = (field: keyof AddressForm) => {
        setFocusedField(field);
    };

    const handleCepSearch = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, "");
        if (cleanCep.length !== 8) return;

        try {
            setSearchingCep(true);

            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();

            if (data.erro) {
                showToast({
                    title: "CEP não encontrado",
                    subtitle: "Verifique o número digitado",
                    status: "error",
                });
                return;
            }

            setForm((prev) => ({
                ...prev,
                end_logradouro: data.logradouro || "",
                end_bairro: data.bairro || "",
                end_cidade: data.localidade || "",
                end_uf: data.uf || "",
            }));

            setTimeout(() => {
                fieldRefs.current.end_numero?.focus();
            }, 100);

            showToast({
                title: "CEP encontrado",
                subtitle: "Dados atualizados com sucesso",
                status: "success",
            });
        } catch {
            showToast({
                title: "Erro ao buscar CEP",
                subtitle: "Tente novamente mais tarde",
                status: "error",
            });
        } finally {
            setSearchingCep(false);
        }
    };

    const validateForm = (): boolean => {
        const requiredFields = ["end_apelido", "end_cep", "end_numero"] as const;
        let isValid = true;
        const newErrors: Partial<Record<keyof AddressForm, string>> = {};

        requiredFields.forEach((field) => {
            if (!form[field].trim()) {
                newErrors[field] = FIELD_VALIDATIONS[field].message || "Campo obrigatório";
                isValid = false;
            } else if (
                FIELD_VALIDATIONS[field].pattern &&
                !FIELD_VALIDATIONS[field].pattern!.test(form[field])
            ) {
                newErrors[field] = FIELD_VALIDATIONS[field].message || "Formato inválido";
                isValid = false;
            }
        });

        if (
            form.end_uf &&
            FIELD_VALIDATIONS.end_uf.pattern &&
            !FIELD_VALIDATIONS.end_uf.pattern.test(form.end_uf)
        ) {
            newErrors.end_uf = FIELD_VALIDATIONS.end_uf.message;
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            const firstErrorField =
                requiredFields.find((field) => newErrors[field]) || "end_apelido";

            if (fieldRefs.current[firstErrorField]) {
                setTimeout(() => {
                    fieldRefs.current[firstErrorField]?.focus();
                }, 100);
            }
        }

        return isValid;
    };

    const handleSave = async () => {
        Keyboard.dismiss();

        if (!validateForm()) {
            showToast({
                title: "Campos obrigatórios",
                subtitle: "Preencha todos os campos necessários",
                status: "error",
            });
            return;
        }

        try {
            setLoading(true);

            await api.put(`/addresses/${end_codigo}`, {
                ...form,
                updated_at: new Date(),
            });

            showToast({
                title: "Endereço atualizado",
                subtitle: "As alterações foram salvas com sucesso",
                status: "success",
            });

            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => navigation.goBack());
        } catch {
            showToast({
                title: "Erro ao salvar",
                subtitle: "Não foi possível atualizar o endereço",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const renderFieldIcon = (field: keyof AddressForm) => {
        if (!form[field] && focusedField !== field) return null;

        const iconMap = {
            end_apelido: "home",
            end_cep: "map-pin",
            end_logradouro: "map",
            end_numero: "hash",
            end_bairro: "layers",
            end_cidade: "globe",
            end_uf: "flag",
            end_complemento: "plus-circle",
            end_referencia: "navigation",
        };

        return (
            <Feather
                name={iconMap[field] as any}
                size={18}
                color={errors[field] ? "#ff4444" : "#999"}
                style={styles.fieldIcon}
            />
        );
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header
                    title="Editar endereço"
                    subtitle="CARREGANDO DADOS DO ENDEREÇO"
                />

                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 24,
                    }}
                >
                    <ActivityIndicator size="large" color="#000" />
                    <Text style={{ marginTop: 12, color: "#666", fontFamily: "Righteous" }}>
                        Carregando endereço...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Editar endereço"
                subtitle="ATUALIZE OS DADOS DO ENDEREÇO"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={styles.scrollContent}
                    bounces={false}
                >
                    <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                APELIDO <Text style={styles.required}>*</Text>
                            </Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedField === "end_apelido" && styles.inputWrapperFocused,
                                    errors.end_apelido && styles.inputWrapperError,
                                ]}
                            >
                                {renderFieldIcon("end_apelido")}
                                <TextInput
                                    ref={(ref) => {
                                        fieldRefs.current.end_apelido = ref;
                                    }}
                                    placeholder="Casa, Trabalho, etc"
                                    placeholderTextColor="#aaa"
                                    style={styles.input}
                                    value={form.end_apelido}
                                    onFocus={() => handleFocus("end_apelido")}
                                    onBlur={() => handleFieldBlur("end_apelido")}
                                    onChangeText={(v) => updateField("end_apelido", v)}
                                    returnKeyType="next"
                                    onSubmitEditing={() => fieldRefs.current.end_cep?.focus()}
                                    blurOnSubmit={false}
                                />
                            </View>
                            {errors.end_apelido && (
                                <Text style={styles.errorText}>{errors.end_apelido}</Text>
                            )}
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                CEP <Text style={styles.required}>*</Text>
                            </Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedField === "end_cep" && styles.inputWrapperFocused,
                                    errors.end_cep && styles.inputWrapperError,
                                ]}
                            >
                                {renderFieldIcon("end_cep")}
                                <TextInput
                                    ref={(ref) => {
                                        fieldRefs.current.end_cep = ref;
                                    }}
                                    placeholder="00000-000"
                                    placeholderTextColor="#aaa"
                                    style={[styles.input, styles.cepInput]}
                                    keyboardType="numeric"
                                    value={form.end_cep}
                                    onFocus={() => handleFocus("end_cep")}
                                    onBlur={() => handleFieldBlur("end_cep")}
                                    onChangeText={(v) => {
                                        updateField("end_cep", v);

                                        if (v.replace(/\D/g, "").length === 8) {
                                            handleCepSearch(v);
                                        }
                                    }}
                                    returnKeyType="next"
                                    onSubmitEditing={() => {
                                        if (form.end_cep.replace(/\D/g, "").length === 8) {
                                            handleCepSearch(form.end_cep);
                                        }
                                    }}
                                    blurOnSubmit={false}
                                />
                                {searchingCep && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#000"
                                        style={styles.cepLoading}
                                    />
                                )}
                            </View>
                            {errors.end_cep && (
                                <Text style={styles.errorText}>{errors.end_cep}</Text>
                            )}
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>LOGRADOURO</Text>
                            <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                                {renderFieldIcon("end_logradouro")}
                                <TextInput
                                    placeholder="Busca automática pelo CEP"
                                    placeholderTextColor="#aaa"
                                    style={[styles.input, styles.inputDisabled]}
                                    value={form.end_logradouro}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.fieldContainer, { flex: 2, marginBottom: 0 }]}>
                                <Text style={styles.fieldLabel}>
                                    NÚMERO <Text style={styles.required}>*</Text>
                                </Text>
                                <View
                                    style={[
                                        styles.inputWrapper,
                                        focusedField === "end_numero" && styles.inputWrapperFocused,
                                        errors.end_numero && styles.inputWrapperError,
                                    ]}
                                >
                                    {renderFieldIcon("end_numero")}
                                    <TextInput
                                        ref={(ref) => {
                                            fieldRefs.current.end_numero = ref;
                                        }}
                                        placeholder="123"
                                        placeholderTextColor="#aaa"
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={form.end_numero}
                                        onFocus={() => handleFocus("end_numero")}
                                        onBlur={() => handleFieldBlur("end_numero")}
                                        onChangeText={(v) => updateField("end_numero", v)}
                                        returnKeyType="next"
                                        onSubmitEditing={() =>
                                            fieldRefs.current.end_complemento?.focus()
                                        }
                                        blurOnSubmit={false}
                                    />
                                </View>
                                {errors.end_numero && (
                                    <Text style={styles.errorText}>{errors.end_numero}</Text>
                                )}
                            </View>

                            <View style={[styles.fieldContainer, { flex: 1, marginBottom: 0 }]}>
                                <Text style={styles.fieldLabel}>UF</Text>
                                <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                                    {renderFieldIcon("end_uf")}
                                    <TextInput
                                        placeholder="UF"
                                        placeholderTextColor="#aaa"
                                        style={[styles.input, styles.ufInput, styles.inputDisabled]}
                                        value={form.end_uf}
                                        editable={false}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>BAIRRO</Text>
                            <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                                {renderFieldIcon("end_bairro")}
                                <TextInput
                                    placeholder="Busca automática pelo CEP"
                                    placeholderTextColor="#aaa"
                                    style={[styles.input, styles.inputDisabled]}
                                    value={form.end_bairro}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>CIDADE</Text>
                            <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                                {renderFieldIcon("end_cidade")}
                                <TextInput
                                    placeholder="Busca automática pelo CEP"
                                    placeholderTextColor="#aaa"
                                    style={[styles.input, styles.inputDisabled]}
                                    value={form.end_cidade}
                                    editable={false}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>COMPLEMENTO</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedField === "end_complemento" &&
                                        styles.inputWrapperFocused,
                                ]}
                            >
                                {renderFieldIcon("end_complemento")}
                                <TextInput
                                    ref={(ref) => {
                                        fieldRefs.current.end_complemento = ref;
                                    }}
                                    placeholder="Apto, Bloco, etc (opcional)"
                                    placeholderTextColor="#aaa"
                                    style={styles.input}
                                    value={form.end_complemento}
                                    onFocus={() => handleFocus("end_complemento")}
                                    onBlur={() => handleFieldBlur("end_complemento")}
                                    onChangeText={(v) => updateField("end_complemento", v)}
                                    returnKeyType="next"
                                    onSubmitEditing={() =>
                                        fieldRefs.current.end_referencia?.focus()
                                    }
                                    blurOnSubmit={false}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>REFERÊNCIA</Text>
                            <View
                                style={[
                                    styles.inputWrapper,
                                    focusedField === "end_referencia" &&
                                        styles.inputWrapperFocused,
                                ]}
                            >
                                {renderFieldIcon("end_referencia")}
                                <TextInput
                                    ref={(ref) => {
                                        fieldRefs.current.end_referencia = ref;
                                    }}
                                    placeholder="Próximo ao mercado, etc (opcional)"
                                    placeholderTextColor="#aaa"
                                    style={styles.input}
                                    value={form.end_referencia}
                                    onFocus={() => handleFocus("end_referencia")}
                                    onBlur={() => handleFieldBlur("end_referencia")}
                                    onChangeText={(v) => updateField("end_referencia", v)}
                                    returnKeyType="done"
                                    onSubmitEditing={handleSave}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (loading || searchingCep) && styles.buttonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={loading || searchingCep}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather name="check" size={20} color="#fff" />
                                    <Text style={styles.buttonText}>Salvar alterações</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <Text style={styles.helperText}>
                            <Feather name="info" size={12} color="#999" /> Os campos com * são
                            obrigatórios
                        </Text>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}