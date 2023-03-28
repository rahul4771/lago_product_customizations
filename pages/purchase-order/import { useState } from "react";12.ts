import { useState } from "react";

const childComponent = (props) => {
    let [test, setTest] = useState(props.test);
    if(test.test1 == "test1"){
        let tested = test;
        tested.test1 = "tested";
        setTest(tested)
    }
    let tested2 = test;
    props.setTest(tested2);
}
export childComponent;