import { styled, YStack, XStack, Text, Separator as TamaguiSeparator } from 'tamagui';

export const Card = styled(YStack, {
  backgroundColor: '$surface',
  borderRadius: '$md',
  padding: '$md',
  borderWidth: 1,
  borderColor: '$borderColor',

  variants: {
    noBorder: {
      true: {
        borderWidth: 0,
      },
    },
    bottomBorder: {
      true: {
        borderWidth: 0,
        borderBottomWidth: 1,
      },
    },
  } as const,
});

export const Screen = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',

  variants: {
    padded: {
      true: {
        paddingHorizontal: '$md',
      },
    },
  } as const,
});

export const Row = styled(XStack, {
  alignItems: 'center',
});

export const SectionHeader = styled(Text, {
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
});

export const Body = styled(Text, {
  fontSize: '$2',
  fontWeight: '400',
  color: '$color',
});

export const Caption = styled(Text, {
  fontSize: '$1',
  fontWeight: '400',
  color: '$colorSecondary',
});

export const Separator = styled(TamaguiSeparator, {
  borderColor: '$borderColor',
});
