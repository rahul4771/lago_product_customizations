import React from 'react';
import AllSalesReps from './list';
import EditSalesRep from './edit-salesrep';
import AddSalesRep from './add-salesrep';
import SalesrepDetails from './salesrep-details';

const CreateSalesRepMaster = (props) => {
    const page = props.page;
    const params = props.params;
    return (
        page == "salesList" ? <AllSalesReps />
        : page == "editSalesRep" ? <EditSalesRep params={params} />
        : page == "salesRepDetails" ? <SalesrepDetails params={params} />
        : page == "addSalesRep" ? <AddSalesRep params={params} />
        : <AllSalesReps />
    );
}
export default CreateSalesRepMaster;
