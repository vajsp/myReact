// ReactElement

import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import {
    Key,
    Props,
    Ref,
    Type,
    IReactElement,
    ElementType,
} from 'shared/ReactTypes';

export const ReactElement = function (
    type: Type,
    key: Key,
    ref: Ref,
    props: Props
): IReactElement {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        key,
        ref,
        props,
        type,
        _mark: 'KaSong',
    };

    return element;
};

export function isValidElementFn(object: any) {
    return (
        typeof object === 'object' &&
        object !== null &&
        object.$$typeof === REACT_ELEMENT_TYPE
    );
}

export const jsx = (type: ElementType, config: any, ...maybeChildren) => {
    let key: Key = null;
    const props: Props = {};
    let ref: Ref = null;

    for (const prop in config) {
        const val = config[prop];
        if (prop === 'key') {
            if (val !== undefined) {
                key = '' + val;
            }
            continue;
        }

        if (prop === 'ref') {
            if (val !== undefined) {
                ref = val;
            }
            continue;
        }

        if (Object.hasOwnProperty.call(config, prop)) {
            props[prop] = val;
        }
    }

    const length = maybeChildren.length;
    if (length) {
        if (length === 1) {
            props.children = maybeChildren[0];
        } else {
            props.children = maybeChildren;
        }
    }

    console.log('jsx');

    return ReactElement(type, key, ref, props);
};

export const jsxDEV = (type: ElementType, config: any) => {
    let key: Key = null;
    const props: Props = {};
    let ref: Ref = null;

    for (const prop in config) {
        const val = config[prop];
        if (prop === 'key') {
            if (val !== undefined) {
                key = '' + val;
            }
            continue;
        }

        if (prop === 'ref') {
            if (val !== undefined) {
                ref = val;
            }
            continue;
        }

        if (Object.hasOwnProperty.call(config, prop)) {
            props[prop] = val;
        }
    }
    // console.log('jsxDEV');
    // console.log(jsxDEV);

    return ReactElement(type, key, ref, props);
};
