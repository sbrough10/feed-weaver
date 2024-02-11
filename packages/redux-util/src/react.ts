import {
  EqualityFn,
  useDispatch as useRrDispatch,
  useSelector as useRrSelector,
} from "react-redux";
import { Dispatch } from "./types";

export function getUseDispatch<State>() {
  return useRrDispatch as () => Dispatch<State>;
}

export function getUseSelector<State>() {
  return <Result>(
    selector: (state: State) => Result,
    equalityFn?: EqualityFn<Result>
  ) => {
    return useRrSelector(selector, equalityFn);
  };
}

export interface ReduxQueueService<State> {
  dispatch: Dispatch<State>;
}

// const ReduxQueueContext = React.createContext<ReduxQueueService>({
//   dispatch: () => {},
// });

export const ReduxQueueProvider = () => {};
