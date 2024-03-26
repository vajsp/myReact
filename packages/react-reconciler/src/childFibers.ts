import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Key, Props, ReactElementType } from 'shared/ReactTypes';
import {
    createFiberFromElement,
    createFiberFromFragment,
    createWorkInProgress,
    FiberNode,
} from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { Fragment, HostText } from './workTags';

type ExistingChildren = Map<string | number, FiberNode>;

/**
 * 05.实现首屏渲染 17分钟开始
 * @param shouldTrackEffects 是否追踪副作用
 * @returns
 */
function ChildReconciler(shouldTrackEffects: boolean) {
    function deleteChild(returnFiber: FiberNode, childToDelete: FiberNode) {
        if (!shouldTrackEffects) {
            return;
        }

        const deleteions = returnFiber.deletions;
        if (deleteions === null) {
            returnFiber.deletions = [childToDelete];
            returnFiber.flags |= ChildDeletion;
        } else {
            deleteions.push(childToDelete);
        }
    }

    function deleteRemainingChildren(
        returnFiber: FiberNode,
        currentFirstChild: FiberNode | null
    ) {
        if (!shouldTrackEffects) {
            return;
        }

        let childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
    }

    /** 创建组件 */
    function reconcileSingleElement(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        element: ReactElementType
    ) {
        const key = element.key;
        while (currentFiber !== null) {
            // update 比较key和type看能不能复用
            if (currentFiber.key === key) {
                // key相同
                if (element.$$typeof === REACT_ELEMENT_TYPE) {
                    // type相同
                    if (currentFiber.type === element.type) {
                        let props = element.props;
                        if (element.type === REACT_ELEMENT_TYPE) {
                            props = element.props.children;
                        }

                        const existing = useFiber(currentFiber, props);
                        existing.return = returnFiber;
                        // 当前节点可复用，标记剩下的节点删除
                        deleteRemainingChildren(
                            returnFiber,
                            currentFiber.sibling
                        );
                        return existing;
                    }
                    // key相同 type不同  删掉所有旧的
                    // deleteChild(returnFiber, currentFiber);
                    deleteRemainingChildren(returnFiber, currentFiber);
                    break;
                } else {
                    if (__DEV__) {
                        console.warn('还未实现的react类型', element);
                        break;
                    }
                }
            } else {
                // key不同， 删掉旧的
                deleteChild(returnFiber, currentFiber);
                currentFiber = currentFiber.sibling;
            }
        }

        // console.log('reconcileSingleElement');
        //根据reactElement创建fiber节点
        let fiber;
        if (element.type === REACT_ELEMENT_TYPE) {
            fiber = createFiberFromFragment(element.props.children, key);
        } else {
            fiber = createFiberFromElement(element);
        }

        fiber.return = returnFiber;

        return fiber;
    }

    function reconcileSingleTextNode(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        content: string | number
    ) {
        while (currentFiber !== null) {
            // updata流程
            if (currentFiber.tag === HostText) {
                // 类型没有变
                const existing = useFiber(currentFiber, { content });
                existing.return = returnFiber;
                deleteRemainingChildren(returnFiber, currentFiber.sibling);
                return existing;
            }
            // div -> haha
            deleteChild(returnFiber, currentFiber);
            currentFiber = currentFiber.sibling;
        }

        const fiber = new FiberNode(HostText, { content }, null);
        fiber.return = returnFiber;
        return fiber;
    }

    /** 是否标记副作用 */
    function placeSingleChild(fiber: FiberNode) {
        // 代表首屏渲染
        if (shouldTrackEffects && fiber.alternate === null) {
            // console.log(`%cplaceSingleChild`, 'color: red');
            // console.log(fiber);
            fiber.flags |= Placement;
        }

        return fiber;
    }

    function reconcileChildrenArray(
        returnFiber: FiberNode,
        currentFirstChild: FiberNode | null,
        newChild: any[]
    ) {
        // 最后一个可复用fiber在current中的index
        let lastPlacedIndex: number = 0;
        // 创建的最后一个fiber
        let lastNewFiber: FiberNode | null = null;
        // 创建第一个fiber
        let firstNewFiber: FiberNode | null = null;

        // 1.将current保存在map中
        const existingChildren: ExistingChildren = new Map();
        let current = currentFirstChild;
        while (current !== null) {
            const keyToUse = current.key !== null ? current.key : current.index;
            existingChildren.set(keyToUse, current);
            current = current.sibling;
        }

        for (let i = 0; i < newChild.length; i++) {
            // 2.遍历newChild,寻找是否可复用
            const after = newChild[i];

            // a.在Map中存在对应current fiber，且可以复用
            // b.在Map中不存在对应current fiber，或不能复用
            const newFiber = updateFromMap(
                returnFiber,
                existingChildren,
                i,
                after
            );

            if (newFiber === null) {
                continue;
            }

            // 3.标记移动还是插入
            newFiber.index = i;
            newFiber.return = returnFiber;

            if (lastNewFiber === null) {
                lastNewFiber = newFiber;
                firstNewFiber = newFiber;
            } else {
                lastNewFiber.sibling = newFiber;
                lastNewFiber = lastNewFiber.sibling;
            }

            if (!shouldTrackEffects) {
                continue;
            }

            const current = newFiber.alternate;
            if (current !== null) {
                const oldIndex = current.index;
                if (oldIndex < lastPlacedIndex) {
                    // 移动
                    newFiber.flags |= Placement;
                    continue;
                } else {
                    // 不移动
                    lastPlacedIndex = oldIndex;
                }
            } else {
                // mount
                newFiber.flags |= Placement;
            }
        }

        // 4.将Map中剩下的标记为删除
        existingChildren.forEach((fiber) => {
            deleteChild(returnFiber, fiber);
        });

        return firstNewFiber;
    }

    function updateFromMap(
        returnFiber: FiberNode,
        existingChildren: ExistingChildren,
        index: number,
        element: any
    ): FiberNode | null {
        const keyToUse = element.key !== null ? element.key : element.index;
        const before = existingChildren.get(keyToUse);

        // 步骤2-- 是否复用 详解 element是HostText,current fiber是么？
        if (typeof element === 'string' || typeof element === 'number') {
            // HostText
            if (before) {
                if (before.tag === HostText) {
                    existingChildren.delete(keyToUse);
                    return useFiber(before, { content: element + '' });
                }
            }
            return new FiberNode(HostText, { content: element + '' }, null);
        }

        // ReactElement
        if (typeof element === 'object' && element !== null) {
            switch (element.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    if (element.type === REACT_ELEMENT_TYPE) {
                        return updateFragment(
                            returnFiber,
                            before,
                            element,
                            keyToUse,
                            existingChildren
                        );
                    }

                    // key相同 都复用
                    if (before?.type === element.type) {
                        existingChildren.delete(keyToUse);

                        return useFiber(before, element.props);
                    }

                    return createFiberFromElement(element);
            }

            // TODO:数组类型
            if (Array.isArray(element) && __DEV__) {
                console.warn('还未实现数组类型的child');
            }
            return null;
        }

        if (Array.isArray(element)) {
            return updateFragment(
                returnFiber,
                before,
                element,
                keyToUse,
                existingChildren
            );
        }

        return null;
    }

    return function reconcileChildrenFibers(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        newChild?: any
    ) {
        // 判断Fragment
        const isUnKeyedTopLevelFragment =
            typeof newChild === 'object' &&
            newChild !== null &&
            newChild.type === REACT_ELEMENT_TYPE &&
            newChild.key === null;
        if (isUnKeyedTopLevelFragment) {
            newChild = newChild?.props.children;
        }

        // 判断当前fiber的类型
        if (typeof newChild === 'object' && newChild !== null) {
            // 多节点的情况 ul>li*3
            if (Array.isArray(newChild)) {
                const data = reconcileChildrenArray(
                    returnFiber,
                    currentFiber,
                    newChild
                );
                console.log(data);
                return data;
            }

            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(
                        reconcileSingleElement(
                            returnFiber,
                            currentFiber,
                            newChild
                        )
                    );

                default:
                    if (__DEV__) {
                        console.warn('未实现的reconcile类型', newChild);
                    }
                    break;
            }
        }

        // hostText
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(
                reconcileSingleTextNode(returnFiber, currentFiber, newChild)
            );
        }

        if (currentFiber !== null) {
            // 兜底删除
            // deleteChild(returnFiber, currentFiber);
            deleteRemainingChildren(returnFiber, currentFiber);
        }

        // return fiberNode
        if (__DEV__) {
            console.warn('未实现的reconcile类型', newChild);
        }
    };
}

function useFiber(fiber: FiberNode, pendingProps: Props) {
    const clone = createWorkInProgress(fiber, pendingProps);
    clone.index = 0;
    clone.sibling = null;

    return clone;
}

function updateFragment(
    returnFiber: FiberNode,
    current: FiberNode | undefined,
    elements: any[],
    key: Key,
    existingChildren: ExistingChildren
) {
    let fiber;
    if (!current || current.tag !== Fragment) {
        fiber = createFiberFromFragment(elements, key);
    } else {
        existingChildren.delete(key);
        fiber = useFiber(current, elements);
    }
    fiber.return = returnFiber;
    return fiber;
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
