import type { FormField } from "@/redux/features/billerForm/billerFormTypes";
import type { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface FetchBillersParams {
  search?: string;
  category?: number;
}

export interface FetchDataParams {
  category?: number | undefined;
  search?: string;
}

export type LookupItem = Record<string, any>;

export interface DatePickerEvent {
  date: Date | undefined;
}

export type LookupSource = "app" | "enrollment";
type LookupBaseQuery = BaseQueryFn<string | FetchArgs, any, FetchBaseQueryError>;
type LookupExtraOptions = Parameters<LookupBaseQuery>[2];

export type FetchLookupOptionsArgs = {
  id: number | string;
  formConfig: FormField[];
  source: LookupSource;
  baseQuery: LookupBaseQuery;
  api: BaseQueryApi;
  extra: LookupExtraOptions;
};
