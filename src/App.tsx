import React, { useState } from 'react';
import useBroadcast from './useBroadcast';
import './App.css';

function App() {
  const { emit, messages } = useBroadcast();
  const [text, setText] = useState('')
  const onSubmit = (event: any) => {
    event.preventDefault()
    emit(text)
    setText('')
  }
  const onChange = (event: any) => {
    setText(event.target.value)
  }
  return (
    <div className='app'>
      TEST
      <a href="http://localhost:3000" rel="noreferrer" onClick={() => {
        // NOTE: this timeout must be long enough to allow the "child tab" to initialize 
        // *this* React app so that it can attach the new child tab context to the same broadcast channel
        setTimeout(() => {
          emit('INIT_NEW_TAB')
        }, 1000)
        }} target="_blank">
        NEW TAB
      </a>
      <div>
        <form
          onSubmit={onSubmit}>
          <input value={text} onChange={onChange} />
          <button type='submit'>SEND MESSAGE</button>
        </form>
      </div>
      <pre>
        {JSON.stringify({messages}, null, 2)}
      </pre>
    </div>
  );
}

export default App;
