import { Comparison } from "./Comparison";
import { Ref } from "./Ref";

describe("Comparison", () => {
  it(`Should build "'abc' <> 'def'"`, () => {
    expect(
      Ref.STRING("abc").isNotEqualTo(Ref.STRING("def")).build()
    ).toStrictEqual("'abc' <> 'def'");
  });

  it(`Should build "'123' = 123"`, () => {
    expect(Ref.STRING("123").isEqualTo(Ref.NUMBER(123)).build()).toStrictEqual(
      "'123' = 123"
    );
  });

  it(`Should build "100 > 10"`, () => {
    expect(Ref.NUMBER(100).isGreaterThan(Ref.NUMBER(10)).build()).toStrictEqual(
      "100 > 10"
    );
  });

  it(`Should build "0 = BIT(0)"`, () => {
    expect(Ref.NUMBER(0).isFalse().build()).toStrictEqual("0 = BIT(0)");
  });

  it(`Should build "1 = BIT(1)"`, () => {
    expect(Ref.NUMBER(1).isTrue().build()).toStrictEqual("1 = BIT(1)");
  });
});
