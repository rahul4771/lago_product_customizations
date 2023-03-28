import React from 'react';
import AllCustomer from './list';
import AddCustomer from './add-customer';
import EditCustomer from './edit-customer';


const CreateCustomerRepMaster = (props) => {
    const page = props.page;
    const params = props.params;
    return (
        page == "customerList" ? <AllCustomer />
        : page == "addCustomer" ? <AddCustomer params={params} />
        : page == "editCustomer" ? <EditCustomer params={params} />
        : <AllCustomer />
    );
}
export default CreateCustomerRepMaster;
