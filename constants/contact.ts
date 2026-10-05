import type { ContactChannel, ContactSupportInfo } from '@/types/settings';

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    action: 'web',
    icon: 'facebook',
    label: 'Tama',
    title: 'Facebook',
    url: 'https://www.facebook.com/Aqwireofficial',
  },
  {
    action: 'web',
    icon: 'instagram',
    label: 'Tama',
    title: 'Instagram',
    url: 'https://www.instagram.com/aqwireofficial/',
  },
  {
    action: 'email',
    icon: 'mail',
    label: 'support@aqwire.io',
    title: 'Email Support',
    url: 'mailto:support@aqwire.io',
  },
  {
    action: 'phone',
    icon: 'phone',
    label: 'International: +1 408 400 3780',
    title: 'International',
    url: 'tel:+14084003780',
  },
  {
    action: 'phone',
    icon: 'phone',
    label: 'Local: +63 962 694 2113',
    title: 'Local',
    url: 'tel:+639626942113',
  },
  {
    action: 'phone',
    icon: 'phone',
    label: 'Local: +63 962 694 0950',
    title: 'Local',
    url: 'tel:+639626940950',
  },
];

export const SUPPORT_EMAIL_CHANNEL = CONTACT_CHANNELS.find(({ action }) => action === 'email');

export const CONTACT_SUPPORT_INFO: ContactSupportInfo[] = [
  {
    label: 'Support Hours',
    value: 'Monday to Friday, 7:00 AM - 6:00 PM PhST',
  },
  {
    label: 'Helpful Details',
    value: 'For faster assistance, include your account email, invoice number, payment reference, or transaction details when available.',
  },
];
