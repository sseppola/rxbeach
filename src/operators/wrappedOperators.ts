import * as operators from 'rxjs/operators';
import { Observable } from 'rxjs';
import { markWithLatestFrom } from 'rxbeach/internal';
import { markMerge, markCombineLatest } from 'rxbeach/internal/markers';

export const merge = ((...sources: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.merge(...sources),
    markMerge([observable$, ...sources])
  )) as typeof operators.merge;

export const withLatestFrom = ((...dependencies: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.withLatestFrom(...dependencies),
    markWithLatestFrom(observable$, dependencies)
  )) as typeof operators.withLatestFrom;

export const combineLatest = ((...sources: Observable<unknown>[]) => (
  observable$: Observable<unknown>
) =>
  observable$.pipe(
    operators.combineLatest(...sources),
    markCombineLatest([observable$, ...sources])
  )) as typeof operators.combineLatest;
