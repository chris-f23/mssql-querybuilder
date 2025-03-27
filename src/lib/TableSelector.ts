import { Comparison } from "./Comparison";
import { Logical } from "./Logical";
import { ITableDefinitionMap } from "./types";

export class TableSelectorError extends Error {}

type JoinType = "JOIN" | "LEFT JOIN" | "RIGHT JOIN";

export class TableSelector<TableDefinitionMap extends ITableDefinitionMap> {
  private fromTable: TableDefinitionMap[keyof TableDefinitionMap];
  private joinTables: Array<{
    joinType: JoinType;
    table: TableDefinitionMap[keyof TableDefinitionMap];
    condition: Logical | Comparison;
  }>;

  constructor(private tableDefinitions?: TableDefinitionMap) {}

  public from(tableDefinitionName: keyof typeof this.tableDefinitions) {
    this.fromTable = this.tableDefinitions[tableDefinitionName];
    return this;
  }

  public join(
    joinType: JoinType,
    tableAlias: keyof typeof this.tableDefinitions,
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    const table = this.tableDefinitions[tableAlias];
    const condition = conditionBuilder(this.tableDefinitions);

    if (!this.joinTables) {
      this.joinTables = [];
    }

    this.joinTables.push({
      joinType,
      table,
      condition,
    });

    return this;
  }

  public build(): string {
    return [
      `FROM ${this.fromTable.fullName()}`,
      this.joinTables.map(({ joinType, table, condition }) => {
        return `${joinType} ${table.fullName()} ON ${condition.build()}`;
      }).join(" "),
    ].join(" ");
  }
}
