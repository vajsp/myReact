// ReactDom.createRoot().render(<App />)

import {
    createContainer,
    upDateContainer,
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { Container } from './hostConfig';
import { initEvent } from './SyntheticEvent';

export function createRoot(container: Container) {
    const root = createContainer(container);

    return {
        render(element: ReactElementType) {
            // console.log('element');
            // console.log(element);
            initEvent(container, 'click');
            return upDateContainer(element, root);
        },
    };
}
