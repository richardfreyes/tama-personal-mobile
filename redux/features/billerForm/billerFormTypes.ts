import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface FormField {
  id: number;
  name: string;
  fieldType: string;
  key: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  maxLength?: number;
  lookupReference?: {
    location: string;
    source: 'link' | 'self';
  };
  pattern?: string;
  visibility?: any;
}


export type AppBaseQuery = BaseQueryFn<string | FetchArgs, any, FetchBaseQueryError, {}, {}>;

export type LookupOptionsPayload = {
  billerId: number;
  formConfig: FormField[];
};

export interface Project {
  is_active: boolean;
  is_enabled: boolean;
  project_category: string | null;
  project_id: number;
  project_name: string;
}

export interface ProjectsResponse {
  projects: Project[];
}
