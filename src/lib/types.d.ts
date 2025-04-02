import { TableDefinition } from "./TableDefinition";

export type ITableDefinitionMap = Record<
  string,
  TableDefinition<ColumnDefinition>
>;
export type ColumnDefinition = {};

export type Comparator =
  | "="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<="
  | "IS"
  | "IS NOT"
  | "IN"
  | "NOT IN"
  | "LIKE"
  | "NOT LIKE"
  | "BETWEEN";
