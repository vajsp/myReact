import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    return (
        <div>
            <Child />
        </div>
    );
}

function Child() {
    return <span>big-react</span>;
}

console.log('开始');

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
