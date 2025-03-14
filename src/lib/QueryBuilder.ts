export class ClauseAlreadySetError extends Error {}

export class QueryBuilder {
  private clauses = {
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

  public from(database: string, schema: string, table: string, alias: string) {
    if (this.clauses.from.length > 0) {
      throw new ClauseAlreadySetError("'FROM' already set");
    }
    const fullyQualifiedName = `[${database}].[${schema}].[${table}] AS ${alias}`;
    this.clauses.from = `FROM ${fullyQualifiedName}`;
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
    return `${this.clauses.select} ${this.clauses.from} ${this.clauses.where}`;
  }
}
