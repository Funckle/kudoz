import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useSubscription } from '../../hooks/useSubscription';
import { updateUserProfile, signOut } from '../../services/auth';
import { exportUserData } from '../../services/dataExport';
import type { ProfileScreenProps } from '../../types/navigation';
import type { Visibility } from '../../types/database';

export function SettingsScreen({ navigation }: ProfileScreenProps<'Settings'>) {
  const theme = useTheme();
  const { user, refreshUser } = useAuth();
  const { isModerator } = useRole();
  const { isPaid } = useSubscription();
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>(user?.default_visibility ?? 'public');
  const [exporting, setExporting] = useState(false);

  const handleVisibilityChange = async (value: Visibility) => {
    if (!user) return;
    setDefaultVisibility(value);
    await updateUserProfile(user.id, { default_visibility: value });
    await refreshUser();
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const result = await exportUserData(user.id);
    setExporting(false);
    if (result.error) Alert.alert('Export failed', result.error);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', onPress: signOut },
    ]);
  };

  if (!user) return <LoadingSpinner />;

  return (
    <ScreenContainer noTopInset>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Subscription</Text>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('Subscription')}>
          <Text fontSize="$2" color="$color">Plan</Text>
          <Text fontSize="$2" color="$colorSecondary">{isPaid ? 'Premium' : 'Free'}</Text>
        </TouchableOpacity>
        {user.invites_remaining > 0 && (
          <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('Invites')}>
            <Text fontSize="$2" color="$color">Invites</Text>
            <Text fontSize="$2" color="$colorSecondary">{user.invites_remaining} left</Text>
          </TouchableOpacity>
        )}

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Privacy</Text>
        <XStack paddingVertical={12} borderBottomWidth={1} borderBottomColor="$borderColor" justifyContent="space-between" alignItems="center">
          <Text fontSize="$2" color="$color">Default visibility</Text>
        </XStack>
        {(['public', 'friends', 'private'] as Visibility[]).map((v) => (
          <TouchableOpacity
            key={v}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: defaultVisibility === v ? theme.color.val : theme.borderColor.val,
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: defaultVisibility === v ? theme.borderColorLight.val : undefined,
            }}
            onPress={() => handleVisibilityChange(v)}
          >
            <Text fontSize="$2" color="$color">{v === 'friends' ? 'Mutual followers' : v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </TouchableOpacity>
        ))}

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Social</Text>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('BlockedUsers')}>
          <Text fontSize="$2" color="$color">Blocked users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('MutedUsers')}>
          <Text fontSize="$2" color="$color">Muted users</Text>
        </TouchableOpacity>

        {isModerator && (
          <>
            <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Moderation</Text>
            <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('AdminDashboard')}>
              <Text fontSize="$2" color="$color">Moderation Dashboard</Text>
            </TouchableOpacity>
          </>
        )}

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Data</Text>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={handleExport}>
          <Text fontSize="$2" color="$color">{exporting ? 'Exporting...' : 'Export your data'}</Text>
        </TouchableOpacity>

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">About</Text>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('About')}>
          <Text fontSize="$2" color="$color">About Kudoz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('YourData')}>
          <Text fontSize="$2" color="$color">Your data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text fontSize="$2" color="$color">Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('Terms')}>
          <Text fontSize="$2" color="$color">Terms & Conditions</Text>
        </TouchableOpacity>

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginTop="$lg" marginBottom="$sm" textTransform="uppercase">Account</Text>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={handleSignOut}>
          <Text fontSize="$2" color="$color">Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text fontSize="$2" color="$error">Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
