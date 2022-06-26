import { useState } from "react";

export default function Test() {
  const onclick = (e) => {
    console.log("You click me!");
    console.log(e);
    setContent("Click me again!!!");
  }
  const [content, setContent] = useState("Initial Content");
  return (
    <div className="prose">
      <button onClick={onclick}>click me</button>

      <input className="bg-black" type={"text"} value={content} readOnly />
    </div>
  )
}
