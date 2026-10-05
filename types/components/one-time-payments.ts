import type { ComponentsProps } from '../component-props';

export type BillsComponentProps = Pick<
  ComponentsProps,
  | 'sectionHeader'
  | 'sectionFooter'
  | 'onViewAllPress'
  | 'onAddBillerPress'
  | 'onPayNowPress'
> & {

  variant?: 'panel' | 'plain';
};
