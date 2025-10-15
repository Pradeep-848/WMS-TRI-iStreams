import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image
} from 'react-native';
import Header from '../Components/Header';
import { useTheme } from '../Context/ThemeContext';
import { GlobalStyles } from '../Styles/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Searchbar, AnimatedFAB } from 'react-native-paper';
import { useAuth } from '../Context/AuthContext';
import { callSoapService } from '../SoapRequestAPI/callSoapService';
import { formatSoapDate, formatSoapDateonly, formatSoapDateWithTime } from '../Utils/dataTimeUtils';
import { useFocusEffect } from '@react-navigation/native';
import IonIcons from 'react-native-vector-icons/Ionicons';
import BackgroundGradient from '../Components/BackgroundGradient';

const ChatListScreen = ({ navigation }) => {
    const { userData } = useAuth();
    const { theme } = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const insets = useSafeAreaInsets();

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageCache, setImageCache] = useState(new Map());
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            GetListUserMessage();
        }, [])
    );

    // Memoize the image processing to avoid repeated work
    const processImageData = useCallback((avatarData) => {
        if (!avatarData) return null;

        if (avatarData.startsWith('data:image')) {
            return avatarData;
        }

        // Clean and format base64 data
        const cleanedData = avatarData.replace(/(\r\n|\n|\r)/gm, "");
        return `data:image/bmp;base64,${cleanedData}`;
    }, []);

    const parseCreatedOn = (createdOn) => {
        const match = createdOn.match(/\d+/);
        if (!match) return new Date(0);
        const timestamp = parseInt(match[0], 10);
        return new Date(timestamp);
    };

    const GetListUserMessage = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const listUserMsgParam = { ForTheUserName: userData.userName };
            const response = await callSoapService(
                userData.clientURL,
                'IM_Get_ListOfUsers_Messages',
                listUserMsgParam
            );

            // Group by conversation partner
            const conversationMap = new Map();

            response.forEach(emp => {
                // Determine conversation partner (not the login user)
                const partner =
                    emp.CREATED_USER === userData.userName
                        ? emp.ASSIGNED_USER
                        : emp.CREATED_USER;

                const existing = conversationMap.get(partner);

                // Always pick the latest message
                if (
                    !existing ||
                    parseCreatedOn(emp.CREATED_ON) > parseCreatedOn(existing.CREATED_ON)
                ) {
                    conversationMap.set(partner, emp);
                }
            });

            // Now process only the last messages
            const formatted = await Promise.all(
                Array.from(conversationMap.values()).map(async emp => {
                    let avatarData = null;

                    // ✅ Decide which empNo to use
                    const empNoToUse =
                        emp.CREATED_USER === userData.userName ? emp.ASSIGNED_EMP_NO : emp.EMP_NO;

                    if (imageCache.has(empNoToUse)) {
                        avatarData = imageCache.get(empNoToUse);
                    } else {
                        try {
                            const res = await callSoapService(
                                userData.clientURL,
                                'getpic_bytearray',
                                { EmpNo: empNoToUse }
                            );
                            avatarData = res;
                            setImageCache(prev => new Map(prev.set(empNoToUse, res)));
                        } catch (error) {
                            console.warn(`Failed to fetch image for ${empNoToUse}`, error);
                        }
                    }

                    return {
                        id: emp.TASK_ID.toString(),
                        name:
                            emp.CREATED_USER === userData.userName
                                ? emp.ASSIGNED_USER
                                : emp.CREATED_USER,
                        lastMessage: emp.TASK_INFO,
                        timestamp: formatSoapDateonly(emp.CREATED_ON),
                        unreadCount: emp.VIEW_STATUS === 'F' ? 1 : 0,
                        avatar: avatarData,
                        lastSeen: formatSoapDateWithTime(emp.CREATED_ON),
                        empNo: empNoToUse, // ✅ store correct empNo for reference
                        isSent: emp.CREATED_USER === userData.userName,
                        rawCreatedOn: emp.CREATED_ON,
                    };
                })
            );

            // Sort newest first
            formatted.sort((a, b) => {
                const dateA = parseCreatedOn(a.rawCreatedOn);
                const dateB = parseCreatedOn(b.rawCreatedOn);
                return dateB - dateA;
            });

            setChats(formatted);
        } catch (error) {
            console.log('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChatPress = useCallback((chat) => {
        navigation.navigate('ChatDetail', { chat });
    }, [navigation]);

    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const lower = searchQuery.toLowerCase();
        return chats.filter(
            (c) =>
                c.name.toLowerCase().includes(lower) ||
                c.lastMessage.toLowerCase().includes(lower)
        );
    }, [searchQuery, chats]);

    // Memoized avatar component to prevent unnecessary re-renders
    const AvatarComponent = React.memo(({ emp, style }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        const processedUri = useMemo(() => {
            return emp.avatar ? processImageData(emp.avatar) : null;
        }, [emp.avatar, processImageData]);

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
                    />
                </View>
            );
        }

        // Fallback to initials
        const initials = emp.name
            ? emp.name.split(' ').map((w) => w[0]).join('').toUpperCase()
            : '?';

        return (
            <View style={[style, globalStyles.empImageInList, globalStyles.justalignCenter, { backgroundColor: colors.card }, globalStyles.borderRadius_30]}>
                <Text style={[globalStyles.title, globalStyles.clr_primary]}>{initials}</Text>
            </View>
        );
    });

    // Memoized chat item to prevent unnecessary re-renders
    const ChatItem = React.memo(({ item, onPress }) => (
        <TouchableOpacity
            style={[globalStyles.twoInputContainer, globalStyles.py_10, globalStyles.px_5, globalStyles.alignItemsCenter]}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={globalStyles.mr_15}>
                <AvatarComponent emp={item} style={globalStyles.empImageInList} />
            </View>

            <View style={[globalStyles.flex_1, globalStyles.justifyContentCenter]}>
                <View style={globalStyles.twoInputContainer}>
                    <Text style={[globalStyles.subtitle]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[globalStyles.small_text, { color: item.unreadCount > 0 ? colors.primary : colors.text }]}>{item.timestamp}</Text>
                </View>
                <View style={[globalStyles.twoInputContainer, globalStyles.alignItemsCenter, globalStyles.py_5]}>
                    <View style={[globalStyles.twoInputContainer, globalStyles.alignItemsCenter]}>
                        {item.isSent && (
                            <IonIcons style={{ color: colors.primary, marginRight: 4 }} name="checkmark-done-sharp" size={16} />
                        )}
                        <Text style={globalStyles.content} numberOfLines={1}>
                            {item.lastMessage}
                        </Text>
                    </View>
                    {item.unreadCount > 0 && (
                        <View
                            style={[
                                globalStyles.borderRadius_20,
                                {
                                    backgroundColor: colors.primary,
                                    minWidth: 22,
                                    height: 22,
                                    paddingHorizontal: 6,
                                    justifyContent: "center",
                                    alignItems: "center",
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    globalStyles.subtitle_4,
                                    { color: colors.background, textAlign: "center" },
                                ]}
                            >
                                {item.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    ));

    const renderChatItem = useCallback(({ item }) => (
        <ChatItem item={item} onPress={handleChatPress} />
    ), [handleChatPress]);

    const keyExtractor = useCallback((item) => item.id + item.name, []);

    const getItemLayout = useCallback((data, index) => ({
        length: 80, // Approximate height of each item
        offset: 80 * index,
        index,
    }), []);

    return (
        <BackgroundGradient>
            <SafeAreaView style={[globalStyles.pageContainer, { paddingTop: insets.top }]}>
                {/* Header */}
                <Header title="Message" />

                <Searchbar
                    placeholder="Search"
                    theme={theme}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[globalStyles.my_10, { backgroundColor: colors.card }]}
                    placeholderTextColor={colors.text}
                    iconColor={colors.text}
                />

                {/* Chat List */}
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={keyExtractor}
                    style={globalStyles.flex_1}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={15}
                    getItemLayout={getItemLayout}
                    refreshing={loading}
                    onRefresh={GetListUserMessage}
                />

                <AnimatedFAB
                    icon="plus"
                    color={colors.background}
                    theme={theme}
                    style={[globalStyles.fab, { backgroundColor: colors.purple }]}
                    onPress={() => navigation.navigate('AddUserScreen')}
                />
            </SafeAreaView>
        </BackgroundGradient>
    );
};

export default ChatListScreen;