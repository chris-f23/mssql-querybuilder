import { ColumnSelector } from "./ColumnsSelector";
import { Fn } from "./Fn";
import { Ref } from "./Ref";

describe("QueryBuilder", () => {
  it(`Should select "1"`, () => {
    const columnsSelected = new ColumnSelector().select(() => {
      return [Ref.number(1)];
    }).build();

    expect(columnsSelected).toStrictEqual(["1"]);
  });

  it(`Should select "1 AS [number]"`, () => {
    const columnsSelected = new ColumnSelector().select(() => {
      return [Ref.number(1).as("number")];
    }).build();

    expect(columnsSelected).toStrictEqual(["1 AS [number]"]);
  });

  it(`Should select "SELECT UPPER('hello world') AS [upper_message]" and "'me' AS [author]"`, () => {
    const columnsSelected = new ColumnSelector().select(() => {
      return [Fn.UPPER(Ref.string("hello world")).as("upper_message")];
    }).build();

    expect(columnsSelected).toStrictEqual([`SELECT UPPER('hello world') AS [upper_message]`, `'me' AS [author]`]);
  });
});