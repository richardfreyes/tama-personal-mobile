import LegalDocumentScreen from '@/components/settings/LegalDocumentScreen';
import { PRIVACY_POLICY_CONTENT } from '@/constants/legal';

export default function PrivacyScreen() {
  return (
    <LegalDocumentScreen
      content={PRIVACY_POLICY_CONTENT}
      title="Privacy Policy"
    />
  );
}
