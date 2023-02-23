import { Action, ActionName } from './Action';

export interface ActionCreator<
  Type extends ActionName,
  Payload = undefined,
  Meta extends Record<string, any> | undefined = undefined
> {
  (payload: Payload): Action<Type, Payload, Meta>;
  readonly type: Type;
}
