import { table } from "console";

type JoinType = "FULL";
type Condition = "=" | "<>" | ">" | "<" | ">=" | "<=";

export class ClauseAlreadySetError extends Error {}
class FromClause<Columns> {
  public toString() {
    return "";
  }
}

type ColumnDefinition = {};

// type Columns = Record<string, string>;
export class TableDefinition<T extends ColumnDefinition> {
  database: string;
  schema: string;
  table: string;
  #columns: T;

  constructor(props: { database: string; schema?: string; table: string }) {
    this.database = props.database;
    this.schema = props.schema ?? "dbo";
    this.table = props.table;
  }

  colRef(column: keyof T) {
    return String(column);
  }

  fullName(alias: string) {
    return `[${this.database}].[${this.schema}].[${this.table}] AS [${alias}]`;
  }
}

// export class FromClauseBuilder<MainTableColumns> {
//   constructor() {}

//   public join<Columns>(table: {
//     database: string;
//     schema: string;
//     table: string;
//     as: string;
//   }) {
//     return new FromClause<MainTableColumns>();
//   }

//   public build() {
//     return "";
//   }
// }

// type TableDefinitionMap<
//   TableColumns extends string[],
//   TableAliases extends string,
//   TableDefinitions extends TableDefinition<TableColumns>
// > = {
//   [key in TableAliases]: TableDefinitions;
// };

type ITableDefinitionMap = Record<string, TableDefinition<ColumnDefinition>>;

export class ConditionBuilder<TableDefinitionMap extends ITableDefinitionMap> {
  constructor(public tableDefinitions: TableDefinitionMap) {}

  // public on(
  //   columnSelector: (
  //     tableDefinitions: TableDefinitionMap
  //   ) => TableDefinitionMap["#columns"],
  //   condition: Condition,
  //   value: string
  // ) {}

  public and() {}
  public or() {}
}

export class QueryBuilder<TableDefinitionMap extends ITableDefinitionMap> {
  private clauses: {
    select: string;
    from: string;
    where: string;
  } = {
    select: "",
    from: "",
    where: "",
  };

  tableDefinitions: TableDefinitionMap;

  public constructor(tableDefinitions: TableDefinitionMap) {
    this.tableDefinitions = tableDefinitions;
  }

  public select(
    columnsSelector: (
      tableDefinitions: TableDefinitionMap
    ) => Record<string, string>
  ) {
    if (this.clauses.select.length > 0) {
      throw new ClauseAlreadySetError("'SELECT' already set");
    }

    const columns = columnsSelector(this.tableDefinitions);

    this.clauses.select =
      "SELECT " +
      Object.entries(columns)
        .map(([k, v]) => `${v} AS [${k}]`)
        .join(", ");
    return this;
  }

  public from(tableAlias: keyof typeof this.tableDefinitions) {
    const table = this.tableDefinitions[tableAlias];

    this.clauses.from = `FROM ${table.fullName(String(tableAlias))}`;
    return this;
  }

  public join(
    tableAlias: keyof typeof this.tableDefinitions,
    joinType: JoinType,
    on: (
      conditionBuilder: ConditionBuilder<typeof this.tableDefinitions>
    ) => ConditionBuilder<typeof this.tableDefinitions>
  ) {
    // const join = on(this.tableDefinitions);

    // this.clauses.from = `FROM ${leftTable.fullName(
    return this;
  }

  public where(field: string, operator: string, value: string) {
    if (this.clauses.where.length > 0) {
      throw new ClauseAlreadySetError("'WHERE' already set");
    }
    this.clauses.where = `WHERE ${field} ${operator} ${value}`;
    return this;
  }

  public build() {
    return [this.clauses.select, this.clauses.from, this.clauses.where].join(
      " "
    );
  }
}
