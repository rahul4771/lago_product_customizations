import { useState } from "react";
import childComponent './childComponent.js';

const parentComponent = () => {
    let [test, setTest] = useState({test1:"test1",test2:"test2",test3:"test3"});
    <childComponent test={test} setTest={setTest()}/>
}
export parentComponent;