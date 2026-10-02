import LegalDocumentScreen from '@/components/settings/LegalDocumentScreen';
import { TERMS_AND_CONDITIONS_CONTENT } from '@/constants/legal';

export default function TermsScreen() {
  return (
    <LegalDocumentScreen
      content={TERMS_AND_CONDITIONS_CONTENT}
      title="Terms & Conditions"
    />
  );
}
