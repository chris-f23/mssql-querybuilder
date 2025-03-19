import { Ref } from "./Ref";
import { ColumnDefinition } from "./types";

export class TableDefinition<T extends ColumnDefinition> {
  database: string;
  schema: string;
  table: string;
  alias: string;

  constructor(props: {
    database: string;
    schema?: string;
    table: string;
    alias: string;
  }) {
    this.database = props.database;
    this.schema = props.schema ?? "dbo";
    this.table = props.table;
    this.alias = props.alias;
  }

  get(column: keyof T): Ref {
    return new Ref(`[${this.alias}].[${String(column)}]`);
  }

  fullName() {
    return `[${this.database}].[${this.schema}].[${this.table}] AS [${this.alias}]`;
  }
}
