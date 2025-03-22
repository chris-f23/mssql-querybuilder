import { Ref } from "./Ref";
import { ITableDefinitionMap } from "./types";

export class ColumnSelectorError extends Error {}

export class ColumnSelector<TableDefinitionMap extends ITableDefinitionMap> {
  private selectFn?: (tableDefinitions: TableDefinitionMap) => Ref[];

  constructor(private tableDefinitions?: TableDefinitionMap) {}

  public select(selectFn: (tableDefinitions?: TableDefinitionMap) => Ref[]) {
    this.selectFn = selectFn;
    return this;
  }

  public build(): string[] {
    const columns = this.selectFn(this.tableDefinitions);

    if (columns.length === 0) {
      throw new ColumnSelectorError("No columns selected");
    }

    return [...columns.map((c) => c.build())];
  }
}
