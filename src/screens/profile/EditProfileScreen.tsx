import React, { useState } from 'react';
import { ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { LIMITS, validateUsername, validateUrl } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, checkUsernameAvailable } from '../../services/auth';
import { pickImage, optimizeImage, uploadImage } from '../../services/media';
import type { ProfileScreenProps } from '../../types/navigation';

export function EditProfileScreen({ navigation }: ProfileScreenProps<'EditProfile'>) {
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);

  const handlePickAvatar = async () => {
    const result = await pickImage();
    if (!result.cancelled && result.uri) {
      const optimized = await optimizeImage(result.uri);
      if (!user) return;
      const upload = await uploadImage(optimized.uri, user.id, 'avatar', 'avatars');
      if (upload.url) setAvatarUri(upload.url);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (website && !validateUrl(website)) {
      Alert.alert('Invalid website URL');
      return;
    }

    const updates: Record<string, unknown> = {
      name: name.trim(),
      bio: bio.trim(),
      website: website.trim() || undefined,
      avatar_url: avatarUri || undefined,
    };

    if (username !== user.username) {
      const validation = validateUsername(username);
      if (!validation.valid) {
        Alert.alert('Invalid username', validation.error);
        return;
      }
      // Check once-per-day limit
      if (user.username_changed_at) {
        const lastChange = new Date(user.username_changed_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        if (lastChange > dayAgo) {
          Alert.alert('Too soon', 'You can only change your username once per day');
          return;
        }
      }
      const available = await checkUsernameAvailable(username);
      if (!available) {
        Alert.alert('Username taken');
        return;
      }
      updates.username = username;
    }

    setSaving(true);
    const result = await updateUserProfile(user.id, updates as Parameters<typeof updateUserProfile>[1]);
    setSaving(false);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      await refreshUser();
      navigation.goBack();
    }
  };

  return (
    <ScreenContainer noTopInset>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={88}
      >
        <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
          <YStack alignItems="center" marginBottom="$lg">
            <TouchableOpacity onPress={handlePickAvatar}>
              <Avatar uri={avatarUri} name={name} size={80} />
            </TouchableOpacity>
            <Button title="Change photo" onPress={handlePickAvatar} variant="secondary" style={{ marginTop: 8 }} />
          </YStack>
          <TextInput label="Name" value={name} onChangeText={setName} />
          <TextInput label="Username" value={username} onChangeText={(t) => setUsername(t.toLowerCase())} maxLength={LIMITS.USERNAME_MAX} autoCapitalize="none" />
          <TextInput label="Bio" value={bio} onChangeText={setBio} maxLength={LIMITS.BIO} multiline />
          <TextInput label="Website" value={website} onChangeText={setWebsite} keyboardType="url" autoCapitalize="none" />
          <Button title="Save" onPress={handleSave} loading={saving} />
          <XStack justifyContent="center" alignItems="center" paddingVertical="$lg">
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text fontSize="$1" color="$colorSecondary">Privacy Policy</Text>
            </TouchableOpacity>
            <Text fontSize="$1" color="$colorSecondary"> · </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text fontSize="$1" color="$colorSecondary">Terms & Conditions</Text>
            </TouchableOpacity>
          </XStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
