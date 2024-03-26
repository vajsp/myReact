// ### completeWork

import {
    appendInitialChild,
    Container,
    createInstance,
    createTextInstance,
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags, Update } from './fiberFlags';
import {
    Fragment,
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText,
} from './workTags';
import { updateFiberProps } from 'react-dom/src/SyntheticEvent';

function markUpdate(fiber: FiberNode) {
    fiber.flags |= Update;
}

// compoleteWork需要解决的问题
// - 对于Host类型fiberNode: 构建离屏DOM树
// - 标记Update flag (TODO)

// completeWork性能优化策略
// flags分部在不同fiberNode中，如何快速找到他们
// 答案：利用completeWork向上遍历的流程，将字fiberNode的flags冒泡到父fiberNode

/**
 * 递归中的归
 * compoleteWork需要解决的问题
 * 1. 对于Host类型fiberNode: 构建离屏
 * 2. 标记Update flag (TODO)
 * */
export const compoleteWork = (workinProgress: FiberNode) => {
    // console.log('compoleteWork的workinProgress');
    // console.log(workinProgress);
    // debugger;

    // 递归中的归
    const newProps = workinProgress.pendingProps;
    const current = workinProgress.alternate;

    switch (workinProgress.tag) {
        case HostComponent:
            if (current !== null && workinProgress.stateNode) {
                // updata
                // 这里workinProgress.stateNode存的是dom节点
                updateFiberProps(workinProgress.stateNode, newProps);
            } else {
                // 构建离屏dom树
                // 1.构建Dom
                const instace = createInstance(workinProgress.type, newProps);
                // const instace = createInstance(workinProgress.type, newProps);
                // 2.将dom插入dom树中
                appendAllChildren(instace, workinProgress);
                workinProgress.stateNode = instace;
            }
            bubbleProperties(workinProgress);

            return null;
        case HostText:
            if (current !== null && workinProgress.stateNode) {
                // updata
                // 这里workinProgress.stateNode存的是dom节点
                const oldText = current.memoizedProps.content;
                const newText = newProps.content;
                if (oldText !== newText) {
                    markUpdate(workinProgress);
                }
            } else {
                // 构建离屏dom树
                // 1.构建Dom
                const instace = createTextInstance(newProps.content);
                // 2.将dom插入dom树中
                // appendAllChildren(instace, workinProgress);
                workinProgress.stateNode = instace;
            }
            bubbleProperties(workinProgress);
            return null;
        case HostRoot:
        case FunctionComponent:
        case Fragment:
            bubbleProperties(workinProgress);
            return null;

        default:
            if (__DEV__) {
                console.warn('compoleteWork实现未知类型');
            }
            break;
    }
};

function appendAllChildren(parent: Container, workinProgress: FiberNode) {
    let node = workinProgress.child;
    while (node !== null) {
        if (node.tag === HostComponent || node.tag === HostText) {
            appendInitialChild(parent, node?.stateNode);
        } else if (node.child !== null) {
            node.child.return = node;
            node = node.child;
            continue;
        }

        if (node === workinProgress) {
            return;
        }

        while (node.sibling === null) {
            if (node.return === null || node.return === workinProgress) {
                return;
            }
            node = node?.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

/** 因为是递归的过程，总是最上面的值，冒泡到根节点，根节点就会知道有要更新的flags 视频05 42:04 */
function bubbleProperties(workinProgress: FiberNode) {
    let subtreeFlags = NoFlags;
    let child = workinProgress.child;

    while (child !== null) {
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;

        child.return = workinProgress;
        child = child.sibling;
    }

    workinProgress.subtreeFlags |= subtreeFlags;
}
