export const PoppinsFontNames = {
  '100': 'PoppinsThin',
  '200': 'PoppinsExtraLight',
  '300': 'PoppinsLight',
  '400': 'PoppinsRegular',
  '500': 'PoppinsMedium',
  '600': 'PoppinsSemiBold',
  '700': 'PoppinsBold',
  '800': 'PoppinsExtraBold',
  '900': 'PoppinsBlack',

  light: 'PoppinsLight',
  regular: 'PoppinsRegular',
  medium: 'PoppinsMedium',
  bold: 'PoppinsBold',
} as const;

export type PoppinsWeight = keyof typeof PoppinsFontNames;