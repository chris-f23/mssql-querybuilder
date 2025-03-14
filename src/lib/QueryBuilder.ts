export class ClauseAlreadySetError extends Error {}
class FromClause<Columns> {
  public toString() {
    return "";
  }
}

export class FromClauseBuilder<MainTableColumns> {
  constructor() {}

  public join<Columns>(table: {
    database: string;
    schema: string;
    table: string;
    as: string;
  }) {
    return new FromClause<MainTableColumns>();
  }

  public build() {
    return "";
  }
}

export class QueryBuilder {
  private clauses: {
    select: string;
    from: string;
    where: string;
  } = {
    select: "",
    from: "",
    where: "",
  };

  public constructor() {}

  public select(columns: string[]) {
    if (this.clauses.select.length > 0) {
      throw new ClauseAlreadySetError("'SELECT' already set");
    }

    this.clauses.select = "SELECT " + columns.map((c) => `[${c}]`).join(", ");
    return this;
  }

  public from<Columns>(mainTable: {
    database: string;
    schema: string;
    table: string;
    as: string;
  }) {
    if (this.clauses.from.length > 0) {
      throw new ClauseAlreadySetError("'FROM' already set");
    }

    if (mainTable.schema === undefined) {
      mainTable.schema = "dbo";
    }

    this.clauses.from = `FROM [${mainTable.database}].[${mainTable.schema}].[${mainTable.table}] AS ${mainTable.as}`;
    return new FromClauseBuilder<Columns>(this.clauses.from);
  }

  public where(field: string, operator: string, value: string) {
    if (this.clauses.where.length > 0) {
      throw new ClauseAlreadySetError("'WHERE' already set");
    }
    this.clauses.where = `WHERE ${field} ${operator} ${value}`;
    return this;
  }

  public build() {
    return `${this.clauses.select} ${this.clauses.from} ${this.clauses.where}`;
  }
}
