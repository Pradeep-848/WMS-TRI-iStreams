import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
    TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatSoapTimeOnly, formatSoapDateonly } from '../Utils/dataTimeUtils';
import { useFocusEffect } from '@react-navigation/native';
import BackgroundGradient from '../Components/BackgroundGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatDetailScreen = ({ route, navigation }) => {
    const { chat } = route.params;
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const inputRef = useRef(null);
    const insets = useSafeAreaInsets();

    // State management
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Refs
    const flatListRef = useRef(null);
    const intervalRef = useRef(null);
    const lastMessageCountRef = useRef(0);
    const messagesMapRef = useRef(new Map());
    const scrollTimeoutRef = useRef(null);
    const isActiveRef = useRef(true);

    // Scroll state - simplified
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    useEffect(() => {
        initializeChat();
        return () => {
            clearPolling();
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    useFocusEffect(
        useCallback(() => {
            isActiveRef.current = true;
            startPolling();
            return () => {
                isActiveRef.current = false;
                clearPolling();
            };
        }, [])
    );

    const initializeChat = async () => {
        await Promise.all([
            GetAllSpecificUserMsg(),
            UpdateViewStatus()
        ]);
        setInitialLoading(false);
    };

    const startPolling = useCallback(() => {
        clearPolling();
        // Use shorter interval for active chat, longer for background
        const interval = isActiveRef.current ? 5000 : 15000;
        intervalRef.current = setInterval(() => {
            if (isActiveRef.current && !loading && !sending) {
                GetAllSpecificUserMsg();
            }
        }, interval);
    }, [loading, sending]);

    const clearPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const UpdateViewStatus = useCallback(async () => {
        try {
            const updateFromStatusParams = {
                LoginUser: chat.name,
                AssignedUser: userData.userName
            };

            const updateToStatusParams = {
                LoginUser: userData.userName,
                AssignedUser: chat.name
            };

            await callSoapService(
                userData.clientURL,
                "IM_UpdateUnread_MessagesToRead_ForUser",
                updateFromStatusParams
            );

            await callSoapService(
                userData.clientURL,
                "IM_UpdateUnread_MessagesToRead_ForUser",
                updateToStatusParams
            );

            setMessages(prev =>
                prev.map(msg =>
                    msg.sent ? { ...msg, status: "read" } : msg
                )
            );
        } catch (e) {
            console.log("Error updating status:", e);
        }
    }, [userData.userName, chat.name, userData.clientURL]);

    // Optimized scroll to end
    const scrollToEnd = useCallback((animated = true) => {
        if (!flatListRef.current || !shouldAutoScroll) return;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            try {
                flatListRef.current?.scrollToEnd({ animated });
            } catch (error) {
                console.log('Scroll error:', error);
            }
        }, animated ? 100 : 0);
    }, [shouldAutoScroll]);

    // Optimized message sending
    const handleSendMessage = useCallback(async () => {
        const messageText = newMessage.trim();
        if (!messageText || sending) return;

        setSending(true);
        setNewMessage(''); // Clear immediately for better UX

        // Create optimistic message
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            text: messageText,
            timestamp: formatSoapTimeOnly(`/Date(${Date.now()})/`),
            date: formatSoapDateonly(`/Date(${Date.now()})/`),
            rawTimestamp: Date.now(),
            sent: true,
            senderAvatar: userData.userName?.charAt(0).toUpperCase() || "?",
            type: "text",
            pending: true,
            status: "sent"
        };

        // Add optimistic message
        setMessages(prev => [...prev, optimisticMessage]);
        scrollToEnd(true);

        try {
            const userSendMsgParams = {
                UserName: userData.userName,
                ToUserName: chat.name,
                Message: messageText,
                MessageInfo: messageText,
            };

            const result = await callSoapService(
                userData.clientURL,
                'IM_Send_Message_To',
                userSendMsgParams
            );

            if (result === "SENT") {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === optimisticMessage.id
                            ? { ...msg, pending: false, status: "delivered" }
                            : msg
                    )
                );
                await GetAllSpecificUserMsg();
            } else {
                // Handle send failure
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
                setNewMessage(messageText); // Restore message
            }
        } catch (e) {
            console.log("Send error:", e);
            setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
            setNewMessage(messageText); // Restore message
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }, [newMessage, sending, userData.userName, userData.clientURL, chat.name]);

    // Memoized image processing
    const processImageData = useCallback((avatarData) => {
        if (!avatarData) return null;
        if (avatarData.startsWith('data:image')) {
            return avatarData;
        }
        const cleanedData = avatarData.replace(/(\r\n|\n|\r)/gm, "");
        return `data:image/bmp;base64,${cleanedData}`;
    }, []);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    // Optimized Avatar component with better caching
    const AvatarComponent = React.memo(({ emp, style }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const processedUri = useMemo(() => {
            return emp.avatar ? processImageData(emp.avatar) : null;
        }, [emp.avatar]);

        if (processedUri && !imageError) {
            return (
                <View style={style}>
                    {imageLoading && (
                        <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    )}
                    <Image
                        source={{ uri: processedUri }}
                        style={style}
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                            setImageError(true);
                            setImageLoading(false);
                        }}
                        resizeMode="cover"
                    />
                </View>
            );
        }

        const initials = emp.name
            ? emp.name.split(' ').map((w) => w[0]).join('').toUpperCase()
            : '?';

        return (
            <View style={[style, globalStyles.medAvatarFallback]}>
                <Text style={[globalStyles.subtitle_2, globalStyles.clr_primary]}>{initials}</Text>
            </View>
        );
    });

    const DateSeparator = React.memo(({ date }) => (
        <View style={[globalStyles.twoInputContainer1, globalStyles.my_10]}>
            <View style={styles.dateLine} />
            <Text style={[globalStyles.subtitle_3, { color: colors.gray }]}>{date}</Text>
            <View style={styles.dateLine} />
        </View>
    ));

    const FileMessage = React.memo(({ message }) => (
        <TouchableOpacity
            style={[
                globalStyles.twoInputContainer1, globalStyles.borderRadius_15, globalStyles.p_10,
                message.sent ? styles.sentFileContainer : styles.receivedFileContainer,
            ]}
        >
            <Ionicons
                name="document-attach"
                size={28}
                color={message.sent ? "#fff" : "#2563eb"}
            />
            <View style={{ marginLeft: 10 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        color: message.sent ? "#fff" : "#1e293b",
                    }}
                >
                    {message.fileName}
                </Text>
                <Text style={{ fontSize: 12, color: message.sent ? "#e2e8f0" : "#64748b" }}>
                    {message.fileSize}
                </Text>
            </View>
            <Ionicons
                name="download"
                size={20}
                style={globalStyles.mx_5}
                color={message.sent ? "#fff" : "#2563eb"}
            />
        </TouchableOpacity>
    ));

    // Optimized message component
    const MessageComponent = React.memo(({ message, index, showDate, showAvatar }) => {
        return (
            <View>
                {showDate && <DateSeparator date={message.date} />}
                <View style={[
                    globalStyles.twoInputContainer,
                    { alignItems: 'flex-end' },
                    message.sent ? globalStyles.justifyEnd : globalStyles.justifyStart,
                    globalStyles.mt_5
                ]}>
                    {!message.sent && (
                        <View style={globalStyles.mx_10}>
                            {showAvatar ? (
                                <AvatarComponent emp={chat} style={globalStyles.medAvatar} />
                            ) : (
                                <View style={globalStyles.medAvatar} />
                            )}
                        </View>
                    )}
                    <View style={[
                        styles.messageContainer,
                        message.sent
                            ? [globalStyles.justifyStart, globalStyles.px_15,
                            globalStyles.py_10, globalStyles.borderRadius_20, { backgroundColor: colors.primary }]
                            : [globalStyles.justifyStart, globalStyles.px_15,
                            globalStyles.py_10, globalStyles.borderRadius_20, { backgroundColor: colors.lightGray }],
                        message.pending && styles.pendingMessage
                    ]}>
                        {message.type === "file" ? (
                            <FileMessage message={message} />
                        ) : (
                            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                                <Text
                                    style={[
                                        globalStyles.body,
                                        message.sent ? [globalStyles.body, { color: colors.white }] : globalStyles.body,
                                        { flexShrink: 1 },
                                    ]}
                                >
                                    {message.text}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5 }}>
                                    <Text
                                        style={[
                                            globalStyles.subtitle_4,
                                            message.sent ? [globalStyles.small_text, { color: colors.lightGray }] : [globalStyles.small_text, { color: colors.gray }],
                                            { alignSelf: "flex-end", marginBottom: -5 },
                                        ]}
                                    >
                                        {message.timestamp}
                                    </Text>
                                    {message.sent && !message.pending && (
                                        <Ionicons
                                            name={
                                                message.status === "sent"
                                                    ? "checkmark-sharp"        // single tick
                                                    : "checkmark-done-sharp"   // double tick
                                            }
                                            size={17}
                                            style={[globalStyles.ml_5, {
                                                color:
                                                    message.status === "read"
                                                        ? colors.success      // read → blue double tick
                                                        : colors.white,    // delivered → white double tick
                                            }]}
                                        />
                                    )}
                                    {message.pending && (
                                        <ActivityIndicator
                                            size="small"
                                            color={colors.white}
                                            style={{ marginLeft: 4, marginBottom: -3 }}
                                        />
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    });

    // Optimized message fetching with caching
    const GetAllSpecificUserMsg = useCallback(async () => {
        if (loading) return;
        setLoading(true);

        try {
            const specUserMsgParam = {
                FromUserName: userData.userName,
                SentToUserName: chat.name
            };

            const response = await callSoapService(
                userData.clientURL,
                "IM_Get_Specific_User_Messages",
                specUserMsgParam
            );

            // Quick check if messages changed
            if (response.length === lastMessageCountRef.current) {
                setLoading(false);
                return;
            }

            const newMessagesMap = new Map();
            const mapped = response.map((msg) => {
                const createdUser = msg.CREATED_USER?.trim() || "";
                const currentUser = userData.userName?.trim() || "";
                const rawTimestamp = parseInt(msg.CREATED_ON.match(/\d+/)[0]);

                const messageObj = {
                    id: msg.TASK_ID.toString(),
                    text: msg.TASK_INFO,
                    timestamp: formatSoapTimeOnly(msg.CREATED_ON),
                    date: formatSoapDateonly(msg.CREATED_ON),
                    rawTimestamp,
                    sent: createdUser.toUpperCase() === currentUser.toUpperCase(),
                    senderAvatar: createdUser ? createdUser.charAt(0).toUpperCase() : "?",
                    type: "text",
                    status: msg.VIEW_STATUS === "T" ? "read" : "delivered",
                };

                newMessagesMap.set(messageObj.id, messageObj);
                return messageObj;
            });

            // Sort by timestamp
            mapped.sort((a, b) => a.rawTimestamp - b.rawTimestamp);

            // Only update if messages actually changed
            const hasNewMessages = mapped.length > lastMessageCountRef.current;

            setMessages(mapped);
            messagesMapRef.current = newMessagesMap;
            lastMessageCountRef.current = mapped.length;

            // Auto-scroll only for new messages
            if (hasNewMessages && shouldAutoScroll) {
                scrollToEnd(true);
            }

        } catch (error) {
            console.log("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    }, [loading, userData.userName, userData.clientURL, chat.name, shouldAutoScroll]);

    // Optimized item rendering
    const renderMessage = useCallback(({ item, index }) => {
        const showDate = index === 0 || messages[index - 1].date !== item.date;
        const showAvatar = !item.sent && (
            index === messages.length - 1 ||
            messages[index + 1].sent ||
            messages[index + 1].senderAvatar !== item.senderAvatar
        );

        return (
            <MessageComponent
                message={item}
                index={index}
                showDate={showDate}
                showAvatar={showAvatar}
            />
        );
    }, [messages]);

    const keyExtractor = useCallback((item) => item.id, []);

    // Optimized scroll handlers
    const onScrollBeginDrag = useCallback(() => {
        setShouldAutoScroll(false);
    }, []);

    const onScrollEndDrag = useCallback((event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
        if (isNearBottom) {
            setShouldAutoScroll(true);
        }
    }, []);

    const getItemLayout = useCallback((data, index) => {
        const ESTIMATED_ITEM_HEIGHT = 70;
        return {
            length: ESTIMATED_ITEM_HEIGHT,
            offset: ESTIMATED_ITEM_HEIGHT * index,
            index,
        };
    }, []);

    // Memoized loading screen
    const InitialLoadingScreen = React.memo(() => (
        <View style={[globalStyles.flex_1, globalStyles.justalignCenter]}>
            <View style={globalStyles.justalignCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[globalStyles.subtitle_2, globalStyles.mt_10, { color: colors.gray }]}>
                    Loading messages...
                </Text>
            </View>
        </View>
    ));

    return (
        <BackgroundGradient>
            <SafeAreaView style={[globalStyles.pageContainer, { paddingTop: insets.top, paddingHorizontal: 0 }]}>
                {/* Header */}
                <View style={[globalStyles.twoInputContainer1, globalStyles.py_10, { backgroundColor: colors.card }]}>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        style={globalStyles.p_10}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="arrow-back" color={colors.text} size={24} />
                    </TouchableOpacity>

                    <View style={globalStyles.twoInputContainer}>
                        <View style={[styles.smallAvatar, chat?.online && styles.avatarOnline]}>
                            <AvatarComponent emp={chat} style={globalStyles.medAvatar} />
                        </View>
                        <View style={globalStyles.flex_1}>
                            <Text style={globalStyles.subtitle_2} numberOfLines={1}>
                                {chat?.name}
                            </Text>
                            <Text style={globalStyles.content}>
                                {`Last Seen On: ${chat.lastSeen}`}
                            </Text>
                        </View>
                    </View>
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {initialLoading ? (
                        <InitialLoadingScreen />
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            renderItem={renderMessage}
                            keyExtractor={keyExtractor}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={15}
                            windowSize={15}
                            initialNumToRender={25}
                            updateCellsBatchingPeriod={50}
                            contentContainerStyle={
                                messages.length < 5
                                    ? { flexGrow: 1, justifyContent: 'flex-end' }
                                    : { paddingBottom: 20 }
                            }
                            keyboardShouldPersistTaps="handled"
                            getItemLayout={getItemLayout}
                            onScrollBeginDrag={onScrollBeginDrag}
                            onScrollEndDrag={onScrollEndDrag}
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                            }}
                            onContentSizeChange={() => {
                                if (shouldAutoScroll) {
                                    scrollToEnd(false); // Scroll after content is rendered
                                }
                            }}
                        />
                    )}

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            placeholder="Type a message..."
                            placeholderTextColor="#9ca3af"
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={1000}
                            editable={!sending}
                        />
                        <TouchableOpacity
                            onPress={handleSendMessage}
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: newMessage.trim().length > 0 ? colors.blue : colors.background,
                                    opacity: sending ? 0.6 : 1
                                }
                            ]}
                            disabled={newMessage.trim().length === 0 || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size={20} color={colors.text} />
                            ) : (
                                <Feather name="send" size={20} color={newMessage.trim().length > 0 ? colors.white : colors.text} />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundGradient>
    );
};

export default ChatDetailScreen;

const styles = StyleSheet.create({
    smallAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sendButton: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarOnline: {
        borderWidth: 3,
        borderColor: '#10b981',
    },
    dateLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    messageContainer: {
        maxWidth: '80%',
    },
    pendingMessage: {
        opacity: 0.7,
    },
    sentFileContainer: {
        backgroundColor: '#2563eb',
    },
    receivedFileContainer: {
        backgroundColor: '#f1f5f9',
    },
    inputContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e2e8f0',
        alignItems: 'flex-end',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1e293b',
        maxHeight: 100,
        backgroundColor: '#f8fafc',
    },
});