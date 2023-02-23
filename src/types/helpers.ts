import { Observable } from 'rxjs';
import { Action, ActionName } from './Action';

export type ActionStream<Type extends ActionName, Payload, Meta> = Observable<
  Action<Type, Payload, Meta>
>;

export type ActionDispatcher<Type extends ActionName, Payload, Meta> = (
  action: Action<Type, Payload, Meta>,
  namespace?: string
) => void;

/**
 * Helper type for extracting the payload type from an action creator
 *
 * ```
 * type Payload = ExtractPayload<typeof myAction>;
 * ```
 */
// export type ExtractPayload<ActionType<T, P, M> extends Action<T, P, M>> = ReturnType<ActionType>['payload'];
