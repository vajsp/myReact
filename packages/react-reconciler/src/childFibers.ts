import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { Props, ReactElementType } from 'shared/ReactTypes';
import {
    createFiberFromElement,
    createWorkInProgress,
    FiberNode,
} from './fiber';
import { ChildDeletion, Placement } from './fiberFlags';
import { HostText } from './workTags';

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

    /** 创建组件 */
    function reconcileSingleElement(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        element: ReactElementType
    ) {
        const key = element.key;
        if (currentFiber !== null) {
            // update 比较key和type看能不能复用
            work: if (currentFiber.key === key) {
                // key相同
                if (element.$$typeof === REACT_ELEMENT_TYPE) {
                    // type相同
                    if (currentFiber.type === element.type) {
                        const existing = useFiber(currentFiber, element.props);
                        existing.return = returnFiber;
                        return existing;
                    }
                    // key相同 type不同  删掉旧的
                    deleteChild(returnFiber, currentFiber);
                    break work;
                } else {
                    if (__DEV__) {
                        console.warn('还未实现的react类型', element);
                        break work;
                    }
                }
            } else {
                //  删掉旧的
                deleteChild(returnFiber, currentFiber);
            }
        }

        // console.log('reconcileSingleElement');
        //根据reactElement创建fiber节点
        const fiber = createFiberFromElement(element);
        fiber.return = returnFiber;
        return fiber;
    }

    function reconcileSingleTextNode(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        content: string | number
    ) {
        if (currentFiber !== null) {
            // updata流程
            if (currentFiber.tag === HostText) {
                // 类型没有变
                const existing = useFiber(currentFiber, { content });
                existing.return = returnFiber;
                return existing;
            }
            // div -> haha
            deleteChild(returnFiber, currentFiber);
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

    return function reconcileChildrenFibers(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        newChild?: ReactElementType
    ) {
        // 判断当前fiber的类型
        if (typeof newChild === 'object' && newChild !== null) {
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
        // TODO:多节点的情况 ul>li*3

        // hostText
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(
                reconcileSingleTextNode(returnFiber, currentFiber, newChild)
            );
        }

        if (currentFiber !== null) {
            // 兜底删除
            deleteChild(returnFiber, currentFiber);
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

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
