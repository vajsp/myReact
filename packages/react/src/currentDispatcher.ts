import { Action } from 'shared/ReactTypes';

export interface Dispatcher {
    /** [num,updataNum] = useState(()=> num + 1) */
    useState: <T>(initialState: (() => T) | T) => [T, Dispatch<T>];
}

export type Dispatch<State> = (action: Action<State>) => void;

const currentDispatcher: { current: Dispatcher | null } = { current: null };

export const resolveDispatcher = (): Dispatcher => {
    const dispatcher = currentDispatcher.current;

    if (dispatcher === null) {
        throw new Error('hook只能在函数组件中执行');
    }

    return dispatcher;
};

export default currentDispatcher;
