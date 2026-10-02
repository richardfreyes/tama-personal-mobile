import { COMMON } from "@/constants/common";
import { VisibilityCondition, VisibilityGroupNode, VisibilityPrimitive } from "@/types";

const isObject = (value: any): value is Record<string, any> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isVisibilityCondition = (node: any): node is VisibilityCondition => (
  isObject(node) &&
  typeof node.lhs === 'string' &&
  typeof node.operator === 'string' &&
  'rhs' in node
);

const normalizeComparable = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  return String(value).trim();
};

const parseInRhs = (rhs: any): any[] => {
  if (Array.isArray(rhs)) {
    return rhs;
  }

  if (rhs === null || rhs === undefined) {
    return [];
  }

  if (typeof rhs !== 'string') {
    return [rhs];
  }

  const trimmed = rhs.trim();
  if (!(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return [trimmed];
  }

  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    try {
      const normalizedQuotes = trimmed.replace(/'/g, '"');
      const parsed = JSON.parse(normalizedQuotes);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      const sliced = trimmed.slice(1, -1).trim();
      if (!sliced) {
        return [];
      }

      return sliced
        .split(',')
        .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
        .filter((item) => item.length > 0);
    }
  }
};

const evaluateCondition = (condition: VisibilityCondition, values: Record<string, any>): boolean => {
  const lhsValue = extractFieldValue(values[condition.lhs], condition.lhs);
  const lhsComparable = normalizeComparable(lhsValue);

  switch (condition.operator) {
    case 'equals': {
      if (Array.isArray(condition.rhs)) {
        return condition.rhs.some((item) => normalizeComparable(item) === lhsComparable);
      }

      return lhsComparable === normalizeComparable(condition.rhs);
    }
    case 'not_equals': {
      if (Array.isArray(condition.rhs)) {
        return condition.rhs.every((item) => normalizeComparable(item) !== lhsComparable);
      }

      return lhsComparable !== normalizeComparable(condition.rhs);
    }
    case 'in': {
      const rhsValues = parseInRhs(condition.rhs).map(normalizeComparable);
      return rhsValues.includes(lhsComparable);
    }
    default:
      return false;
  }
};

const evaluateGroup = (group: VisibilityGroupNode, values: Record<string, any>): boolean => {
  const andNodes = group.AND ?? group.and;
  if (Array.isArray(andNodes)) {
    return andNodes.every((node) => evaluateVisibilityNode(node, values));
  }

  const orNodes = group.OR ?? group.or;
  if (Array.isArray(orNodes)) {
    return orNodes.some((node) => evaluateVisibilityNode(node, values));
  }

  if (group.operator && Array.isArray(group.conditions)) {
    const operator = group.operator.toUpperCase();
    if (operator === 'AND') {
      return group.conditions.every((node) => evaluateVisibilityNode(node, values));
    }

    if (operator === 'OR') {
      return group.conditions.some((node) => evaluateVisibilityNode(node, values));
    }
  }

  return true;
};

const getFieldKeysToClear = (fieldKey: string, fieldType: string): string[] => {
  const keys = new Set<string>([fieldKey]);

  if (fieldType === 'lookup') {
    keys.add(`${fieldKey}Code`);
  }

  if (fieldType === 'tel') {
    keys.add(`${fieldKey}_callingCode`);
    keys.add(`${fieldKey}_countryCode`);
    keys.add(`${fieldKey}_flag`);
  }

  if (fieldKey === 'projectName') {
    keys.add('projectId');
    keys.add('merchantProjectId');
    keys.add('projectCategory');
  }

  return Array.from(keys);
};

const hasValueToClear = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
};

export const extractFieldValue = (fieldValue: any, lhsKey?: string): VisibilityPrimitive => {
  if (fieldValue === null || fieldValue === undefined) {
    return fieldValue as VisibilityPrimitive;
  }

  if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
    return fieldValue;
  }

  if (!isObject(fieldValue)) {
    return String(fieldValue);
  }

  if (lhsKey) {
    const directMatch = fieldValue[lhsKey];
    if (directMatch !== undefined && directMatch !== null) {
      return extractFieldValue(directMatch);
    }

    const keyCode = fieldValue[`${lhsKey}Code`];
    if (keyCode !== undefined && keyCode !== null) {
      return extractFieldValue(keyCode);
    }
  }

  for (const key of COMMON.OBJECT_VALUE_KEYS) {
    const candidate = fieldValue[key];
    if (candidate !== undefined && candidate !== null) {
      return extractFieldValue(candidate);
    }
  }

  const fallbackKeys = ['name', 'text', 'label'] as const;
  for (const key of fallbackKeys) {
    const candidate = fieldValue[key];
    if (candidate !== undefined && candidate !== null) {
      return extractFieldValue(candidate);
    }
  }

  return '';
};

export const evaluateVisibilityNode = (node: any, values: Record<string, any>): boolean => {
  if (!node) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.every((item) => evaluateVisibilityNode(item, values));
  }

  if (isVisibilityCondition(node)) {
    return evaluateCondition(node, values);
  }

  if (isObject(node)) {
    return evaluateGroup(node, values);
  }

  return true;
};

export const evaluateFieldVisibility = (
  fieldConfig: { visibility?: any } | null | undefined,
  values: Record<string, any>
): boolean => {
  if (!fieldConfig || !('visibility' in fieldConfig) || !fieldConfig.visibility) {
    return true;
  }

  return evaluateVisibilityNode(fieldConfig.visibility, values);
};

export const flattenFields = <T extends { key: string; fieldType: string; fields?: T[] | null }>(
  fields: T[]
): T[] => (
  fields.flatMap((field) => {
    if (field.fieldType === 'row' && Array.isArray(field.fields)) {
      return flattenFields(field.fields);
    }

    return field.key ? [field] : [];
  })
);

export const sortFieldsByDisplayOrder = <T extends { displayOrder?: number; fields?: T[] | null }>(
  fields: T[]
): T[] => (
  fields
    .map((field, index) => ({
      field: (Array.isArray(field.fields)
        ? { ...field, fields: sortFieldsByDisplayOrder(field.fields) }
        : field) as T,
      index,
    }))
    .sort((left, right) => {
      const leftOrder = Number(left.field.displayOrder);
      const rightOrder = Number(right.field.displayOrder);
      const normalizedLeftOrder = Number.isFinite(leftOrder) ? leftOrder : Number.POSITIVE_INFINITY;
      const normalizedRightOrder = Number.isFinite(rightOrder) ? rightOrder : Number.POSITIVE_INFINITY;

      return normalizedLeftOrder - normalizedRightOrder || left.index - right.index;
    })
    .map(({ field }) => field)
);

const evaluateVisibleFieldKeys = <T extends { key: string; fieldType: string; fields?: T[] | null; visibility?: any }>(
  fields: T[],
  values: Record<string, any>
): Set<string> => {
  const visibleKeys = new Set<string>();

  const visitFields = (candidateFields: T[], isParentVisible = true) => {
    candidateFields.forEach((field) => {
      const isVisible = isParentVisible && evaluateFieldVisibility(field, values);

      if (field.fieldType === 'row' && Array.isArray(field.fields)) {
        visitFields(field.fields, isVisible);
        return;
      }

      if (field.key && isVisible) {
        visibleKeys.add(field.key);
      }
    });
  };

  visitFields(fields);

  return visibleKeys;
};

export const resolveVisibilityState = <T extends { key: string; fieldType: string; fields?: T[] | null; visibility?: any }>(
  fields: T[],
  currentValues: Record<string, any>
): {
  visibleFieldKeys: Set<string>;
  sanitizedValues: Record<string, any>;
  hiddenFieldKeys: Set<string>;
  clearedKeys: Set<string>;
} => {
  const flatFields = flattenFields(fields);
  const maxPasses = Math.max(1, flatFields.length + 1);
  let sanitizedValues = currentValues;
  let visibleFieldKeys = evaluateVisibleFieldKeys(fields, sanitizedValues);
  const hiddenFieldKeys = new Set<string>();
  const clearedKeys = new Set<string>();

  for (let pass = 0; pass < maxPasses; pass += 1) {
    visibleFieldKeys = evaluateVisibleFieldKeys(fields, sanitizedValues);
    let hasChanges = false;
    let nextValues = sanitizedValues;

    flatFields.forEach((field) => {
      if (!field.key || visibleFieldKeys.has(field.key)) {
        return;
      }

      hiddenFieldKeys.add(field.key);
      const keysToClear = getFieldKeysToClear(field.key, field.fieldType);

      keysToClear.forEach((keyToClear) => {
        if (!(keyToClear in nextValues)) {
          return;
        }

        hiddenFieldKeys.add(keyToClear);
        const currentValue = nextValues[keyToClear];
        if (!hasValueToClear(currentValue)) {
          return;
        }

        if (!hasChanges) {
          nextValues = { ...nextValues };
          hasChanges = true;
        }

        delete nextValues[keyToClear];
        clearedKeys.add(keyToClear);
      });
    });

    sanitizedValues = nextValues;

    if (!hasChanges) {
      break;
    }
  }

  visibleFieldKeys = evaluateVisibleFieldKeys(fields, sanitizedValues);
  flatFields.forEach((field) => {
    if (!field.key || visibleFieldKeys.has(field.key)) {
      return;
    }

    hiddenFieldKeys.add(field.key);
    getFieldKeysToClear(field.key, field.fieldType).forEach((keyToClear) => {
      hiddenFieldKeys.add(keyToClear);
    });
  });

  return {
    visibleFieldKeys,
    sanitizedValues,
    hiddenFieldKeys,
    clearedKeys,
  };
};
