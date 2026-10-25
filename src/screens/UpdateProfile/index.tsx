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

type ProfileFormData = {
    usu_nome: string;
    usu_email: string;
    usu_telefone: string;
    usu_cpf: string;
};

type FieldName = keyof ProfileFormData;
type FormErrors = Partial<Record<FieldName, string>>;

type ProfileInputProps = {
    label: string;
    field: FieldName;
    value: string;
    placeholder: string;
    icon: keyof typeof Feather.glyphMap;
    error?: string;
    required?: boolean;
    focusedField: FieldName | null;
    onFocus: (field: FieldName) => void;
    onBlur: (field: FieldName) => void;
    onChangeText: (value: string) => void;
    inputRef?: (ref: TextInput | null) => void;
    disabled?: boolean
} & TextInputProps;

const INITIAL_FORM: ProfileFormData = {
    usu_nome: "",
    usu_email: "",
    usu_telefone: "",
    usu_cpf: "",
};

function onlyNumbers(value: string) {
    return value.replace(/\D/g, "");
}

function formatPhone(value: string) {
    const numbers = onlyNumbers(value).slice(0, 11);

    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

function formatCpf(value: string) {
    const numbers = onlyNumbers(value).slice(0, 11);

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) {
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    }

    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
    return /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value.trim());
}

function isValidCpf(value: string) {
    return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value.trim());
}

function ProfileInput({
    label,
    field,
    value,
    placeholder,
    icon,
    error,
    required = false,
    focusedField,
    onFocus,
    onBlur,
    onChangeText,
    inputRef,
    style,
    disabled,
    ...rest
}: ProfileInputProps) {
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
                    style={[styles.input, style]}
                    onFocus={() => onFocus(field)}
                    onBlur={() => onBlur(field)}
                    onChangeText={onChangeText}
                    autoCorrect={false}
                    editable={!disabled}
                    {...rest}
                />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

export function UpdateProfile() {
    const navigation = useNavigation<any>();
    const fontLoaded = useRighteousFont();
    const { user, updateUserProfile } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState<ProfileFormData>({
        usu_nome: user?.usu_nome ?? INITIAL_FORM.usu_nome,
        usu_email: user?.usu_email ?? INITIAL_FORM.usu_email,
        usu_telefone: formatPhone(user?.usu_telefone ?? INITIAL_FORM.usu_telefone),
        usu_cpf: formatCpf(user?.usu_cpf ?? INITIAL_FORM.usu_cpf),
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [focusedField, setFocusedField] = useState<FieldName | null>(null);
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef<Record<FieldName, TextInput | null>>({
        usu_nome: null,
        usu_email: null,
        usu_telefone: null,
        usu_cpf: null,
    });

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

        switch (field) {
            case "usu_nome":
                if (!trimmed) return "Informe seu nome.";
                if (trimmed.length < 3) return "Digite um nome válido.";
                return undefined;

            case "usu_email":
                if (!trimmed) return "Informe seu e-mail.";
                if (!isValidEmail(trimmed)) return "Digite um e-mail válido.";
                return undefined;

            case "usu_telefone":
                if (!trimmed) return "Informe seu telefone.";
                if (!isValidPhone(trimmed)) return "Digite um telefone válido.";
                return undefined;

            case "usu_cpf":
                if (!trimmed) return "Informe seu CPF.";
                if (!isValidCpf(trimmed)) return "Digite um CPF válido.";
                return undefined;

            default:
                return undefined;
        }
    }, []);

    const validateForm = useCallback(() => {
        const fields: FieldName[] = ["usu_nome", "usu_email", "usu_telefone", "usu_cpf"];
        const nextErrors: FormErrors = {};

        fields.forEach((field) => {
            const error = validateField(field, form[field]);
            if (error) {
                nextErrors[field] = error;
            }
        });

        setErrors(nextErrors);

        const firstInvalidField = fields.find((field) => !!nextErrors[field]);
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

            if (field === "usu_telefone") {
                nextValue = formatPhone(value);
            }

            if (field === "usu_cpf") {
                nextValue = formatCpf(value);
            }

            setForm((prev) => ({
                ...prev,
                [field]: nextValue,
            }));

            clearFieldError(field);
        },
        [clearFieldError]
    );

    const hasChanges = useMemo(() => {
        const originalName = user?.usu_nome ?? "";
        const originalEmail = user?.usu_email ?? "";
        const originalPhone = formatPhone(user?.usu_telefone ?? "");
        const originalCpf = formatCpf(user?.usu_cpf ?? "");

        return (
            form.usu_nome !== originalName ||
            form.usu_email !== originalEmail ||
            form.usu_telefone !== originalPhone ||
            form.usu_cpf !== originalCpf
        );
    }, [form, user?.usu_cpf, user?.usu_email, user?.usu_nome, user?.usu_telefone]);

    const handleSave = useCallback(async () => {
        Keyboard.dismiss();

        if (!validateForm()) {
            showToast({
                title: "Campos inválidos",
                subtitle: "Revise as informações antes de salvar.",
                status: "error",
            });
            return;
        }

        if (!hasChanges) {
            showToast({
                title: "Nada para atualizar",
                subtitle: "Você ainda não alterou nenhuma informação.",
                status: "info",
            });
            return;
        }

        try {
            setLoading(true);

            await updateUserProfile({
                usu_nome: form.usu_nome.trim(),
                usu_email: form.usu_email.trim().toLowerCase(),
                usu_telefone: onlyNumbers(form.usu_telefone),
                usu_cpf: onlyNumbers(form.usu_cpf),
            });

            showToast({
                title: "Perfil atualizado",
                subtitle: "Seus dados foram atualizados com sucesso.",
                status: "success",
            });

            navigation.goBack();
        } catch (error: any) {
            const status = error?.response?.status;

            const apiMessage =
                error?.response?.data?.message ||
                error?.response?.message ||
                error?.message;

            if (status === 409 && apiMessage?.toLowerCase().includes("e-mail")) {
                setErrors((prev) => ({
                    ...prev,
                    usu_email: "Este e-mail já está cadastrado.",
                }));

                showToast({
                    title: "E-mail já cadastrado",
                    subtitle: "Esse e-mail já está sendo usado por outra conta.",
                    status: "error",
                });

                focusField("usu_email");
                return;
            }

            if (status === 409 && apiMessage?.toLowerCase().includes("telefone")) {
                setErrors((prev) => ({
                    ...prev,
                    usu_telefone: "Este telefone já está cadastrado.",
                }));

                showToast({
                    title: "Telefone já cadastrado",
                    subtitle: "Esse telefone já está sendo usado por outra conta.",
                    status: "error",
                });

                focusField("usu_telefone");
                return;
            }

            showToast({
                title: "Erro ao atualizar",
                subtitle: apiMessage || "Não foi possível salvar suas informações.",
                status: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [
        focusField,
        form.usu_cpf,
        form.usu_email,
        form.usu_nome,
        form.usu_telefone,
        hasChanges,
        navigation,
        showToast,
        updateUserProfile,
        validateForm,
    ]);

    if (!fontLoaded) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#111827" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Editar perfil"
                subtitle="Mantenha suas informações atualizadas"
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
                        <ProfileInput
                            label="Nome"
                            field="usu_nome"
                            value={form.usu_nome}
                            placeholder="Seu nome completo"
                            icon="user"
                            required
                            error={errors.usu_nome}
                            focusedField={focusedField}
                            onFocus={() => handleFocus("usu_nome")}
                            onBlur={() => handleBlur("usu_nome")}
                            onChangeText={(value) => handleChange("usu_nome", value)}
                            inputRef={(ref) => {
                                inputRefs.current.usu_nome = ref;
                            }}
                            returnKeyType="next"
                            onSubmitEditing={() => focusField("usu_email")}
                            disabled
                            blurOnSubmit={false}
                        />

                        <ProfileInput
                            label="E-mail"
                            field="usu_email"
                            value={form.usu_email}
                            placeholder="seuemail@exemplo.com"
                            icon="mail"
                            required
                            error={errors.usu_email}
                            focusedField={focusedField}
                            onFocus={() => handleFocus("usu_email")}
                            onBlur={() => handleBlur("usu_email")}
                            onChangeText={(value) => handleChange("usu_email", value)}
                            inputRef={(ref) => {
                                inputRefs.current.usu_email = ref;
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => focusField("usu_telefone")}
                            blurOnSubmit={false}
                        />

                        <ProfileInput
                            label="Telefone"
                            field="usu_telefone"
                            value={form.usu_telefone}
                            placeholder="(00) 00000-0000"
                            icon="phone"
                            required
                            error={errors.usu_telefone}
                            focusedField={focusedField}
                            onFocus={() => handleFocus("usu_telefone")}
                            onBlur={() => handleBlur("usu_telefone")}
                            onChangeText={(value) => handleChange("usu_telefone", value)}
                            inputRef={(ref) => {
                                inputRefs.current.usu_telefone = ref;
                            }}
                            keyboardType="phone-pad"
                            returnKeyType="next"
                            onSubmitEditing={() => focusField("usu_cpf")}
                            blurOnSubmit={false}
                        />

                        <ProfileInput
                            label="CPF"
                            field="usu_cpf"
                            value={form.usu_cpf}
                            placeholder="000.000.000-00"
                            icon="credit-card"
                            required
                            error={errors.usu_cpf}
                            focusedField={focusedField}
                            onFocus={() => handleFocus("usu_cpf")}
                            onBlur={() => handleBlur("usu_cpf")}
                            onChangeText={(value) => handleChange("usu_cpf", value)}
                            inputRef={(ref) => {
                                inputRefs.current.usu_cpf = ref;
                            }}
                            keyboardType="number-pad"
                            returnKeyType="done"
                            onSubmitEditing={handleSave}
                        />
                        

                        <TouchableOpacity
                            style={[
                                styles.button,
                                (!hasChanges || loading) && styles.buttonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!hasChanges || loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Feather name="save" size={18} color="#FFFFFF" />
                                    <Text style={styles.buttonText}>Salvar alterações</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        padding: 12,
    },
    card: {
        padding: 14,
    },

    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        marginLeft: 12,
        fontFamily: "Righteous",
        fontSize: 16,
        color: "#374151",
        marginBottom: 8,
    },
    required: {
        color: "#DC2626",
    },
    inputWrapper: {
        minHeight: 58,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        width: "100%"
    },
    inputWrapperFocused: {
        borderColor: "#111827",
    },
    inputWrapperError: {
        borderColor: "#DC2626",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 54,
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#111827",
        paddingVertical: 0,
    },
    errorText: {
        fontFamily: "Righteous",
        fontSize: 11,
        color: "#DC2626",
        marginTop: 6,
        marginLeft: 2,
    },
    button: {
        height: 56,
        borderRadius: 18,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#FFFFFF",
    },

});