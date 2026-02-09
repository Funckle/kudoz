import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useAuth } from '../../hooks/useAuth';
import { exportUserData } from '../../services/dataExport';
import type { ProfileScreenProps } from '../../types/navigation';

export function YourDataScreen({ navigation }: ProfileScreenProps<'YourData'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const result = await exportUserData(user.id);
    setExporting(false);
    if (result.error) Alert.alert('Export failed', result.error);
  };

  return (
    <ScreenContainer noTopInset>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$lg">Your Data</Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">What We Collect</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          We store only what's necessary to make Kudoz work: your email address, profile information
          (name, username, bio, avatar), goals, posts, comments, reactions, and follow relationships.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">How It's Used</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Your data is used exclusively to provide the Kudoz service. We show your goals and posts to
          people you've chosen to share with based on your visibility settings. We never sell your data
          or share it with advertisers.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">Where It Lives</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Your data is stored securely on protected servers. Other users can only see what you've chosen to share. Kudoz administrators can access data when needed to run and maintain the service, but we'll never share it with anyone else.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">Your Rights</Text>

        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val }} onPress={handleExport} disabled={exporting}>
          <Text fontSize="$2" color="$color">{exporting ? 'Exporting...' : 'Export your data'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val }} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text fontSize="$2" color="$error">Delete your account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
