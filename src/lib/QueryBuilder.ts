export class QueryBuilderError extends Error {}

class FromClause<Columns> {
  public toString() {
    return "";
  }
}

type LogicalOperator = "AND" | "OR";

export class Logical {
  public constructor(
    private left: Comparison | Logical,
    private operator: LogicalOperator,
    private right: Comparison | Logical
  ) {}

  public and(otherComparison: Comparison): Logical {
    return new Logical(this, "AND", otherComparison);
  }

  public or(otherComparison: Comparison): Logical {
    return new Logical(this, "OR", otherComparison);
  }

  public build(): string {
    return `${this.left.build()} ${this.operator} ${this.right.build()}`;
  }
}

type Comparator =
  | "="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<="
  | "IS"
  | "IS NOT"
  | "IN"
  | "NOT IN";

export class Comparison {
  public constructor(
    private left: Ref,
    private comparator: Comparator,
    private right: Ref
  ) {}

  public and(otherComparison: Comparison): Logical {
    return new Logical(this, "AND", otherComparison);
  }

  public or(otherComparison: Comparison): Logical {
    return new Logical(this, "OR", otherComparison);
  }

  public build(): string {
    return `${this.left.build()} ${this.comparator} ${this.right.build()}`;
  }
}

export class Fn {
  // public static AND(conditions: Ref[]): Ref {
  //   return new Ref(conditions.map((c) => `${c.build()}`).join(" AND "));
  // }

  public static CONCAT(...values: Ref[]): Ref {
    return new Ref(values.map((v) => v.build()).join(" + "));
  }

  public static UPPER(text: Ref): Ref {
    return new Ref(`UPPER(${text.build()})`);
  }

  public static SPACE(quantity: number = 1): Ref {
    return new Ref("'" + " ".repeat(quantity) + "'");
  }
}

export class Ref {
  public constructor(private original: string) {}

  public build(): string {
    return this.original;
  }

  private compare(comparator: Comparator, otherRef: Ref): Comparison {
    return new Comparison(this, comparator, otherRef);
  }

  public as(alias: string): Ref {
    return new Ref(`${this.original} AS [${alias}]`);
  }

  public isEqualTo = (otherRef: Ref): Comparison => this.compare("=", otherRef);
  public isLessThan = (otherRef: Ref): Comparison =>
    this.compare("<", otherRef);
  public isLessThanOrEqualTo = (otherRef: Ref): Comparison =>
    this.compare("<=", otherRef);
  public isGreaterThan = (otherRef: Ref): Comparison =>
    this.compare(">", otherRef);
  public isGreaterThanOrEqualTo = (otherRef: Ref): Comparison =>
    this.compare(">=", otherRef);
  public isNotEqualTo = (otherRef: Ref): Comparison =>
    this.compare("<>", otherRef);

  public isFalse = (): Comparison => this.compare("=", Ref.CONSTANTS.FALSE);
  public isTrue = (): Comparison => this.compare("=", Ref.CONSTANTS.TRUE);

  public isNull = (): Comparison => this.compare("IS", Ref.CONSTANTS.NULL);
  public isNotNull = (): Comparison =>
    this.compare("IS NOT", Ref.CONSTANTS.NULL);

  public static number(n: number) {
    return new Ref(`${n}`);
  }

  public static string(s: string) {
    return new Ref(`'${s}'`);
  }

  private static CONSTANTS = {
    NULL: new Ref("NULL"),
    FALSE: new Ref("BIT(0)"),
    TRUE: new Ref("BIT(1)"),
  };
}

type ColumnDefinition = {};

// type Columns = Record<string, string>;
export class TableDefinition<T extends ColumnDefinition> {
  database: string;
  schema: string;
  table: string;
  alias: string;

  // #columns: T;

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

type ITableDefinitionMap = Record<string, TableDefinition<ColumnDefinition>>;

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

  public constructor(private tableDefinitions: TableDefinitionMap = undefined) {
    this.parts = {
      select: null,
      from: null,
      join: [],
      where: null,
    };
  }

  public select(
    columnsSelector: (tableDefinitions: TableDefinitionMap) => Ref[]
  ) {
    if (this.parts.select !== null) {
      throw new QueryBuilderError("'SELECT' already set");
    }

    const columns = columnsSelector(this.tableDefinitions);

    if (columns.length === 0) {
      throw new QueryBuilderError("No columns selected");
    }

    this.parts.select = columns;
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
    if (this.parts.select === null) {
      throw new QueryBuilderError("'SELECT' is required");
    }

    const columnsSelected = this.parts.select.map((r) => r.build().trim());

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

// export class ConditionBuilder<TableDefinitionMap extends ITableDefinitionMap> {
//   private condition: Ref;

//   public constructor(private tableDefinitionMap: TableDefinitionMap) {}

//   public where(left: Ref, comparator: Comparator, right: Ref) {
//     this.condition = new Ref(`${left.build()}${comparator}${right.build()}`);
//     return this;
//   }

//   public build(): string {
//     return this.condition.build();
//   }
// }

// export class ConditionGroup {
//   public constructor(
//     public leftRef: Ref | ConditionGroup,
//     public comparator: Comparator,
//     public rightRef: Ref | ConditionGroup
//   ) {}

//   public and(
//     comparator: Comparator,
//     rightRef: Ref | ConditionGroup
//   ): ConditionGroup {
//     return new ConditionGroup(this, comparator, rightRef);
//   }
//   public or(
//     comparator: Comparator,
//     rightRef: Ref | ConditionGroup
//   ): ConditionGroup {
//     return new ConditionGroup(this, comparator, rightRef);
//   }
// }

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

// export class ConditionBuilder<TableDefinitionMap extends ITableDefinitionMap> {
//   constructor(public tableDefinitions: TableDefinitionMap) {}

//   public on(
//     columnSelector: (
//       tableDefinitions: TableDefinitionMap
//     ) => TableDefinitionMap["#columns"],
//     condition: Condition,
//     value: string
//   ) {
//     return this;
//   }

//   public and() {}
//   public or() {}
// }
