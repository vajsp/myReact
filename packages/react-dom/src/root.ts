// ReactDom.createRoot().render(<App />)

import {
    createContainer,
    upDateContainer,
} from 'react-reconciler/src/fiberReconciler';
import { ReactElementType } from 'shared/ReactTypes';
import { Container } from './hostConfig';

export function createRoot(container: Container) {
    const root = createContainer(container);

    return {
        render(element: ReactElementType) {
            upDateContainer(element, root);
        },
    };
}
