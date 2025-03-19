import { Logical } from "./Logical";
import { Ref } from "./Ref";
import { Comparator } from "./types";

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
