import { Container } from 'hostConfig';
import { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { Flags, NoFlags } from './fiberFlags';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';

// 03.初探Reconciler 16分钟开始讲解原理

export class FiberNode {
    /**
     * 对于FunctionComponent，指函数本身
     * 对于ClassComponent，指class
     * 对于HostComponet，指的是DOM节点tagName
     */
    type: any;
    /** 刚开始的props状态 */
    pendingProps: Props;
    /** 确定下来的props状态 */
    memoizedProps: Props;
    /** 在processUpateQueue中计算完成后的状态, 函数组件就是hooks的链表 */
    memoizedState: any;
    /** 组件的类型 FunctionComponent、classComponent、HostComponent（指的是DOM节点对应的Fiber节点） */
    tag: WorkTag;
    key: Key;
    ref: Ref;
    /** hostComponent<div/>中的 div Dom,对于HostComponent来说指的是对应的真实的DOM节点 */
    stateNode: any;

    /** 指向父fiber节点 */
    return: FiberNode | null = null;
    /** 右边兄弟fiberNode */
    sibling: FiberNode | null = null;
    // 他的子fiberNode
    child: FiberNode | null = null;
    // ul li*3   li的编号
    index: number = 0;

    /** 当前还是之前的FiberNode */
    alternate: FiberNode | null;
    /** fiberNode 变化标记 */
    flags: Flags;
    subtreeFlags: Flags;
    /** 更新队列，用于暂存 setState 的值 */
    upUateQueue: any;

    constructor(tag: WorkTag, pendingProps: Props, key: Key) {
        // 实力
        this.tag = tag;
        this.key = key;
        // hostComponent <div/> div Dom
        this.stateNode = null;
        /**  FunctionComponent ()=>{} */
        this.type = null;

        // 构成树状态结构,执行父fiberNode

        this.return = null;
        // 右边兄弟fiberNode
        this.sibling = null;
        // 他的子fiberNode
        this.child = null;
        // ul li*3   li的编号
        this.index = 0;
        this.ref = null;

        // 工作单元

        /** 刚开始的props,新传入的 props */
        this.pendingProps = pendingProps;
        /**  工作完之后的props */
        this.memoizedProps = null;
        /** 确定下来的state状态 */
        this.memoizedState = null;
        this.upUateQueue = null;

        this.alternate = null;
        /** 副作用,保存本次更新会造成的DOM操作。比如删除，移动 */
        this.flags = NoFlags;
        this.subtreeFlags = NoFlags;
    }
}

export class FiberRootNode {
    /** fiberRootNode Container不一一定是个dom节点，不同的宿主会是不同类型，浏览器里为Element类型 */
    container: Container;
    current: FiberNode;
    finishedWork: FiberNode | null;
    constructor(container: Container, hostRootFiber: FiberNode) {
        this.container = container;
        this.current = hostRootFiber;
        hostRootFiber.stateNode = this;
        this.finishedWork = null;
    }
}

export const createWorkInProgress = (
    current: FiberNode,
    pendingProps: Props
): FiberNode => {
    let workinProgress = current.alternate;
    if (workinProgress === null) {
        // mount首屏阶段
        workinProgress = new FiberNode(current.tag, pendingProps, current.key);
        workinProgress.type = current.type;
        workinProgress.stateNode = current.stateNode;

        workinProgress.alternate = current;
        current.alternate = workinProgress;
    } else {
        // upate更新阶段
        workinProgress.pendingProps = pendingProps;
        workinProgress.flags = NoFlags;
        workinProgress.subtreeFlags = NoFlags;
    }

    workinProgress.type = current.type;
    workinProgress.upUateQueue = current.upUateQueue;
    workinProgress.child = current.child;
    workinProgress.memoizedProps = current.memoizedProps;
    workinProgress.memoizedState = current.memoizedState;

    return workinProgress;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
    const { type, key, props } = element;
    let fiberTag: WorkTag = FunctionComponent;

    if (typeof type === 'string') {
        // div type:div
        fiberTag = HostComponent;
    } else if (typeof type !== 'function' && __DEV__) {
        console.warn('未定义的type类型', element);
    }

    const fiber = new FiberNode(fiberTag, props, key);
    fiber.type = type;
    return fiber;
}
