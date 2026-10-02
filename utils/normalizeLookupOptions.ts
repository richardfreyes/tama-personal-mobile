import { LookupItem } from "@/types";
import { LookupOption } from '@/types/form';

const mapLookupItemToOption = (item: LookupItem): LookupOption | null => {
  const code =
    item.code ??
    item.value ??
    item.id ??
    item.typeCode ??
    item.typeId ??
    item.projectId ??
    item.project_id ??
    item.merchantProjectId;

  const name =
    item.name ??
    item.label ??
    item.text ??
    item.typeName ??
    item.project_name ??
    item.projectId;

  if (name === undefined || name === null) {
    return null;
  }

  return {
    code: String(code ?? name),
    name: String(name),
  };
};

export const normalizeLookupOptions = (fieldKey: string, rawLookupOptions?: Record<string, any>): LookupOption[] => {
  const optionsSource = rawLookupOptions?.[fieldKey];

  if (!optionsSource) {
    return [];
  }

  if (Array.isArray(optionsSource)) {
    return optionsSource
      .map((item: any) => {
        if (item && typeof item === 'object') {
          return mapLookupItemToOption(item);
        }

        if (item === undefined || item === null) {
          return null;
        }

        return {
          code: String(item),
          name: String(item),
        };
      })
      .filter((item): item is LookupOption => item !== null);
  }

  if (typeof optionsSource === 'object') {
    if (fieldKey === 'projectName' && Array.isArray(optionsSource.projects)) {
      return optionsSource.projects
        .map((project: LookupItem) => mapLookupItemToOption(project))
        .filter((item: LookupOption | null): item is LookupOption => item !== null);
    }

    return Object.entries(optionsSource)
      .map(([key, item]: [string, any]) => {
        if (item && typeof item === 'object') {
          const mapped = mapLookupItemToOption(item);
          if (!mapped) {
            return null;
          }

          return {
            ...mapped,
            code: String(item.code ?? item.value ?? item.typeCode ?? key),
          };
        }

        if (item === undefined || item === null) {
          return null;
        }

        return {
          code: String(key),
          name: String(item),
        };
      })
      .filter((item: LookupOption | null): item is LookupOption => item !== null);
  }

  return [{
    code: String(optionsSource),
    name: String(optionsSource),
  }];
};