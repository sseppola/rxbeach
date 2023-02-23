import {
  InteropObservable,
  Observable,
  ObservableInput,
  OperatorFunction,
  Subject,
  from,
  pipe,
} from 'rxjs';
import { filter, map, mergeWith, scan } from 'rxjs/operators';
import { VoidPayload } from './internal/types';
import { defaultErrorSubject } from './internal/defaultErrorSubject';
import { ofType } from './operators/operators';
import { isObservableInput } from './isObservableInput';
import { Action, ActionName } from './types/Action';
import { ActionFactory } from './actionCreator';
import { ActionCreator } from './types/ActionCreator';

const wrapInArray = <T>(val: T | T[]): T[] =>
  Array.isArray(val) ? val : [val];

export type ReducerFn<State, ReducerAction> = ReducerAction extends Action<
  infer Type,
  infer Payload,
  infer Meta
>
  ? (previousState: State, payload: Payload, namespace?: string) => State
  : never;

type RegisteredActionReducer<State, ReducerAction> =
  ReducerAction extends Action<infer Type, infer Payload, infer Meta>
    ? ReducerFn<State, Payload> & {
        trigger: {
          actions: Array<Action<Type, Payload, Meta>>;
        };
      }
    : never;

type RegisteredStreamReducer<State, Payload = any> = ReducerFn<
  State,
  Payload
> & {
  trigger: {
    source$: Observable<Payload>;
  };
};

// export type RegisteredReducer<State, ReducerAction> =
//   Reducer<State, Payload> & {
//         trigger:
//           | {
//               actions: Array<Action<Type, Payload, Meta>>;
//             }
//           | {
//               source$: Observable<Payload>;
//             };
//       }
//     : never;

const isActionReducer = <State, ReducerAction>(
  reducerFn:
    | RegisteredActionReducer<State, ReducerAction>
    | RegisteredStreamReducer<State>
): reducerFn is RegisteredActionReducer<State, ReducerAction> =>
  'actions' in reducerFn.trigger;

const isStreamReducer = <State, ReducerAction, Payload>(
  reducerFn:
    | RegisteredActionReducer<State, ReducerAction>
    | RegisteredStreamReducer<State, Payload>
): reducerFn is RegisteredStreamReducer<State, Payload> =>
  'source$' in reducerFn.trigger;

// type StreamReducerCreator = {
//   /**
//    * Define a reducer for a stream
//    *
//    * @see combineReducers
//    * @param source$ The stream which will trigger this reducer
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @template `Payload` - The type of values `source$` emits
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State, Payload>(
//     source$: ObservableInput<Payload>,
//     reducer: ReducerFn<State, Payload>
//   ): RegisteredStreamReducer<State, Payload>;
// };

// type ActionReducerCreator = {
//   /**
//    * Define a reducer for multiple actions with overlapping payload
//    *
//    * @see combineReducers
//    * @param actionCreator The action creator to assign this reducer to and
//    *                      extract payload type from
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @template `Payload` - The payload of the action, fed to the reducer together
//    *                       with the state. Should be automatically extracted from
//    *                       the `actionCreator` parameter
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State, Payload>(
//     actionCreator: Action<Payload>[],
//     reducer: ReducerFn<State, Payload>
//   ): RegisteredReducer<State, Payload>;

//   /**
//    * Define a reducer for multiple actions without overlapping payload
//    *
//    * @see combineReducers
//    * @param actionCreator The action creator to assign this reducer to and
//    *                      extract payload type from
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State>(
//     actionCreator: Action<unknown>[],
//     reducer: ReducerFn<State, unknown>
//   ): RegisteredReducer<State, unknown>;

//   /**
//    * Define a reducer for multiple actions without payloads
//    *
//    * @see combineReducers
//    * @param actionCreator The action creator to assign this reducer to and
//    *                      extract payload type from
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State>(
//     actionCreator: Action[],
//     reducer: ReducerFn<State, VoidPayload>
//   ): RegisteredReducer<State, VoidPayload>;

//   /**
//    * Define a reducer for an action with payload
//    *
//    * @see combineReducers
//    * @param actionCreator The action creator to assign this reducer to and
//    *                      extract payload type from
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @template `Payload` - The payload of the action, fed to the reducer together
//    *                       with the state. Should be automatically extracted from
//    *                       the `actionCreator` parameter
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State, Payload>(
//     actionCreator: Action<Payload>,
//     reducer: ReducerFn<State, Payload>
//   ): RegisteredReducer<State, Payload>;

//   /**
//    * Define a reducer for an action without payload
//    *
//    * @see combineReducers
//    * @param actionCreator The action creator to assign this reducer to and
//    *                      extract payload type from
//    * @param reducer The reducer function
//    * @template `State` - The state the reducer reduces to
//    * @returns A registered reducer that can be passed into `combineReducers`, or
//    *          called directly as if it was the `reducer` parameter itself.
//    */
//   <State, Payload = VoidPayload>(
//     actionCreator: Action | Action[],
//     reducer: ReducerFn<State, Payload>
//   ): RegisteredReducer<State, Payload>;
// };

/**
 * streamReducer
 * A stream reducer is a stream operator which updates the state of a given stream with the last
 * emitted state of another stream, it basically reduces the state of a given stream over another
 * stream.
 *
 * @param source The observable that the reducer function should be subscribed to, which act as
 *                the "action" of the reducer.
 * @param reducerFn The reducer function with signature:
 *                  (prevState, observableInput) => nextState
 * @returns A wrapped reducer function for use with persistedReducedStream, combineReducers etc.
 */
export const streamReducer = <State, EmittedState>(
  source: ObservableInput<EmittedState>,
  reducerFn: ReducerFn<State, EmittedState>
) => {
  const wrappedStreamReducer = (
    state: State,
    emittedState: EmittedState,
    namespace?: string
  ) => reducerFn(state, emittedState, namespace);

  wrappedStreamReducer.trigger = {
    source$: from(source),
  };

  return wrappedStreamReducer;
};

type ActionReducerCreator<State, ActionCreators> = ActionCreators extends Array<
  ActionCreator<infer Type, infer Payload, infer Meta>
>
  ? (
      actionCreators: Array<ActionCreator<Type, Payload, Meta>>,
      reducer: ReducerFn<State, Payload>
    ) => State
  : ActionCreators extends ActionCreator<infer Type, infer Payload, infer Meta>
  ? (
      actionCreators: ActionCreator<Type, Payload, Meta>,
      reducer: ReducerFn<State, Payload>
    ) => State
  : never;

/**
 * actionReducer
 * actionReducerCreator...
 * A action reducer is a stream operator which allows to update the state of a given stream based
 * on a given action with the payload of that action.
 *
 * @param actionCreator One or multiple actions that should run the reducer
 * @param reducerFn The reducer function with signature: (prevState, action) => newState
 * @returns A wrapped reducer function for use with persistedReducedStream, combineReducers etc.
 */
type UnknownActionCreator = ActionCreator<ActionName, unknown, {}>;
type OneOf<T> = T extends Array<infer U> ? U : T;

export function actionReducer<
  State,
  ActionCreators extends UnknownActionCreator | UnknownActionCreator[]
>(
  actionCreator: ActionCreators,
  reducerFn: ReducerFn<State, Parameters<OneOf<ActionCreators>>[0]>
) {
  const wrappedActionReducer = (
    state: State,
    payload: Parameters<OneOf<ActionCreators>>[0],
    namespace?: string
  ) => reducerFn(state, payload, namespace);

  wrappedActionReducer.trigger = {
    actions: wrapInArray(actionCreator),
  };

  return wrappedActionReducer;
}

type InferFromObservable<TObservable> = TObservable extends Observable<
  infer TValueType
>
  ? TValueType
  : never;
/**
 * @deprecated since version 2.4.0
 * Use actionReducer or streamReducer instead
 */
// Stream/Action
export function reducer<State, ReducerAction extends UnknownActionCreator>(
  trigger: ReducerAction,
  reducerFn: ReducerFn<State, ReducerAction>
): RegisteredActionReducer<State, ReducerAction>;
export function reducer<State, ReducerActions extends UnknownActionCreator[]>(
  trigger: ReducerActions,
  reducerFn: ReducerFn<State, ReducerActions>
): RegisteredActionReducer<State, ReducerActions>;
export function reducer<State, StreamTrigger extends ObservableInput<unknown>>(
  trigger: StreamTrigger,
  reducerFn: ReducerFn<State, InferFromObservable<StreamTrigger>>
): RegisteredStreamReducer<State, InferFromObservable<StreamTrigger>>;
export function reducer<State>(
  trigger: UnknownActionCreator[] | ObservableInput<unknown>,
  reducerFn: ReducerFn<State, UnknownActionCreator[] | ObservableInput<unknown>>
) {
  if (!Array.isArray(trigger) && isObservableInput(trigger)) {
    return streamReducer(trigger, reducerFn);
  } else {
    return actionReducer(trigger, reducerFn);
  }
}

const ACTION_ORIGIN = Symbol('Action origin');

type CombineReducersConfig = {
  errorSubject?: Subject<any>;
  namespace?: string;
};

/**
 * Combine registered reducers into a stream operator
 *
 * Each reducer will receive the previous state (or the seed if it's the first
 * invocation) together with the payloads of the actions of the given reducer,
 * or the emitted values from the stream of the given reducer.
 *
 * The behaviour is undefined if multiple reducers are registered for the same
 * actions.
 *
 * This operator does not change whether the stream is hot or cold.
 *
 * The order of invocation for the reducers is controlled by the rxjs operator
 * `merge`, which is called with all the actions first and then the source
 * streams in the order their reducers are defined in the `reducers` argument.
 *
 * If a reducer throws an error, it will be nexted on the error subject. If the
 * error subject is not explicitly set, it will default to
 * `defaultErrorSubject`, which will rethrow the errors globally, as uncaught
 * exceptions. The stream will not complete or emit any value upon an error.
 *
 * @param seed The initial input to the first reducer call
 * @param reducers The reducer entries that should be combined
 * @param namespace Namespace to pass on to the reducers. Note that this will
 *                  always be passed, regardless of namespaces of the actions.
 * @see rxjs.merge
 */
export const combineReducers = <State, ActionOrEmittedState>(
  seed: State,
  reducers: Array<
    | RegisteredActionReducer<State, ActionOrEmittedState>
    | RegisteredStreamReducer<State, ActionOrEmittedState>
  >,
  { errorSubject = defaultErrorSubject, namespace }: CombineReducersConfig = {}
): OperatorFunction<Action<ActionName, unknown>, State> => {
  const actionReducers = reducers.filter(isActionReducer);
  const streamReducers = reducers.filter(isStreamReducer);
  const reducersByActionType = new Map(
    actionReducers.flatMap((reducerFn) => {
      return reducerFn.trigger.actions.map((actionCreator) => [
        actionCreator.type,
        reducerFn,
      ]);
    })
  );

  type Packet =
    | { origin: typeof ACTION_ORIGIN; value: Action }
    | { origin: number; value: any };

  const source$s = streamReducers.map((reducerFn, i) =>
    reducerFn.trigger.source$.pipe(
      map((payload): Packet => ({ origin: i, value: payload }))
    )
  );

  return pipe(
    ofType(...actionReducers.flatMap((reducerFn) => reducerFn.trigger.actions)),
    map((action): Packet => ({ origin: ACTION_ORIGIN, value: action })),
    mergeWith(...source$s),
    scan(
      ({ state }, packet) => {
        try {
          if (packet.origin === ACTION_ORIGIN) {
            const reducerFn = reducersByActionType.get(packet.value.type)!;
            return {
              caughtError: false,
              state: reducerFn(state, packet.value.payload, namespace),
            };
          }

          const reducerFn = streamReducers[packet.origin];
          return {
            caughtError: false,
            state: reducerFn(state, packet.value, namespace),
          };
        } catch (e) {
          errorSubject.next(e);
          return {
            caughtError: true,
            state,
          };
        }
      },
      { state: seed, caughtError: false }
    ),
    filter(({ caughtError }) => caughtError === false),
    map(({ state }) => state)
  );
};
