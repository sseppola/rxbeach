import { Subject } from 'rxjs';
import { tag } from 'rxjs-spy/operators';
import { share } from 'rxjs/operators';
import { _namespaceAction } from './namespace';
import { Action, ActionName } from './types/Action';

const actionSubject$ = new Subject<Action<ActionName, any>>();

/**
 * The main action stream for RxBeach
 */
export const action$ = actionSubject$.pipe(tag('action$'), share());

/**
 * Dispatch an action to the action stream
 *
 * If namespace is provided, it will be set on the action.
 *
 * @param action The action to dispatch to action$
 * @param namespace Optional namespace to add to the action
 */
export const dispatchAction = <Type extends ActionName, Payload, Meta>(
  action: Action<Type, Payload, Meta>,
  namespace: string
) => {
  if (namespace === undefined) {
    actionSubject$.next(action);
  } else {
    actionSubject$.next(_namespaceAction(namespace, action));
  }
};
