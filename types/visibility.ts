export type VisibilityPrimitive = string | number | boolean | null | undefined;

export type VisibilityOperator = 'equals' | 'not_equals' | 'in' | string;

export type VisibilityCondition = {
  lhs: string;
  operator: VisibilityOperator;
  rhs: any;
};

export type VisibilityGroupNode = {
  AND?: VisibilityNode[];
  OR?: VisibilityNode[];
  and?: VisibilityNode[];
  or?: VisibilityNode[];
  operator?: string;
  conditions?: VisibilityNode[];
};

export type VisibilityNode = VisibilityCondition | VisibilityGroupNode | VisibilityNode[];
