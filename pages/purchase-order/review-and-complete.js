import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { InlineError, Modal, TextContainer, Frame, Toast } from '@shopify/polaris';
import Moment from 'react-moment';
import { useRouter } from "next/router";
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Spinner } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import momentTimezone from 'moment-timezone';
import moment from 'moment';

const ReviewAndComplete = (props) => {
    const router = useRouter();
    const [orderId, setOrderId] = useState(JSON.parse(props.orderId).orderId);
    const product = JSON.parse(props.orderId).product;
    const [puchaseOrder, setPurchaseOrder] = useState({});
    const [customer, setCustomer] = useState({});
    const [lineItems, setLineItems] = useState({});
    const [loading, setLoading] = useState(true);
    const [artwork, setArtwork] = useState([]);
    const [poName, setPoName] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [active, setActive] = useState(true);
    const [customerName, setCustomername] = useState('');
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    const handleChange = useCallback(() => setActive(!active), [active]);
    const [commendDetails, setCommendDetails] = useState([]);
    const [commendStatus, setCommendStatus] = useState(false);
    const [commend, setCommend] = useState('');
    const [validation, setValidation] = useState(false);
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
	const [poDetails, setPoDetails] = useState({});
    let approveFlow = JSON.parse(props.orderId).approveFlow || false;
    let setSignal = null;
    let controller = null;
    let dates = [];
    let itemsCount = 0;
    let modalStatus = null;
    let concernedElement = null;
    
    useEffect(() => {
        router.prefetch("/header?tab=all-POs");
        try {
            controller = new AbortController();
            setSignal = controller.signal;
            getPurchaseOrder(setSignal);
            getCommendOnOrder();
            return () => {
                if (setSignal) {
                    controller.abort();
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, []);
	
	useEffect(() => {
		(async () => {
			concernedElement = document.querySelector(".Polaris-Modal-Dialog__Modal");
		})();
	}, [showModal]);

	document.addEventListener("mousedown", (event) => {
		if(concernedElement != null){
			if (!concernedElement.contains(event.target)) {
				concernedElement = null;
				setShowModal(false);
			}
		}
	});
    const sendCheckout = async () => {
        let url = API.sendCheckoutURL;
        let orderID = orderId;
        let data = { orderID }
        const responseSendCheckoutURL = await ApiHelper.post(url, data);
        if (responseSendCheckoutURL && responseSendCheckoutURL.message == 'success') {
            setActive(false);
            setShowModal(false);
            settoggleActiveT(true);
        }
    }
    const getPurchaseOrder = async (signal) => {
        let url = API.puchaseOrder + '/' + orderId;
        setLoading(true);
        const purchaseOrderDetails = await ApiHelper.get(url, signal);
        setLoading(false);
        if (purchaseOrderDetails && purchaseOrderDetails.message == "success") {
            setPurchaseOrder(purchaseOrderDetails.body.purchase_order);
            setCustomer(purchaseOrderDetails.body.purchase_order.customer);
            setLineItems(purchaseOrderDetails.body.purchase_order.line_items);
            setArtwork(purchaseOrderDetails.body.artwork);
            setPoName(purchaseOrderDetails.body.purchase_order.name.replace("#", "%23"));
            let data = {};
            data['orderId'] = purchaseOrderDetails.body.purchase_order.id;
            data['orderName'] = purchaseOrderDetails.body.purchase_order.name;
            data['orderCustomer'] = purchaseOrderDetails.body.purchase_order.customer;
            data['requiredBy'] = purchaseOrderDetails.body.purchase_order.required_by;
            data['orderInstruction'] = purchaseOrderDetails.body.purchase_order.instruction;
			data['lineItems'] = purchaseOrderDetails.body.purchase_order.line_items;
			data['approveFlow'] = approveFlow;
			data['product'] = product;
			let orderLineItems = purchaseOrderDetails.body.purchase_order.line_items;
			let existingVariants = {};
			Object.keys(orderLineItems).map((key) => {
				orderLineItems[key].items.map((item, itemKey) => {
					existingVariants[item.variant_id] = {
						'variantId': item.variant_id,
						'quantity': item.quantity
					};
				})
			});
			data['existingVariants'] = existingVariants;
            setPoDetails(data);
            let customerFullName = data['orderCustomer'].name.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '');
            customerFullName = customerFullName.slice(0, 2);
            if (customerFullName.length == 1) {
                customerFullName = data['orderCustomer'].name.slice(0, 2);
            }
            let currentDate = momentTimezone().tz("America/Los_Angeles");
            let currentToDate = momentTimezone().tz("America/Los_Angeles").add(4.2, 'hours');
            let fromDate = moment(currentDate, "YYYY-MM-DD hh:mm:ss").format('YYYYMMDDThhmmss');
            let fromDateAdded = moment(currentToDate, "YYYY-MM-DD hh:mm:ss").format('YYYYMMDDThhmmss');
            setStartDate(fromDate);
            setEndDate(fromDateAdded);
            setCustomername(customerFullName);
            setLocation("Marketing Lago, 19652 86 Ave, Langley, BC V2Y 1Z5, Canada");
        }
    }

    const validator = () => {
        try {
            let commendAdded = commend;
            commendAdded = commendAdded.trim();
            setCommend(commendAdded);
            if (commendAdded != '') {
                postCommendOnOrder();
                setValidation(false);
                return () => {
                    if (setSignal) {
                        controller.abort();
                    }
                };
            } else {
                setValidation(true);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const getCommendOnOrder = async () => {
        let url = API.orderComments + '/' + orderId;
        const getOrderCommend = await ApiHelper.get(url, null);
        let data = null;
        if (getOrderCommend && getOrderCommend.message == 'success') {
            let commentArray = getOrderCommend.body.comments;
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            for (let props in commentArray) {
                let year = commentArray[props].created_at.slice(0, 4);
                let month = Number(commentArray[props].created_at.slice(5, 7));
                let date = commentArray[props].created_at.slice(8, 10);
                let hours = commentArray[props].created_at.slice(11, 13); 
                let minutes = commentArray[props].created_at.slice(14, 16);
                let ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                let strTime = hours + ':' + minutes + ' ' + ampm;
                let created_date = monthNames[month-1] + ' ' + date + ', ' + year;
                data = {
                    order_id: commentArray[props].order_id,
                    comment: commentArray[props].comment.replace(/'/g, ''),
                    from: commentArray[props].sender_type,
                    to: commentArray[props].receiver_type,
                    created_date: created_date,
                    created_time: strTime,
                    created_at: commentArray[props].created_at,
                };
                Array.prototype.push.apply(commendDetails, [data]);
            }
        }
    };

    const postCommendOnOrder = async () => {
        let currentComment = commend;
        setCommend('');
        let url = API.orderComments;
        let newDateUS = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
        let newDate = new Date(newDateUS.replace(/-/g, "/"));
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        let momentTimeCreatedAt = momentTimezone().tz("America/Los_Angeles").format('YYYY-MM-DD HH:mm:ss');
        let momentCreatedAt = momentTimeCreatedAt.slice(0, 10);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let cur_year = momentCreatedAt.slice(0, 4);
        let cur_month = Number(momentCreatedAt.slice(5, 7));
        let cur_date = momentCreatedAt.slice(8, 10);
        let created_date = monthNames[cur_month-1] + ' ' + cur_date + ', ' + cur_year;
        let time = new Intl.DateTimeFormat('default', {
            hour12: true,
            hour: 'numeric',
            minute: 'numeric',
        }).format(new Date(momentTimeCreatedAt.replace(/-/g, "/")));
        let data = {
            order_id: orderId,
            comment: currentComment,
            from: 'admin',
            to: customer.id,
            created_date: created_date,
            created_time: time,
            created_at: year + '-' + month + '-' + date,
            created_on: momentTimeCreatedAt,
        };
        commendDetails.unshift(data);
        if(currentComment != ''){
            const postOrderCommend = await ApiHelper.post(url, data, null);
            setCommendStatus(true);
        }
    };
    return (
        <>
            <div
                className="Polaris-Tabs__Panel"
                id="create-po"
                role="tabpanel"
                aria-labelledby="Create-PO"
                tabIndex="-1"
            >
                <div className="Polaris-Card__Section">
                    <div className="list--breabcrumbs">
                        <ul className="Polaris-List">
                        {approveFlow ? (<>
                            <li className="Polaris-List__Item">
                                <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: orderId } }}>{puchaseOrder.name? "PO Details - " + puchaseOrder.name : "PO Details" }</Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={IconArrow} alt="Icon arrow right" />
                            </li>
                            <li className="Polaris-List__Item">
                                <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editAssignArtwork", params: JSON.stringify({ orderId: orderId, productId: product.id }) } }}> Assign Artwork </Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={IconArrow} alt="Icon arrow right"/>
                            </li>
                            <li className="Polaris-List__Item">
                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editColorSizeQuantity", params: JSON.stringify({ product: product , orderId: orderId, orderName: poDetails.orderName, lineItems : poDetails.existingVariants }) } }}> Assign Color, Size, Quantity </Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={IconArrow} alt="Icon arrow right"/>
                            </li>
                            <li className="Polaris-List__Item">
                            <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "reviewAndApprove", params: JSON.stringify({ orderId: orderId, product: product }) } }}>Approve</Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={ IconArrow } alt="Icon arrow right" />
                            </li>
                            <li className="Polaris-List__Item">
                            <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "addPoInstructions", params: JSON.stringify(poDetails) } }}>Add Order Level Instructions</Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={IconArrow} alt="Icon arrow right" />
                            </li>
                            <li className="Polaris-List__Item">
                                Review and Complete
                            </li></>) : (<>
                            <li className="Polaris-List__Item">
                                <Link href={{ pathname: "/", query: { tab: "create-PO", page: "poDetails", params: orderId } }}>{puchaseOrder.name? "PO Details - " + puchaseOrder.name : "PO Details" }</Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={ IconArrow } alt="Icon arrow right" />
                            </li>
                            <li className="Polaris-List__Item">
                            <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "addPoInstructions", params: JSON.stringify(poDetails) } }}>Add Order Level Instructions</Link>
                            </li>
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <img src={IconArrow} alt="Icon arrow right" />
                            </li>
                            <li className="Polaris-List__Item">
                                Review and Complete
                            </li></>) }
                        </ul>
                        <div id="PolarisPortalsContainer"></div>
                    </div>
                    {loading === false ? (
                        <div>
                            <div className="display-text">
                                <div className="display-text--title">
                                    <div>
                                        <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                            {'PO ' + puchaseOrder.name}
                                        </p>
                                    </div>
                                    <div className='purchase__orders'>
                                        <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
                                            <span className="Polaris-Tag__TagText">
                                                {status}
                                            </span>
                                        </span>
                                        <div id="PolarisPortalsContainer"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="Polaris-ButtonGroup">
                                        <div className="Polaris-ButtonGroup__Item">
                                            <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "addPoInstructions", params: JSON.stringify(poDetails) } }}>
                                                <button className="Polaris-Button" type="button">
                                                    <span className="Polaris-Button__Content">
                                                        <span className="Polaris-Button__Text">
                                                            Back
                                                        </span>
                                                    </span>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="PolarisPortalsContainer"></div>
                        </div>
                    ) : null}
                    <div className="review__complete">
                        {loading ? (
                            <Spinner accessibilityLabel="Spinner example" size="large" />
                        ) : (
                            <>
                                <div className="Polaris-Layout">
                                    <div className="Polaris-Layout__Section">
                                        <div className="Polaris-Card">
                                            <div>
                                                <div>
                                                    <div className="Polaris-Page__Content">
                                                        <div>
                                                            <div>
                                                                <div
                                                                    className="Polaris-DataTable__Navigation"
                                                                >
                                                                    <button
                                                                        className="Polaris-Button Polaris-Button--disabled Polaris-Button--plain Polaris-Button--iconOnly"
                                                                        aria-label="Scroll table left one column"
                                                                        type="button"
                                                                        disabled=""
                                                                    >
                                                                        <span className="Polaris-Button__Content">
                                                                            <span className="Polaris-Button__Icon">
                                                                                <span className="Polaris-Icon">
                                                                                    <svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                                        <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                                                                    </svg>
                                                                                </span>
                                                                            </span>
                                                                        </span>
                                                                    </button>
                                                                    <button className="Polaris-Button Polaris-Button--plain Polaris-Button--iconOnly"
                                                                        aria-label="Scroll table right one column"
                                                                        type="button">
                                                                        <span className="Polaris-Button__Content">
                                                                            <span className="Polaris-Button__Icon">
                                                                                <span className="Polaris-Icon">
                                                                                    <svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
                                                                                        <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                                                                    </svg>
                                                                                </span>
                                                                            </span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                                <div className="Polaris-DataTable">
                                                                    <div className="Polaris-DataTable__ScrollContainer">
                                                                        <table className="Polaris-DataTable__Table review--data-status">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th
                                                                                        data-polaris-header-cell="true"
                                                                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                                                                        scope="col"
                                                                                    >
                                                                                        Garment / Artwork
                                                                                    </th>
                                                                                    <th
                                                                                        data-polaris-header-cell="true"
                                                                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                                        scope="col"
                                                                                    >
                                                                                        Status
                                                                                    </th>
                                                                                    <th
                                                                                        data-polaris-header-cell="true"
                                                                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                                        scope="col" style={{ paddingLeft: "34px" }}
                                                                                    >
                                                                                        Quantity
                                                                                    </th>
                                                                                    <th
                                                                                        data-polaris-header-cell="true"
                                                                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                                        scope="col" style={{ paddingLeft: "34px" }}
                                                                                    >
                                                                                        Price
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {Object.keys(lineItems).map((key) => {
                                                                                    let customProduct = puchaseOrder.customized_products[key];
                                                                                    let customImage = "";
                                                                                    if (customProduct.custom_product_front != "") {
                                                                                        customImage = customProduct.custom_product_front;
                                                                                    } else if (customProduct.custom_product_back != "") {
                                                                                        customImage = customProduct.custom_product_back;
                                                                                    } else {
                                                                                        customImage = customProduct.custom_product_sleeve;
                                                                                    }
                                                                                    let customizationDetails = JSON.parse(puchaseOrder.metafield.value);
                                                                                    let arts = [];
                                                                                    let customizationElements = customizationDetails[key].customization_elements;

                                                                                    $.each(customizationElements, function (key, artElement) {
                                                                                        if (artElement.art_image_status) {
                                                                                            $.each(artElement.art_image_array, function (index, artImageData) {
                                                                                                arts.push(artImageData);
                                                                                            });
                                                                                        }
                                                                                    });

                                                                                    if (lineItems[key].status == "pendingAdminApproval") {
                                                                                        status = "Awaiting Admin Approval";
                                                                                    } else if (lineItems[key].status == "pendingCustomerApproval") {
                                                                                        status = "Awaiting Client Approval";
                                                                                    } else if (lineItems[key].status == "adminApproved") {
                                                                                        status = "Admin Approved";
                                                                                    } else if (lineItems[key].status == "customerApproved") {
                                                                                        status = "Client Approved";
                                                                                    }
                                                                                    let placedArtwork = arts;

                                                                                    return (
                                                                                        <Fragment key={"prod-" + key}>
                                                                                            <tr className="Polaris-DataTable__TableRow" >
                                                                                                <th className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignMiddle Polaris-DataTable__Cell--firstColumn"
                                                                                                    scope="row">
                                                                                                    <div>
                                                                                                        <span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
                                                                                                            <img src={customImage} alt={lineItems[key].product_name} />
                                                                                                        </span>
                                                                                                        <div id="PolarisPortalsContainer"></div>
                                                                                                    </div>
                                                                                                    <div>
                                                                                                        <div>
                                                                                                            <h2 className="Polaris-Heading">
                                                                                                                {lineItems[key].product_name}
                                                                                                            </h2>
                                                                                                            <div id="PolarisPortalsContainer"></div>
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <ul className="Polaris-List">
                                                                                                                {
                                                                                                                    lineItems[key].items.map((item, itemKey) => {
                                                                                                                        let options = "Qty: " + item.quantity;
                                                                                                                        item.options.map((option) => {
                                                                                                                            options += ", " + option.name + ": " + option.value;
                                                                                                                        })

                                                                                                                        return (
                                                                                                                            <li className="Polaris-List__Item" key={"op" + key + "i" + itemKey}>
                                                                                                                                {options}
                                                                                                                            </li>
                                                                                                                        )
                                                                                                                    })
                                                                                                                }
                                                                                                                <li className="Polaris-List__Item">Assigned artwork</li>
                                                                                                                {placedArtwork.map((placedArt, index) => {
                                                                                                                    return (
                                                                                                                        <Fragment key={"p" + key + "a" + index}>
                                                                                                                            <li className="Polaris-List__Item">
                                                                                                                                SKU: {placedArt.id}
                                                                                                                            </li>
                                                                                                                            <li className="Polaris-List__Item" style={{ textTransform: "capitalize" }}>
                                                                                                                                Name:{" "}
                                                                                                                                {placedArt.name}
                                                                                                                            </li>
                                                                                                                        </Fragment>
                                                                                                                    )
                                                                                                                })}
                                                                                                            </ul>
                                                                                                            <div id="PolarisPortalsContainer"></div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </th>
                                                                                                <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignMiddle" key="status">
                                                                                                    <div>
                                                                                                        <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'color--green' : status == 'Client Approved' ? 'color--green' : 'color--grey')}>
                                                                                                            <span
                                                                                                                className="Polaris-Tag__TagText">
                                                                                                                {status}
                                                                                                            </span>
                                                                                                        </span>
                                                                                                        <div id="PolarisPortalsContainer"></div>
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop" key="price-quantity">
                                                                                                    <ul className="Polaris-List List-style" style={{marginTop:"30px"}}>
                                                                                                        {
                                                                                                            lineItems[key].items.map((item, itemKey) => {
                                                                                                                return (
                                                                                                                    <li className="Polaris-List__Item" key={"item-price-quantity-" + itemKey}>
                                                                                                                        {"$" + item.price + " x " + item.quantity}
                                                                                                                    </li>
                                                                                                                )
                                                                                                            })
                                                                                                        }
                                                                                                    </ul>
                                                                                                </td>
                                                                                                <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop" key="price">
                                                                                                    <ul className="Polaris-List List-style" style={{marginTop:"30px"}}>
                                                                                                        {
                                                                                                            lineItems[key].items.map((item, itemKey) => {
                                                                                                                let total = item.price * item.quantity;
                                                                                                                itemsCount += Number(item.quantity);
                                                                                                                return (
                                                                                                                    <li className="Polaris-List__Item" key={"item-price-quantity-" + itemKey}>
                                                                                                                        {"$" + total.toFixed(2)}
                                                                                                                    </li>
                                                                                                                )
                                                                                                            })
                                                                                                        }
                                                                                                    </ul>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </Fragment>
                                                                                    )
                                                                                })}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                        </div>
                                        {puchaseOrder.required_by ? (
                                            <div className="Polaris-Card review__heading">
                                                <div>
                                                    <h2 className="Polaris-Heading">Required by Date</h2>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div>
                                                    <div className="Polaris-TextContainer">
                                                        <p>
                                                        {moment(new Date(puchaseOrder.required_by.replace(/-/g, "/"))).format('MMMM DD, YYYY')}
                                                        </p>
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                            </div>
                                        ) : null}
                                        <div className="Polaris-Card review__heading--production">
                                            <div>
                                                <h2 className="Polaris-Heading">Required Production Times</h2>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div>
                                                <div>
                                                    <div className="Polaris-Page__Content">
                                                        <div>
                                                            <div>
                                                                <div className="Polaris-DataTable">
                                                                    <div className="Polaris-DataTable__ScrollContainer">
                                                                        <table className="Polaris-DataTable__Table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header" scope="col">Stock</th>
                                                                                    <th data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col">Embellishment</th>
                                                                                    <th data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col">Printing</th>
                                                                                    <th data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header" scope="col">Shipping</th>
                                                                                </tr>
                                                                                <tr>
                                                                                    <th className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--total" scope="row">1 hour</th>
                                                                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--total">2.5 hours</td>
                                                                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--total">0.5 hours</td>
                                                                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--total">0.2 hours</td>
                                                                                </tr>
                                                                            </thead>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div>
                                                <a href={"https://calendar.google.com/calendar/u/0/r/eventedit?text=PO" + poName + ' - ' + customer.name + "&details=https://lago-apparel-cad.myshopify.com/admin/draft_orders/" + orderId + "&location="+ location +"&dates=" + startDate + "Z/" + endDate + "Z"} className="Polaris-Button Polaris-Button--plain" type="button" target='_blank'>
                                                    <span className="Polaris-Button__Content">
                                                        <span className="Polaris-Button__Text">Google Calendar</span>
                                                    </span>
                                                </a>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                        </div>
                                        <div className="Polaris-Card review__heading--summary">
                                            <div>
                                                <h2 className="Polaris-Heading">Order Summary</h2>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div className="list--total">
                                                <ul className="Polaris-List">
                                                    <li className="Polaris-List__Item">
                                                        <h2>Subtotal&emsp;&emsp;{itemsCount} items</h2>
                                                        <h2>{"$" + puchaseOrder.subtotalPrice}</h2>
                                                    </li>
                                                    <li className="Polaris-List__Item">
                                                        <h2>Shipping</h2>
                                                        <h2>{"$" + puchaseOrder.totalShippingPrice}</h2>
                                                    </li>
                                                    <li className="Polaris-List__Item">
                                                        <h2>Tax</h2>
                                                        <h2>{"$" + puchaseOrder.totalTax}</h2>
                                                    </li>
                                                    <li className="Polaris-List__Item">
                                                        <h1>Total</h1>
                                                        <h1>{"$" + puchaseOrder.totalPrice}</h1>
                                                    </li>
                                                </ul>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                        </div>
                                        <div className="review--button">
                                            <button className="Polaris-Button Polaris-Button--primary" type="button"
                                                onClick={() => {
                                                    handleChange,
                                                    setActive(true);
                                                    setShowModal(true);
                                                }}
                                            >
                                                <span className="Polaris-Button__Content">
                                                    <span className="Polaris-Button__Text">Complete & Send Invoice</span>
                                                </span>
                                            </button>
                                            <div id="PolarisPortalsContainer"></div>
                                        </div>
                                        {loading === false ? (
                                            <div className="Polaris-Card__Section">
                                                <div>
                                                    <h2 className="Polaris-Heading customer--heading">Conversations</h2>
                                                    <div className="customer--user">
                                                        <span aria-label="Farrah" role="img" className="Polaris-Avatar Polaris-Avatar--sizeMedium">
                                                            <span className="Polaris-Avatar__Initials">LA</span> 
                                                        </span>
                                                        <span className="custom_input_btn">
                                                            <div className="Polaris-Connected" style={{ width: '94%', float: 'left' }}>
                                                                <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                    <div className="Polaris-TextField Polaris-TextField--hasValue">
                                                                        <input
                                                                            id="PolarisTextField28"
                                                                            className="Polaris-TextField__Input"
                                                                            aria-describedby="PolarisTextField28CharacterCounter"
                                                                            aria-labelledby="PolarisTextField28Label"
                                                                            aria-invalid="false"
                                                                            value={commend}
                                                                            onBlur={(event) => setCommend(event.target.value)}
                                                                            onChange={(event) => setCommend(event.target.value)}
                                                                            onKeyUp={(event) => setCommend(event.target.value)}
                                                                        />
                                                                        <div
                                                                            id="PolarisTextField28CharacterCounter"
                                                                            className="Polaris-TextField__CharacterCount"
                                                                            aria-label="11 of 20 characters used"
                                                                            aria-live="off"
                                                                            aria-atomic="true"
                                                                        >
                                                                        </div>
                                                                        <div className="Polaris-TextField__Backdrop"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="Polaris-ButtonGroup">
                                                                <div className="Polaris-ButtonGroup__Item">
                                                                    <button
                                                                        className="Polaris-Button  Polaris-Button--primary"
                                                                        type="button"
                                                                        onClick={validator}
                                                                    >
                                                                        <span className="Polaris-Button__Content">
                                                                            <span className="Polaris-Button__Text">Post</span>
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </span>
                                                    </div>
                                                    {validation === true && (<div style={{ marginLeft: '4%' }}><InlineError message="Cannot add empty comments" fieldID="postButton" /></div>)}
                                                    <div className="customer--comments">
                                                        <ul className="Polaris-List">
                                                            {commendDetails.map((item, itemKey) => {
                                                                let options = item.comment;
                                                                let optionsCreatedDate = item.created_date;
                                                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                                                                let current_date = momentTimezone().tz("America/Los_Angeles").format('YYYY-MM-DD HH:mm:ss').slice(0, 10);
                                                                let cur_year = current_date.slice(0, 4);
                                                                let cur_month = Number(current_date.slice(5, 7));
                                                                let cur_date = current_date.slice(8, 10);
                                                                let currentDate = monthNames[cur_month-1] + ' ' + cur_date + ', ' + cur_year;
                                                                let subHeading = '';
                                                                if (optionsCreatedDate == currentDate && !dates.includes(optionsCreatedDate)) {
                                                                    subHeading = 'Today';
                                                                    dates.push(optionsCreatedDate);
                                                                } else if (!dates.includes(optionsCreatedDate)) {
                                                                    subHeading = item.created_date;
                                                                    dates.push(optionsCreatedDate);
                                                                }
                                                                return (
                                                                    <Fragment key={"comment" + itemKey}>
                                                                        {subHeading ? (
                                                                            <h3 aria-label="Accounts" className="Polaris-Subheading">
                                                                                <b> {subHeading} </b>
                                                                            </h3>
                                                                        ) : null}
                                                                        {item.from == 'admin' ? (
                                                                            <li className="Polaris-List__Item grid">
                                                                                <span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
                                                                                    {options}
                                                                                </span>
                                                                                <span className="date_posted"> {item.created_time} </span>
                                                                            </li>
                                                                        ) : item.from == 'customer' ? (
                                                                            <li className="Polaris-List__Item grid active">
                                                                                <span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
                                                                                    {options}
                                                                                </span>
                                                                                <span className="date_posted"> {item.created_time} </span>
                                                                            </li>
                                                                        ) : item.from == 'sales_rep' ? (
                                                                            <li className="Polaris-List__Item grid">
                                                                                <span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
                                                                                    {options}
                                                                                </span>
                                                                                <span className="date_posted"> {item.created_time} </span>
                                                                            </li>
                                                                        ) : null}
                                                                    </Fragment>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div
                                        className="Polaris-Layout__Section Polaris-Layout__Section--secondary"
                                    >
                                        <div className="Polaris-Card">
                                            <div className="review--customer">
                                                <div>
                                                    <h2 className="Polaris-Heading">Customer</h2>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div>
                                                    <a href={"https://lago-apparel-cad.myshopify.com/admin/customers/" + customer.id} className="Polaris-Button Polaris-Button--plain" type="button" target='_blank'>
                                                        <span className="Polaris-Button__Content"><span className="Polaris-Button__Text">{customer.name}</span></span>
                                                    </a>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div>
                                                    <a href={"https://lago-apparel-cad.myshopify.com/admin/customers/" + customer.id} className="Polaris-Button Polaris-Button--plain" type="button" target='_blank'>
                                                        <span className="Polaris-Button__Content"><span className="Polaris-Button__Text">{customer.email}</span></span>
                                                    </a>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                            </div>
                                            <div className="secondary__wrap">
                                                <div className="secondary__wrap--heading">
                                                    <div>
                                                        <h2 className="Polaris-Heading">Shipping Address</h2>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                    <div><a href={"https://lago-apparel-cad.myshopify.com/admin/customers/" + customer.id} className="Polaris-Button Polaris-Button--plain" type="button" target='_blank'><span className="Polaris-Button__Content"><span className="Polaris-Button__Text">Edit</span></span></a>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="Polaris-TextContainer">
                                                        {
                                                            puchaseOrder.shippingAddress != null ? (
                                                                <p>
                                                                    {puchaseOrder.shippingAddress.address1 ? (<>  {puchaseOrder.shippingAddress.address1} <br /> </>) : null}
                                                                    {puchaseOrder.shippingAddress.address2 ? (<> {puchaseOrder.shippingAddress.address2} <br /> </>) : null}
                                                                    {puchaseOrder.shippingAddress.city ? (<> {puchaseOrder.shippingAddress.city + " "} </>) : null}
                                                                    {puchaseOrder.shippingAddress.province ? (<> {puchaseOrder.shippingAddress.province + " "} </>) : null}
                                                                    {puchaseOrder.shippingAddress.zip ? (<> {puchaseOrder.shippingAddress.zip} <br /> </>) : null}
                                                                    {puchaseOrder.shippingAddress.country ? (<> {puchaseOrder.shippingAddress.country} <br /> </>) : null}
                                                                    {puchaseOrder.shippingAddress.phone ? (<> {puchaseOrder.shippingAddress.phone} <br /> </>) : null}
                                                                </p>
                                                            ) : customer.address != null ? (
                                                                <p>
                                                                    {customer.address.address1 ? (<>  {customer.address.address1} <br /> </>) : null}
                                                                    {customer.address.address2 ? (<> {customer.address.address2} <br /> </>) : null}
                                                                    {customer.address.city ? (<> {customer.address.city + " "} </>) : null}
                                                                    {customer.address.province ? (<> {customer.address.province + " "} </>) : null}
                                                                    {customer.address.zip ? (<> {customer.address.zip} <br /> </>) : null}
                                                                    {customer.address.country ? (<> {customer.address.country} <br /> </>) : null}
                                                                    {customer.address.phone ? (<> {customer.address.phone} <br /> </>) : null}
                                                                </p>
                                                            ) : (
                                                                <p>No shipping address provided</p>
                                                            )
                                                        }
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                            </div>
                                            <div className="secondary__wrap">
                                                <div className="secondary__wrap--heading">
                                                    <div>
                                                        <h2 className="Polaris-Heading">Billing Address</h2>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                    <div><a href={"https://lago-apparel-cad.myshopify.com/admin/customers/" + customer.id} className="Polaris-Button Polaris-Button--plain" type="button" target='_blank'><span className="Polaris-Button__Content"><span className="Polaris-Button__Text">Edit</span></span></a>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="Polaris-TextContainer">
                                                        {
                                                            puchaseOrder.billingAddress != null ? (
                                                                <p>
                                                                    {puchaseOrder.billingAddress.address1 ? (<>  {puchaseOrder.billingAddress.address1} <br /> </>) : null}
                                                                    {puchaseOrder.billingAddress.address2 ? (<> {puchaseOrder.billingAddress.address2} <br /> </>) : null}
                                                                    {puchaseOrder.billingAddress.city ? (<> {puchaseOrder.billingAddress.city + " "} </>) : null}
                                                                    {puchaseOrder.billingAddress.province ? (<> {puchaseOrder.billingAddress.province + " "} </>) : null}
                                                                    {puchaseOrder.billingAddress.zip ? (<> {puchaseOrder.billingAddress.zip} <br /> </>) : null}
                                                                    {puchaseOrder.billingAddress.country ? (<> {puchaseOrder.billingAddress.country} <br /> </>) : null}
                                                                    {puchaseOrder.billingAddress.phone ? (<> {puchaseOrder.billingAddress.phone} <br /> </>) : null}
                                                                </p>
                                                            ) : customer.address != null ? (
                                                                <p>
                                                                    {customer.address.address1 ? (<>  {customer.address.address1} <br /> </>) : null}
                                                                    {customer.address.address2 ? (<> {customer.address.address2} <br /> </>) : null}
                                                                    {customer.address.city ? (<> {customer.address.city + " "} </>) : null}
                                                                    {customer.address.province ? (<> {customer.address.province + " "} </>) : null}
                                                                    {customer.address.zip ? (<> {customer.address.zip} <br /> </>) : null}
                                                                    {customer.address.country ? (<> {customer.address.country} <br /> </>) : null}
                                                                    {customer.address.phone ? (<> {customer.address.phone} <br /> </>) : null}
                                                                </p>
                                                            ) : (
                                                                <p>No shipping address provided</p>
                                                            )
                                                        }
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div id="PolarisPortalsContainer"></div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {showModal === true ? (
                <Modal
                    title="Send Invoice on Order"
                    titleHidden
                    open={active}
                    onClose={handleChange}
                    primaryAction={{
                        content: 'Continue',
                        onAction: sendCheckout,
                    }}
                    secondaryActions={[
                        {
                            content: 'No',
                            onAction: handleChange,
                        },
                    ]}
                >
                    <Modal.Section>
                        <TextContainer>

                            {Object.keys(lineItems).map((key) => {
                                if (lineItems[key].status == "pendingAdminApproval") {
                                    modalStatus = lineItems[key].product_name + " is under awaiting approval from the Admin";
                                } else if (lineItems[key].status == "pendingCustomerApproval") {
                                    modalStatus = lineItems[key].product_name + " is under awaiting approval from the Client";
                                } else if (lineItems[key].status == "adminApproved") {
                                    modalStatus = lineItems[key].product_name + " has been approved by the Admin";
                                } else if (lineItems[key].status == "customerApproved") {
                                    modalStatus = lineItems[key].product_name + " has been approved by the Client";
                                }
                                return (
                                    <Fragment key={key}>
                                        <ul>
                                            <li>
                                                <div>
                                                    <div>
                                                        {modalStatus}
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </Fragment>
                                )
                            })}
                            <p style={{ marginLeft: "4%" }}>
                                Do you want to send the Invoice URL to the customer?
                            </p>
                        </TextContainer>
                    </Modal.Section>
                </Modal>
            ) : null}

            {toggleActiveT === true ? (
                <div style={{ height: '250px' }}>
                    <Frame>
                        <Toast content="Successfully sent the Invoice URL" onDismiss={toggleActiveChange} />
                    </Frame>
                </div>
            ) : null}
        </>
    );
}
export default ReviewAndComplete;
