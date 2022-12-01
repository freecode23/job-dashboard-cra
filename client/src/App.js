
import React from 'react';
import { useState } from 'react';
import { axiosInstance } from './config';


function App() {
  const [value, setValue] = useState("");
  console.log("api=", process.env.REACT_APP_GOOGLE_API);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    const res = await axiosInstance.get("/values");
    console.log("res", res.data);
    setValue(res.data)
  }

  
  return (
    <div className="App">
      <h1>{value}</h1>
      <button
        onClick={handleSubmit}
      >Get Value</button>
    </div>
  );
}

export default App;
