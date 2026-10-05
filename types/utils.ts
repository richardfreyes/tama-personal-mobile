import { MerchantEnrollmentPayload, MerchantFormConfigResponse, MerchantFormField, MerchantTransactionPayload } from "@/redux/features/merchants/merchantTypes";
import { PaymentInfoRow } from "./common";
import { AddCardFormInputs } from "./form";

export type CurrencyInputSelection = { start: number; end: number };
export type ModalActionFn = () => void;

export type PaymentMethodFormData = AddCardFormInputs & {
  saveAsDefaultBilling: boolean;
  useAsPrimaryPayment: boolean;
  cardProvider: string;
};

export type EnrollmentPayloadBuilderParams = {
  activeFormConfig?: MerchantFormConfigResponse;
  email?: string;
  firstName?: string;
  formData: Record<string, any>;
  inputFields: MerchantFormField[];
  isEnrollmentSelected: boolean;
  lastName?: string;
  merchantId: string;
};

export type EnrollmentPayloads = {
  currency: string;
  enrollmentPayload: MerchantEnrollmentPayload;
  payload: MerchantTransactionPayload;
};

export type EnrollmentReviewField = {
  text: string;
  value: any;
};

export interface ScheduledPaymentInfo {
  rows: PaymentInfoRow[];
  noteText: string;
}
