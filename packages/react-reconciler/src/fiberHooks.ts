/* eslint-disable @typescript-eslint/no-unused-vars */
import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import {
    UpdateQueue,
    createUpate,
    createUpateQueue,
    enqueueUpate,
    processUpateQueue,
} from './upDateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpateOnFiber } from './workLoop';

let currentlyRenderingFiber: FiberNode | null = null;
/** 当前正在处理的hook */
let workinProgressHook: Hook | null = null;
let currentHook: Hook | null = null;

const { currentDispatcher } = internals;

/** 08. 16：03讲解 */
interface Hook {
    memoizedState: any;
    updateQueue: any;
    /** 指向下个hooks */
    next: Hook | null;
}

export function renderWidthHooks(workinProgress: FiberNode) {
    // 赋值操作
    currentlyRenderingFiber = workinProgress;
    /** 赋值为null 创建链表 */
    workinProgress.memoizedState = null;

    const current = workinProgress.alternate;

    if (current !== null) {
        // updata
        currentDispatcher.current = HookDispatcherOnUpdate;
    } else {
        // mount
        currentDispatcher.current = HookDispatcherOnMount;
    }

    const Component = workinProgress.type;
    const props = workinProgress.pendingProps;
    const children = Component(props);

    // 重置操作
    currentlyRenderingFiber = null;
    return children;
}

const HookDispatcherOnMount: Dispatcher = {
    useState: mountState,
};

const HookDispatcherOnUpdate: Dispatcher = {
    useState: updateState,
};

function updateState<State>(): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = updateWorkInProgresHook();

    // 计算新state的逻辑
    const queue = hook.updateQueue as UpdateQueue<State>;
    const pending = queue.shared.pending;

    if (pending !== null) {
        const { memoizedState } = processUpateQueue(
            hook.memoizedState,
            pending
        );
        hook.memoizedState = memoizedState;
    }

    return [hook.memoizedState, queue.dispatch];
}

function updateWorkInProgresHook(): Hook {
    // TODO: render阶段触发的更新

    let nextCurrentHook: Hook | null;
    if (currentHook === null) {
        // 这是哥Fc update时的第一个hook
        const current = currentlyRenderingFiber?.alternate;
        if (current !== null) {
            nextCurrentHook = current?.memoizedState;
        } else {
            nextCurrentHook = null;
        }
    } else {
        // 这FC uodate时 后续hook
        nextCurrentHook = currentHook.next;
    }

    if (nextCurrentHook === null) {
        // mount/update u1 u2 u3
        // update       u1 u2 u3 u4
        throw new Error(
            `组件${currentlyRenderingFiber?.type}本次执行时的Hook比上次多`
        );
    }

    currentHook = nextCurrentHook as Hook;
    const newHook: Hook = {
        memoizedState: currentHook.memoizedState,
        updateQueue: currentHook.updateQueue,
        next: null,
    };

    if (workinProgressHook === null) {
        // mount时 第一个hooks
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hooks');
        } else {
            workinProgressHook = newHook;
            currentlyRenderingFiber.memoizedState = workinProgressHook;
        }
    } else {
        // mount时后续的hook
        workinProgressHook.next = newHook;
        workinProgressHook = newHook;
    }

    return workinProgressHook;
}

/** 实现useState 视频08 22:46 */
function mountState<State>(
    initialState: (() => State) | State
): [State, Dispatch<State>] {
    // 找到当前useState对应的hook数据
    const hook = mountWorkInProgresHook();
    let memoizedState;
    if (initialState instanceof Function) {
        memoizedState = initialState();
    } else {
        memoizedState = initialState;
    }

    const queue = createUpateQueue();
    hook.updateQueue = queue;
    hook.memoizedState = memoizedState;

    const dispatch = dispatchSetState.bind(
        null,
        currentlyRenderingFiber,
        queue
    );
    queue.dispatch = dispatch;

    return [memoizedState, dispatch];
}

function dispatchSetState<State>(
    fiber: FiberNode,
    updateQueue: UpdateQueue<State>,
    action: Action<State>
) {
    const update = createUpate(action);
    enqueueUpate(updateQueue, update);
    scheduleUpateOnFiber(fiber);
}

/** 找到当前useState对应的hook数据 */
function mountWorkInProgresHook(): Hook {
    const hook: Hook = {
        memoizedState: null,
        updateQueue: null,
        next: null,
    };

    if (workinProgressHook === null) {
        // mount时 第一个hooks
        if (currentlyRenderingFiber === null) {
            throw new Error('请在函数组件内调用hooks');
        } else {
            workinProgressHook = hook;
            currentlyRenderingFiber.memoizedState = workinProgressHook;
        }
    } else {
        // mount时后续的hook
        workinProgressHook.next = hook;
        workinProgressHook = hook;
    }

    return workinProgressHook;
}
