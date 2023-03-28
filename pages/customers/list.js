import React, { useState, useEffect, useRef } from "react";
import AbortController from "abort-controller";
import { Spinner, Tooltip, TextStyle, Toast, Frame } from '@shopify/polaris';
import ApiHelper from "../../helpers/api-helper";
import { API } from "../../constants/api";
import ViewPendingOrders from "../customers/view-pending-orders";

const AllCustomers = (props) => {
    const [allCustomers, setAllCustomers] = useState([]);
    const [next, setNext] = useState("");
    const [previous, setPrevious] = useState("");
    const [searchString, setSearchString] = useState("");
    const [searchStringComplete, setSearchStringComplete] = useState("");
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);
    const [customerCount, setCustomerCount] = useState(0);
    const [error, setError] = useState(false);
    const [errorMesage, setErrorMessage] = useState(false);
    const isCancelled = useRef(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const toggleShowModal = (showPopUp) => {
        setShowPopUp(showPopUp);
    }
    const [customerId, setCustomerId] = useState("");
    let setSignal = null;
    let controller = null;

    const eventKeyCodes = {
        enter: 13,
    }

    useEffect(() => {
        isCancelled.current = false;
        try {
            controller = new AbortController();
            setSignal = controller.signal;
            getAllCustomers(null, null, setSignal);
            return () => {
                if (setSignal) {
                    isCancelled.current = true;
                    controller.abort();
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, [searchStringComplete]);

    const getAllCustomers = async (cursor = null, value = null, signal = null) => {
        if (searchString.includes("\\") || searchString.includes("\"")) {
            setErrorMessage("Invalid keyword");
            setError(true);
            return false;
        }
        let url = API.customers;
        if (cursor != null && value != null || searchString != "") {
            url += "?";
            if (searchString != "") {
                url += "query=" + searchString;
                if (cursor != null && value != null) {
                    url += "&" + cursor + "=" + value;
                } else {
                    setPageCount(0);
                }
            } else {
                url += cursor + "=" + value;
            }
        }
        if (cursor == "previous") {
          setPageCount((pageCount) => (pageCount-1));
        }
        if (cursor == "next") {
          setPageCount((pageCount) => (pageCount+1));
        }
        setLoading(true);
        const allCustomersDetails = await ApiHelper.get(url, signal);
        if(isCancelled.current) {
            return false;
        }
        setLoading(false);
        if (allCustomersDetails && allCustomersDetails.message == "success") {
            let customerCount = allCustomersDetails.body.customers.length;
            setCustomerCount(customerCount);
            setAllCustomers(allCustomersDetails.body.customers);
            setNext(allCustomersDetails.body.next_cursor);
            setPrevious(allCustomersDetails.body.previous_cursor);
        }

        if (allCustomersDetails && allCustomersDetails.message == "error") {
            setCustomerCount(0);
            setAllCustomers([]);
            setNext('');
            setPrevious('');
            setError(true);
            setErrorMessage("Failed to get Customers");
        }
        
    };

    const viewPendingOrdersPopup = async () => {
        if (document.getElementsByClassName('view_pending_orders')[0]) {
            document.getElementsByClassName('view_pending_orders')[0].style.display = "block";
        }
        setShowPopUp(true);
    }

    return (
        <div className="Polaris-Tabs__Panel" id="all-pos" role="tabpanel" aria-labelledby="all-pos" tabIndex="-1">
            <div className="Polaris-Card__Section">
                <div>
                    <div className="display-text">
                        <div className="one-half text-left">
                            <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                Customers
                            </p>
                        </div>
                        <div className="one-half text-right">
                            <a href={"https://lago-apparel-cad.myshopify.com/admin/customers/new"} target="_blank">
                                <button
                                className="Polaris-Button Polaris-Button--primary"
                                type="button"
                                >
                                <span className="Polaris-Button__Content">
                                    <span className="Polaris-Button__Text">
                                    <TextStyle variation="strong" preferredPosition="above">Add Customer</TextStyle>
                                    </span>
                                </span>
                                </button>
                            </a>
                        </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                </div>
                <div className="Polaris-Layout">
                    <div className="Polaris-Layout__Section">
                        <div className="Polaris-Card">
                            <div className="Polaris-Card__Section">
                                <div aria-expanded="false" aria-owns="PolarisComboBox2"
                                    aria-controls="PolarisComboBox2" aria-haspopup="true" tabIndex="0"
                                    style={{ outline: "none" }} >
                                    <div>
                                        <div className="Polaris-Labelled__LabelWrapper"></div>
                                        <div className="Polaris-Connected">
                                            <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                <div className="Polaris-TextField">
                                                    <div onClick={() => {
                                                            try {
                                                                controller = new AbortController();
                                                                setSignal = controller.signal;
                                                                getAllCustomers(null, null, setSignal);
                                                            } catch (e) {
                                                                console.log(e);
                                                            }
                                                        }} style={{cursor: 'pointer'}}>
                                                        <div
                                                            className="Polaris-TextField__Prefix"
                                                            id="PolarisTextField2Prefix"
                                                        >
                                                            <span className="Polaris-Icon Polaris-Icon--colorBase Polaris-Icon--applyColor">
                                                                <svg
                                                                    viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm9.707 4.293l-4.82-4.82A5.968 5.968 0 0 0 14 8 6 6 0 0 0 2 8a6 6 0 0 0 6 6 5.968 5.968 0 0 0 3.473-1.113l4.82 4.82a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414z"></path>
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        id="PolarisTextField2"
                                                        role="combobox"
                                                        placeholder="Search"
                                                        autoComplete="off"
                                                        className="Polaris-TextField__Input"
                                                        aria-labelledby="PolarisTextField2Label PolarisTextField2Prefix"
                                                        aria-invalid="false"
                                                        aria-autocomplete="list"
                                                        value={searchString}
                                                        tabIndex="0"
                                                        aria-controls="Polarispopover2"
                                                        aria-owns="Polarispopover2"
                                                        aria-expanded="false"
                                                        onChange={(e) => setSearchString(e.target.value)}
                                                        onKeyDown={(e)=>{if(e.keyCode == eventKeyCodes.enter){setSearchStringComplete(e.target.value)}}}
                                                        onBlur={(e)=>{setSearchStringComplete(e.target.value)}}
                                                    />
                                                    <div className="Polaris-TextField__Backdrop"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="">
                                        <div className="Polaris-DataTable__Navigation">
                                            <button className="Polaris-Button Polaris-Button--disabled Polaris-Button--plain Polaris-Button--iconOnly"
                                                aria-label="Scroll table left one column" type="button" disabled="">
                                                <span className="Polaris-Button__Content"><span className="Polaris-Button__Icon"><span
                                                    className="Polaris-Icon"><svg viewBox="0 0 20 20" className="Polaris-Icon__Svg"
                                                        focusable="false" aria-hidden="true">
                                                        <path
                                                            d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z">
                                                        </path>
                                                    </svg></span></span></span>
                                            </button>
                                            <button className="Polaris-Button Polaris-Button--plain Polaris-Button--iconOnly"
                                                        aria-label="Scroll table right one column" type="button">
                                                <span className="Polaris-Button__Content"><span className="Polaris-Button__Icon"><span
                                                    className="Polaris-Icon"><svg viewBox="0 0 20 20" className="Polaris-Icon__Svg"
                                                        focusable="false" aria-hidden="true">
                                                        <path
                                                            d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z">
                                                        </path>
                                                    </svg></span></span></span>
                                            </button>
                                        </div>
                                        {loading ? (
                                            <Spinner accessibilityLabel="Spinner example" size="large" />
                                        ) : allCustomers.length > 0 ? (
                                            <div className="Polaris-DataTable">
                                                <div className="Polaris-DataTable__ScrollContainer">
                                                    <table className="Polaris-DataTable__Table">
                                                        <thead>
                                                            <tr>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    EMAIL ADDRESS
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    FULL NAME
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    BILLING ADDRESS
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    SHIPPING ADDRESS
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    TOTAL SALES
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col">
                                                                    PENDING PO's
                                                                </th>
                                                                <th data-polaris-header-cell="true"
                                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                                    scope="col"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                allCustomers.map((customer, index) => {
                                                                    return (
                                                                        <tr className="Polaris-DataTable__TableRow" data-index={index} key={"customer" + index}>
                                                                            <th
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                                                scope="row"
                                                                            >
                                                                                {
                                                                                    <a href={'https://lago-apparel-cad.myshopify.com/admin/customers/' + customer.id} target='_blank' color='blue'>
                                                                                        <Tooltip content="View Customer" active={false}>
                                                                                            <TextStyle variation="strong" preferredPosition="above">{customer.email}</TextStyle>
                                                                                        </Tooltip>
                                                                                    </a>
                                                                                }
                                                                            </th>
                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                {customer.name}
                                                                            </td>
                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                {customer.billing_address != null && customer.billing_address.address1 ? (<>{customer.billing_address.address1}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.address2 ? (<>{customer.billing_address.address2}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.city ? (<>{customer.billing_address.city}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.province ? (<>{customer.billing_address.province}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.country ? (<>{customer.billing_address.country}<br /></>) : null}
                                                                            </td>

                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                {customer.billing_address != null && customer.billing_address.address1 ? (<>{customer.billing_address.address1}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.address2 ? (<>{customer.billing_address.address2}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.city ? (<>{customer.billing_address.city}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.province ? (<>{customer.billing_address.province}<br /></>) : null}
                                                                                {customer.billing_address != null && customer.billing_address.country ? (<>{customer.billing_address.country}<br /></>) : null}
                                                                            </td>
                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                {"$" + customer.total_sales}
                                                                            </td>

                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop" color="#FFF">
                                                                                <Tooltip content="View Pending PO's" active={false}>
                                                                                    <button className="Polaris-Button Polaris-Button--outline" type="button"
                                                                                        onClick={() => {
                                                                                            setCustomerId(customer.id);
                                                                                            viewPendingOrdersPopup();
                                                                                        }}
                                                                                    >
                                                                                        <span className="Polaris-Button__Content">
                                                                                            <span className="Polaris-Button__Text">View</span>
                                                                                        </span>
                                                                                    </button>
                                                                                </Tooltip>
                                                                            </td>
                                                                            <td
                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                    <a href={'https://lago-apparel-cad.myshopify.com/admin/customers/' + customer.id} target='_blank'>
                                                                                    <span className="Polaris-Icon" style={{ cursor: "pointer" }}>
                                                                                        <Tooltip content="Edit customer" active={false}>
                                                                                            <TextStyle variation="strong" preferredPosition="above">
                                                                                                <svg
                                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                                    width="20"
                                                                                                    height="20"
                                                                                                    viewBox="0 0 20 20"
                                                                                                >
                                                                                                    <g
                                                                                                        fill="none"
                                                                                                        fillRule="evenodd"
                                                                                                    >
                                                                                                        <g fill="#212B36">
                                                                                                            <g>
                                                                                                                <path
                                                                                                                    d="M18.878 1.085c-1.445-1.446-3.967-1.446-5.414 0l-11.17 11.17c-.108.108-.18.234-.228.368-.003.009-.012.015-.015.024l-2 6c-.12.359-.026.756.242 1.023.19.19.446.293.707.293.106 0 .212-.016.316-.051l6-2c.01-.003.015-.012.024-.015.134-.048.26-.12.367-.227L18.878 6.499C19.601 5.776 20 4.814 20 3.792c0-1.023-.399-1.984-1.122-2.707zm-1.414 4L17 5.549l-2.586-2.586.464-.464c.691-.691 1.895-.691 2.586 0 .346.346.536.805.536 1.293 0 .488-.19.947-.536 1.293zM3.437 14.814l1.712 1.712-2.568.856.856-2.568zM7 15.549l-2.586-2.586L13 4.377l2.586 2.586L7 15.549z"
                                                                                                                    transform="translate(-1145 -345) translate(1145 345)" />
                                                                                                            </g>
                                                                                                        </g>
                                                                                                    </g>
                                                                                                </svg>
                                                                                            </TextStyle>
                                                                                        </Tooltip>
                                                                                    </span>
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {previous == null && next == null ? null : (
                                                    <div className="Polaris-DataTable__Footer">
                                                        <nav aria-label="Pagination">
                                                            <div
                                                                className="Polaris-ButtonGroup"
                                                                data-buttongroup-segmented="false"
                                                            >

                                                                <div className={"Polaris-ButtonGroup__Item " + (previous ? '' : "Border_color")}
                                                                    style={{ marginLeft: "0" }}
                                                                >
                                                                    <a href="#" onClick={() => {
                                                                        if (previous != null) {
                                                                            getAllCustomers("previous", previous)
                                                                        }
                                                                    }} className={(previous ? '' : "Polaris-Button--disabled")} >
                                                                        <button
                                                                            style={{ padding: "7px 8px", border: "1px solid", backgroundColor: "transparent" }}
                                                                            id="previousURL"
                                                                            className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (previous ? '' : "Polaris-Button--disabled")}
                                                                            aria-label="Previous"
                                                                            type="button"
                                                                            disabled={previous == null}
                                                                        >
                                                                            <span className="Polaris-Button__Content">
                                                                                <span className="Polaris-Button__Icon last-child"
                                                                                    style={{ margin: "0" }}
                                                                                >

                                                                                    <span className="Polaris-Icon"
                                                                                        style={{ borderRadius: '4px 0 0 4px' }}
                                                                                    >
                                                                                        {previous == null ? (
                                                                                            <svg
                                                                                                viewBox="0 0 20 20"
                                                                                                className="Polaris-Icon__Svg"
                                                                                                focusable="false"
                                                                                                aria-hidden="true"
                                                                                                style={{ fill: '#babec3' }}
                                                                                            >
                                                                                                <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                                                                            </svg>
                                                                                        ) : (
                                                                                                <svg
                                                                                                    viewBox="0 0 20 20"
                                                                                                    className="Polaris-Icon__Svg"
                                                                                                    focusable="false"
                                                                                                    aria-hidden="true"

                                                                                                >
                                                                                                    <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                                                                                </svg>
                                                                                            )}
                                                                                    </span>
                                                                                </span>
                                                                            </span>
                                                                        </button>
                                                                    </a>
                                                                </div>
                                                                <div className={"Polaris-ButtonGroup__Item " + (next ? '' : "Border_color")} >
                                                                    <a href="#" onClick={() => {
                                                                        if (next != null) {
                                                                            getAllCustomers("next", next)
                                                                        }
                                                                    }} className={(next ? '' : "Polaris-Button--disabled")} >
                                                                        <button
                                                                            id="nextURL"
                                                                            style={{ padding: "7px 8px", border: "1px solid", backgroundColor: "transparent" }}
                                                                            className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (next ? '' : "Polaris-Button--disabled")}
                                                                            aria-label="Next"
                                                                            type="button"
                                                                            disabled={next == null}
                                                                        >
                                                                            <span className="Polaris-Button__Content">
                                                                                <span className="Polaris-Button__Icon last-child"
                                                                                    style={{ margin: "0" }}
                                                                                >
                                                                                    <span className="Polaris-Icon"
                                                                                        style={{ borderRadius: "0 4px 3px 0" }}
                                                                                    >
                                                                                        {next == null ? (
                                                                                            <svg
                                                                                                viewBox="0 0 20 20"
                                                                                                className="Polaris-Icon__Svg"
                                                                                                focusable="false"
                                                                                                aria-hidden="true"
                                                                                                style={{ fill: "#babec3" }}
                                                                                            >
                                                                                                <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                                                                            </svg>
                                                                                        ) : (
                                                                                                <svg
                                                                                                    viewBox="0 0 20 20"
                                                                                                    className="Polaris-Icon__Svg"
                                                                                                    focusable="false"
                                                                                                    aria-hidden="true"
                                                                                                >
                                                                                                    <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                                                                                </svg>
                                                                                            )}
                                                                                    </span>
                                                                                </span>
                                                                            </span>
                                                                        </button>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </nav>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : searchString != "" ? (
                                            <div className="_1z7Ob">
                                                <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <img src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e" alt="Empty search results" draggable="false" />
                                                    </div>
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                                            No customers found
                                                        </p>
                                                    </div>
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <span className="Polaris-TextStyle--variationSubdued_1segu">
                                                            <p>Try changing the filters or search term</p>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="_1z7Ob">
                                                <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <img src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e" alt="Empty search results" draggable="false" />
                                                    </div>
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                                            No customers found
                                                        </p>
                                                    </div>
                                                    <div className="Polaris-Stack__Item_yiyol">
                                                        <span className="Polaris-TextStyle--variationSubdued_1segu">
                                                            <p>Try changing the filters or search term</p>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div id="PolarisPortalsContainer">
                                    <div data-portal-id="popover-Polarisportal1"></div>
                                </div>
                            </div>
                        </div>
                        {loading ? null : customerCount > 0 ?  (<div className="display-text">
                            <div className="one-half text-left">
                            <p className="Polaris-DisplayText Polaris-DisplayText--sizeExtraSmall"style={{ marginLeft: '7px' }}>
                            Showing {pageCount*10+1} to {pageCount*10+customerCount} out of total customers
                            </p>
                            </div>
                        </div>): ''}
                        { showPopUp === true ? (
                            <ViewPendingOrders customerId={customerId} toggleShowModal={toggleShowModal} />
                        ) : null }
                    </div>
                </div>
                <div id="PolarisPortalsContainer"></div>
            </div>
            { error  ? (<Frame>
                <Toast content={errorMesage} error onDismiss={() => {setError(false)}} />
            </Frame>) : ''}
        </div>);
}

export default AllCustomers;
