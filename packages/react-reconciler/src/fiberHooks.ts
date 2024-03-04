import { FiberNode } from './fiber';

export function renderWidthHooks(workinProgress: FiberNode) {
    const Component = workinProgress.type;
    const props = workinProgress.pendingProps;
    const children = Component(props);

    return children;
}
