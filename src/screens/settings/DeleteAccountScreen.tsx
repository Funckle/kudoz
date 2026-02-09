import React, { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { deleteAccount } from '../../services/auth';

export function DeleteAccountScreen() {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your profile, goals, posts, and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setDeleting(true);
            const result = await deleteAccount(user.id);
            if (result.error) {
              Alert.alert('Error', result.error);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer noTopInset>
      <YStack flex={1} padding="$md" justifyContent="center">
        <Text fontSize="$5" fontWeight="700" color="$error" marginBottom="$sm">Delete Account</Text>
        <Text fontSize="$2" fontWeight="600" color="$error" marginBottom="$md">This action is permanent and cannot be undone.</Text>
        <Text fontSize="$2" color="$colorSecondary" marginBottom="$xl" lineHeight={22}>
          Deleting your account will remove:{'\n\n'}
          • Your profile and avatar{'\n'}
          • All your goals{'\n'}
          • All your posts and progress{'\n'}
          • All your comments{'\n'}
          • Your follower connections{'\n'}
          • Your notification history
        </Text>
        <Button
          title={deleting ? 'Deleting...' : 'Delete my account'}
          onPress={handleDelete}
          variant="destructive"
          loading={deleting}
        />
      </YStack>
    </ScreenContainer>
  );
}
