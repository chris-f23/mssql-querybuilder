import { Comparison } from "./Comparison";

export type LogicalOperator = "AND" | "OR";

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
