import { Comparison } from "./Comparison";
import { Comparator } from "./types";

export interface IRef {
  build(): string;
}

export class OrderedRef implements IRef {
  public constructor(private original: string) {}

  public build(): string {
    return this.original;
  }
}

export class AliasRef implements IRef {
  public constructor(private original: string) {}

  public build(): string {
    return this.original;
  }
}

export class Ref implements IRef {
  private constructor(private original: string) {}

  public build(removeWrappingParenthesis: boolean = true): string {
    if (
      removeWrappingParenthesis &&
      this.original.startsWith("(") &&
      this.original.endsWith(")")
    ) {
      return this.original.slice(1, this.original.length - 1);
    }
    return this.original;
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

  private compare(
    comparator: Comparator,
    refOrValue: Ref | string | number
  ): Comparison {
    let newRef: Ref;

    if (refOrValue instanceof Ref) {
      newRef = refOrValue;
    } else if (typeof refOrValue === "number") {
      newRef = Ref.NUMBER(refOrValue);
    } else {
      newRef = Ref.STRING(refOrValue);
    }

    return new Comparison(this, comparator, newRef);
  }

  public isEqualTo = (refOrValue: Ref | string | number): Comparison =>
    this.compare("=", refOrValue);

  public isLessThan = (refOrValue: Ref | string | number): Comparison =>
    this.compare("<", refOrValue);

  public isLessThanOrEqualTo = (
    refOrValue: Ref | string | number
  ): Comparison => this.compare("<=", refOrValue);

  public isGreaterThan = (refOrValue: Ref | string | number): Comparison =>
    this.compare(">", refOrValue);

  public isGreaterThanOrEqualTo = (
    refOrValue: Ref | string | number
  ): Comparison => this.compare(">=", refOrValue);

  public isNotEqualTo = (refOrValue: Ref | string | number): Comparison =>
    this.compare("<>", refOrValue);

  public isFalse = (): Comparison => this.compare("=", Ref.FALSE());
  public isTrue = (): Comparison => this.compare("=", Ref.TRUE());
  public isNull = (): Comparison => this.compare("IS", Ref.NULL());
  public isNotNull = (): Comparison => this.compare("IS NOT", Ref.NULL());

  public toUpper = () => new Ref(`UPPER(${this.original})`);
  public toLower = () => new Ref(`LOWER(${this.original})`);

  public multipliedBy = (refOrValue: Ref | number) =>
    new Ref(
      `(${this.original} * ${
        refOrValue instanceof Ref ? refOrValue.build() : refOrValue
      })`
    );

  public dividedBy = (refOrValue: Ref | number) =>
    new Ref(
      `(${this.original} / ${
        refOrValue instanceof Ref ? refOrValue.build() : refOrValue
      })`
    );

  public isBetween = (
    refOrValue: Ref | number | string,
    andRefOrValue: Ref | number | string
  ): Comparison => {
    let leftRef = refOrValue;

    if (typeof leftRef === "string") {
      leftRef = Ref.STRING(leftRef);
    } else if (typeof leftRef === "number") {
      leftRef = Ref.NUMBER(leftRef);
    }

    let rightRef = andRefOrValue;
    if (typeof rightRef === "string") {
      rightRef = Ref.STRING(rightRef);
    } else if (typeof rightRef === "number") {
      rightRef = Ref.NUMBER(rightRef);
    }

    return new Comparison(
      this,
      "BETWEEN",
      new Ref(`${leftRef.build()} AND ${rightRef.build()}`)
    );
  };

  // public isLike = (otherRef: Ref) => this.compare("LIKE", otherRef);

  public startsWith = (otherRefOrString: Ref | string) => {
    const compareString =
      otherRefOrString instanceof Ref
        ? `'%' + ${otherRefOrString.build()}`
        : `'%${otherRefOrString}'`;

    return this.compare("LIKE", Ref._raw(compareString));
  };

  public endsWith = (otherRefOrString: Ref | string) => {
    const compareString =
      otherRefOrString instanceof Ref
        ? `${otherRefOrString.build()} + '%'`
        : `'${otherRefOrString}%'`;

    return this.compare("LIKE", Ref._raw(compareString));
  };

  public contains = (otherRefOrString: Ref | string) => {
    const compareString =
      otherRefOrString instanceof Ref
        ? `'%' + ${otherRefOrString.build()} + '%'`
        : `'%${otherRefOrString}%'`;

    return this.compare("LIKE", Ref._raw(compareString));
  };
  // public static UPPER = (ref: Ref) => new Ref(`UPPER(${ref.build()})`);
  // public static LOWER = (ref: Ref) => new Ref(`LOWER(${ref.build()})`);

  // public static CONCAT(...values: Ref[]): Ref {
  //   return new Ref(values.map((v) => v.build()).join(" + "));
  // }

  public ascending = () => new OrderedRef(`${this.original} ASC`);

  public descending = () => new OrderedRef(`${this.original} DESC`);

  public static NUMBER = (value: number) => new Ref(`${value}`);

  public static STRING = (value: string) => new Ref(`'${value}'`);

  public static BOOLEAN = (value: boolean) =>
    new Ref(`BIT(${value ? "1" : "0"})`);

  public static NULL = () => new Ref("NULL");
  public static FALSE = () => new Ref(`BIT(0)`);
  public static TRUE = () => new Ref(`BIT(1)`);

  public static sumOverPartition(ref: Ref, by: Ref): Ref {
    return new Ref(`SUM(${ref.build()}) OVER (PARTITION BY ${by.build()})`);
  }
}
