import CameraIcon from '@/assets/icons/camera.svg';
import DeleteIcon from '@/assets/icons/delete.svg';
import DoubleCheckCircle from '@/assets/icons/double-check-circle.svg';
import HelpIcon from '@/assets/icons/help.svg';
import HistoryIcon from '@/assets/icons/history.svg';
import HomeOutlineIcon from '@/assets/icons/home-outline.svg';
import HouseIcon from '@/assets/icons/house.svg';
import ImageIcon from '@/assets/icons/image.svg';
import InfoIcon from '@/assets/icons/info-circle.svg';
import InvoicesIcon from '@/assets/icons/invoices.svg';
import LockIcon from '@/assets/icons/lock.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import MailIcon from '@/assets/icons/mail.svg';
import ReceiptIcon from '@/assets/icons/receipt.svg';
import SettingIcon from '@/assets/icons/setting.svg';
import TridotIcon from '@/assets/icons/tridot.svg';
import UserDeletion from '@/assets/icons/user-deletion.svg';
import UserIcon from '@/assets/icons/user.svg';
import WalletIcon from '@/assets/icons/wallet.svg';
import OnboardingImg1 from '@/assets/images/onboarding-1.svg';
import OnboardingImg2 from '@/assets/images/onboarding-2.svg';
import OnboardingImg3 from '@/assets/images/onboarding-3.svg';
import type { BillerCategory } from '@/types';

export const ONBOARDING_IMGS = [
  { id: '1', image: OnboardingImg1 },
  { id: '2', image: OnboardingImg2 },
  { id: '3', image: OnboardingImg3 },
] as const;

export const BILLER_CATEGORIES = [
  { id: 'all', name: 'All Billers', categoryId: undefined, icon: DoubleCheckCircle, iconProps: { width: 16, height: 16 } },
  { id: 'real_estate', name: 'Real Estate', categoryId: 2, icon: HouseIcon, iconProps: { width: 16, height: 16 } },
  // { id: 'education', name: 'Education', categoryId: 3, icon: HatIcon, iconProps: { width: 16, height: 16 } },
] as BillerCategory[];

// Bottom bar tabs in display order. `name` is the Expo Router tab route; `href` is where a second
// tap on the active tab returns to.
export const FLOATING_NAV_TABS = [
  { name: 'dashboard', label: 'Home', href: '/dashboard', icon: HomeOutlineIcon },
  { name: 'bills/index', label: 'Bills', href: '/bills', icon: ReceiptIcon },
  { name: 'transactions/index', label: 'History', href: '/transactions', icon: HistoryIcon },
  { name: 'payment-methods/index', label: 'Wallet', href: '/payment-methods', icon: WalletIcon },
] as const;

export const SETTINGS = [
  { id: 'profile', title: 'Profile', icon: UserIcon, route: '/settings/profile' },
  { id: 'security', title: 'Account & Security', icon: LockIcon, route: '/settings/security' },
  { id: 'help', title: 'Help', icon: HelpIcon, route: '#help' },
  { id: 'about', title: 'About', icon: InfoIcon, route: '/settings/about' },
  { id: 'contact', title: 'Contact Us', icon: MailIcon, route: '/settings/contact' },
  { id: 'logout', title: 'Logout', icon: LogoutIcon, route: 'logout' },
] as const;

export const ACCOUNT_SECURITY = [
  { id: 'changeEmail', title: 'Change Email', icon: MailIcon, route: '/security/change-email' },
  { id: 'changePassword', title: 'Change Password', icon: TridotIcon, route: '/security/change-password' },
  { id: 'deactivationDeletion', title: 'Deactivation or Deletion', icon: UserDeletion, route: '#deactivationDeletion' },
] as const;

export const NOTIFICATIONS = [
  { id: '1', title: 'Mark All As Read', icon: InvoicesIcon, route: '/notifications/settings' },
  { id: '2', title: 'Notification Settings', icon: SettingIcon, route: '/notifications/settings' },
] as const;

export const PROFILE = [
  { id: '1', title: 'Choose From Library', icon: CameraIcon },
  { id: '2', title: 'Take Photo', icon: ImageIcon },
  { id: '3', title: 'Remove Current Picture', icon: DeleteIcon },
];

export const PROFILE_IMAGE_URI = 'https://i.pravatar.cc/150?img=1' as const;
