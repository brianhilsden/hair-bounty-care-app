import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, ProgressPhoto } from '../../lib/api/progress';
import { useToast } from '../ui/Toast';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.25;

interface PhotoViewerProps {
  photo: ProgressPhoto | null;
  onClose: () => void;
}

export const PhotoViewer = ({ photo, onClose }: PhotoViewerProps) => {
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editLength, setEditLength] = useState('');

  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (photo) {
      translateY.setValue(SCREEN_HEIGHT);
      scale.setValue(0.95);
      setEditing(false);
      setEditNote(photo.notes ?? '');
      setEditLength(photo.currentLength ? String(photo.currentLength) : '');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 65, friction: 11 }),
      ]).start();
    }
  }, [photo?.id]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => Math.abs(dy) > Math.abs(dx) && dy > 5,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          translateY.setValue(dy);
          const opacity = Math.max(0, 1 - dy / SCREEN_HEIGHT);
          backdropOpacity.setValue(opacity);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 1.2) {
          dismiss();
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
            Animated.timing(backdropOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const updateMutation = useMutation({
    mutationFn: (data: { notes?: string; currentLength?: number }) =>
      progressApi.updateProgressPhoto(photo!.id, data),
    onSuccess: (result) => {
      queryClient.setQueryData<any>(['progress', 'photos'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((p: ProgressPhoto) =>
            p.id === photo!.id ? { ...p, ...result.data } : p
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      setEditing(false);
      showToast('Photo updated!', 'success');
    },
    onError: () => showToast('Could not update photo', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => progressApi.deleteProgressPhoto(photo!.id),
    onSuccess: () => {
      queryClient.setQueryData<any>(['progress', 'photos'], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((p: ProgressPhoto) => p.id !== photo!.id) };
      });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      showToast('Photo deleted', 'info');
      dismiss();
    },
    onError: () => showToast('Could not delete photo', 'error'),
  });

  const handleSave = () => {
    const parsedLength = editLength.trim() ? parseFloat(editLength.trim()) : undefined;
    updateMutation.mutate({
      notes: editNote.trim() || undefined,
      currentLength: parsedLength && !isNaN(parsedLength) ? parsedLength : undefined,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Photo',
      'This will permanently remove this progress photo. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (!photo) return null;

  return (
    <Modal visible={!!photo} transparent animationType="none" onRequestClose={dismiss}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Backdrop */}
        <Animated.View
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', opacity: backdropOpacity }}
        />

        <Animated.View
          style={{ flex: 1, transform: [{ translateY }, { scale }] }}
          {...panResponder.panHandlers}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEnabled={editing}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 }}>
              <TouchableOpacity onPress={dismiss} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {new Date(photo.takenAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setEditing(!editing)}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: editing ? 'rgba(210,153,74,0.3)' : 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 16 }}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={deleteMutation.isPending}
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center' }}
                >
                  {deleteMutation.isPending
                    ? <ActivityIndicator size="small" color="#ef4444" />
                    : <Text style={{ fontSize: 16 }}>🗑️</Text>}
                </TouchableOpacity>
              </View>
            </View>

            {/* Photo */}
            <Image
              source={{ uri: photo.photoUrl }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'cover' }}
            />

            {/* Details */}
            <View style={{ padding: 20 }}>
              {photo.currentLength && !editing && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#D2994A', fontSize: 13, fontWeight: '700' }}>📏 </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                    {photo.currentLength} cm
                  </Text>
                </View>
              )}

              {photo.notes && !editing && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 }}>NOTE</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 }}>{photo.notes}</Text>
                </View>
              )}

              {!photo.notes && !editing && (
                <TouchableOpacity onPress={() => setEditing(true)} style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Text style={{ color: 'rgba(210,153,74,0.6)', fontSize: 13 }}>✏️ Add notes or hair length</Text>
                </TouchableOpacity>
              )}

              {/* Edit form */}
              {editing && (
                <View style={{ gap: 12 }}>
                  <View>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>Hair length (cm)</Text>
                    <TextInput
                      value={editLength}
                      onChangeText={setEditLength}
                      placeholder="e.g. 14.5"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      keyboardType="decimal-pad"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(210,153,74,0.25)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14 }}
                    />
                  </View>
                  <View>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 6 }}>Notes</Text>
                    <TextInput
                      value={editNote}
                      onChangeText={setEditNote}
                      placeholder="How's your hair journey going?"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      multiline
                      numberOfLines={4}
                      maxLength={300}
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(210,153,74,0.25)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, textAlignVertical: 'top', minHeight: 90 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setEditing(false)}
                      style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={updateMutation.isPending}
                      style={{ flex: 2, backgroundColor: '#D2994A', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                    >
                      {updateMutation.isPending
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={{ color: '#fff', fontWeight: '700' }}>Save Changes</Text>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
