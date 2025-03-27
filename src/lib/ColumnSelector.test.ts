import { ColumnSelector } from "./ColumnSelector";
import { Ref } from "./Ref";

describe("Column Selector", () => {
  it(`Should build "SELECT 1"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.NUMBER(1)];
      })
      .build();

    expect(columnsSelected).toStrictEqual(`SELECT 1`);
  });

  it(`Should build "SELECT 1 AS [number]"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.NUMBER(1).as("number")];
      })
      .build();

    expect(columnsSelected).toStrictEqual(`SELECT 1 AS [number]`);
  });

  it(`Should build "SELECT 'Hello World'"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.STRING("Hello World")];
      })
      .build();

    expect(columnsSelected).toEqual("SELECT 'Hello World'");
  });

  it(`Should build "SELECT 'Hello World' AS [message]"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [Ref.STRING("Hello World").as("message")];
      })
      .build();

    expect(columnsSelected).toEqual("SELECT 'Hello World' AS [message]");
  });

  it(`Should build "SELECT UPPER('hello world') AS [upper_message], 'me' AS [author]"`, () => {
    const columnsSelected = new ColumnSelector()
      .select(() => {
        return [
          Ref.STRING("hello world").toUpper().as("upper_message"),
          Ref.STRING("me").as("author"),
        ];
      })
      .build();

    expect(columnsSelected).toStrictEqual(
      `SELECT UPPER('hello world') AS [upper_message], 'me' AS [author]`
    );
  });
});
