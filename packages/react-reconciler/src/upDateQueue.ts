import { Action } from 'shared/ReactTypes';

export interface IUpate<State> {
    action: Action<State>;
}

export interface UpdateQueue<State> {
    shared: {
        pending: IUpate<State> | null;
    };
}

/** 更新的数据结构 */
export const createUpate = <State>(action: Action<State>) => {
    return {
        action,
    };
};

/** 保存更新的数据结构 */
export const createUpateQueue = <State>() => {
    return {
        shared: {
            pending: null,
        },
    } as UpdateQueue<State>;
};

/** 将upDate插入upDateQueue */
export const enqueueUpate = <Action>(
    updateQueue: UpdateQueue<Action>,
    update: IUpate<Action>
) => {
    updateQueue.shared.pending = update;
};

/** 消费update */
export const processUpateQueue = <State>(
    baseState: State,
    pendingUpDate: IUpate<State> | null
): { memoizedState: State } => {
    const result: ReturnType<typeof processUpateQueue<State>> = {
        memoizedState: baseState,
    };

    if (pendingUpDate !== null) {
        const action = pendingUpDate.action;

        if (action instanceof Function) {
            // baseState 1 upDate(x)=>4x -> memoizedState 4
            result.memoizedState = action(baseState);
        } else {
            // baseState 1 upDate2 -> memoizedState 2
            result.memoizedState = action;
        }
    }

    return result;
};
