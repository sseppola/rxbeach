import { Subject } from 'rxjs';
import { Action } from 'types/Action';
import { ActionDispatcher, ActionStream } from 'types/helpers';
import { tag } from 'rxjs-spy/operators';

const actionSubject$ = new Subject<Action<any>>();

export const action$: ActionStream = actionSubject$.pipe(tag('action$'));

export const dispatchAction: ActionDispatcher = action =>
  actionSubject$.next(action);
