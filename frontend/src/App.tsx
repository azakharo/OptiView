import {useState} from 'react';
import {Button} from 'flowbite-react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="mx-auto flex max-w-md items-center justify-center">
      <div>
        <h1 className="mb-4 text-center text-4xl">Vite + React</h1>
        <div className="flex justify-center">
          <Button color="green" onClick={() => setCount(count => count + 1)}>
            count is {count}
          </Button>
        </div>
        <div className="mt-2 text-2xl text-green-600">
          This template uses Tailwind CSS
        </div>
      </div>
    </div>
  );
}

export default App;
