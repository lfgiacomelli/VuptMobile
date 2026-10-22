import React, { useMemo, useRef, useState, useEffect } from "react";
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
    Button,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";
import useRighteousFont from "../../hooks/useFont";
import LottieView from "lottie-react-native";

import loadingAnimation from "../../assets/animations/loadingAnimation.json";
import { PartnersCarousel } from "../../components/PartnersCarousel";


type Step = "initial" | "email" | "password";

export function Login() {
    const fontLoaded = useRighteousFont();
    const { showToast } = useToast();
    const navigation = useNavigation<any>();
    const { signInUser } = useAuth();

    const [step, setStep] = useState<Step>("initial");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const lottieRef = useRef<LottieView>(null);


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
                toValue: nextStep === "initial" ? 1 : 0.45,
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
                if (nextStep === "email") {
                    emailInputRef.current?.focus();
                }

                if (nextStep === "password") {
                    passwordInputRef.current?.focus();
                }
            });
        });
    }

    function validateEmail(value: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    function handleGoToEmailStep() {
        setEmailError("");
        setPasswordError("");
        animateStepChange("email");
    }

    function handleValidateEmail() {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setEmailError("Informe seu e-mail.");
            return;
        }

        if (!validateEmail(trimmedEmail)) {
            setEmailError("Digite um e-mail válido.");
            return;
        }

        setEmailError("");
        animateStepChange("password");
    }

    async function handleLogin() {
        const trimmedEmail = email.trim();
        let hasError = false;

        if (!trimmedEmail) {
            setEmailError("Informe seu e-mail.");
            hasError = true;
        } else if (!validateEmail(trimmedEmail)) {
            setEmailError("Digite um e-mail válido.");
            hasError = true;
        } else {
            setEmailError("");
        }

        if (!password.trim()) {
            setPasswordError("Informe sua senha.");
            hasError = true;
        } else {
            setPasswordError("");
        }

        if (hasError) return;

        try {
            setLoading(true);
            await signInUser(trimmedEmail, password);
        } catch (error) {
            setPasswordError("Não foi possível entrar com essas credenciais.");
            showToast({
                title: "Email ou senha inválidos",
                status: "error",
                subtitle: "Verifique e tente novamente"
            });
        } finally {
            setLoading(false);
        }
    }

    function handleBack() {
        if (step === "password") {
            setPasswordError("");
            animateStepChange("email");
            return;
        }

        if (step === "email") {
            setEmailError("");
            animateStepChange("initial");
        }
    }

    const progress = useMemo(() => {
        if (step === "email") return 0.5;
        if (step === "password") return 1;
        return 0;
    }, [step]);


    if (!fontLoaded) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", alignContent: "center" }}>
                    <Image source={require("../../assets/images/vupt.png")} style={{ width: 200, height: 300 }} />
                    <LottieView
                        ref={lottieRef}
                        source={loadingAnimation}
                        autoPlay
                        loop
                        style={{ width: 220, height: 220 }}
                    />
                    <Text style={styles.subtitle}>Estamos preparando tudo para o seu login!</Text>
                </View>
            </SafeAreaView>
        )
    }
    const renderHeader = () => (
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View style={styles.headerContent}>
                <Text style={styles.eyebrow}>Acesso</Text>
                <Text style={styles.title}>Entre ou crie sua conta</Text>
                <Text style={styles.subtitle}>
                    Solicite corridas hoje mesmo!
                </Text>
            </View>
        </Animated.View>
    );

    const renderInitialStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.sectionTitle}>Como deseja continuar?</Text>
                <Text style={styles.sectionDescription}>
                    Escolha uma opção para acessar sua conta ou iniciar seu cadastro.
                </Text>
            </View>

            <View style={styles.cardsWrapper}>
                <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.cardTouchable}
                    onPress={handleGoToEmailStep}
                >
                    <LinearGradient
                        colors={["#141414", "#242424"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryCard}
                    >
                        <View style={styles.cardIcon}>
                            <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                        </View>

                        <Text style={styles.primaryCardTitle}>Entrar</Text>
                        <Text style={styles.primaryCardDescription}>
                            Acesse sua conta para continuar.
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.cardTouchable}
                    onPress={() => navigation.navigate("SignUp")}
                >
                    <View style={styles.secondaryCard}>
                        <View style={[styles.cardIcon, styles.secondaryCardIcon]}>
                            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                        </View>

                        <Text style={styles.secondaryCardTitle}>Criar conta</Text>
                        <Text style={styles.secondaryCardDescription}>
                            Faça seu cadastro e comece agora.
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.aboutMiniTouchable}
                    onPress={() => navigation.navigate("AboutApp")}
                >
                    <LinearGradient
                        colors={["#161616", "#0F0F0F"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aboutMiniCard}
                    >
                        <View style={styles.aboutMiniContent}>
                            <View style={styles.aboutMiniIcon}>
                                <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
                            </View>

                            <Text style={styles.aboutMiniText}>
                                Conheça sobre o aplicativo
                            </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={16} color="#6E6E6E" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmailStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.stepBadge}>Passo 1 de 2</Text>
                <Text style={styles.sectionTitle}>Informe seu e-mail</Text>
                <Text style={styles.sectionDescription}>
                    Digite o endereço de e-mail vinculado à sua conta.
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
                        onSubmitEditing={handleValidateEmail}
                        returnKeyType="next"
                        blurOnSubmit={false}
                    />
                    {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
                </View>
            </View>
        </View>
    );

    const renderPasswordStep = () => (
        <View style={styles.stepContent}>
            <View>
                <Text style={styles.stepBadge}>Passo 2 de 2</Text>
                <Text style={styles.sectionTitle}>Digite sua senha</Text>
                <Text style={styles.sectionDescription}>
                    Acesso com <Text style={styles.emailHighlight}>{email.trim()}</Text>
                </Text>
            </View>

            <View style={styles.formBlock}>
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
                            placeholder="Digite sua senha"
                            placeholderTextColor="#A0A0A0"
                            secureTextEntry={!passwordVisibility}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError("");
                            }}
                            onSubmitEditing={handleLogin}
                            returnKeyType="done"
                        />

                        <TouchableOpacity
                            onPress={() => setPasswordVisibility((prev) => !prev)}
                            activeOpacity={0.7}
                            style={styles.passwordToggle}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={passwordVisibility ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#666666"
                            />
                        </TouchableOpacity>
                    </View>

                    {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
                </View>

                <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.changeEmailButton}
                    onPress={() => animateStepChange("email")}
                >
                    <Text style={styles.changeEmailText}>Alterar e-mail</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderBottomActions = () => {
        if (step === "initial") {
            return null;
        }

        if (step === "email") {
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
                            !email.trim() && styles.bottomPrimaryButtonDisabled,
                        ]}
                        onPress={handleValidateEmail}
                        disabled={!email.trim()}
                    >
                        <LinearGradient
                            colors={email.trim() ? ["#141414", "#242424"] : ["#D5D5D5", "#E3E3E3"]}
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
                        (!password.trim() || loading) && styles.bottomPrimaryButtonDisabled,
                    ]}
                    onPress={handleLogin}
                    disabled={!password.trim() || loading}
                >
                    <LinearGradient
                        colors={
                            password.trim() && !loading
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
                            <Text style={styles.bottomPrimaryButtonText}>Entrar</Text>
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
                                {step === "initial" && renderInitialStep()}
                                {step === "email" && renderEmailStep()}
                                {step === "password" && renderPasswordStep()}
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
    cardsWrapper: {
        marginTop: 24,
        gap: 12,
    },
    cardTouchable: {
    },
    primaryCard: {
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 20,
        minHeight: 132,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 3,
    },
    secondaryCard: {
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 20,
        minHeight: 132,
        justifyContent: "center",
        backgroundColor: "#FAFAFA",
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },
    cardIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: "rgba(255,255,255,0.16)",
    },
    secondaryCardIcon: {
        backgroundColor: "#111111",
    },
    primaryCardTitle: {
        fontSize: 20,
        fontFamily: "Righteous",
        color: "#FFFFFF",
        marginBottom: 6,
    },
    primaryCardDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: "rgba(255,255,255,0.82)",
    },
    secondaryCardTitle: {
        fontSize: 20,
        fontFamily: "Righteous",
        color: "#111111",
        marginBottom: 6,
    },
    secondaryCardDescription: {
        fontSize: 14,
        lineHeight: 20,
        color: "#666666",
    },
    stepBadge: {
        fontSize: 12,
        color: "#8D8D8D",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 12,
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
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 8 : 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        backgroundColor: "#FFFFFF",
    },
    bottomSecondaryButton: {
        height: 38,
        minWidth: 76,
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
        height: 38,
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
        fontSize: 14,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },
    aboutMiniTouchable: {
        marginTop: 10,
    },

    aboutMiniCard: {
        height: 54,
        borderRadius: 16,
        paddingHorizontal: 14,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
    },

    aboutMiniContent: {
        flexDirection: "row",
        alignItems: "center",
    },

    aboutMiniIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.06)",
        alignItems: "center",
        justifyContent: "center",
    },

    aboutMiniText: {
        color: "#EAEAEA",
        marginLeft: 10,
        fontSize: 13,
        fontFamily: "Righteous",
        letterSpacing: 0.3,
    },
});