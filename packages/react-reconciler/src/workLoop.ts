/* eslint-disable @typescript-eslint/no-unused-vars */
import { beginWork } from './beginWork';
import { commitMuationEffects } from './commitWork';
import { compoleteWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workinProgress: FiberNode | null = null;

/** 创建workinProgress */
function prepareFreshStack(root: FiberRootNode) {
    workinProgress = createWorkInProgress(root.current, {});
}

/** 调度功能 在upDateContainer中调用 */
export function scheduleUpateOnFiber(fiber: FiberNode) {
    // 对于 this.setState调用传入的是当前的fiberNode所以要找到原地址的fiber
    const root = markUpDateFromFiberToRoot(fiber);
    // console.log('markUpDateFromFiberToRoot');
    // console.log(root);

    renderRoot(root);
}

/** 找到fiberRootNode */
function markUpDateFromFiberToRoot(fiber: FiberNode) {
    let node = fiber;
    let parent = node.return;
    // 遍历普通的fiber节点root
    while (parent !== null) {
        node = parent;
        parent = node.return;
    }

    // 找到hostRootFiber
    if (node.tag === HostRoot) {
        return node.stateNode;
    }

    return null;
}

/** renderRoot在scheduleUpateOnFiber调用
 * scheduleUpateOnFiber在upDateContainer中调用
 * root.ts中render调用
 * 视频04.如何触发更新29分钟讲解流程
 */
export function renderRoot(root: FiberRootNode) {
    // 初始化
    prepareFreshStack(root);

    // console.log('renderRoot的root');
    // console.log(root);

    // workLoop();

    // workinProgress = null;

    do {
        try {
            workLoop();
            break;
        } catch (e) {
            if (__DEV__) {
                console.log('workLoop发生错误', e);
            }

            workinProgress = null;
        }
    } while (true);

    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;

    console.log('root');
    console.log(root);
    // console.log('finishedWork');
    // console.log(finishedWork);
    // debugger;

    // workinProgress fiberNode树中的flags
    commitRoot(root);
}

/**
 * commit阶段要执行的两个任务
 * 1.执行fiber树的切换
 * 2.执行Placement对应操作
 * @param root
 * @returns
 */
function commitRoot(root: FiberRootNode) {
    // 6-1初探reactDom 19分钟理顺流程
    const finishedWork = root.finishedWork;
    if (finishedWork === null) {
        return;
    }

    if (__DEV__) {
        // console.log('commit阶段开始 finishedWork', finishedWork);
        console.log(
            `%ccommit阶段开始 finishedWork`,
            'color: green',
            finishedWork
        );
    }

    // 重置
    root.finishedWork = null;

    // 判断是否存在3个子阶段需要执行的操作
    // root flags root subtreeFlags
    const subtreeHasEffect =
        (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

    // console.log('subtreeHasEffect,subtreeHasEffect');
    // console.log(subtreeHasEffect, subtreeHasEffect);

    if (subtreeHasEffect || rootHasEffect) {
        //  beforeMutation
        //  mutation
        commitMuationEffects(finishedWork);
        root.current = finishedWork;
        //  layout
    } else {
        // 执行fiber树的切换
        root.current = finishedWork;
    }
}

function workLoop() {
    while (workinProgress !== null) {
        // console.log('workLoop的workinProgress');
        // console.log(workinProgress);
        performUnitOfWork(workinProgress);
    }
}

function performUnitOfWork(fiber: FiberNode) {
    // next可能是子fiber,也可能是null,为子fiber时继续向下遍历，为null到达最深层
    const next = beginWork(fiber);

    // debugger;

    fiber.memoizedProps = fiber.pendingProps;

    if (next === null) {
        // console.log(`%ccompleteUnitOfWork开始的fiber`, 'color: red');
        // console.log(fiber);
        // 这里说的就是DFS 遍历兄弟节点
        completeUnitOfWork(fiber);
    } else {
        // 这里说的就是DFS 有子节点遍历子节点
        // 继续执行wookloop,继续向下遍历
        workinProgress = next;
    }
}

/** 这里说的就是DFS 遍历兄弟节点  5实现首屏渲染27分钟 */
function completeUnitOfWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber;

    do {
        compoleteWork(node);
        const sibling = fiber.sibling;

        if (sibling !== null) {
            workinProgress = sibling;
            return;
        }

        // console.log('completeUnitOfWork的fiber');
        // console.log(node);

        // 如果兄弟节点不存在，递归向上
        node = node.return;
        workinProgress = node;
    } while (true);
}
