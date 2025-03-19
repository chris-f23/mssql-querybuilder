import { Ref } from "./Ref";

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
