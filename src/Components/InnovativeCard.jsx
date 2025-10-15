import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import { GlobalStyles } from '../Styles/styles';
import { useTheme } from '../Context/ThemeContext';

const InnovativeCard = ({ title, icon, gradientColors, onPress, delay = 0, description }) => {
    const {theme} = useTheme();
    const colors = theme.colors;
    const globalStyles = GlobalStyles(colors);
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ]).start();
    }, []);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.cardWrapper,
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                style={styles.cardTouchable}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientCard}
                >
                    {/* Background Pattern */}
                    <View style={styles.backgroundPattern}>
                        <View style={styles.patternCircle1} />
                        <View style={styles.patternCircle2} />
                        <View style={styles.patternCircle3} />
                    </View>

                    {/* Card Content */}
                    <View style={styles.cardContent}>
                        <View style={styles.iconContainer}>
                            <View style={styles.iconBackground}>
                                <MaterialCommunityIcons
                                    name={icon}
                                    color="rgba(255, 255, 255, 0.9)"
                                    size={25}
                                />
                            </View>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{title}</Text>
                            <Text style={styles.cardDescription}>{description}</Text>
                        </View>

                        <View style={styles.arrowContainer}>
                            <View style={styles.arrowBackground}>
                                <Icon name="arrow-right" size={12} color="rgba(255, 255, 255, 0.9)" />
                            </View>
                        </View>
                    </View>

                    {/* Shine Effect */}
                    <View style={styles.shineEffect} />
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default InnovativeCard;

const styles = StyleSheet.create({
    cardWrapper: {
        marginHorizontal: 5,
    },
    cardTouchable: {
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientCard: {
        borderRadius: 20,
        padding: 20,
        minHeight: 100,
        overflow: 'hidden',
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    patternCircle1: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -30,
        right: -30,
    },
    patternCircle2: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -10,
        left: -10,
    },
    patternCircle3: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        top: 20,
        left: 20,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        marginRight: 16,
        alignItems: 'center',
    },
    iconBackground: {
        width: 40,
        height: 40,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    cardTitle: {
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardDescription: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 20,
    },
    arrowContainer: {
        alignItems: 'center',
    },
    arrowBackground: {
        width: 30,
        height: 30,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    shineEffect: {
        position: 'absolute',
        top: 0,
        left: -100,
        width: 50,
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: [{ skewX: '-20deg' }],
    },
});
