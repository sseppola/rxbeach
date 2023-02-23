import type { Expect } from './internal/testing/utils';
import { ActionCreator, ActionName } from './types/Action';

/**
 * `actionCreator`
 * This is more accurately named as "actionCreatorCreator" 😂
 */
export const actionCreator = <
  Type extends ActionName,
  Payload = any,
  Meta = any
>(
  type: Type
): Readonly<ActionCreator<Type, Payload, Meta>> => {
  const actionCreatorFn = (payload: Payload) =>
    Object.freeze({
      type,
      payload,
      meta: Object.freeze({}),
    });
  actionCreatorFn.type = type;

  return Object.freeze(actionCreatorFn);
};

export type ActionFactory = typeof actionCreator;
