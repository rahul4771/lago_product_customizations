import React from 'react';
import CreatePurchaseOrder from './create';
import SelectGarment from './select-garment';
import AssignArtwork from './assign-artwork';
import AssignColorSizeQuantity from './assign-color-size';
import UploadArtwork from '../artwork/upload';
import EditNewArtwork from '../artwork/editArtwork';
import PurchaseOrderDetails from './po-details';
import PurchaseOrderPreview from './po-previews';
import ReviewAndApprove from './review-and-approve';
import AddPoInstructions from './add-po-instructions';
import ReviewAndComplete from './review-and-complete';
import EditAssignArtwork from './edit-assign-artwork';
import EditColorSizeQuantity from './edit-assign-color-size';

const CreatePoMaster = (props) => {
    const page = props.page;
    const params = props.params;
    return (
        page == "create" ? <CreatePurchaseOrder/>
        : page == "selectGarment" ? <SelectGarment/>
        : page == "assignArtwork" ? <AssignArtwork productId={params} />
        : page == "assignColorSizeQuantity" ? <AssignColorSizeQuantity product={params} />
        : page == "uploadArtwork" ? <UploadArtwork productId={params} />
        : page == "editArtwork" ? <EditNewArtwork/>
        : page == "poDetails" ? <PurchaseOrderDetails orderId={params} />
        : page == "poPreview" ? <PurchaseOrderPreview orderId={params} />
        : page == "reviewAndApprove" ? <ReviewAndApprove orderId={params} />
        : page == "addPoInstructions" ? <AddPoInstructions order={params} />
        : page == "reviewAndComplete" ? <ReviewAndComplete orderId={params} />
        : page == "editAssignArtwork" ? <EditAssignArtwork params={params} />
        : page == "editColorSizeQuantity" ? <EditColorSizeQuantity params={params} />
        : <CreatePurchaseOrder/>
    );
}
export default CreatePoMaster;
