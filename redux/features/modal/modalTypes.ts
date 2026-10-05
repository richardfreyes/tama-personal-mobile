export interface ModalButtonConfig {
  direction?: 'column' | 'row';
  primaryLabel: string;
  primaryStyle?: object;
  secondaryLabel?: string;
  secondaryStyle?: object;
}

interface ModalState {
  isVisible: boolean;
  dismissible?: boolean;
  iconType?: 'success' | 'warning' | 'info' | 'error' | 'logout' | 'delete' | null;

  variant?: 'default' | 'confirm';
  headerMessage?: string;
  bodyMessage?: string;
  bodyType?: 'accountDeletion' | 'default';
  buttonConfig?: ModalButtonConfig;
  id?: string;
}

export type ShowModalPayload = Omit<ModalState, 'isVisible'>;

export const initialState: ModalState = {
  isVisible: false,
  iconType: null,
  headerMessage: '',
  bodyMessage: '',
  bodyType: undefined,
  buttonConfig: undefined,
  id: undefined,
};
