import { ColumnSelector } from "./ColumnsSelector";
import { Comparison } from "./Comparison";
import { Logical } from "./Logical";
import { Ref } from "./Ref";
import { ITableDefinitionMap } from "./types";

export class QueryBuilderError extends Error { }

export class QueryBuilder<TableDefinitionMap extends ITableDefinitionMap> {
  private parts: {
    select: null | Ref[];
    from: TableDefinitionMap[keyof TableDefinitionMap] | null;
    join: Array<{
      table: TableDefinitionMap[keyof TableDefinitionMap];
      condition: Logical | Comparison;
    }> | null;
    where: Logical | Comparison | null;
  };

  public columnsSelector: ColumnSelector<
    QueryBuilder<TableDefinitionMap>["tableDefinitions"]
  >;

  public constructor(private tableDefinitions: TableDefinitionMap = undefined) {
    this.columnsSelector = new ColumnSelector(this.tableDefinitions);

    this.parts = {
      select: null,
      from: null,
      join: [],
      where: null,
    };
  }

  public select(fn: (tableDefinitions: TableDefinitionMap) => Ref[]) {
    this.columnsSelector.select(fn);
    return this;
  }

  public from(tableDefinitionName: keyof typeof this.tableDefinitions) {
    if (this.parts.from !== null) {
      throw new QueryBuilderError("'SELECT' already set");
    }

    const table = this.tableDefinitions[tableDefinitionName];
    this.parts.from = table;
    return this;
  }

  public join(
    tableAlias: keyof typeof this.tableDefinitions,
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    const table = this.tableDefinitions[tableAlias];

    const conditionBuilderResult = conditionBuilder(this.tableDefinitions);

    this.parts.join.push({ table: table, condition: conditionBuilderResult });
    return this;
  }

  // public where(field: string, operator: string, value: string) {
  //   if (this.query.where !== null) {
  //     throw new QueryBuilderError("'WHERE' already set");
  //   }

  //   this.query.where = `WHERE ${field} ${operator} ${value}`;
  //   return this;
  // }

  public buildParts(separator: string) {

    const columnsSelected = this.columnsSelector.build() //this.parts.select.map((r) => r.build().trim());

    let fromTable: string;
    if (this.parts.from) {
      fromTable = `FROM ${this.parts.from.fullName()}`.trim();
    }

    let joinTables: string[];
    if (this.parts.join) {
      joinTables = this.parts.join.map(({ table, condition }) => {
        return [
          `JOIN ${table.fullName().trim()}`,
          `ON ${condition.build().trim()}`,
        ].join(separator);
      });
    }

    let whereCondition: string;
    if (this.parts.where) {
      whereCondition = this.parts.where.build().trim();
    }

    return {
      columnsSelected,
      fromTable,
      joinTables,
      whereCondition,
    };
  }

  public build(multiline: boolean = false) {
    const separator = multiline ? "\n" : " ";
    const { columnsSelected, fromTable, joinTables, whereCondition } =
      this.buildParts(separator);

    return [
      `SELECT`,
      columnsSelected.join(separator),
      fromTable,
      joinTables,
      whereCondition,
    ]
      .join(separator)
      .trim();
  }
}
