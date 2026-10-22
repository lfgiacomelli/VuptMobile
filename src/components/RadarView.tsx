import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const RadarView = () => {
    const pulse = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(pulse, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {[1, 2, 3].map((i) => (
                <Animated.View
                    key={i}
                    style={[styles.pulse, {
                        transform: [{ scale: pulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.5 + (i * 0.2)]
                        }) }],
                        opacity: pulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.6 / i, 0]
                        })
                    }]}
                />
            ))}
            <View style={styles.dot} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', height: 150 },
    pulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', borderWidth: 1, borderColor: '#333' },
    dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#000' }
});