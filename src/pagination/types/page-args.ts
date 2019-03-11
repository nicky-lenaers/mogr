import { GraphQLFieldConfigArgumentMap, GraphQLInterfaceType, GraphQLObjectType } from 'graphql';
import { FilterType } from './filter';
import { QueryOptionsType } from './query-options';

/** Filter Operator Types */
export enum FilterOperatorTypes {
  eq = '$eq',
  ne = '$ne',
  in = '$in',
  contains = '$regex'
}

/** Field Filter */
export interface FieldFilter {
  eq?: string;
  ne?: string;
  in?: string[];
  contains?: {
    value: string;
    options?: string;
  };
}

/** Page Arguments Filter */
export interface PageArgsFilter {
  [key: string]: FieldFilter;
}

/** Order By Option */
export interface OrderByOption {
  field: string;
  direction: 'ASC' | 'DESC';
}

/** Order By Options */
export type OrderByOptions = OrderByOption[];

/** Page Arguments */
export interface PageArgs {
  filters?: PageArgsFilter[];
  queryOptions?: {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
    orderBy?: OrderByOptions;
  };
}

/** Page Arguments Map */
export function PageArgsMap(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLFieldConfigArgumentMap {
  return {
    filters: {
      type: FilterType(type)
    },
    queryOptions: {
      type: QueryOptionsType(type)
    }
  };
}
