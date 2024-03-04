// 递归中的递的阶段

import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWidthHooks } from './fiberHooks';
import { processUpateQueue, UpdateQueue } from './upDateQueue';
import {
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText,
} from './workTags';

/**
 * 向下，递归中的递的阶段，做两件事
 * 1.计算状态的最新值
 * 2.创造子fiberNode
 * @param workinProgress
 */
export const beginWork = (workinProgress: FiberNode) => {
    console.log('beginWork的workinProgress');
    console.log(workinProgress);
    // 比较，返回子fiberNode
    switch (workinProgress.tag) {
        case HostRoot:
            return upDateHostRoot(workinProgress);
        case HostComponent:
            return updateHostComponent(workinProgress);
        case HostText:
            return null;
        case FunctionComponent:
            return updateFunctionComponent(workinProgress);

        default:
            if (__DEV__) {
                console.warn('beginWork实现未知类型');
            }
            break;
    }
    return null;
};

function updateFunctionComponent(workinProgress: FiberNode) {
    const nextProps = workinProgress.pendingProps;
    const nextChildren = nextProps.children;
    recocileChildren(workinProgress, nextChildren);

    return workinProgress.child;
}

function upDateHostRoot(workinProgress: FiberNode) {
    const baseState = workinProgress.memoizedState;
    const upUateQueue = workinProgress.upUateQueue as UpdateQueue<Element>;
    const pending = upUateQueue.shared.pending;
    // 这里memoizedState就是传入的<App/>节点
    const { memoizedState } = processUpateQueue(baseState, pending);
    workinProgress.memoizedState = memoizedState;

    const nextChildren = workinProgress.memoizedState;

    recocileChildren(workinProgress, nextChildren);
    return workinProgress.child;
}

export function updateHostComponent(workinProgress: FiberNode) {
    const nextChildren = renderWidthHooks(workinProgress);

    recocileChildren(workinProgress, nextChildren);
    return workinProgress.child;
}

function recocileChildren(
    workinProgress: FiberNode,
    children?: ReactElementType
) {
    const current = workinProgress.alternate;
    if (current !== null) {
        // update
        workinProgress.child = reconcileChildFibers(
            workinProgress,
            current?.child,
            children
        );
    } else {
        // mount
        workinProgress.child = mountChildFibers(workinProgress, null, children);
    }
}
