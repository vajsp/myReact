import { appendChildToContainer, Container } from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags, Placement } from './fiberFlags';
import { HostComponent, HostRoot, HostText } from './workTags';

let nextEffect: FiberNode | null = null;
/** 向下遍历，然后从下向上遍历 */
export const commitMuationEffects = (finishedWork: FiberNode) => {
    nextEffect = finishedWork;
    while (nextEffect !== null) {
        // 向下遍历
        const child: FiberNode | null = nextEffect.child;

        if (
            (nextEffect.subtreeFlags & MutationMask) !== NoFlags &&
            child !== null
        ) {
            nextEffect = child;
        } else {
            //  向上遍历 DFS
            up: while (nextEffect !== null) {
                commitMutaitonEffectsOnFiber(nextEffect);
                const sibling: FiberNode | null = nextEffect.sibling;

                if (sibling !== null) {
                    nextEffect = sibling;
                    break up;
                } else {
                    nextEffect = nextEffect.return;
                }
            }
        }
    }
};

/** 执行具体的Effect */
const commitMutaitonEffectsOnFiber = (finshedWork: FiberNode) => {
    const flags = finshedWork.flags;

    if ((flags & Placement) !== NoFlags) {
        commitPlacement(finshedWork);
        // 移除
        finshedWork.flags &= ~Placement;
        // flags Update
        // flags ChildDeletion
    }
};

/** 获得父级节点然后插入 */
const commitPlacement = (finshedWork: FiberNode) => {
    // parent DOM
    // finishedWork ~~ DOM
    if (__DEV__) {
        console.warn('执行Placement操作', finshedWork);
    }

    // parent Dom
    const hostParent = getHostParent(finshedWork);

    if (hostParent !== null) {
        // finishWork ~~ DOM append parent
        appendPlacementNodeIntorContainer(finshedWork, hostParent);
    }
};

function getHostParent(fiber: FiberNode): Container | null {
    let parent = fiber.return;

    while (parent) {
        const parentTag = parent.tag;
        // HostComponment HostRoot
        if (parentTag === HostComponent) {
            return parent.stateNode as Container;
        }
        if (parentTag === HostRoot) {
            return (parent.stateNode as FiberRootNode).container;
        }

        parent = parent.return;
    }
    if (__DEV__) {
        console.warn('未找到host parent');
    }

    return null;
}

/** 向下递归，找到HostComponent和HostText 插入*/
function appendPlacementNodeIntorContainer(
    finishedWork: FiberNode,
    hostParent: Container
) {
    // fiber host
    if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
        appendChildToContainer(hostParent, finishedWork.stateNode);
        return;
    }

    const child = finishedWork.child;
    if (child !== null) {
        appendPlacementNodeIntorContainer(child, hostParent);
        let sibling = child.sibling;

        while (sibling !== null) {
            appendPlacementNodeIntorContainer(sibling, hostParent);
            sibling = sibling.sibling;
        }
    }
}
