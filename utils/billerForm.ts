import { API_PATHS } from "@/redux/apiPaths";

export const getLookupEndpoint = (key: string, billerId: number): string | undefined => {
  switch (key) {
    case 'projectName':
      return API_PATHS.dashboard.getBillerProjects(billerId);
    case 'paymentType':
      return API_PATHS.dashboard.getBillerPaymentTypes(billerId);
    case 'propertyType':
      return API_PATHS.dashboard.getBillerPropertyTypes(billerId);
    case 'salesChannel':
      return API_PATHS.dashboard.getBillerSalesChannel(billerId);
    case 'paymentOption':
      return API_PATHS.dashboard.getBillerPaymentOptions(billerId);
    case 'paymentMode':
      return API_PATHS.dashboard.getBillerPaymentModes(billerId);
    case 'month':
      return API_PATHS.dashboard.getBillerMonths(billerId);
    case 'paymentYear':
      return API_PATHS.dashboard.getBillerPaymentYears(billerId);
    case 'chargeType':
      return API_PATHS.dashboard.getBillerChargeTypes(billerId);
    default:
      return undefined;
  }
};