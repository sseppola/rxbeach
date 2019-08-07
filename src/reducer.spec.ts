import { reducer, reducerMap } from "reducer";
import { deepEqual } from "assert";

describe("reducer", function() {
  it("Should define actions and map them to reducers", function() {
    const reducerFn = (totalLength: number, payload: string) =>
      totalLength + payload.length;

    const addString = reducer(reducerFn);
    const reducers = reducerMap(addString);

    deepEqual(reducers, new Map([[addString.type, reducerFn]]));
  });
});
