import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../store/authStore';

const { width, height } = Dimensions.get('screen');


const INTRO_VIDEO_URI = require('../assets/entrance_video.mp4');

// ─── Native video (iOS / Android) ────────────────────────────────────────────
function NativeVideo({ onEnd }: { onEnd: () => void }) {
  const { useVideoPlayer, VideoView } = require('expo-video');
  const player = useVideoPlayer(INTRO_VIDEO_URI, (p: any) => {
    p.muted = false;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('playingChange', (event: any) => {
      if (!event.isPlaying && event.oldIsPlaying) {
        onEnd();
      }
    });
    return () => sub.remove();
  }, [player]);

  return (
    <VideoView
      player={player}
      style={styles.video}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

// ─── Web video (plain HTML <video>) ──────────────────────────────────────────
function WebVideo({ onEnd }: { onEnd: () => void }) {
  return (
    <video
      src={INTRO_VIDEO_URI}
      autoPlay
      muted
      playsInline
      loop={false}
      onEnded={onEnd}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const skipOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const navigated = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const skipTimer = setTimeout(() => {
      Animated.timing(skipOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1500);

    const autoTimer = setTimeout(() => finish(), 12000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoTimer);
    };
  }, []);

  function finish() {
    if (navigated.current) return;
    navigated.current = true;

    const { isAuthenticated, isLoading, user } = useAuthStore.getState();

    if (isLoading) {
      // Auth still resolving — wait for it then navigate
      const unsub = useAuthStore.subscribe((state) => {
        if (!state.isLoading) {
          unsub();
          doNavigate(state.isAuthenticated, state.user?.isOnboarded);
        }
      });
    } else {
      doNavigate(isAuthenticated, user?.isOnboarded);
    }
  }

  function doNavigate(authenticated: boolean, onboarded?: boolean) {
    if (authenticated) {
      router.replace(onboarded ? '/(tabs)/home' : '/(onboarding)/age-group');
    } else {
      router.replace('/(auth)/welcome');
    }
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {Platform.OS === 'web' ? <WebVideo onEnd={finish} /> : <NativeVideo onEnd={finish} />}

      <LinearGradient
        colors={[
          'rgba(0,0,0,0.5)',
          'rgba(0,0,0,0.05)',
          'rgba(0,0,0,0.05)',
          'rgba(26,10,3,0.85)',
          'rgba(26,10,3,0.98)',
        ]}
        locations={[0, 0.2, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.topBar}>
        <Text style={styles.watermark}>✨ Hair Bounty Care</Text>
      </View>

      <Animated.View style={[styles.skipContainer, { opacity: skipOpacity }]}>
        <TouchableOpacity onPress={finish} style={styles.skipButton} activeOpacity={0.75}>
          <Text style={styles.skipText}>Skip  ›</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.bottomContent, { transform: [{ scale: logoScale }] }]}>
        <Text style={styles.brandName}>Hair Bounty Care</Text>
        <Text style={styles.tagline}>Grow. Glow. Flourish.</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    backgroundColor: '#1A0A03',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  watermark: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  skipContainer: {
    position: 'absolute',
    top: 56,
    right: 24,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  brandName: {
    color: '#D2994A',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#D2994A',
    borderRadius: 2,
  },
});
