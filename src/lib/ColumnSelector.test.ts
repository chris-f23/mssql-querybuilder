import { ColumnSelector } from "./ColumnSelector";
import { Ref } from "./Ref";

describe("QueryBuilder", () => {
  it(`Should select "1"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.NUMBER(1)];
      })
      .build();

    expect(columnsSelected).toStrictEqual(["1"]);
  });

  it(`Should select "1 AS [number]"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.NUMBER(1).as("number")];
      })
      .build();

    expect(columnsSelected).toStrictEqual(["1 AS [number]"]);
  });

  it(`Should select "SELECT UPPER('hello world') AS [upper_message]" and "'me' AS [author]"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [
          Ref.STRING("hello world").toUpper().as("upper_message"),
          Ref.STRING("me").as("author"),
        ];
      })
      .build();

    expect(columnsSelected).toStrictEqual([
      `UPPER('hello world') AS [upper_message]`,
      `'me' AS [author]`,
    ]);
  });
});
