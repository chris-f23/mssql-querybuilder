import { Comparison } from "./Comparison";
import { Comparator } from "./types";

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
