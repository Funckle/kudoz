import React, { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { YStack, Text } from 'tamagui';

export function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <YStack paddingVertical={6} alignItems="center" backgroundColor="$error">
      <Text fontSize="$1" fontWeight="600" color="#FFFFFF">No connection</Text>
    </YStack>
  );
}
