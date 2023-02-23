import { IsExact } from 'conditional-type-checks';
import { Equal, Expect } from '../internal/testing/utils';
import { Action, ActionName } from './Action';

type InternalMeta = Action<ActionName>['meta'];

type tests = [
  // It creates the minimal action shape with only a type
  Expect<
    Equal<
      Action<`[test] type`>,
      { type: `[test] type`; meta: Readonly<InternalMeta> }
    >
  >,
  // It enforces the action name shape
  // @ts-expect-error
  Action<`test type`>,

  // It accepts a payload
  Expect<
    Equal<
      Action<`[test] payload`, { two: 2 }>,
      {
        type: `[test] payload`;
        payload: { two: 2 };
        meta: Readonly<InternalMeta>;
      }
    >
  >,

  // It allows any kind of payload
  Expect<
    Equal<
      Action<`[test] payload`, 2>,
      { type: `[test] payload`; payload: 2; meta: Readonly<InternalMeta> }
    >
  >,

  // It accepts a payload and metadata
  Expect<
    Equal<
      Action<`[test] metadata`, { asd: 'asd' }, { createdAt: Date }>,
      {
        type: `[test] metadata`;
        payload: { asd: 'asd' };
        meta: Readonly<InternalMeta & { createdAt: Date }>;
      }
    >
  >,

  // it enforces payload as a record
  // @ts-expect-error
  Action<`[test] metadata`, { asd: 'asd' }, number>,

  // It expands union types
  Expect<
    Equal<
      Action<`[test] union payload`, boolean>,
      | Action<`[test] union payload`, true>
      | Action<`[test] union payload`, false>
    >
  >,

  // It expands union types from enums
  Expect<
    Equal<
      Action<`[test] enum union`, Enum>,
      Action<`[test] enum union`, Enum.A> | Action<`[test] enum union`, Enum.B>
    >
  >,

  // It expands inline union types
  Expect<
    Equal<
      Action<`[test] inline union`, Foo | Bar>,
      Action<`[test] inline union`, Foo> | Action<`[test] inline union`, Bar>
    >
  >
];

enum Enum {
  A,
  B,
}
type Foo = { foo: number };
type Bar = { bar: string };
