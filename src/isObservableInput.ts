import { ObservableInput, from } from 'rxjs';

export const isObservableInput = <T>(obj: any): obj is ObservableInput<T> => {
  try {
    from(obj);
    return true;
  } catch {
    return false;
  }
};
