import { Comparison } from "./Comparison";
import { Comparator } from "./types";

export class Ref {
  private constructor(private original: string) {}

  public build(): string {
    return this.original;
  }

  private compare(comparator: Comparator, otherRef: Ref): Comparison {
    return new Comparison(this, comparator, otherRef);
  }

  public as(alias: string): Ref {
    return new Ref(`${this.original} AS [${alias}]`);
  }

  public static _raw = (raw: string) => new Ref(raw);

  public append = (otherRef: Ref) =>
    new Ref(`${this.original} + ${otherRef.build()}`);

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

  public isFalse = (): Comparison => this.compare("=", Ref.FALSE());
  public isTrue = (): Comparison => this.compare("=", Ref.TRUE());
  public isNull = (): Comparison => this.compare("IS", Ref.NULL());
  public isNotNull = (): Comparison => this.compare("IS NOT", Ref.NULL());

  public toUpper = () => new Ref(`UPPER(${this.original})`);
  public toLower = () => new Ref(`LOWER(${this.original})`);

  // public static UPPER = (ref: Ref) => new Ref(`UPPER(${ref.build()})`);
  // public static LOWER = (ref: Ref) => new Ref(`LOWER(${ref.build()})`);

  // public static CONCAT(...values: Ref[]): Ref {
  //   return new Ref(values.map((v) => v.build()).join(" + "));
  // }

  public static NUMBER = (value: number) => new Ref(`${value}`);

  public static STRING = (value: string) => new Ref(`'${value}'`);

  public static BOOLEAN = (value: boolean) =>
    new Ref(`BIT(${value ? "1" : "0"})`);

  public static NULL = () => new Ref("NULL");
  public static FALSE = () => new Ref(`BIT(0)`);
  public static TRUE = () => new Ref(`BIT(1)`);
}
