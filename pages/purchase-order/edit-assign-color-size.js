import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import { Spinner, Frame, Toast } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';

const EditColorSizeQuantity = (props) => {
    const router = useRouter();
    const params = JSON.parse(props.params);
    const product = params.product;
    const orderId = params.orderId;
    const orderName = params.orderName;
    const [inputQuantity, setInputQuantity] = useState({});
    const [successActive, setSuccessActive] = useState(false);
    const [errorActive, setErrorActive] = useState(false);
    const [message, setMessage] = useState("");
    const existingLineItems = params.lineItems;

    const succssToggleActive = useCallback(() => setSuccessActive((successActive) => !successActive), []);
    const errorToggleActive = useCallback(() => setErrorActive((errorActive) => !errorActive), []);

    let customer = null;
    if (localStorage.getItem("customer")) {
        customer = JSON.parse(localStorage.getItem("customer"));
    }
    let preview = null;
    if (localStorage.getItem('preview')) {
        preview = JSON.parse(localStorage.getItem('preview'));
    } else if (localStorage.getItem('existingPreview')) {
        preview = JSON.parse(localStorage.getItem('existingPreview'));
    }
    let variants = product.variants;
    let options = product.options;

    useEffect(() => {
        router.prefetch("/header?tab=create-PO&page=poDetails");
        $(".Polaris-Spinner--sizeLarge").css("display", "none");
        $(".Polaris-Spinner--sizeLarge").css("position", "fixed");
        $(".Polaris-Spinner--sizeLarge").css("width", "100%");
        $(".Polaris-Spinner--sizeLarge").css("top", "220px");
        $(".Polaris-Spinner--sizeLarge").css("text-align", "center");
        let product = JSON.parse(props.params).product;
        let options = product.options;
        const colorsObj = options.filter(option => option.name == 'Color');
        let tempInputQty = {};
        if (colorsObj.length) {
            const colors = colorsObj[0].values;
            for (let color of colors) {
                tempInputQty[color] = {};
                const sizesObj = options.filter(option => option.name == 'Size');
                if (sizesObj.length) {
                    const sizes = sizesObj[0].values;
                    for (let size of sizes) {
                        variants.map((variant) => {
                            if (variant.option1 == size && variant.option2 == color) {
                                let variantId = variant.id;
                                if (existingLineItems[variantId] != undefined) {
                                    tempInputQty[color][size] = existingLineItems[variantId]["quantity"];
                                } else {
                                    tempInputQty[color][size] = 0;
                                }
                            } 
                        });
                    }
                }
            }
        }
        setInputQuantity(tempInputQty);
    }, []);

    /* function to calculate the count of each variants */
    $("body").on("change keyup", "input[type='number']", function () {
        let type = $(this).data('type');
        if (type == "quantity") {
            const variantClass = $(this).attr('data-class');
            calculateTotal(variantClass);
        }
    });

    /* function to set the order line items */
    const saveVariants = () => {
        let lineItems = [];
        let index = 0;
        let flag = 0;
        $.each($("input[type='number']"), function (i, variant) {
            let variantId = $(variant).data('id');
            let quantity = $(variant).val();
            if (quantity > 0) {
                flag = 1;
                lineItems[index] = {
                    'variantId': variantId,
                    'quantity': quantity
                };
                index++;
            }
        });
        if (flag == 0) {
            setMessage("Please add required quantity");
            setErrorActive(true);
        } else {
            let productId = JSON.parse(localStorage.getItem('customizationInfo')).product_id;
            let cartDetails = localStorage.getItem('cartData');
            if (cartDetails == '' || cartDetails == null) {
                let cartItems = [];
                cartItems[productId] = {
                    'preview': localStorage.getItem('preview') ? localStorage.getItem('preview') : null,
                    'existingPreview':  localStorage.getItem('existingPreview'),
                    'customization_info': localStorage.getItem('customizationInfo'),
                    'lineItems': lineItems
                }
                let cart = { 'items': Object.assign({}, cartItems) };
                localStorage.setItem("cartData", JSON.stringify(cart));
                updateDraftOrder(JSON.stringify(cart));
            } else {
                cartDetails = JSON.parse(cartDetails).items;
                cartDetails[productId] = {
                    'preview': localStorage.getItem('preview') ? localStorage.getItem('preview') : null,
                    'existingPreview':  localStorage.getItem('existingPreview'),
                    'customization_info': localStorage.getItem('customizationInfo'),
                    'lineItems': lineItems
                }
                let cart = { 'items': Object.assign({}, cartDetails) };
                localStorage.setItem("cartData", JSON.stringify(cart));
                updateDraftOrder(JSON.stringify(cart));
            }
        }
    };

    // convert base64/URLEncoded data component to raw binary data held in a string
    function dataURItoBlob(dataURI, fdataobj, position, productId) {
        let byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);
        // separate out the mime component
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        let imageAssociation = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            imageAssociation[i] = byteString.charCodeAt(i);
        }
        let blobObject = new Blob([imageAssociation], { type: mimeString });
        let fileName = Math.floor(Math.random() * 899999 + 100000);
        fdataobj.append(position + '-' + productId, blobObject, fileName + ".png");
    }

    /* function to create draft order */
    const updateDraftOrder = async (cartDetails = null) => {
        $(".Polaris-Spinner--sizeLarge").css("display", "block");
        $(".Polaris-Spinner--sizeLarge").css("top", 0);
        $(".Polaris-Spinner--sizeLarge").css("background", "#0000002b");
        $(".Polaris-Spinner--sizeLarge").css("z-index", "9999");
        $(".Polaris-Spinner--sizeLarge").css("height", "100vh");
        $(".Polaris-Spinner--sizeLarge").css("margin-left", "-20px");
        $(".Polaris-Spinner--sizeLarge svg").css("position", "absolute");
        $(".Polaris-Spinner--sizeLarge svg").css("top", "55%");
        if (cartDetails != null) {
            let cartItems = JSON.parse(cartDetails).items;
            let fdataobj = new FormData(document.forms[0]);
            for (let productId of Object.keys(cartItems)) {
                let preview = JSON.parse(cartItems[productId].preview);
                if (preview != null) {
                    dataURItoBlob(preview.front, fdataobj, 'front', productId);
                    dataURItoBlob(preview.back, fdataobj, 'back', productId);
                    dataURItoBlob(preview.sleeve, fdataobj, 'sleeve', productId);
                } else {
                    let existingPreview = JSON.parse(cartItems[productId].existingPreview);
                    let files = {};
                    if (existingPreview.front) {
                        files['front' + '-' + productId] = existingPreview.front;
                    } else {
                        files['front' + '-' + productId] = "";
                    }
                    if (existingPreview.back) {
                        files['back' + '-' + productId] = existingPreview.back;
                    } else {
                        files['back' + '-' + productId] = "";
                    }
                    if (existingPreview.sleeve) {
                        files['sleeve' + '-' + productId] = existingPreview.sleeve;
                    } else {
                        files['sleeve' + '-' + productId] = "";
                    }
                    fdataobj.append("files", JSON.stringify(files));
                }
                delete cartItems[productId].preview;
                delete cartItems[productId].existingPreview; 
            }
            fdataobj.append('customer_id', customer.id);
            fdataobj.append('custom_product', JSON.stringify(cartItems));
            // createDraftOrder(fdataobj);
            let url = API.puchaseOrder + "/" + orderId;
            const orderDetails = await ApiHelper.postFormData(url, fdataobj);
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            $("#quntity-size-color").css("z-index", "519");
            if (orderDetails && orderDetails.message == 'success') {
                let orderName = orderDetails.body.order_name;
                setMessage("Purchase order " + orderName + " is updated successfully");
                setSuccessActive(true);
                setTimeout(function () {
                    router.replace("/header?tab=create-PO&page=reviewAndApprove&params=" + JSON.stringify({ orderId: orderDetails.body.order_id, product: product }));
                }, 500);
            }
        }
    };

    function calculateTotal(variantClass){
        let countArray = $('.' + variantClass).map((i, e) => e.value).get();
        let countValue = countArray.map((i) => Number(i));
        let sum = countValue.reduce(function (a, b) { return a + b }, 0);
        $("#" + variantClass).html(sum);
    }

    function filterInput(value) {
        let filterStatus = '';
        if(value ==null){
            setMessage("The input field must be a number");
            setErrorActive(true);
            $("#submitButton").addClass("Polaris-Button--disabled");
            filterStatus = true;
        }else if(value ==''){
            setMessage("The input field must be a number");
            setErrorActive(true);
            $("#submitButton").attr("disabled",true);
            $("#submitButton").addClass("Polaris-Button--disabled");
            filterStatus = true;
        }else if(value > 100000){
            setMessage("The quantity must be less than 100000");
            setErrorActive(true);
            filterStatus = true;
        }else{
            filterStatus = false;
        }
        return filterStatus;
    }

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
                            <li className="Polaris-List__Item">
                                <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: orderId } }}>{orderName ? "PO Details - " + orderName : "PO Details"}</Link>
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
                                Assign Color, Size, Quantity
                            </li>
                        </ul>
                        <div id="PolarisPortalsContainer"></div>
                    </div>
                    <div>
                        <div className="display-text">
                            <div className="display-text--title">
                                <div>
                                    <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                        { "PO " + orderName } 
                                    </p>
                                </div>
                                <div className='purchase__orders'>
                                    <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
                                        <span
                                            className="Polaris-Tag__TagText">{status}</span>
                                    </span>
                                    <div id="PolarisPortalsContainer"></div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <div className="Polaris-ButtonGroup">
                                        <div className="Polaris-ButtonGroup__Item">
                                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editAssignArtwork", params: JSON.stringify({"orderId": orderId, "productId": product.id}) } }}>
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
                                    <div id="PolarisPortalsContainer"></div>
                                </div>
                            </div>
                        </div>
                        <div id="PolarisPortalsContainer"></div>
                    </div>
                    <Spinner
                        accessibilityLabel="Spinner example"
                        size="large"
                    />
                    <div id="quntity-size-color">
                        <div className="Polaris-Layout">
                            <div className="Polaris-Layout__Section">
                                <div>
                                    <div className="Polaris-Card">
                                        <div className="Polaris-Card__Section">
                                            <div>
                                                <div>
                                                    <p
                                                        className="Polaris-DisplayText Polaris-DisplayText--sizeSmall"
                                                    >
                                                        Assign Color, Size, Quantity
                                                    </p>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div>
                                                    <div
                                                        className="Polaris-Layout assign_artwork--assign"
                                                    >
                                                        <div className="Polaris-Layout__Section">
                                                            <div>
                                                                <span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
                                                                    <img src={preview !== null && preview.front !== undefined ? preview.front : preview.back !== undefined ? preview.back : preview.sleeve !== undefined ? preview.sleeve : product.image.src} alt="Image" />
                                                                </span>
                                                                <div id="PolarisPortalsContainer"></div>
                                                            </div>
                                                        </div>
                                                        <div className="Polaris-Layout__Section">
                                                            <div style={{marginTop:"14%"}}>
                                                                <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">
                                                                    {product.title}
                                                                </p>
                                                                <div id="PolarisPortalsContainer"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div>
                                                    <div className="Polaris-Page data--table">
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
                                                                            <span
                                                                                className="Polaris-Button__Content"
                                                                            ><span
                                                                                className="Polaris-Button__Icon"
                                                                            ><span
                                                                                className="Polaris-Icon"
                                                                            ><svg
                                                                                viewBox="0 0 20 20"
                                                                                className="Polaris-Icon__Svg"
                                                                                focusable="false"
                                                                                aria-hidden="true"
                                                                            >
                                                                                            <path
                                                                                                d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"
                                                                                            ></path></svg></span></span
                                                                                ></span></button
                                                                        ><button
                                                                            className="Polaris-Button Polaris-Button--plain Polaris-Button--iconOnly"
                                                                            aria-label="Scroll table right one column"
                                                                            type="button"
                                                                        >
                                                                            <span
                                                                                className="Polaris-Button__Content"
                                                                            ><span
                                                                                className="Polaris-Button__Icon"
                                                                            ><span
                                                                                className="Polaris-Icon"
                                                                            ><svg
                                                                                viewBox="0 0 20 20"
                                                                                className="Polaris-Icon__Svg"
                                                                                focusable="false"
                                                                                aria-hidden="true"
                                                                            >
                                                                                            <path
                                                                                                d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"
                                                                                            ></path></svg></span></span
                                                                                ></span>
                                                                        </button>
                                                                    </div>
                                                                    {Object.keys(inputQuantity).length ? (

                                                                        <div className="Polaris-DataTable">
                                                                            <div
                                                                                className="Polaris-DataTable__ScrollContainer"
                                                                            >
                                                                                <table
                                                                                    className="Polaris-DataTable__Table"
                                                                                >
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th
                                                                                                data-polaris-header-cell="true"
                                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                                                                                scope="col"
                                                                                            >
                                                                                                &nbsp;
                                                                                            </th>
                                                                                            {options.filter(prop => prop.name == 'Size').map((option) => {
                                                                                                return Object.keys(option.values).map((index) => {
                                                                                                    return (
                                                                                                        <th key={index}
                                                                                                            data-polaris-header-cell="true"
                                                                                                            className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                                                                                            scope="col">
                                                                                                            {option.values[index]}
                                                                                                        </th>
                                                                                                    );
                                                                                                });
                                                                                            })}
                                                                                            <th key="-1"
                                                                                                data-polaris-header-cell="true"
                                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                                                                                scope="col"
                                                                                            >
                                                                                                Total
                                                                                            </th>
                                                                                        </tr>
                                                                                        {options.map((option, index) => {
                                                                                            if (option.name == 'Color') {
                                                                                                return option.values.map((value, index) => {
                                                                                                    let total = 0;
                                                                                                    return (
                                                                                                        <tr key={index}>
                                                                                                            <th
                                                                                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                                                                                scope="row"
                                                                                                            >
                                                                                                                {value}
                                                                                                            </th>
                                                                                                            {options.filter(prop => prop.name == 'Size').map((option) => {
                                                                                                                return Object.keys(option.values).map((index) => {
                                                                                                                    return variants.map((variant) => {
                                                                                                                        if (variant.option1 == option.values[index] && variant.option2 == value) {
                                                                                                                            if (existingLineItems[variant.id] != undefined) {
                                                                                                                                total += params.lineItems[variant.id]['quantity'];
                                                                                                                            }
                                                                                                                            return (
                                                                                                                                <td key={variant.id} className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                                                                    <div className="Polaris-Connected">
                                                                                                                                        <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                                                                                                            <div className="Polaris-TextField Polaris-TextField--hasValue">
                                                                                                                                                <input
                                                                                                                                                    id={"PolarisTextField3_" + variant.id}
                                                                                                                                                    data-id={variant.id}
                                                                                                                                                    className={"Polaris-TextField__Input input_quantity " + value}
                                                                                                                                                    data-class={value}
                                                                                                                                                    min="0"
                                                                                                                                                    max="6"
                                                                                                                                                    step="1"
                                                                                                                                                    type="number"
                                                                                                                                                    data-type="quantity"
                                                                                                                                                    aria-labelledby="PolarisTextField3Label PolarisTextField3Prefix"
                                                                                                                                                    aria-invalid="false"
                                                                                                                                                    value={ inputQuantity[value][option.values[index]] }
                                                                                                                                                    onChange={(e) => {
                                                                                                                                                        let filterStatus =  filterInput(e.target.value);
                                                                                                                                                        let str_count = e.target.value;
                                                                                                                                                        e.target.value = str_count.replace(/[^0-9]/g, "");
                                                                                                                                                        if(e.target.value <= 100000){
                                                                                                                                                            let tempQuantity = JSON.parse(JSON.stringify(inputQuantity));
                                                                                                                                                            tempQuantity[value][option.values[index]] = e.target.value;
                                                                                                                                                            setInputQuantity(tempQuantity);
                                                                                                                                                            if(filterStatus){
                                                                                                                                                                e.target.parentNode.classList.add("filter-error");
                                                                                                                                                            }else{
                                                                                                                                                                setErrorActive(false);
                                                                                                                                                                e.target.parentNode.classList.remove("filter-error");
                                                                                                                                                            }
                                                                                                                                                            let quantityFlag = $('.Polaris-TextField--hasValue').hasClass('filter-error');
                                                                                                                                                            if (!quantityFlag) {
                                                                                                                                                                $("#submitButton").attr("disabled",false);
                                                                                                                                                                $("#submitButton").removeClass("Polaris-Button--disabled");
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }}
                                                                                                                                                />
                                                                                                                                                <div className="Polaris-TextField__Spinner"
                                                                                                                                                    aria-hidden="true">
                                                                                                                                                    <div role="button"
                                                                                                                                                        className="Polaris-TextField__Segment"
                                                                                                                                                        tabIndex="-1"  onClick={(e) => {
                                                                                                                                                            let fieldID = "PolarisTextField3_" + variant.id;
                                                                                                                                                            let fieldVal = document.getElementById(fieldID).value;
                                                                                                                                                            let tempQuantity = JSON.parse(JSON.stringify(inputQuantity));
                                                                                                                                                            if(fieldVal == null||fieldVal == ''){
                                                                                                                                                                document.getElementById("PolarisTextField3_" + variant.id).value = 0;
                                                                                                                                                            }
                                                                                                                                                            let filterStatus =  filterInput(document.getElementById(fieldID).value);
                                                                                                                                                            if (fieldVal < 100000) {
                                                                                                                                                                let count = parseInt(document.getElementById(fieldID).value) + 1;
                                                                                                                                                                document.getElementById(fieldID).value = count;
                                                                                                                                                                calculateTotal(value);
                                                                                                                                                                tempQuantity[value][option.values[index]] = document.getElementById(fieldID).value;
                                                                                                                                                                setInputQuantity(tempQuantity);
                                                                                                                                                            }
                                                                                                                                                            if(filterStatus){
                                                                                                                                                                document.getElementById(fieldID).parentNode.classList.add("filter-error");
                                                                                                                                                            }else{
                                                                                                                                                                setErrorActive(false);
                                                                                                                                                                document.getElementById(fieldID).parentNode.classList.remove("filter-error");
                                                                                                                                                            }
                                                                                                                                                            fieldID = null;
                                                                                                                                                            fieldVal = null;
                                                                                                                                                            let quantityFlag = $('.Polaris-TextField--hasValue').hasClass('filter-error');
                                                                                                                                                            if (!quantityFlag) {
                                                                                                                                                                $("#submitButton").attr("disabled",false);
                                                                                                                                                                $("#submitButton").removeClass("Polaris-Button--disabled");
                                                                                                                                                            }
                                                                                                                                                        }}>
                                                                                                                                                        <div className="Polaris-TextField__SpinnerIcon">
                                                                                                                                                            <span className="Polaris-Icon">
                                                                                                                                                                <svg
                                                                                                                                                                    viewBox="0 0 20 20"
                                                                                                                                                                    className="Polaris-Icon__Svg"
                                                                                                                                                                    focusable="false"
                                                                                                                                                                    aria-hidden="true"
                                                                                                                                                                >
                                                                                                                                                                    <path d="M15 12l-5-5-5 5h10z"></path>
                                                                                                                                                                </svg>
                                                                                                                                                            </span>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                    <div role="button"
                                                                                                                                                        className="Polaris-TextField__Segment"
                                                                                                                                                        tabIndex="-1"  onClick={(e) => {
                                                                                                                                                            let fieldID = "PolarisTextField3_" + variant.id;
                                                                                                                                                            let fieldVal = document.getElementById(fieldID).value;
                                                                                                                                                            let tempQuantity = JSON.parse(JSON.stringify(inputQuantity));
                                                                                                                                                            if(fieldVal == null||fieldVal == ''){
                                                                                                                                                                document.getElementById("PolarisTextField3_" + variant.id).value = 1;
                                                                                                                                                            }
                                                                                                                                                            let filterStatus =  filterInput(document.getElementById(fieldID).value);
                                                                                                                                                            if(document.getElementById(fieldID).value > 0) {
                                                                                                                                                                let count = parseInt(document.getElementById(fieldID).value) - 1;
                                                                                                                                                                document.getElementById(fieldID).value = count;
                                                                                                                                                                calculateTotal(value);
                                                                                                                                                                tempQuantity[value][option.values[index]] = document.getElementById(fieldID).value;
                                                                                                                                                                setInputQuantity(tempQuantity);
                                                                                                                                                            }
                                                                                                                                                            if(filterStatus){
                                                                                                                                                                document.getElementById(fieldID).parentNode.classList.add("filter-error");
                                                                                                                                                            }else{
                                                                                                                                                                setErrorActive(false);
                                                                                                                                                                document.getElementById(fieldID).parentNode.classList.remove("filter-error");
                                                                                                                                                            }
                                                                                                                                                            fieldID = null;
                                                                                                                                                            fieldVal = null;
                                                                                                                                                            let quantityFlag = $('.Polaris-TextField--hasValue').hasClass('filter-error');
                                                                                                                                                            if (!quantityFlag) {
                                                                                                                                                                $("#submitButton").attr("disabled",false);
                                                                                                                                                                $("#submitButton").removeClass("Polaris-Button--disabled");
                                                                                                                                                            }
                                                                                                                                                            
                                                                                                                                                        }}>
                                                                                                                                                        <div className="Polaris-TextField__SpinnerIcon">
                                                                                                                                                            <span className="Polaris-Icon">
                                                                                                                                                                <svg
                                                                                                                                                                    viewBox="0 0 20 20"
                                                                                                                                                                    className="Polaris-Icon__Svg"
                                                                                                                                                                    focusable="false"
                                                                                                                                                                    aria-hidden="true">
                                                                                                                                                                    <path d="M5 8l5 5 5-5H5z"></path>
                                                                                                                                                                </svg>
                                                                                                                                                            </span>
                                                                                                                                                        </div>
                                                                                                                                                    </div>
                                                                                                                                                </div>
                                                                                                                                                <div className="Polaris-TextField__Backdrop"></div>
                                                                                                                                            </div>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </td>
                                                                                                                            );
                                                                                                                        } else if (variant.option1 == option.values[index]) {
                                                                                                                            if(inputQuantity[value][option.values[index]] == undefined){
                                                                                                                                return (
                                                                                                                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                                                                        <div></div>
                                                                                                                                    </td>
                                                                                                                                    );
                                                                                                                            }
                                                                                                                        }
                                                                                                                    })
                                                                                                                });
                                                                                                            })}
                                                                                                            <td id={value} className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                                                                { total }
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    );
                                                                                                })
                                                                                            }
                                                                                        })}

                                                                                    </thead>
                                                                                </table>
                                                                            </div>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                                <div className="data--table__button">
                                                    <button
                                                        id="submitButton"
                                                        className="Polaris-Button Polaris-Button--primary"
                                                        type="button"
                                                        onClick={() => saveVariants()}
                                                        >
                                                        <span className="Polaris-Button__Content">
                                                            <span className="Polaris-Button__Text" >Review and Approve</span>
                                                            </span>
                                                    </button>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {successActive ? (
                    <Frame>
                        <Toast content={message} onDismiss={succssToggleActive} />
                    </Frame>
                ) : null
                }
                {errorActive ? (
                    <Frame>
                        <Toast content={message} error onDismiss={errorToggleActive} />
                    </Frame>
                ) : null
                }
            </div>
        </>
    );
}
export default EditColorSizeQuantity;
