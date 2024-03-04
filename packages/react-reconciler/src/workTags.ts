export type WorkTag =
    | typeof FunctionComponent
    | typeof HostRoot
    | typeof HostComponent
    | typeof HostText;

/** 函数组件 */
export const FunctionComponent = 0;
/**  是 fiber 树的根 */
export const HostRoot = 3;
/** 原生标签div ,HostComponent 即指原生的 HTML 标签*/
export const HostComponent = 5;
/** 原生文本节点 <div>123</div>*/
export const HostText = 6;
