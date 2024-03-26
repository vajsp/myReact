import {
    appendChildToContainer,
    commitUpate,
    Container,
    insertChildToContainer,
    Instance,
    removeChild,
} from 'hostConfig';
import { FiberNode, FiberRootNode } from './fiber';
import {
    ChildDeletion,
    MutationMask,
    NoFlags,
    Placement,
    Update,
} from './fiberFlags';
import {
    FunctionComponent,
    HostComponent,
    HostRoot,
    HostText,
} from './workTags';

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

    if ((flags & Update) !== NoFlags) {
        commitUpate(finshedWork);
        // 移除
        finshedWork.flags &= ~Update;
    }

    if ((flags & ChildDeletion) !== NoFlags) {
        const deletions = finshedWork.deletions;
        if (deletions !== null) {
            deletions.forEach((childToDelete) => {
                commitDeletion(childToDelete);
            });
        }
    }
};

function recordHostChildrenToDelete(
    childrenToDelete: FiberNode[],
    unmountFiber: FiberNode
) {
    // 1.找到第一个root host节点
    const lastOne = childrenToDelete[childrenToDelete.length - 1];

    if (!lastOne) {
        childrenToDelete.push(unmountFiber);
    } else {
        let node = lastOne.sibling;
        while (node !== null) {
            if (unmountFiber === node) {
                childrenToDelete.push(unmountFiber);
            }
            node = node.sibling;
        }
    }

    // 2.每找到一个host节点，判断下这个节点是不是1 找到那个节点的兄弟节点
}

/** 10-2 4:37分 */
function commitDeletion(childToDelete: FiberNode) {
    //   对于标记ChildDeletion的子树，由于子树中:
    // 对于FC，需要处理useEffect unmout执行解绑ref
    // 对于HostComponent,需要解绑ref
    // 对于子树的 [根HostComponentJ ，需要移除DOM

    // let rootHostNode: FiberNode | null = null;
    const rootChildrenToDelete: FiberNode[] = [];

    // 递归子树
    commitNestedComponent(childToDelete, (unmountFiber) => {
        switch (unmountFiber.tag) {
            case HostComponent:
                recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
                return;
            //  TODO:解绑ref
            case HostText:
                recordHostChildrenToDelete(rootChildrenToDelete, unmountFiber);
                return;
            case FunctionComponent:
                // TODO:useEffect unmount
                return;
            default:
                if (__DEV__) {
                    console.warn('未处理的unmount类型', unmountFiber);
                }
                break;
        }
    });

    // 移除rootHostComponent的Dom
    if (rootChildrenToDelete.length) {
        const hostParent = getHostParent(childToDelete);
        if (hostParent !== null) {
            rootChildrenToDelete.forEach((node) => {
                removeChild(node.stateNode, hostParent);
            });
        }
    }
    childToDelete.return = null;
    childToDelete.child = null;
}

function commitNestedComponent(
    root: FiberNode,
    onCommitUnount: (fiber: FiberNode) => void
) {
    let node = root;
    while (true) {
        onCommitUnount(node);
        if (node.child !== null) {
            // 向下遍历
            node.child.return = node;
            node = node.child;
            continue;
        }
        if (node === root) {
            // 终止条件
            return;
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === root) {
                return;
            }
            // 向上归
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

/** 获得父级节点然后插入 */
const commitPlacement = (finshedWork: FiberNode) => {
    // parent DOM
    // finishedWork ~~ DOM
    if (__DEV__) {
        console.warn('执行Placement操作', finshedWork);
    }

    // parent Dom
    const hostParent = getHostParent(finshedWork);

    // host  sibling
    const sibling = getHostSibling(finshedWork);

    if (hostParent !== null) {
        // finishWork ~~ DOM append parent
        insertOrappendPlacementNodeIntorContainer(
            finshedWork,
            hostParent,
            sibling
        );
    }
};

function getHostSibling(fiber: FiberNode) {
    let node: FiberNode = fiber;

    findSibling: while (true) {
        while (node.sibling === null) {
            const parent = node.return;

            if (
                parent === null ||
                parent.tag === HostComponent ||
                parent.tag === HostRoot
            ) {
                return null;
            }
            node = parent;
        }

        node.sibling.return = node.return;
        node = node.sibling;

        while (node.tag !== HostText && node.tag !== HostComponent) {
            // 向下遍历
            if ((node.flags & Placement) !== NoFlags) {
                continue findSibling;
            }
            if (node.child === null) {
                continue findSibling;
            } else {
                node.child.return = node;
                node = node.child;
            }
        }

        if ((node.flags & Placement) === NoFlags) {
            return node.stateNode;
        }
    }
}

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
function insertOrappendPlacementNodeIntorContainer(
    finishedWork: FiberNode,
    hostParent: Container,
    before?: Instance
) {
    // fiber host
    if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
        if (before) {
            insertChildToContainer(finishedWork.stateNode, hostParent, before);
        } else {
            appendChildToContainer(hostParent, finishedWork.stateNode);
        }

        return;
    }

    const child = finishedWork.child;
    if (child !== null) {
        insertOrappendPlacementNodeIntorContainer(child, hostParent);
        let sibling = child.sibling;

        while (sibling !== null) {
            insertOrappendPlacementNodeIntorContainer(sibling, hostParent);
            sibling = sibling.sibling;
        }
    }
}
