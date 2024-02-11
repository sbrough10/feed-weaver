import { Dispatch } from "redux";

interface IAction {
  [index: string]: any;
  type: string;
}

const Action = <T>(type: string, data?: Omit<T, keyof IAction>) => {
  return { type, ...data };
};

const ok = (type: string) => `${type}.ok`;

const fail = (type: string) => `${type}.fail`;

/**
 * Returns a function responsible for dispatching actions based on result from action handler.
 *
 * @param type - type of action
 * @param action - handler for action
 * @param data - additional data to include with action
 */
export function createAction<XDS>(
  type: string,
  action: (getState?: () => XDS, dispatch?: Dispatch) => Promise<any>,
  data?: any
) {
  return (dispatch: Dispatch, getState: () => XDS) => {
    dispatch(Action(type, data));
    return action(getState, dispatch)
      .then((result) => dispatch(Action(ok(type), result)))
      .catch((result) => {
        const { err } = result;
        return dispatch(Action(fail(type), err));
      });
  };
}
