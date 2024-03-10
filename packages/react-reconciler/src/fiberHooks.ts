/* eslint-disable @typescript-eslint/no-unused-vars */
import internals from 'shared/internals';
import { FiberNode } from './fiber';
import { Dispatcher, Dispatch } from 'react/src/currentDispatcher';
import {
    UpdateQueue,
    createUpate,
    createUpateQueue,
    enqueueUpate,
} from './upDateQueue';
import { Action } from 'shared/ReactTypes';
import { scheduleUpateOnFiber } from './workLoop';

let currentlyRenderingFiber: FiberNode | null = null;
/** 当前正在处理的hook */
let workinProgressHook: Hook | null = null;

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
