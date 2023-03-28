let url = "https://reqres.in/api/users?page=2";
let request = {
    method: "GET",
    headers: {
      "access-token": TOKEN,
    }
  };
const response = await fetch(url, request);
let sortOrder = null;
{Object.keys(response.data).map((key) => {
    if(key == "first_name") sortOrder[key] = response.data[key];
})}

sortOrder = sortOrder.sort();

return(
    <>
    
    </>
)
{Object.keys(sortOrder).map((key) => {
    if(sortOrder[key] == response.data[key]){

    }
})}