import LegalDocumentScreen from '@/components/settings/LegalDocumentScreen';
import { REFUND_AND_CHARGEBACK_POLICY_CONTENT } from '@/constants/legal';

export default function RefundPolicyScreen() {
  return (
    <LegalDocumentScreen
      content={REFUND_AND_CHARGEBACK_POLICY_CONTENT}
      title="Refund and Chargeback Policy"
    />
  );
}
