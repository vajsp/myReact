// 递归中的递的阶段

import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWidthHooks } from './fiberHooks';
import { processUpateQueue, UpdateQueue } from './upDateQueue';
import {
    Fragment,
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText,
} from './workTags';

/**
 * 向下，递归中的递的阶段，做两件事就是比较，返回子fiberNode
 * 1.计算状态的最新值
 * 2.创造子fiberNode
 * @param workinProgress
 */
export const beginWork = (workinProgress: FiberNode) => {
    // console.log('beginWork的workinProgress');
    // console.log(workinProgress);

    // 比较，返回子fiberNode
    switch (workinProgress.tag) {
        case HostRoot:
            return upDateHostRoot(workinProgress);
        case HostComponent:
            return updateHostComponent(workinProgress);
        // 文本节点没有begin work
        case HostText:
            return null;
        case FunctionComponent:
            return updateFunctionComponent(workinProgress);
        case Fragment:
            return updateFragment(workinProgress);

        default:
            if (__DEV__) {
                console.warn('beginWork实现未知类型');
            }
            break;
    }
    return null;
};

function updateFragment(workinProgress: FiberNode) {
    const nextChildren = workinProgress.pendingProps;
    recocileChildren(workinProgress, nextChildren);
    return workinProgress.child;
}

function upDateHostRoot(workinProgress: FiberNode) {
    /** 1.计算更新状态 */
    // 对于首屏渲染来说是不存在的
    const baseState = workinProgress.memoizedState;
    const upUateQueue = workinProgress.upUateQueue as UpdateQueue<Element>;
    const pending = upUateQueue.shared.pending;
    // 这里memoizedState就是传入的<App/>节点
    const { memoizedState } = processUpateQueue(baseState, pending);
    workinProgress.memoizedState = memoizedState;

    const nextChildren = workinProgress.memoizedState;
    // console.log('nextChildren');
    // console.log(nextChildren);
    /** 2.创造子fiberNode */
    recocileChildren(workinProgress, nextChildren);
    return workinProgress.child;
}

function updateHostComponent(workinProgress: FiberNode) {
    // console.log('updateHostComponent');
    const nextProps = workinProgress.pendingProps;
    const nextChildren = nextProps.children;
    recocileChildren(workinProgress, nextChildren);

    return workinProgress.child;
}

/**
 * <p>唱跳rap</p>
 * @param workinProgress
 * @returns
 */
export function updateFunctionComponent(workinProgress: FiberNode) {
    // console.log('updateFunctionComponent');
    // console.log(workinProgress);
    const nextChildren = renderWidthHooks(workinProgress);
    /** 1. 对于HostComponent 只有创建子节点  因为他是div标签 */
    recocileChildren(workinProgress, nextChildren);
    return workinProgress.child;
}

/**
 * 当进入A的beginWork时，通过对比B current FiberNode与B reactElement 生成B对应的 wip fiberNode
 * @param workinProgress
 * @param children
 */
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
