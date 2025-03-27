import { ColumnSelector } from "./ColumnSelector";
import { Comparison } from "./Comparison";
import { Logical } from "./Logical";
import { IRef, Ref } from "./Ref";
import { TableSelector } from "./TableSelector";
import { ITableDefinitionMap } from "./types";

export class QueryBuilderError extends Error {}

export class QueryBuilder<TableDefinitionMap extends ITableDefinitionMap> {
  private columnSelector: ColumnSelector<
    QueryBuilder<TableDefinitionMap>["tableDefinitions"]
  >;

  private tableSelector: TableSelector<
    QueryBuilder<TableDefinitionMap>["tableDefinitions"]
  >;
  private whereCondition: Logical | Comparison;
  private orderByRefs: IRef[];

  public constructor(private tableDefinitions: TableDefinitionMap = undefined) {
    this.columnSelector = new ColumnSelector(this.tableDefinitions);
  }

  public select(fn: (tableDefinitions: TableDefinitionMap) => IRef[]) {
    this.columnSelector.select(fn);
    return this;
  }

  public from(tableDefinitionName: keyof typeof this.tableDefinitions) {
    this.tableSelector = new TableSelector(this.tableDefinitions);
    this.tableSelector.from(tableDefinitionName);
    return this;
  }

  public join(
    tableAlias: keyof typeof this.tableDefinitions,
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    this.tableSelector.join("JOIN", tableAlias, conditionBuilder);
    return this;
  }

  public leftJoin(
    tableAlias: keyof typeof this.tableDefinitions,
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    this.tableSelector.join("LEFT JOIN", tableAlias, conditionBuilder);
    return this;
  }

  public rightJoin(
    tableAlias: keyof typeof this.tableDefinitions,
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    this.tableSelector.join("RIGHT JOIN", tableAlias, conditionBuilder);
    return this;
  }

  public where(
    conditionBuilder: (
      tableDefinitions: TableDefinitionMap
    ) => Logical | Comparison
  ) {
    const conditionBuilderResult = conditionBuilder(this.tableDefinitions);
    this.whereCondition = conditionBuilderResult;
    return this;
  }

  public orderBy(orderByFn: (tableDefinitions: TableDefinitionMap) => IRef[]) {
    const orderByFnResult = orderByFn(this.tableDefinitions);
    this.orderByRefs = orderByFnResult;
    return this;
  }

  // public where(
  //   conditionBuilder: (
  //     tableDefinitions: TableDefinitionMap
  //   ) => Logical | Comparison
  // ) {
  //   const conditionBuilderResult = conditionBuilder(this.tableDefinitions);
  //   this.whereCondition = conditionBuilderResult;
  //   return this;
  // }

  public build() {
    let finalQuery = "";
    finalQuery += this.columnSelector.build();
    if (this.tableSelector) {
      finalQuery += " " + this.tableSelector.build();
    }
    if (this.whereCondition) {
      finalQuery += " WHERE " + this.whereCondition.build();
    }

    if (this.orderByRefs) {
      finalQuery +=
        " ORDER BY " + this.orderByRefs.map((r) => r.build()).join(", ");
    }

    finalQuery += ";";

    return finalQuery;
  }
}
