import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
    createUpate,
    createUpateQueue,
    enqueueUpate,
    UpdateQueue,
} from './upDateQueue';
import { scheduleUpateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

/** ReatDom.createRoot 创建FiberRootNode */
export function createContainer(container: Container) {
    const hostRootFiber = new FiberNode(HostRoot, {}, null);
    const root = new FiberRootNode(container, hostRootFiber);
    hostRootFiber.upUateQueue = createUpateQueue();
    return root;
}

/** 更新调用 */
export function upDateContainer(
    element: ReactElementType | null,
    root: FiberRootNode
) {
    // console.log('upDateContainer element');
    // console.log(element);

    const hostRootFiber = root.current;
    // reactDom.createRoot(root).render(<App />) 这里的element就是<App />
    const update = createUpate<ReactElementType | null>(element);
    enqueueUpate(
        hostRootFiber.upUateQueue as UpdateQueue<ReactElementType | null>,
        update
    );

    scheduleUpateOnFiber(hostRootFiber);

    return element;
}
