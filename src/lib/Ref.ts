import { Comparison } from "./Comparison";
import { Comparator } from "./types";

export interface IRef {
  build(): string;
}

class AliasRef implements IRef {
  public constructor(private original: string) {}

  public build(): string {
    return this.original;
  }
}

export class Ref implements IRef {
  private constructor(private original: string) {}

  public build(): string {
    return this.original;
  }

  private compare(comparator: Comparator, otherRef: Ref): Comparison {
    return new Comparison(this, comparator, otherRef);
  }

  public as(alias: string): AliasRef {
    return new AliasRef(`${this.original} AS [${alias}]`);
  }

  public static _raw = (raw: string) => new Ref(raw);

  public append(otherRefOrString: Ref | string) {
    if (otherRefOrString instanceof Ref) {
      return new Ref(`${this.original} + ${otherRefOrString.build()}`);
    }
    return new Ref(`${this.original} + '${otherRefOrString}'`);
  }

  // public wrap(value: string) {
  //   return new Ref(`'${value}' + ${this.original} + '${value}'`);
  // }

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

  // public isLike = (otherRef: Ref) => this.compare("LIKE", otherRef);

  public startsWith = (otherRef: Ref) =>
    this.compare("LIKE", Ref._raw(`'%' + ${otherRef.build()}`));

  public endsWith = (otherRef: Ref) =>
    this.compare("LIKE", Ref._raw(`${otherRef.build()} + '%'`));

  public contains = (otherRef: Ref) =>
    this.compare("LIKE", Ref._raw(`'%' + ${otherRef.build()} + '%'`));

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
