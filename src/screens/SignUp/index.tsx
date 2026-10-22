import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Easing,
    StatusBar,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import useRighteousFont from "../../hooks/useFont";

type Step = "name" | "credentials" | "contact";

export function SignUp() {
    const fontLoaded = useRighteousFont();
    const navigation = useNavigation<any>();
    const { showToast } = useToast();
    const { signUpUser } = useAuth();

    const [step, setStep] = useState<Step>("name");
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [cpf, setCpf] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [cpfError, setCpfError] = useState("");

    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const nameInputRef = useRef<TextInput>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const phoneInputRef = useRef<TextInput>(null);
    const cpfInputRef = useRef<TextInput>(null);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.985)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);

    useEffect(() => {
        if (!fontLoaded) return;

        const timer = setTimeout(() => {
            nameInputRef.current?.focus();
        }, 180);

        return () => clearTimeout(timer);
    }, [fontLoaded]);

    function animateStepChange(nextStep: Step) {
        Keyboard.dismiss();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 130,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(slideAnim, {
                toValue: 10,
                duration: 130,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }),
            Animated.timing(headerOpacity, {
                toValue: nextStep === "name" ? 1 : 0.45,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setStep(nextStep);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.ease),
                }),
            ]).start(() => {
                if (nextStep === "name") {
                    nameInputRef.current?.focus();
                }

                if (nextStep === "credentials") {
                    emailInputRef.current?.focus();
                }

                if (nextStep === "contact") {
                    phoneInputRef.current?.focus();
                }
            });
        });
    }

    function onlyNumbers(value: string) {
        return value.replace(/\D/g, "");
    }

    function formatPhone(value: string) {
        const numbers = onlyNumbers(value).slice(0, 11);

        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;

        const isMobile = numbers.length >= 11;
        return isMobile
            ? `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
            : `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
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

    function validateEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function validateName() {
        const trimmedName = name.trim();

        if (!trimmedName) {
            setNameError("Informe seu nome.");
            return false;
        }

        if (trimmedName.length < 3) {
            setNameError("Digite seu nome completo ou um nome mais descritivo.");
            return false;
        }

        setNameError("");
        return true;
    }

    function validateCredentials() {
        let valid = true;

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail) {
            setEmailError("Informe seu e-mail.");
            valid = false;
        } else if (!validateEmail(trimmedEmail)) {
            setEmailError("Digite um e-mail válido.");
            valid = false;
        } else {
            setEmailError("");
        }

        if (!trimmedPassword) {
            setPasswordError("Informe sua senha.");
            valid = false;
        } else if (trimmedPassword.length < 6) {
            setPasswordError("Sua senha deve ter pelo menos 6 caracteres.");
            valid = false;
        } else {
            setPasswordError("");
        }

        return valid;
    }

    function validateContact() {
        let valid = true;

        const phoneNumbers = onlyNumbers(phone);
        const cpfNumbers = onlyNumbers(cpf);

        if (!phoneNumbers) {
            setPhoneError("Informe seu telefone.");
            valid = false;
        } else if (phoneNumbers.length < 10) {
            setPhoneError("Digite um telefone válido.");
            valid = false;
        } else {
            setPhoneError("");
        }

        if (!cpfNumbers) {
            setCpfError("Informe seu CPF.");
            valid = false;
        } else if (cpfNumbers.length !== 11) {
            setCpfError("Digite um CPF válido.");
            valid = false;
        } else {
            setCpfError("");
        }

        return valid;
    }

    function handleNextFromName() {
        if (!validateName()) return;
        animateStepChange("credentials");
    }

    function handleNextFromCredentials() {
        if (!validateCredentials()) return;
        animateStepChange("contact");
    }

    async function handleCreateAccount() {
        const isNameValid = validateName();
        const isCredentialsValid = validateCredentials();
        const isContactValid = validateContact();

        if (!isNameValid || !isCredentialsValid || !isContactValid) {
            return;
        }

        try {
            setLoading(true);

            await signUpUser({
                usu_nome: name.trim(),
                usu_email: email.trim(),
                usu_senha: password,
                usu_telefone: onlyNumbers(phone),
                usu_cpf: onlyNumbers(cpf),
                usu_status: "ativo",
            });

            showToast({
                title: "Conta criada com sucesso",
                status: "success",
                subtitle: "Você já entrou na sua conta",
            });
        } catch (error: any) {
            const status = error?.response?.status;

            if (status === 409) {
                setEmailError("Este e-mail já está vinculado a uma conta.");
                animateStepChange("credentials");

                showToast({
                    title: "E-mail já cadastrado",
                    status: "error",
                    subtitle: "Use outro e-mail ou entre com sua conta.",
                });
            } else {
                showToast({
                    title: "Não foi possível criar sua conta",
                    status: "error",
                    subtitle: "Verifique os dados informados e tente novamente",
                });
            }

            console.log("Erro ao criar conta:", error);
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        if (step === "contact") {
            setPhoneError("");
            setCpfError("");
            animateStepChange("credentials");
            return;
        }

        if (step === "credentials") {
            setEmailError("");
            setPasswordError("");
            animateStepChange("name");
            return;
        }

        navigation.goBack();
    }

    const progress = useMemo(() => {
        if (step === "name") return 1 / 3;
        if (step === "credentials") return 2 / 3;
        return 1;
    }, [step]);

    if (!fontLoaded) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#111111" />
                </View>
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerContent}>
                <Text style={styles.eyebrow}>Cadastro</Text>
                <Text style={styles.title}>Crie sua conta</Text>
                <Text style={styles.subtitle}>
                    Um cadastro simples, claro e feito para você começar sem dificuldade.
                </Text>
            </View>
        </Animated.View>
    );

    const renderNameStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.stepBadge}>Passo 1 de 3</Text>
                <Text style={styles.sectionTitle}>Primeiro, nos conte seu nome</Text>
                <Text style={styles.sectionDescription}>
                    Queremos identificar você da forma certa desde o início.
                </Text>
            </View>

            <View style={styles.formBlock}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nome</Text>
                    <TextInput
                        ref={nameInputRef}
                        style={[styles.input, nameError ? styles.inputError : null]}
                        placeholder="Digite seu nome completo"
                        placeholderTextColor="#A0A0A0"
                        autoCapitalize="words"
                        autoCorrect={false}
                        textContentType="name"
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (nameError) setNameError("");
                        }}
                        onSubmitEditing={handleNextFromName}
                        returnKeyType="next"
                    />
                    {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
                </View>
            </View>
        </View>
    );

    const renderCredentialsStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.stepBadge}>Passo 2 de 3</Text>
                <Text style={styles.sectionTitle}>Agora, seus dados de acesso</Text>
                <Text style={styles.sectionDescription}>
                    Informe o e-mail e crie uma senha para entrar na sua conta.
                </Text>
            </View>

            <View style={styles.formBlock}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-mail</Text>
                    <TextInput
                        ref={emailInputRef}
                        style={[styles.input, emailError ? styles.inputError : null]}
                        placeholder="seuemail@exemplo.com"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError("");
                        }}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                    {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Senha</Text>
                    <View
                        style={[
                            styles.passwordInputWrapper,
                            passwordError ? styles.passwordInputWrapperError : null,
                        ]}
                    >
                        <TextInput
                            ref={passwordInputRef}
                            style={styles.passwordInput}
                            placeholder="Crie uma senha segura"
                            placeholderTextColor="#A0A0A0"
                            secureTextEntry={!passwordVisibility}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password-new"
                            textContentType="newPassword"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError("");
                            }}
                            onSubmitEditing={handleNextFromCredentials}
                            returnKeyType="next"
                        />

                        <TouchableOpacity
                            onPress={() => setPasswordVisibility((prev) => !prev)}
                            activeOpacity={0.7}
                            style={styles.passwordToggle}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={passwordVisibility ? "eye-off-outline" : "eye-outline"}
                                size={18}
                                color="#666666"
                            />
                        </TouchableOpacity>
                    </View>
                    {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                </View>
            </View>
        </View>
    );

    const renderContactStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.stepBadge}>Passo 3 de 3</Text>
                <Text style={styles.sectionTitle}>Por fim, seus dados de contato</Text>
                <Text style={styles.sectionDescription}>
                    Precisamos dessas informações para concluir seu cadastro com segurança.
                </Text>
            </View>

            <View style={styles.formBlock}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Telefone</Text>
                    <TextInput
                        ref={phoneInputRef}
                        style={[styles.input, phoneError ? styles.inputError : null]}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(formatPhone(text));
                            if (phoneError) setPhoneError("");
                        }}
                        onSubmitEditing={() => cpfInputRef.current?.focus()}
                        returnKeyType="next"
                    />
                    {!!phoneError && <Text style={styles.errorText}>{phoneError}</Text>}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CPF</Text>
                    <TextInput
                        ref={cpfInputRef}
                        style={[styles.input, cpfError ? styles.inputError : null]}
                        placeholder="000.000.000-00"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={cpf}
                        onChangeText={(text) => {
                            setCpf(formatCpf(text));
                            if (cpfError) setCpfError("");
                        }}
                        onSubmitEditing={handleCreateAccount}
                        returnKeyType="done"
                    />
                    {!!cpfError && <Text style={styles.errorText}>{cpfError}</Text>}
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.changeEmailButton}
                    onPress={() => animateStepChange("credentials")}
                >
                    <Text style={styles.changeEmailText}>Alterar e-mail e senha</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBottomActions = () => {
        if (step === "name") {
            return (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        activeOpacity={0.78}
                        style={styles.bottomSecondaryButton}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.bottomSecondaryButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={[
                            styles.bottomPrimaryButton,
                            !name.trim() && styles.bottomPrimaryButtonDisabled,
                        ]}
                        onPress={handleNextFromName}
                        disabled={!name.trim()}
                    >
                        <LinearGradient
                            colors={name.trim() ? ["#141414", "#242424"] : ["#D5D5D5", "#E3E3E3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bottomPrimaryGradient}
                        >
                            <Text style={styles.bottomPrimaryButtonText}>Continuar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            );
        }

        if (step === "credentials") {
            return (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        activeOpacity={0.78}
                        style={styles.bottomSecondaryButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.bottomSecondaryButtonText}>Voltar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={[
                            styles.bottomPrimaryButton,
                            (!email.trim() || !password.trim()) && styles.bottomPrimaryButtonDisabled,
                        ]}
                        onPress={handleNextFromCredentials}
                        disabled={!email.trim() || !password.trim()}
                    >
                        <LinearGradient
                            colors={
                                email.trim() && password.trim()
                                    ? ["#141414", "#242424"]
                                    : ["#D5D5D5", "#E3E3E3"]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bottomPrimaryGradient}
                        >
                            <Text style={styles.bottomPrimaryButtonText}>Continuar</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    activeOpacity={0.78}
                    style={styles.bottomSecondaryButton}
                    onPress={handleBack}
                    disabled={loading}
                >
                    <Text style={styles.bottomSecondaryButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.88}
                    style={[
                        styles.bottomPrimaryButton,
                        (!phone.trim() || !cpf.trim() || loading) && styles.bottomPrimaryButtonDisabled,
                    ]}
                    onPress={handleCreateAccount}
                    disabled={!phone.trim() || !cpf.trim() || loading}
                >
                    <LinearGradient
                        colors={
                            phone.trim() && cpf.trim() && !loading
                                ? ["#141414", "#242424"]
                                : ["#D5D5D5", "#E3E3E3"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.bottomPrimaryGradient}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.bottomPrimaryButtonText}>Criar conta</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={"padding"}
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                            },
                        ]}
                    >
                        {renderHeader()}

                        <View style={styles.mainContent}>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressTrack}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${progress * 100}%` },
                                        ]}
                                    />
                                </View>
                            </View>

                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                {step === "name" && renderNameStep()}
                                {step === "credentials" && renderCredentialsStep()}
                                {step === "contact" && renderContactStep()}
                            </ScrollView>
                        </View>

                        {renderBottomActions()}
                    </Animated.View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },

    container: {
        flex: 1,
    },

    content: {
        flex: 1,
        paddingHorizontal: 24,
    },

    header: {
        paddingTop: Platform.OS === "ios" ? 16 : 24,
        paddingBottom: 18,
    },

    headerContent: {
        alignItems: "center",
    },

    eyebrow: {
        fontSize: 12,
        color: "#8B8B8B",
        marginBottom: 8,
        fontFamily: "Righteous",
        letterSpacing: 1,
        textTransform: "uppercase",
    },

    title: {
        fontFamily: "Righteous",
        fontSize: 28,
        color: "#111111",
        marginBottom: 10,
        letterSpacing: -0.4,
        textAlign: "center",
    },

    subtitle: {
        fontSize: 14,
        color: "#6A6A6A",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 10,
        fontFamily: "Righteous",
    },

    mainContent: {
        flex: 1,
    },

    progressContainer: {
        marginBottom: 16,
    },

    progressTrack: {
        width: "100%",
        height: 3,
        borderRadius: 999,
        backgroundColor: "#EFEFEF",
        overflow: "hidden",
    },

    progressFill: {
        height: "100%",
        backgroundColor: "#1A1A1A",
        borderRadius: 999,
    },

    scrollContent: {
        flexGrow: 1,
        paddingBottom: 16,
    },

    stepContent: {
        flexGrow: 1,
        justifyContent: "space-between",
        paddingTop: 8,
    },

    stepBadge: {
        fontSize: 12,
        color: "#8D8D8D",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 12,
        fontFamily: "Righteous",
    },

    sectionTitle: {
        fontFamily: "Righteous",
        fontSize: 26,
        color: "#111111",
        marginBottom: 8,
        letterSpacing: -0.4,
    },

    sectionDescription: {
        fontSize: 15,
        color: "#666666",
        lineHeight: 22,
        fontFamily: "Righteous",
    },

    formBlock: {
        marginTop: 30,
    },

    inputContainer: {
        marginBottom: 18,
    },

    inputLabel: {
        fontFamily: "Righteous",
        fontSize: 14,
        color: "#444444",
        marginBottom: 12,
    },

    input: {
        height: 48,
        fontSize: 16,
        color: "#111111",
        borderBottomWidth: 1.5,
        borderBottomColor: "#E2E2E2",
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontFamily: "Righteous",
    },

    inputError: {
        borderBottomColor: "#D93A49",
    },

    passwordInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        height: 48,
        borderBottomWidth: 1.5,
        borderBottomColor: "#E2E2E2",
    },

    passwordInputWrapperError: {
        borderBottomColor: "#D93A49",
    },

    passwordInput: {
        flex: 1,
        height: "100%",
        fontSize: 16,
        color: "#111111",
        paddingHorizontal: 0,
        paddingVertical: 0,
        fontFamily: "Righteous",
    },

    passwordToggle: {
        height: 48,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: 12,
        paddingRight: 2,
    },

    errorText: {
        marginTop: 8,
        fontSize: 13,
        color: "#D93A49",
        lineHeight: 18,
        fontFamily: "Righteous",
    },

    emailHighlight: {
        fontFamily: "Righteous",
        color: "#111111",
    },

    changeEmailButton: {
        alignSelf: "flex-start",
        marginTop: 4,
    },

    changeEmailText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#666666",
    },

    bottomBar: {
        paddingTop: 10,
        paddingBottom: Platform.OS === "ios" ? 8 : 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        backgroundColor: "#FFFFFF",
    },

    bottomSecondaryButton: {
        height: 36,
        minWidth: 74,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "#F4F4F4",
    },

    bottomSecondaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#555555",
    },

    bottomPrimaryButton: {
        flex: 1,
        height: 36,
        borderRadius: 10,
        overflow: "hidden",
    },

    bottomPrimaryButtonDisabled: {
        opacity: 0.65,
    },

    bottomPrimaryGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
    },

    bottomPrimaryButtonText: {
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },
}); 