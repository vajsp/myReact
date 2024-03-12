/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOM;
let ReactTestUtils;

describe('ReactElement', () => {
    let ComponentFC;

    beforeEach(() => {
        jest.resetModules();

        React = require('react');
        ReactDOM = require('react-dom');
        ReactTestUtils = require('react-dom/test-utils');
        // NOTE: We're explicitly not using JSX here. This is intended to test
        // classic JS without JSX.
        ComponentFC = () => {
            return React.createElement('div');
        };
    });

    it('returns a complete element according to spec', () => {
        const element = React.createElement(ComponentFC);
        expect(element.type).toBe(ComponentFC);
        expect(element.key).toBe(null);
        expect(element.ref).toBe(null);

        expect(element.props).toEqual({});
    });
});
