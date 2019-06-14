import {
  GraphQLFieldConfigArgumentMap,
  GraphQLInterfaceType,
  GraphQLObjectType
} from 'graphql';
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
export type PageArgsFilter<
  T extends string = string,
  F extends FieldFilter = FieldFilter
> = Record<T, F>;

/** Order By Option */
export interface OrderByOption<
  S extends string = string,
  D extends string = 'ASC' | 'DESC'
> {
  field: S;
  direction: D;
}

/** Order By Options */
export type OrderByOptions<
  S extends string = string,
  D extends string = 'ASC' | 'DESC'
> = Array<OrderByOption<S, D>>;

/** Page Arguments */
export interface PageArgs<
  S extends string = string,
  D extends string = 'ASC' | 'DESC',
  F extends PageArgsFilter = PageArgsFilter
> {
  filters?: F[];
  queryOptions?: {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
    orderBy?: OrderByOptions<S, D>;
  };
}

/** Page Arguments Map */
export function PageArgsMap(
  type: GraphQLObjectType | GraphQLInterfaceType
): GraphQLFieldConfigArgumentMap {
  return {
    filters: {
      type: FilterType(type)
    },
    queryOptions: {
      type: QueryOptionsType(type)
    }
  };
}
