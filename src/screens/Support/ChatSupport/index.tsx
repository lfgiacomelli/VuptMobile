import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    useNavigation,
    useRoute,
    useFocusEffect,
} from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { api } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import useRighteousFont from "../../../hooks/useFont";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

type MessageItem = {
    msg_codigo: number;
    sup_codigo: number;
    remetente_tipo: "usuario" | "atendente" | "sistema";
    remetente_codigo: number | null;
    msg_texto: string;
    msg_lida: number;
    created_at: string;
    updated_at: string;
};

type RouteParams = {
    sup_codigo: number;
};

const { width } = Dimensions.get("window");
const MAX_BUBBLE_WIDTH = Math.min(width * 0.78, 340);

export function ChatSupport() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();

    const { user } = useAuth();
    const { showToast } = useToast();
    const fontLoaded = useRighteousFont();

    const sup_codigo = route?.params?.sup_codigo as number | undefined;

    const flatListRef = useRef<FlatList<MessageItem>>(null);
    const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);
    const firstLoadDoneRef = useRef(false);

    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [hasLoadError, setHasLoadError] = useState(false);

    const trimmedMessage = inputMessage.trim();

    const isSendDisabled = useMemo(() => {
        return !trimmedMessage || sending || !sup_codigo;
    }, [trimmedMessage, sending, sup_codigo]);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const scrollToBottom = useCallback((animated = true) => {
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToEnd({ animated });
        });
    }, []);

    const sortMessages = useCallback((list: MessageItem[]) => {
        return [...list].sort(
            (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, []);

    const safelySetMessages = useCallback(
        (incomingMessages: MessageItem[]) => {
            const sortedMessages = sortMessages(incomingMessages);

            setMessages((prev) => {
                if (!prev.length) return sortedMessages;
                if (!sortedMessages.length) return [];

                const prevLast = prev[prev.length - 1]?.msg_codigo;
                const nextLast =
                    sortedMessages[sortedMessages.length - 1]?.msg_codigo;

                if (
                    prev.length === sortedMessages.length &&
                    prevLast === nextLast
                ) {
                    return prev;
                }

                return sortedMessages;
            });
        },
        [sortMessages]
    );

    const markMessagesAsRead = useCallback(async () => {
        if (!sup_codigo) return;

        try {
            await api.patch(`/support-messages/read/${sup_codigo}`, {
                remetente_tipo: "usuario",
            });
        } catch (error) {
            console.log("Erro ao marcar mensagens como lidas:", error);
        }
    }, [sup_codigo]);

    const loadMessages = useCallback(
        async (isRefresh = false, silent = false) => {
            if (!sup_codigo) {
                setLoading(false);
                setRefreshing(false);
                setHasLoadError(true);

                if (!silent) {
                    showToast({
                        title: "Código do chamado não informado.",
                        status: "error",
                    });
                }
                return;
            }

            if (isFetchingRef.current) return;

            try {
                isFetchingRef.current = true;
                setHasLoadError(false);

                if (isRefresh) {
                    setRefreshing(true);
                } else if (!silent) {
                    setLoading(true);
                }

                const response = await api.get(
                    `/support-messages/support/${sup_codigo}`
                );

                const data: MessageItem[] = response?.data?.data || [];

                if (!mountedRef.current) return;

                safelySetMessages(data);

                if (data.length > 0) {
                    await markMessagesAsRead();
                }

                if (!firstLoadDoneRef.current) {
                    firstLoadDoneRef.current = true;
                    setTimeout(() => scrollToBottom(false), 150);
                }
            } catch (error: any) {
                console.log("Erro ao buscar mensagens:", error);
                console.log("Status:", error?.response?.status);
                console.log("Data:", error?.response?.data);

                if (!mountedRef.current) return;

                setHasLoadError(true);

                if (!silent) {
                    showToast({
                        title:
                            error?.response?.data?.error ||
                            error?.response?.data?.message ||
                            "Não foi possível carregar o chat.",
                        status: "error",
                    });
                }
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
                isFetchingRef.current = false;
            }
        },
        [
            markMessagesAsRead,
            safelySetMessages,
            scrollToBottom,
            showToast,
            sup_codigo,
        ]
    );

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        stopPolling();

        pollingRef.current = setInterval(() => {
            loadMessages(false, true);
        }, 4000);
    }, [loadMessages, stopPolling]);

    useFocusEffect(
        useCallback(() => {
            loadMessages(false, false);
            startPolling();

            return () => {
                stopPolling();
            };
        }, [loadMessages, startPolling, stopPolling])
    );

    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const handleRefresh = useCallback(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await loadMessages(true, false);
    }, [loadMessages]);

    const handleSendMessage = useCallback(async () => {
        if (!trimmedMessage || sending || !user?.usu_codigo || !sup_codigo) {
            return;
        }

        try {
            setSending(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const response = await api.post("/support-messages", {
                sup_codigo,
                remetente_tipo: "usuario",
                remetente_codigo: user.usu_codigo,
                msg_texto: trimmedMessage,
            });

            const createdMessage: MessageItem | undefined = response?.data?.data;

            if (createdMessage) {
                setMessages((prev) => {
                    const exists = prev.some(
                        (item) => item.msg_codigo === createdMessage.msg_codigo
                    );

                    if (exists) return prev;

                    return sortMessages([...prev, createdMessage]);
                });
            }

            setInputMessage("");
            setTimeout(() => scrollToBottom(true), 80);
        } catch (error: any) {
            console.log("Erro ao enviar mensagem:", error);

            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Não foi possível enviar sua mensagem.";

            showToast({
                title: message,
                status: "error",
            });
        } finally {
            setSending(false);
        }
    }, [
        trimmedMessage,
        sending,
        user?.usu_codigo,
        sup_codigo,
        sortMessages,
        scrollToBottom,
        showToast,
    ]);

    const formatMessageTime = useCallback((date: string) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, []);

    const formatDayLabel = useCallback((date: string) => {
        if (!date) return "";

        const current = new Date(date);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        const currentDate = current.toLocaleDateString("pt-BR");
        const todayDate = today.toLocaleDateString("pt-BR");
        const yesterdayDate = yesterday.toLocaleDateString("pt-BR");

        if (currentDate === todayDate) return "Hoje";
        if (currentDate === yesterdayDate) return "Ontem";

        return current.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }, []);

    const shouldShowDateSeparator = useCallback(
        (current: MessageItem, previous?: MessageItem) => {
            if (!previous) return true;

            const currentDate = new Date(current.created_at).toLocaleDateString(
                "pt-BR"
            );
            const previousDate = new Date(
                previous.created_at
            ).toLocaleDateString("pt-BR");

            return currentDate !== previousDate;
        },
        []
    );

    const renderItem = useCallback(
        ({ item, index }: { item: MessageItem; index: number }) => {
            const previousMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(
                item,
                previousMessage
            );

            const isMine = item.remetente_tipo === "usuario";
            const isSystem = item.remetente_tipo === "sistema";

            if (isSystem) {
                return (
                    <View>
                        {showDateSeparator && (
                            <View style={styles.dateSeparatorWrapper}>
                                <View style={styles.dateSeparatorLine} />
                                <Text style={styles.dateSeparatorText}>
                                    {formatDayLabel(item.created_at)}
                                </Text>
                                <View style={styles.dateSeparatorLine} />
                            </View>
                        )}

                        <View style={styles.systemMessageWrapper}>
                            <Text style={styles.systemMessageText}>
                                {item.msg_texto}
                            </Text>
                        </View>
                    </View>
                );
            }

            return (
                <View>
                    {showDateSeparator && (
                        <View style={styles.dateSeparatorWrapper}>
                            <View style={styles.dateSeparatorLine} />
                            <Text style={styles.dateSeparatorText}>
                                {formatDayLabel(item.created_at)}
                            </Text>
                            <View style={styles.dateSeparatorLine} />
                        </View>
                    )}

                    <View
                        style={[
                            styles.messageRow,
                            isMine ? styles.messageRowMine : styles.messageRowOther,
                        ]}
                    >
                        {!isMine && (
                            <View style={styles.avatarWrapper}>
                                <MaterialIcons
                                    name="support-agent"
                                    size={18}
                                    color="#111827"
                                />
                            </View>
                        )}

                        <View
                            style={[
                                styles.messageBubble,
                                isMine
                                    ? styles.messageBubbleMine
                                    : styles.messageBubbleOther,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.messageText,
                                    isMine
                                        ? styles.messageTextMine
                                        : styles.messageTextOther,
                                ]}
                            >
                                {item.msg_texto}
                            </Text>

                            <View style={styles.messageMetaRow}>
                                <Text
                                    style={[
                                        styles.messageTime,
                                        isMine
                                            ? styles.messageTimeMine
                                            : styles.messageTimeOther,
                                    ]}
                                >
                                    {formatMessageTime(item.created_at)}
                                </Text>

                                {isMine && (
                                    <Ionicons
                                        name={
                                            item.msg_lida
                                                ? "checkmark-done"
                                                : "checkmark"
                                        }
                                        size={14}
                                        color={
                                            item.msg_lida ? "#D1FAE5" : "#E5E7EB"
                                        }
                                        style={styles.messageCheckIcon}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            );
        },
        [
            formatDayLabel,
            formatMessageTime,
            messages,
            shouldShowDateSeparator,
        ]
    );

    const EmptyState = useMemo(() => {
        if (hasLoadError) {
            return (
                <View style={styles.emptyWrapper}>
                    <View style={styles.emptyIconBox}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={30}
                            color="#111827"
                        />
                    </View>

                    <Text style={styles.emptyTitle}>
                        Não foi possível carregar a conversa
                    </Text>

                    <Text style={styles.emptySubtitle}>
                        Verifique sua conexão e tente atualizar novamente.
                    </Text>

                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.retryButton}
                        onPress={handleRefresh}
                    >
                        <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.emptyWrapper}>
                <View style={styles.emptyIconBox}>
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={30}
                        color="#111827"
                    />
                </View>

                <Text style={styles.emptyTitle}>Nenhuma mensagem ainda</Text>

                <Text style={styles.emptySubtitle}>
                    Assim que você enviar uma mensagem, a conversa deste chamado
                    aparecerá aqui.
                </Text>
            </View>
        );
    }, [handleRefresh, hasLoadError]);

    if (!fontLoaded) {
        return (
            <View style={styles.centeredState}>
                <ActivityIndicator size="large" color="#111827" />
            </View>
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Chat do suporte</Text>
                        <Text style={styles.headerSubtitle}>
                            Chamado #{sup_codigo ?? "--"}
                        </Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.centeredState}>
                    <ActivityIndicator size="large" color="#111827" />
                    <Text style={styles.loadingText}>Carregando conversa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={20} color="#111827" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Chat do suporte</Text>
                        <Text style={styles.headerSubtitle}>
                            Chamado #{sup_codigo ?? "--"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleRefresh}
                        style={styles.refreshButton}
                    >
                        <Ionicons name="refresh-outline" size={18} color="#111827" />
                    </TouchableOpacity>
                </View>

                <View style={styles.topInfoBar}>
                    <View style={styles.topInfoDot} />
                    <Text style={styles.topInfoText}>
                        Conversa sincronizada automaticamente
                    </Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item) => String(item.msg_codigo)}
                    renderItem={renderItem}
                    contentContainerStyle={[
                        styles.listContent,
                        messages.length === 0 && styles.listContentEmpty,
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={EmptyState}
                    onContentSizeChange={() => {
                        if (messages.length > 0) {
                            scrollToBottom(true);
                        }
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor="#111827"
                        />
                    }
                />

                <View
                    style={[
                        styles.inputContainer,
                        { paddingBottom: Math.max(insets.bottom, 10) },
                    ]}
                >
                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={inputMessage}
                            onChangeText={setInputMessage}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#9CA3AF"
                            style={styles.input}
                            multiline
                            textAlignVertical="top"
                            maxLength={500}
                        />

                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={[
                                styles.sendButton,
                                isSendDisabled && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSendMessage}
                            disabled={isSendDisabled}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Ionicons name="send" size={18} color="#FFFFFF" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputFooter}>
                        <Text style={styles.inputFooterText}>
                            {trimmedMessage.length}/500 caracteres
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },

    keyboard: {
        flex: 1,
    },

    centeredState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
    },

    header: {
        minHeight: 74,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },

    refreshButton: {
        width: 42,
        height: 42,
        borderRadius: 14,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
    },

    headerSpacer: {
        width: 42,
        height: 42,
    },

    headerCenter: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },

    headerTitle: {
        fontSize: 17,
        fontFamily: "Righteous",
        color: "#111827",
        textAlign: "center",
    },

    headerSubtitle: {
        marginTop: 2,
        fontSize: 11,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
    },

    topInfoBar: {
        minHeight: 38,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },

    topInfoDot: {
        width: 8,
        height: 8,
        borderRadius: 999,
        backgroundColor: "#10B981",
        marginRight: 8,
    },

    topInfoText: {
        flexShrink: 1,
        fontSize: 11,
        lineHeight: 16,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
    },

    listContent: {
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 14,
    },

    listContentEmpty: {
        flexGrow: 1,
        justifyContent: "center",
    },

    emptyWrapper: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 28,
    },

    emptyIconBox: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },

    emptyTitle: {
        fontSize: 18,
        fontFamily: "Righteous",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
    },

    emptySubtitle: {
        fontSize: 12,
        lineHeight: 20,
        fontFamily: "Righteous",
        color: "#6B7280",
        textAlign: "center",
    },

    retryButton: {
        marginTop: 18,
        height: 46,
        borderRadius: 16,
        backgroundColor: "#111827",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    retryButtonText: {
        marginLeft: 8,
        fontSize: 13,
        fontFamily: "Righteous",
        color: "#FFFFFF",
    },

    dateSeparatorWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 14,
    },

    dateSeparatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E5E7EB",
    },

    dateSeparatorText: {
        marginHorizontal: 10,
        fontSize: 10,
        fontFamily: "Righteous",
        color: "#9CA3AF",
    },

    messageRow: {
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "flex-end",
    },

    messageRowMine: {
        justifyContent: "flex-end",
    },

    messageRowOther: {
        justifyContent: "flex-start",
    },

    avatarWrapper: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },

    messageBubble: {
        maxWidth: MAX_BUBBLE_WIDTH,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    messageBubbleMine: {
        backgroundColor: "#111827",
        borderBottomRightRadius: 8,
    },

    messageBubbleOther: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderBottomLeftRadius: 8,
    },

    messageText: {
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "Righteous",
    },

    messageTextMine: {
        color: "#FFFFFF",
    },

    messageTextOther: {
        color: "#111827",
    },

    messageMetaRow: {
        marginTop: 6,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },

    messageTime: {
        fontSize: 10,
        fontFamily: "Righteous",
    },

    messageTimeMine: {
        color: "#E5E7EB",
    },

    messageTimeOther: {
        color: "#9CA3AF",
    },

    messageCheckIcon: {
        marginLeft: 4,
    },

    systemMessageWrapper: {
        alignSelf: "center",
        maxWidth: width * 0.86,
        backgroundColor: "#EEF2FF",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },

    systemMessageText: {
        fontSize: 11,
        lineHeight: 16,
        fontFamily: "Righteous",
        color: "#4F46E5",
        textAlign: "center",
    },

    inputContainer: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingHorizontal: 14,
        paddingTop: 12,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
    },

    input: {
        flex: 1,
        minHeight: 50,
        maxHeight: 130,
        borderRadius: 18,
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "Righteous",
        color: "#111827",
    },

    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 18,
        backgroundColor: "#111827",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 10,
    },

    sendButtonDisabled: {
        opacity: 0.45,
    },

    inputFooter: {
        marginTop: 8,
        alignItems: "flex-end",
        paddingRight: 2,
    },

    inputFooterText: {
        fontSize: 10,
        fontFamily: "Righteous",
        color: "#9CA3AF",
    },
});