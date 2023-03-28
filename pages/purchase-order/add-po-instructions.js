import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router";
import Link from 'next/link';
import { InlineError, Frame, Toast } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import momentTimezone from 'moment-timezone';

const AddPoInstructions = (props) => {
    const router = useRouter();
    const [order, setOrder] = useState(JSON.parse(props.order));
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(JSON.parse(props.order).requiredBy ? new Date(JSON.parse(props.order).requiredBy) : "");
    const [successActive, setSuccessActive] = useState(false);
    const [errorActive, setErrorActive] = useState(false);
    const [message, setMessage] = useState("");
    const [emptyValidation, setEmptyValidation] = useState(false);
    const [emptyDateValidation, setEmptyDateValidation] = useState(false);
    const [characterNumberValidation, setCharacterNumberValidation] = useState(false);
    const [maximumCharacterValidation, setMaximumCharacterValidation] = useState(false);
    const succssToggleActive = useCallback(() => setSuccessActive((successActive) => !successActive), []);
    const errorToggleActive = useCallback(() => setErrorActive((errorActive) => !errorActive), []);
    let lineItems = useState(JSON.parse(props.order).lineItems);
    let approveFlow = JSON.parse(props.order).approveFlow || false;
    Object.keys(lineItems).map((key) => {
        let status = "";
        if (lineItems[key].status == "pendingAdminApproval") {
            status = "Awaiting Admin Approval";
          } else if (lineItems[key].status == "pendingCustomerApproval") {
            status = "Awaiting Client Approval";
          } else if (lineItems[key].status == "adminApproved") {
            status = "Admin Approved";
          } else if (lineItems[key].status == "customerApproved") {
            status = "Client Approved";
          }
    });

    useEffect(() => {
        router.prefetch("/header?tab=create-PO&page=poDetails&params=" + order.orderId);
    }, []);

    const validateOrderInstructions = async () => {
        let instruction = document.getElementById("po-instruction").value;
        if (instruction != '' && instruction.length > 5) {
            if(instruction.length >= 4500){
                setMaximumCharacterValidation(true);
                setCharacterNumberValidation(false);     
                setEmptyValidation(false);
            } else {
                setEmptyValidation(false);
                setCharacterNumberValidation(false);
            }
        } else if (instruction == '') {
            setEmptyValidation(true);
            setCharacterNumberValidation(false);
            setMaximumCharacterValidation(false);
        } else {
            setCharacterNumberValidation(true);
            setEmptyValidation(false);
            setMaximumCharacterValidation(false);
        }
    }
    const validateOrderRequiredBy = async (date) => {

        setEmptyDateValidation(!validateDate(date));
    }

    const validateDate = (dateString) => {
        if(dateString == null) {
            return false;
        }
        let dd = String(dateString.getDate()).padStart(2, '0');
        let mm = String(dateString.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = dateString.getFullYear();
        let newDate = mm + '/' + dd + '/' + yyyy;
        let pattern = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
        return pattern.test(newDate);
        
    }

    const addOrderInstructions = async () => {
        try {
            let instruction = document.getElementById("po-instruction").value;
            let requiredBy = document.getElementsByClassName("lagoDatePicker")[0].value;
            if (requiredBy) {
                if(emptyDateValidation) {
                    return false;
                }
                setEmptyDateValidation(false);
                if (instruction != '' && instruction.length > 5) {
                    if(instruction.length >= 4500){
                        setMaximumCharacterValidation(true);
                        setCharacterNumberValidation(false);     
                        setEmptyValidation(false);
                    } else {
                        setEmptyValidation(false);
                        setCharacterNumberValidation(false);
                        let response = await saveInstructions();
                        if (response) {
                            setMessage("Successfully added the instructions.");
                            setSuccessActive(true);
                            if(!approveFlow){
                                setTimeout(function () {
                                    router.replace("/header?tab=create-PO&page=poDetails&params=" + order.orderId);
                                }, 500);
                            }
                        }
                    }
                } else if (instruction == '') {
                    setEmptyValidation(true);
                    setCharacterNumberValidation(false);
                    setMaximumCharacterValidation(false);
                } else {
                    setCharacterNumberValidation(true);
                    setEmptyValidation(false);
                    setMaximumCharacterValidation(false);
                }
            } else {
                setEmptyDateValidation(true);  
                setEmptyValidation(false);  
                setCharacterNumberValidation(false);
                setMaximumCharacterValidation(false);
            }
        } catch (e) {
            console.log(e);
        }
    }
    const reviewAndComplete = async () => {
        try {
            $(".Polaris-Spinner--sizeLarge").css("display", "block");
            let instruction = document.getElementById("po-instruction").value;
            let requiredBy = document.getElementsByClassName("lagoDatePicker")[0].value;
            if (requiredBy)
            {
                if(emptyDateValidation) {
                    return false;
                }
                setEmptyDateValidation(false);
                if (instruction != '' && instruction.length > 5) {
                    if(instruction.length >= 4500){
                        $(".Polaris-Spinner--sizeLarge").css("display", "none");
                        setMaximumCharacterValidation(true);
                        setCharacterNumberValidation(false);     
                        setEmptyValidation(false);
                    } else {
                        setEmptyValidation(false);
                        setCharacterNumberValidation(false);
                        let response = await saveInstructions();
                        if (response) {
                            $(".Polaris-Spinner--sizeLarge").css("display", "none");
                            setSuccessActive(true);
                            setMessage("Successfully added the instructions.");
                            setSuccessActive(true);
                            setTimeout(function () {
                                router.replace("/header?tab=create-PO&page=reviewAndComplete&params=" + JSON.stringify({ orderId: order.orderId, product: order.product, approveFlow: approveFlow }));
                            }, 1000);
                        }
                    }
                } else if (instruction == '') {
                    $(".Polaris-Spinner--sizeLarge").css("display", "none");
                    setEmptyValidation(true);
                    setCharacterNumberValidation(false);
                    setMaximumCharacterValidation(false);
                } else {
                    $(".Polaris-Spinner--sizeLarge").css("display", "none");
                    setCharacterNumberValidation(true);
                    setEmptyValidation(false);
                    setMaximumCharacterValidation(false);
                }
            } else {
                setEmptyDateValidation(true);  
                setEmptyValidation(false);  
                setCharacterNumberValidation(false);  
                setMaximumCharacterValidation(false);
            }
        } catch (e) {
            console.log(e);
        }
    }
    const saveInstructions = async () => {
        let requiredBy = document.getElementsByClassName("lagoDatePicker")[0].value;
        let instruction = document.getElementById("po-instruction").value;
        let url = API.puchaseOrderInstructions;
        
        if (instruction.length === 0 && requiredBy.length === 0) {
            setMessage("Please fill any of the above feilds.");
            setErrorActive(true);
        } else {
            let data = {
                "order_id" : order.orderId,
                "required_by" : requiredBy,
                "instructions" : instruction
            }
            setLoading(true);
            const result = await ApiHelper.post(url, data);
            if (result && result.message == "success") {
                return true;
            }
            setLoading(false);
        }
    }

    return (
        <div  className="Polaris-Tabs__Panel"
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
                        <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: order.orderId } }}>{order.orderName ? "PO Details - " + order.orderName : "PO Details" }</Link>
                    </li>
                    <li className="Polaris-List__Item breadcrumbs--icon">
                        <img src={IconArrow} alt="Icon arrow right" />
                    </li>
                    <li className="Polaris-List__Item">
                        <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editAssignArtwork", params: JSON.stringify({ orderId: order.orderId, productId: order.product.id }) } }}> Assign Artwork </Link>
                    </li>
                    <li className="Polaris-List__Item breadcrumbs--icon">
                        <img src={IconArrow} alt="Icon arrow right"/>
                    </li>
                    <li className="Polaris-List__Item">
                    <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editColorSizeQuantity", params: JSON.stringify({ product: order.product , orderId: order.orderId, orderName: order.orderName, lineItems : order.existingVariants }) } }}> Assign Color, Size, Quantity </Link>
                    </li>
                    <li className="Polaris-List__Item breadcrumbs--icon">
                        <img src={IconArrow} alt="Icon arrow right"/>
                    </li>
                    <li className="Polaris-List__Item">
                    <Link href={{ pathname: '/', query: { tab: 'create-PO', page: "reviewAndApprove", params: JSON.stringify({ orderId: order.orderId, product: order.product }) } }}>Approve</Link>
                    </li>
                    <li className="Polaris-List__Item breadcrumbs--icon">
                        <img src={ IconArrow } alt="Icon arrow right" />
                    </li>
                    <li className="Polaris-List__Item">
                        Add Order Level Instructions
                    </li></>) : (<>
                    <li className="Polaris-List__Item">
                        <Link href={{ pathname: "/", query: { tab: "create-PO", page: "poDetails", params: order.orderId } }}>{order.orderName ? "PO Details - " + order.orderName : "PO Details" }</Link>
                    </li>
                    <li className="Polaris-List__Item breadcrumbs--icon">
                        <img src={ IconArrow } alt="Icon arrow right" />
                    </li>
                    <li className="Polaris-List__Item">
                        Add Order Level Instructions
                    </li>
                </>)}
                </ul>
                
                <div id="PolarisPortalsContainer"></div>
            </div>
            <div>
                <div className="display-text">
                <div className="display-text--title">
                    <div>
                    <p
                        className="Polaris-DisplayText Polaris-DisplayText--sizeLarge"
                    >
                        { "PO " + order.orderName }
                    </p>
                    </div>
                    <div className='purchase__orders'>
                    <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
                        <span className="Polaris-Tag__TagText">
                            { status }
                        </span>
                    </span>
                    <div id="PolarisPortalsContainer"></div>
                    </div>
                </div>
                <div>
                    <div>
                    <div className="Polaris-ButtonGroup">
                        <div className="Polaris-ButtonGroup__Item">
                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "poDetails", params: order.orderId } }}>
                                <button
                                    className="Polaris-Button"
                                    type="button">
                                    <span className="Polaris-Button__Content">
                                        <span className="Polaris-Button__Text">
                                            Cancel
                                        </span>
                                    </span>
                                </button>
                            </Link>
                        </div>
                        <div className="Polaris-ButtonGroup__Item">
                        <button
                            className="Polaris-Button Polaris-Button--primary"
                            type="button"
                            onClick={ () => addOrderInstructions() }
                        >
                            <span className="Polaris-Button__Content">
                                <span className="Polaris-Button__Text">
                                    Save
                                </span>
                            </span>
                        </button>
                        </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                    </div>
                </div>
                </div>
                <div id="PolarisPortalsContainer"></div>
            </div>
            <div className="add__instructions">
                <div className="Polaris-Layout">
                <div className="Polaris-Layout__Section">
                    <div className="Polaris-Card">
                    <div className="Polaris-Card__Section">
                        <div>
                        <div className="instructions--select">
                            <div
                            className="Polaris-Labelled__LabelWrapper"
                            >
                            <div className="Polaris-Label">
                                <label id="PolarisSelect6Label" htmlFor="PolarisSelect6" className="Polaris-Label__Text">
                                    Required By
                                </label>
                            </div>
                            </div>
                            <DatePicker className={ emptyDateValidation === true ? "lagoDatePicker filter-error": "lagoDatePicker"} selected={startDate} dateFormat="MMM d, yyyy" onChange={(date) => {setStartDate(date);validateOrderRequiredBy(date); }} minDate={momentTimezone().tz("America/Los_Angeles").toDate()} onKeyUp={(date) => {validateOrderRequiredBy(date)}} />
                        </div>
                        <div id="PolarisPortalsContainer"></div>
                        {emptyDateValidation === true && <InlineError message="You must enter a valid required by date to submit with your PO" fieldID="postButton" />}
                        </div>
                        <div>
                            <div>
                                <div
                                className="Polaris-Labelled__LabelWrapper"
                                >
                                <div className="Polaris-Label">
                                    <label
                                    id="PolarisTextField18Label"
                                    htmlFor="PolarisTextField18"
                                    className="Polaris-Label__Text"
                                    >Instructions</label
                                    >
                                </div>
                                </div>
                                <div className="Polaris-Connected">
                                <div
                                    className="Polaris-Connected__Item Polaris-Connected__Item--primary"
                                >
                                    <div
                                    className="Polaris-TextField Polaris-TextField--hasValue Polaris-TextField--multiline"
                                    >
                                    <textarea
                                        id="po-instruction"
                                        placeholder="Add Order Instructions"
                                        className={ emptyValidation === true || characterNumberValidation === true || maximumCharacterValidation === true ? "Polaris-TextField__Input filter-error": "Polaris-TextField__Input"}
                                        aria-labelledby="PolarisTextField18Label"
                                        aria-invalid="false"
                                        aria-multiline="true"
                                        style={{height: "106px"}}
                                        onChange={validateOrderInstructions}
                                        defaultValue={order.orderInstruction}
                                    >
                                        </textarea>
                                    <div
                                        className="Polaris-TextField__Backdrop"
                                    ></div>
                                    <div
                                        aria-hidden="true"
                                        className="Polaris-TextField__Resizer"
                                    >
                                        <div
                                        className="Polaris-TextField__DummyInput"
                                        ></div>
                                        <div
                                        className="Polaris-TextField__DummyInput"
                                        >
                                        <br /><br /><br /><br />
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div id="PolarisPortalsContainer"></div>
                        </div>
                        <div className="instructions--button">
                        {emptyValidation === true && <InlineError message="You must enter instructions to submit with your PO" fieldID="postButton" />}
                        {characterNumberValidation === true && <InlineError message="Need more than 5 characters" fieldID="postButton" />}
                        {maximumCharacterValidation === true && <InlineError message="Exceeded maximum character length(4500)" fieldID="postButton" />}
                        <button
                            className="Polaris-Button Polaris-Button--primary"
                            type="button"
                            onClick={ () => reviewAndComplete() }
                        >
                            <span className="Polaris-Button__Content"
                            ><span className="Polaris-Button__Text"
                                >Review and Complete</span
                            ></span
                            >
                        </button>
                        <div id="PolarisPortalsContainer"></div>
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
    );
}
export default AddPoInstructions;
