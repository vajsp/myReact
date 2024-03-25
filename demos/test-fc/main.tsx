/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

// // 第一步测试
// function App() {
//     return (
//         <div>
//             <Child />
//         </div>
//     );
// }

function Child() {
    return <span>big-react</span>;
}

/** useSate测试 */
function App() {
    const [num, setnum] = useState(100);
    // window.setnum = setnum;

    const arr =
        num % 2 === 0
            ? [<li key={'1'}>1</li>, <li key={'2'}>2</li>, <li key={'3'}>3</li>]
            : [
                  <li key={'3'}>3</li>,
                  <li key={'2'}>2</li>,
                  <li key={'1'}>1</li>,
              ];

    console.log(arr);

    return (
        <div
            onClick={() => {
                setnum(num + 1);
            }}
        >
            {arr}
        </div>
    );
    // return num === 3 ? <Child /> : <div>{num}</div>;
}

console.log('开始');

ReactDOM.createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>
);
