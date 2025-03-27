import { IRef } from "./Ref";
import { ITableDefinitionMap } from "./types";

export class ColumnSelectorError extends Error {}

export class ColumnSelector<TableDefinitionMap extends ITableDefinitionMap> {
  private selectFn?: (tableDefinitions: TableDefinitionMap) => IRef[];

  constructor(private tableDefinitions?: TableDefinitionMap) {}

  public select(selectFn: (tableDefinitions?: TableDefinitionMap) => IRef[]) {
    this.selectFn = selectFn;
    return this;
  }

  public build(): string {
    const columns = this.selectFn(this.tableDefinitions);

    if (columns.length === 0) {
      throw new ColumnSelectorError("No columns selected");
    }

    return `SELECT ${columns.map((c) => c.build()).join(", ")}`;
  }
}
