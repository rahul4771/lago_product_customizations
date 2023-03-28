
const array = [{name: 'abc', email: 'abc@gmail.com', age: 20}, {name: 'xyz', email: 'xyz@gmail.com', age: 22}, {name: 'acd', email: 'acd@gmail.com', age: 24}, {name: 'abcd', email: 'abc@gmail.com', age: 24}, {name: 'def', email: 'def@gmail.com', age: 24}, {name: 'abcd', email: 'abc@gmail.com', age: 24}, {name: 'wxyz', email: 'xyz@gmail.com', age: 60}]


let testEmails = [];
let testOutput = [];
(array).forEach(element => {
    if(!testEmails.includes(element.email)){
        testEmails.push(element.email)
        testOutput.push(element)
    }    
});


//Output: [{name: 'abc', email: 'abc@gmail.com', age: 20}, {name: 'xyz', email: 'xyz@gmail.com', age: 22}, {name: 'acd', email: 'acd@gmail.com', age: 24}, {name: 'def', email: 'def@gmail.com', age: 24}]



const renderItems =() => {

const user = [{name: 'abc', email: 'abc@gmail.com', age: 20}, {name: 'xyz', email: 'xyz@gmail.com', age: 22}, {name: 'acd', email: 'acd@gmail.com', age: 24}, {name: 'abcd', email: 'abc@gmail.com', age: 24}, {name: 'def', email: 'def@gmail.com', age: 24}, {name: 'abcd', email: 'abc@gmail.com', age: 24}, {name: 'wxyz', email: 'xyz@gmail.com', age: 60}]

return(
    <>
        Object.values()
        {user.map((value,index) => {
            return(
                <> 
                Name: {value.name} 
                Email: {value.email} 
                </>
            )
        })}
    </>
)

}

export renderItems;


Name: abcEmail: abc@gmail.com