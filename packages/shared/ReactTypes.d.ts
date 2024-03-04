export type Type = any;
export type Key = any;
export type Ref = any;
export type Props = any;
export type ElementType = any;
export type ReactElementType = any;

export interface IReactElement {
    $$typeof: symbol | number;
    type: Type;
    props: Props;
    ref: Ref;
    _mark: string;
}

/** setState的Action */
export type Action<State> = State | ((prevState: State) => State);
