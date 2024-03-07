import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ReactElementType } from 'shared/ReactTypes';
import { createFiberFromElement, FiberNode } from './fiber';
import { Placement } from './fiberFlags';
import { HostText } from './workTags';

/**
 * 05.实现首屏渲染 17分钟开始
 * @param shouldTrackEffects 是否追踪副作用
 * @returns
 */
function ChildReconciler(shouldTrackEffects: boolean) {
    /** 创建组件 */
    function reconcileSingleElement(
        returnFiber: FiberNode,
        currentFiber: FiberNode | null,
        element: ReactElementType
    ) {
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

        // return fiberNode
        if (__DEV__) {
            console.warn('未实现的reconcile类型', newChild);
        }
    };
}

export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);
