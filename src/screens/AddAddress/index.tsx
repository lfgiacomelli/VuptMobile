import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { Header } from "../../components/Header";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import useRighteousFont from "../../hooks/useFont";
import { api } from "../../services/api";

import { styles } from "./styles";

type AddressFormData = {
    end_apelido: string;
    end_cep: string;
    end_logradouro: string;
    end_numero: string;
    end_bairro: string;
    end_cidade: string;
    end_uf: string;
    end_complemento: string;
    end_referencia: string;
};

type FieldName = keyof AddressFormData;

type FormErrors = Partial<Record<FieldName, string>>;

type AddressInputProps = Omit<TextInputProps, 'onFocus' | 'onBlur'> & {
    label: string;
    field: FieldName;
    value: string;
    placeholder: string;
    icon: keyof typeof Feather.glyphMap;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    inputRef?: (ref: TextInput | null) => void;
    onFocus: (field: FieldName) => void;
    onBlur: (field: FieldName) => void;
    onChangeText?: (value: string) => void;
    focusedField: FieldName | null;
    rightElement?: React.ReactNode;
};

const INITIAL_FORM: AddressFormData = {
    end_apelido: "",
    end_cep: "",
    end_logradouro: "",
    end_numero: "",
    end_bairro: "",
    end_cidade: "",
    end_uf: "",
    end_complemento: "",
    end_referencia: "",
};

const REQUIRED_FIELDS: FieldName[] = ["end_apelido", "end_cep", "end_numero"];

function formatCep(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
}

function isValidCep(value: string) {
    return /^\d{5}-\d{3}$/.test(value);
}

function AddressInput({
    label,
    field,
    value,
    placeholder,
    icon,
    error,
    required = false,
    disabled = false,
    inputRef,
    onFocus,
    onBlur,
    onChangeText,
    focusedField,
    rightElement,
    style,
    ...rest
}: AddressInputProps) {
    const isFocused = focusedField === field;

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
                {label}
                {required ? <Text style={styles.required}> *</Text> : null}
            </Text>

            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputWrapperFocused,
                    error && styles.inputWrapperError,
                    disabled && styles.inputWrapperDisabled,
                ]}
            >
                <Feather
                    name={icon}
                    size={18}
                    color={error ? "#DC2626" : isFocused ? "#111827" : "#9CA3AF"}
                    style={styles.inputIcon}
                />

                <TextInput
                    ref={inputRef}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, disabled && styles.inputDisabled, style]}
                    editable={!disabled}
                    onFocus={() => onFocus(field)}
                    onBlur={() => onBlur(field)}
                    onChangeText={onChangeText}
                    autoCorrect={false}
                    autoCapitalize="none"
                    {...rest}
                />

                {rightElement}
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

export function AddAddress() {
    const fontLoaded = useRighteousFont();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState<AddressFormData>(INITIAL_FORM);
    const [errors, setErrors] = useState<FormErrors>({});
    const [focusedField, setFocusedField] = useState<FieldName | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);

    const inputRefs = useRef<Record<FieldName, TextInput | null>>({
        end_apelido: null,
        end_cep: null,
        end_logradouro: null,
        end_numero: null,
        end_bairro: null,
        end_cidade: null,
        end_uf: null,
        end_complemento: null,
        end_referencia: null,
    });

    const lastFetchedCepRef = useRef("");

    const setFieldValue = useCallback((field: FieldName, value: string) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const focusField = useCallback((field: FieldName) => {
        requestAnimationFrame(() => {
            inputRefs.current[field]?.focus();
        });
    }, []);

    const clearFieldError = useCallback((field: FieldName) => {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            return {
                ...prev,
                [field]: undefined,
            };
        });
    }, []);

    const validateField = useCallback((field: FieldName, value: string): string | undefined => {
        const trimmed = value.trim();

        if (field === "end_apelido" && !trimmed) {
            return "Informe um apelido para o endereço.";
        }

        if (field === "end_cep") {
            if (!trimmed) return "Informe o CEP.";
            if (!isValidCep(trimmed)) return "Digite um CEP válido.";
        }

        if (field === "end_numero" && !trimmed) {
            return "Informe o número do endereço.";
        }

        return undefined;
    }, []);

    const validateForm = useCallback(() => {
        const nextErrors: FormErrors = {};

        REQUIRED_FIELDS.forEach((field) => {
            const error = validateField(field, form[field]);
            if (error) {
                nextErrors[field] = error;
            }
        });

        setErrors(nextErrors);

        const firstInvalidField = REQUIRED_FIELDS.find((field) => !!nextErrors[field]);
        if (firstInvalidField) {
            focusField(firstInvalidField);
            return false;
        }

        return true;
    }, [focusField, form, validateField]);

    const handleFocus = useCallback((field: FieldName) => {
        setFocusedField(field);
    }, []);

    const handleBlur = useCallback(
        (field: FieldName) => {
            setFocusedField((current) => (current === field ? null : current));

            const error = validateField(field, form[field]);

            setErrors((prev) => ({
                ...prev,
                [field]: error,
            }));
        },
        [form, validateField]
    );

    const handleChange = useCallback(
        (field: FieldName, value: string) => {
            let nextValue = value;

            if (field === "end_cep") {
                nextValue = formatCep(value);
            }

            if (field === "end_uf") {
                nextValue = value.toUpperCase().slice(0, 2);
            }

            setFieldValue(field, nextValue);
            clearFieldError(field);
        },
        [clearFieldError, setFieldValue]
    );

    const fillAddressFromCep = useCallback(
        async (cep?: string) => {
            const cepValue = cep ?? form.end_cep;
            const normalizedCep = cepValue.replace(/\D/g, "");

            if (normalizedCep.length !== 8) return;
            if (lastFetchedCepRef.current === normalizedCep) return;

            try {
                setSearchingCep(true);
                lastFetchedCepRef.current = normalizedCep;

                const response = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);
                const data = await response.json();

                if (data.erro) {
                    setErrors((prev) => ({
                        ...prev,
                        end_cep: "CEP não encontrado.",
                    }));

                    showToast({
                        title: "CEP não encontrado",
                        subtitle: "Confira o número informado e tente novamente.",
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

                showToast({
                    title: "CEP localizado",
                    subtitle: "Agora preencha o número do endereço.",
                    status: "success",
                });

                focusField("end_numero");
            } catch {
                lastFetchedCepRef.current = "";

                showToast({
                    title: "Erro ao buscar CEP",
                    subtitle: "Não foi possível consultar o CEP agora.",
                    status: "error",
                });
            } finally {
                setSearchingCep(false);
            }
        },
        [focusField, form.end_cep, showToast]
    );

    const handleSave = useCallback(async () => {
        Keyboard.dismiss();

        if (!validateForm()) {
            showToast({
                title: "Revise os campos",
                subtitle: "Existem informações obrigatórias pendentes.",
                status: "error",
            });
            return;
        }

        try {
            setLoading(true);

            await api.post("/addresses", {
                usu_codigo: user?.usu_codigo,
                ...form,
                created_at: new Date(),
                updated_at: new Date(),
            });

            showToast({
                title: "Endereço cadastrado",
                subtitle: "Seu novo endereço foi salvo com sucesso.",
                status: "success",
            });

            navigation.goBack();
        } catch {
            showToast({
                title: "Erro ao salvar",
                subtitle: "Não foi possível cadastrar o endereço.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [form, navigation, showToast, user?.usu_codigo, validateForm]);

    const cepRightElement = useMemo(() => {
        if (!searchingCep) return null;

        return (
            <ActivityIndicator
                size="small"
                color="#111827"
                style={styles.rightLoading}
            />
        );
    }, [searchingCep]);

    if (!fontLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Novo endereço"
                subtitle="PREENCHA AS INFORMAÇÕES"
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                >
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Identificação</Text>
                        <Text style={styles.sectionSubtitle}>
                            Dê um nome fácil para encontrar este endereço depois.
                        </Text>

                        <AddressInput
                            label="Apelido"
                            field="end_apelido"
                            value={form.end_apelido}
                            placeholder="Casa, trabalho, academia..."
                            icon="home"
                            required
                            error={errors.end_apelido}
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={(value) => handleChange("end_apelido", value)}
                            inputRef={(ref) => {
                                inputRefs.current.end_apelido = ref;
                            }}
                            returnKeyType="next"
                            onSubmitEditing={() => focusField("end_cep")}
                            blurOnSubmit={false}
                        />

                        <Text style={styles.sectionTitle}>Localização</Text>
                        <Text style={styles.sectionSubtitle}>
                            Informe o CEP para preencher o endereço automaticamente.
                        </Text>

                        <AddressInput
                            label="CEP"
                            field="end_cep"
                            value={form.end_cep}
                            placeholder="00000-000"
                            icon="map-pin"
                            required
                            error={errors.end_cep}
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={(value) => handleChange("end_cep", value)}
                            inputRef={(ref) => {
                                inputRefs.current.end_cep = ref;
                            }}
                            keyboardType="number-pad"
                            maxLength={9}
                            returnKeyType="next"
                            onSubmitEditing={() => fillAddressFromCep()}
                            onEndEditing={() => fillAddressFromCep()}
                            blurOnSubmit={false}
                            rightElement={cepRightElement}
                        />

                        <AddressInput
                            label="Logradouro"
                            field="end_logradouro"
                            value={form.end_logradouro}
                            placeholder="Preenchido automaticamente pelo CEP"
                            icon="map"
                            disabled
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />

                        <View style={styles.row}>
                            <View style={styles.numberColumn}>
                                <AddressInput
                                    label="Número"
                                    field="end_numero"
                                    value={form.end_numero}
                                    placeholder="123"
                                    icon="hash"
                                    required
                                    error={errors.end_numero}
                                    focusedField={focusedField}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    onChangeText={(value) => handleChange("end_numero", value)}
                                    inputRef={(ref) => {
                                        inputRefs.current.end_numero = ref;
                                    }}
                                    keyboardType="number-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => focusField("end_complemento")}
                                    blurOnSubmit={false}
                                />
                            </View>

                            <View style={styles.ufColumn}>
                                <AddressInput
                                    label="UF"
                                    field="end_uf"
                                    value={form.end_uf}
                                    placeholder="UF"
                                    icon="flag"
                                    disabled
                                    focusedField={focusedField}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </View>
                        </View>

                        <AddressInput
                            label="Bairro"
                            field="end_bairro"
                            value={form.end_bairro}
                            placeholder="Preenchido automaticamente pelo CEP"
                            icon="layers"
                            disabled
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />

                        <AddressInput
                            label="Cidade"
                            field="end_cidade"
                            value={form.end_cidade}
                            placeholder="Preenchido automaticamente pelo CEP"
                            icon="globe"
                            disabled
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                        />

                        <Text style={styles.sectionTitle}>Detalhes adicionais</Text>
                        <Text style={styles.sectionSubtitle}>
                            Informações complementares ajudam a localizar o endereço com mais facilidade.
                        </Text>

                        <AddressInput
                            label="Complemento"
                            field="end_complemento"
                            value={form.end_complemento}
                            placeholder="Apartamento, bloco, sala..."
                            icon="plus-circle"
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={(value) => handleChange("end_complemento", value)}
                            inputRef={(ref) => {
                                inputRefs.current.end_complemento = ref;
                            }}
                            returnKeyType="next"
                            onSubmitEditing={() => focusField("end_referencia")}
                            blurOnSubmit={false}
                        />

                        <AddressInput
                            label="Referência"
                            field="end_referencia"
                            value={form.end_referencia}
                            placeholder="Próximo ao mercado, esquina, portão..."
                            icon="navigation"
                            focusedField={focusedField}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onChangeText={(value) => handleChange("end_referencia", value)}
                            inputRef={(ref) => {
                                inputRefs.current.end_referencia = ref;
                            }}
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (loading || searchingCep) && styles.buttonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={loading || searchingCep}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Feather name="check" size={18} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>Salvar endereço</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerInfo}>
                            <Feather name="info" size={14} color="#6B7280" />
                            <Text style={styles.footerInfoText}>
                                Os campos marcados com * são obrigatórios.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

