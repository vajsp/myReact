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

    return (
        <div
            onClick={() => {
                setnum(num + 1);
            }}
        >
            {num}
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
