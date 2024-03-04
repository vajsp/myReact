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

/** 调度功能 */
export function scheduleUpateOnFiber(fiber: FiberNode) {
    // 调度功能
    const root = markUpDateFromFiberToRoot(fiber);

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

export function renderRoot(root: FiberRootNode) {
    // 初始化
    prepareFreshStack(root);

    do {
        try {
            workLoop();
        } catch (e) {
            if (__DEV__) {
                console.log('workLoop发生错误', e);
            }

            workinProgress = null;
        }
    } while (true);

    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;

    // workinProgress fiberNode树中的flags
    commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
    // 6-1初探reactDom 19分钟理顺流程
    const finishedWork = root.finishedWork;
    if (finishedWork === null) {
        return;
    }

    if (__DEV__) {
        console.log('commit阶段开始', finishedWork);
    }

    // 重置
    root.finishedWork = null;

    // 判断是否存在3个子阶段需要执行的操作
    // root flags root subtreeFlags
    const subtreeHasEffect =
        (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect =
        (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

    if (subtreeHasEffect || rootHasEffect) {
        //  beforeMutation
        //  mutation
        commitMuationEffects(finishedWork);

        root.current = finishedWork;

        //  layout
    } else {
        root.current = finishedWork;
    }
}

function workLoop() {
    while (workinProgress !== null) {
        performUnitOfWork(workinProgress);
    }
}

function performUnitOfWork(fiber: FiberNode) {
    const next = beginWork(fiber);
    fiber.memoizedProps = fiber.pendingProps;

    if (next === null) {
        completeUnitOfWork(fiber);
    } else {
        workinProgress = next;
    }
}

function completeUnitOfWork(fiber: FiberNode) {
    let node: FiberNode | null = fiber;

    do {
        compoleteWork(fiber);
        const sibling = fiber.sibling;

        if (sibling !== null) {
            workinProgress = sibling;
            return;
        }

        // 如果兄弟节点不存在，递归向上
        node = node.return;
        workinProgress = node;
    } while (true);
}
