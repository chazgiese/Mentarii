import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>Hello from React!</h2>
      <button onClick={() => parent.postMessage({ pluginMessage: { type: 'create-rectangles', count } }, '*')}>Create {count} rectangles</button>
      <input type="number" value={count} onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)} />
      <button onClick={() => parent.postMessage({ pluginMessage: { type: 'close' } }, '*')}>Close</button>
    </div>
  );
}
