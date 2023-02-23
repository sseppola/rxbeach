import { AssertTrue, Has } from 'conditional-type-checks';
import { Equal } from '../internal/testing/utils';
import { ActionCreator } from './ActionCreator';

type tests = [
  // It enforces `[prefix] name` types
  // @ts-expect-error
  ActionCreator<'Missing_brackets'>,

  // It accepts basic type name
  ActionCreator<'[test] ActionName'>,

  // Creates the same action if called twice
  Equal<ActionCreator<'[test] A'>, ActionCreator<'[test] A'>>,

  // Creates the same action if called twice
  Equal<ActionCreator<'[test] A'>, ActionCreator<'[test] B'>>,

  // ActionCreatorFn has the type property assigned
  AssertTrue<
    Has<ActionCreator<'[test] ActionName', unknown>, { type: string }>
  >,

  // Action creators are differentiated
  // @ts-expect-error
  Equal<ActionCreator<'ActionName'>, ActionCreator<'ActionName2'>>
];
