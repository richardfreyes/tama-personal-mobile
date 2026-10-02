import { API_PATHS } from "@/redux/apiPaths";
import { FetchLookupOptionsArgs, LookupSource } from "@/types";
import { FormField } from "../billerForm/billerFormTypes";

const getAppLookupEndpoint = (field: FormField, id: number | string) => {
  const billerId = Number(id);

  // Self references name a property in the biller's configuration, not a URL.
  if (field.lookupReference?.source === "self") {
    const key = field.lookupReference.location;
    return key ? API_PATHS.dashboard.getBillerConfig(billerId, key) : undefined;
  }

  switch (field.key) {
    case "projectName":
      return API_PATHS.dashboard.getBillerProjects(billerId);
    case "paymentType":
      return API_PATHS.dashboard.getBillerPaymentTypes(billerId);
    case "propertyType":
      return API_PATHS.dashboard.getBillerPropertyTypes(billerId);
    case "salesChannel":
      return API_PATHS.dashboard.getBillerSalesChannel(billerId);
    case "paymentOption":
      return API_PATHS.dashboard.getBillerPaymentOptions(billerId);
    case "paymentMode":
      return API_PATHS.dashboard.getBillerPaymentModes(billerId);
    case "month":
      return API_PATHS.dashboard.getBillerMonths(billerId);
    case "paymentYear":
      return API_PATHS.dashboard.getBillerPaymentYears(billerId);
    case "chargeType":
      return API_PATHS.dashboard.getBillerChargeTypes(billerId);
    default:
      return field.lookupReference?.location;
  }
};

const getMerchantLookupEndpoint = (field: FormField, id: number | string) => {
  const merchantId = String(id);

  switch (field.key) {
    case "projectName":
      return API_PATHS.merchant.getProjects(merchantId);
    case "paymentType":
      return API_PATHS.merchant.getPaymentTypes(merchantId);
    case "paymentMode":
      return API_PATHS.merchant.getMerchantById(merchantId);
    default:
      return field.lookupReference?.location;
  }
};

const getLookupEndpoint = (field: FormField, id: number | string, source: LookupSource) => {
  if (source === "enrollment") {
    return getMerchantLookupEndpoint(field, id);
  }

  return getAppLookupEndpoint(field, id);
};

export const fetchLookupOptions = async ({
  id,
  formConfig,
  source,
  baseQuery,
  api,
  extra,
}: FetchLookupOptionsArgs) => {
  try {
    const lookupFields = formConfig.filter((field) => field.fieldType === "lookup" && field.key);
    const lookupResults = await Promise.all(
      lookupFields.map(async (field) => {
        const endpoint = getLookupEndpoint(field, id, source);

        if (!endpoint) {
          return null;
        }

        const response = await baseQuery(endpoint, api, extra);

        if (response.error) {
          console.error(`Error fetching lookup options for ${field.key}:`, response.error);
          return null;
        }

        return {
          key: field.key,
          options: response.data,
        };
      })
    );

    const lookupOptions: Record<string, any> = {};
    lookupResults.forEach((result) => {
      if (result) {
        lookupOptions[result.key] = result.options;
      }
    });

    return { data: lookupOptions };
  } catch {
    return {
      error: {
        status: 500,
        data: "Failed to fetch lookup options due to an internal error.",
      },
    };
  }
};
