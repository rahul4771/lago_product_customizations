import React, { useState, useEffect, Fragment, useCallback, useRef } from "react";
import Link from "next/link";
import AbortController from "abort-controller";
import { Spinner, Modal, TextContainer, Frame, Toast } from "@shopify/polaris";
import ApiHelper from "../../helpers/api-helper";
import { API } from "../../constants/api";
import PlaceArtwork from "../purchase-order/place-artwork";

let paginationCount = 0;
let totalPage = 0;
let currentPage = 0;
const ArtworkList = (props) => {
    const product = props.product;
    const orderType = props.type;
    const [artwork, setArtwork] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [artworkCategory, setArtworkCategory] = useState("customer");
    const [searchString, setSearchString] = useState("");
    const [searchStringComplete, setSearchStringComplete] = useState("");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [assignArtwork, setAssignArtwork] = useState({});
    const [uniqueKey, setUniqueKey] = useState("");
    const [artworkId, setArtWorkId] = useState("");
    const [customerArtWorkSort, setCustomerArtWorkSort] = useState("");
    const [publicArtWorkSort, setPublicArtWorkSort] = useState("");
    const [searchFlag, setSearchFlag] = useState(false);
    const [sortFlag, setSortFlag] = useState("");
    const [artworkName, setArtWorkName] = useState("");
    const handleChange = useCallback(() => { setShowPopUp(!showPopUp)
        $("#spinner_loader").css("display", "none");}, [showPopUp]);
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const [toggleMsg, setToggleMsg] = useState("");
    const [active, setActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    const isCancelled = useRef(false);
    const toggleShowModal = (modalStatus) => {
        setShowModal(modalStatus);
    }
    let customer = null;
    if (localStorage.getItem("customer")) {
        customer = JSON.parse(localStorage.getItem("customer"));
    }
    let setSignal = null;
    let controller = null;
    let apiLoad = true;
    const eventKeyCodes = {
        enter: 13,
    }
    useEffect(() => {
        setTimeout(setArtworkHeight, 300);
    },[artwork]);
    useEffect(() => {
        isCancelled.current = false;
        if (apiLoad) {
            $(window).bind('scroll', function () {
                var checkDiv = document.getElementById('artwork-list');
                if (checkDiv) {
                    if ($(window).scrollTop() >= ($('#artwork-list').offset().top + $('#artwork-list').outerHeight() - window.innerHeight) && currentPage != totalPage) {
                        apiLoad = false;
                        if (isCancelled.current) {
                            return false;
                        }
                        setPagination(paginationCount);
                    }
                }
            });
        }
        return () => {
            isCancelled.current = true;
        };
    }, [paginationCount]);

    useEffect(() => {
        isCancelled.current = false;
        try {
            controller = new AbortController();
            setSignal = controller.signal;
            getArtwork(setSignal);
            return () => {
                isCancelled.current = true;
            };
        } catch (e) {
            console.log(e);
        }
    }, [artworkCategory, searchStringComplete, customerArtWorkSort, publicArtWorkSort, pagination]);

    useEffect(() => {
        if (showModal) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = 'unset';
        }
      }, [showModal]);
      
    const setArtworkHeight = () => {

        artwork.map((art, index) => {
            if (index === artwork.length - 1) {
                let [tallest] = [
                ...document.getElementsByClassName('Polaris-MediaCard__Heading'),
                ].sort((a, b) => b.clientHeight - a.clientHeight);
                $('.Polaris-MediaCard__Heading').css(
                'min-height',
                `${tallest.clientHeight}px`,
                );
            }
        });
    };
    const getArtwork = async (signal = null) => {
        let url = '';
        let page = pageNo + 1;
        if (isCancelled.current) {
            return false;
        }
        if (artworkCategory == "customer") {
            url = API.customerArtwork + "?customer-id=" + customer.id + "&page=" + page;
            if (searchString != "") {
                if (searchFlag === false) {
                    setLoading(true);
                    setSearchFlag(true);
                    setArtwork([]);
                    setPageNo(0);
                    url = API.customerArtwork + "?query=" + searchString + "&customer-id=" + customer.id + "&page=1";
                } else {
                    url = API.customerArtwork + "?query=" + searchString + "&customer-id=" + customer.id + "&page=" + page;
                }
            } else {
                if (searchFlag === false) {
                    setLoading(true);
                    setSearchFlag(true);
                    setArtwork([]);
                    setPageNo(0);
                    url = API.customerArtwork + "?customer-id=" + customer.id + "&page=1";
                } else {
                    url = API.customerArtwork + "?customer-id=" + customer.id + "&page=" + page;
                }
            }
            if (customerArtWorkSort != "") {
                if (sortFlag != customerArtWorkSort) {
                    setLoading(true);
                    setSortFlag(customerArtWorkSort);
                    setArtwork([]);
                    setPageNo(0);
                    page = 1;
                }
                if (searchString != "") {
                    url = API.customerArtwork + "?query=" + searchString + "&customer-id=" + customer.id + "&page=" + page + "&sort-by=" + customerArtWorkSort;
                } else {
                    url = API.customerArtwork + "?customer-id=" + customer.id + "&page=" + page + "&sort-by=" + customerArtWorkSort;
                }
            }
        } else if (artworkCategory == "public") {
            url = API.publicArtwork + "?page=" + page;
            if (searchString != "") {
                if (searchFlag === false) {
                    setLoading(true);
                    setSearchFlag(true);
                    setArtwork([]);
                    setPageNo(0);
                    url = API.publicArtwork + "?query=" + searchString + "&page=1";
                } else {
                    url = API.publicArtwork + "?query=" + searchString + "&page=" + page;
                }
            } else {
                if (searchFlag === true) {
                    setLoading(true);
                    setSearchFlag(false);
                    setArtwork([]);
                    setPageNo(0);
                    url = API.publicArtwork + "?page=1";
                } else {
                    url = API.publicArtwork + "?page=" + page;
                }
            }
            if (publicArtWorkSort != "") {
                if (sortFlag != publicArtWorkSort) {
                    setLoading(true);
                    setSortFlag(publicArtWorkSort);
                    setArtwork([]);
                    setPageNo(0);
                    page = 1;
                }
                if (searchString != "") {
                    url = API.publicArtwork + "?query=" + searchString + "&page=" + page + "&sort-by=" + publicArtWorkSort;
                } else {
                    url = API.publicArtwork + "?page=" + page + "&sort-by=" + publicArtWorkSort;
                }
            }
        }

        const artworkDetails = await ApiHelper.get(url, signal);
        if (isCancelled.current) {
            return false;
        }
        setLoading(false);
        if (artworkDetails && artworkDetails.message == 'success') {
            currentPage = artworkDetails.body.currentPage;
            totalPage = artworkDetails.body.totalPages;
            if (artworkDetails.body.currentPage >= artworkDetails.body.totalPages) {
                $("#load-more-btn").css("display", "none");
                setPageNo(0);
                apiLoad = false;
            } else {
                $("#load-more-btn").css("display", "block");
                setPageNo(artworkDetails.body.currentPage);
                apiLoad = true;
                paginationCount = paginationCount + 1;
            }
            if (artwork.length == 0) {
                setArtwork(artworkDetails.body.artwork);
            } else {
                artworkDetails.body.artwork.map((art) => {
                    setArtwork((artwork) => [...artwork, art]);
                })
            }
        }
    };

    const deleteArtWork = async (artworkId, artworkName) => {
        setShowPopUp(true);
        setArtWorkId(artworkId);
        setArtWorkName(artworkName);
    }

    const removeArtwork = async () => {
        setShowPopUp(false);
        if (artworkId) {
            $("#artwork_" + artworkId).hide();
            let url = API.artwork + "/remove-artwork";
            let data = { id: artworkId }
            const removedArtwork = await ApiHelper.post(url, data);
            if (removedArtwork && removedArtwork.message == 'success') {
                setToggleMsg("Artwork deleted successfully");
                settoggleActiveT(true);
            }
            if (removedArtwork && removedArtwork.message == 'error' && removedArtwork.body.removed == false) {
                $("#artwork_" + artworkId).show();
                $("#spinner_loader").css("display", "none");
                setErrorMessage("Delete artwork failed, please try again");
                setActive(true);
            }
            $("#spinner_loader").css("display", "none");
        }
    }
    
    const setSearchStringCompleteTrim = (searchKeywork) => {
        let artSearchValue = searchKeywork.trim();
        artSearchValue = artSearchValue.replace(/  +/g, ' ');
        setSearchStringComplete(artSearchValue);
        setSearchString(artSearchValue);
    }

    return (
        <>
            <div className="Polaris-Card__Section" style={{ border: 'none' }}>
                <div>
                    <p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
                        Select Artwork
                    </p>
                    <div id="PolarisPortalsContainer"></div>
                </div>
                {/* <!--Components--Layout--> */}
                <div>
                    <div className="Polaris-Layout assign_artwork--select">
                        <div className="Polaris-Layout__Section">
                            <div>
                                {/* <!--Components--Autocomplete--> */}
                                <div>
                                    <div>
                                        <div
                                            aria-expanded="false"
                                            aria-owns="PolarisComboBox2"
                                            aria-controls="PolarisComboBox2"
                                            aria-haspopup="true"
                                            tabIndex="0"
                                        >
                                            <div>
                                                <div>
                                                    <div className="Polaris-Connected">
                                                        <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <div className="Polaris-TextField">
                                                                <div
                                                                    className="Polaris-TextField__Prefix"
                                                                    id="PolarisTextField2Prefix"
                                                                >
                                                                    <span className="Polaris-Icon Polaris-Icon--colorBase Polaris-Icon--applyColor">
                                                                        <svg
                                                                            viewBox="0 0 20 20"
                                                                            className="Polaris-Icon__Svg"
                                                                            focusable="false"
                                                                            aria-hidden="true"
                                                                        >
                                                                            <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm9.707 4.293l-4.82-4.82A5.968 5.968 0 0 0 14 8 6 6 0 0 0 2 8a6 6 0 0 0 6 6 5.968 5.968 0 0 0 3.473-1.113l4.82 4.82a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414z"></path>
                                                                        </svg>
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    id="PolarisTextField2"
                                                                    role="combobox"
                                                                    placeholder="Search"
                                                                    autoComplete="nope"
                                                                    className="Polaris-TextField__Input"
                                                                    aria-labelledby="PolarisTextField2Label PolarisTextField2Prefix"
                                                                    aria-invalid="false"
                                                                    aria-autocomplete="list"
                                                                    value={searchString}
                                                                    tabIndex="0"
                                                                    aria-controls="Polarispopover2"
                                                                    aria-owns="Polarispopover2"
                                                                    aria-expanded="false"
                                                                    onChange={(e) => {
                                                                        setSearchString(e.target.value)
                                                                        setSearchFlag(false);}}
                                                                    onKeyDown={(e) => {if(e.keyCode == eventKeyCodes.enter){setSearchStringCompleteTrim(e.target.value)}}}
                                                                    onBlur={(e) => {setSearchStringCompleteTrim(e.target.value)}}
                                                                />
                                                                <div className="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="PolarisPortalsContainer">
                                        <div data-portal-id="popover-Polarisportal1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="Polaris-Layout__Section Polaris-Layout__Section--secondary">
                            <div>
                                {/* <!--Components--Select--> */}
                                <div>
                                    <div className="Polaris-Labelled--hidden">
                                        <div className="Polaris-Labelled__LabelWrapper">
                                            <div className="Polaris-Label">
                                                <label
                                                    id="PolarisSelect4Label"
                                                    htmlFor="PolarisSelect4"
                                                    className="Polaris-Label__Text"
                                                >
                                                    Sort by
                                                </label>
                                            </div>
                                        </div>
                                        <div className="Polaris-Select">
                                            <select
                                                id="PolarisSelect4"
                                                className="Polaris-Select__Input"
                                                aria-invalid="false"
                                                onChange={(e) => {
                                                    setCustomerArtWorkSort(e.target.value)
                                                    setPublicArtWorkSort(e.target.value)
                                                }}
                                            >
                                                <option value="created-desc">
                                                    Created (newest first)
                                                </option>
                                                <option value="created-asc">
                                                    Created (oldest first)
                                                </option>
                                                <option value="updated-desc">
                                                    Updated (newest first)
                                                </option>
                                                <option value="updated-asc">
                                                    Updated (oldest first)
                                                </option>
                                            </select>
                                            <div
                                                className="Polaris-Select__Content"
                                                aria-hidden="true"
                                            >
                                                <span className="Polaris-Select__InlineLabel">
                                                    Sort by
                                                </span>
                                                <span className="Polaris-Select__SelectedOption">
                                                    {
                                                        customerArtWorkSort == 'created-desc' ?
                                                            (<> Created (newest first) </>) :
                                                            customerArtWorkSort == 'created-asc' ?
                                                                (<> Created (oldest first) </>) :
                                                                customerArtWorkSort == 'updated-desc' ?
                                                                    (<> Updated (newest first) </>) :
                                                                    customerArtWorkSort == 'updated-asc' ?
                                                                        (<> Updated (oldest first) </>) : "Created (newest first)"
                                                    }
                                                </span>
                                                <span className="Polaris-Select__Icon">
                                                    <span className="Polaris-Icon">
                                                        <svg
                                                            viewBox="0 0 20 20"
                                                            className="Polaris-Icon__Svg"
                                                            focusable="false"
                                                            aria-hidden="true"
                                                        >
                                                            <path d="M10 16l-4-4h8l-4 4zm0-12l4 4H6l4-4z"></path>
                                                        </svg>
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="Polaris-Select__Backdrop"></div>
                                        </div>
                                    </div>
                                    <div id="PolarisPortalsContainer"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                </div>
            </div>
            <div className="Polaris-Card__Section assign_artwork--tabs">
                {/* <!--Components--Tabs--> */}
                <div>
                    <div className="Polaris-Card">
                        <div>
                            <div className="Polaris-Tabs__Wrapper">
                                <div className="Polaris-Tabs Polaris-Tabs__TabMeasurer">
                                    <li
                                        className="Polaris-Tabs__TabContainer"
                                        role="presentation"
                                    >
                                        <button
                                            id=""
                                            role="tab"
                                            type="button"
                                            tabIndex="-1"
                                            className="Polaris-Tabs__Tab"
                                            aria-selected="false"
                                        >
                                            <span className="Polaris-Tabs__Title">
                                                Lago Artwork
                                            </span>
                                        </button>
                                    </li>
                                    <li
                                        className="Polaris-Tabs__TabContainer"
                                        role="presentation"
                                    >
                                        <button
                                            id=""
                                            role="tab"
                                            type="button"
                                            tabIndex="-1"
                                            className="Polaris-Tabs__Tab Polaris-Tabs__Tab--selected"
                                            aria-selected="true"
                                        >
                                            <span className="Polaris-Tabs__Title">
                                                {customer.name + "'s Artwork"}
                                            </span>
                                        </button>
                                    </li>
                                </div>
                                <ul role="tablist" className="Polaris-Tabs">
                                    <li
                                        className="Polaris-Tabs__TabContainer"
                                        role="presentation"
                                    >
                                        <button
                                            id=""
                                            role="tab"
                                            type="button"
                                            tabIndex="-1"
                                            className={artworkCategory == "public" ? "Polaris-Tabs__Tab Polaris-Tabs__Tab--selected" : "Polaris-Tabs__Tab"}
                                            aria-selected="false"
                                            onClick={() => {
                                                setArtworkCategory("public");
                                                setPageNo(0);
                                                setArtwork([]);
                                            }}
                                        >
                                            <span className="Polaris-Tabs__Title">
                                                Lago Artwork
                                            </span>
                                        </button>
                                    </li>
                                    <li
                                        className="Polaris-Tabs__TabContainer"
                                        role="presentation"
                                    >
                                        <button
                                            id=""
                                            role="tab"
                                            type="button"
                                            tabIndex="-1"
                                            className={artworkCategory == "customer" ? "Polaris-Tabs__Tab Polaris-Tabs__Tab--selected" : "Polaris-Tabs__Tab"}
                                            aria-selected="true"
                                            onClick={() => {
                                                setPageNo(0);
                                                setArtworkCategory("customer");
                                                setArtwork([]);
                                            }
                                            }
                                        >
                                            <span className="Polaris-Tabs__Title">
                                                {customer.name + "'s Artwork"}
                                            </span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div
                                className="Polaris-Tabs__Panel Polaris-Tabs__Panel--hidden"
                                id=""
                                role="tabpanel"
                                aria-labelledby=""
                                tabIndex="-1"
                            >
                                <div className="Polaris-Card__Section">
                                    &nbsp;
                                </div>
                            </div>
                            <div
                                className="Polaris-Tabs__Panel"
                                id=""
                                role="tabpanel"
                                aria-labelledby=""
                                tabIndex="-1"
                            >
                                <div
                                    className="Polaris-Tabs__Panel"
                                    id=""
                                    role="tabpanel"
                                    aria-labelledby=""
                                    tabIndex="-1"
                                >
                                    {loading ? (
                                        <Spinner accessibilityLabel="Spinner example" size="large" />
                                    ) : (
                                        <div id="artwork-list" className="Polaris-Tabs__Panel--columns">
                                            {/* <!--Components--MediaCard--> */}
                                            {artworkCategory == "customer" ? (
                                                <div className="create_po--card artwork__box">
                                                    <div className="Polaris-Labelled--hidden">
                                                        <div className="Polaris-Labelled__LabelWrapper">
                                                            <div className="Polaris-Label">
                                                                <label
                                                                    id="PolarisDropZone2Label"
                                                                    htmlFor="PolarisDropZone2"
                                                                    className="Polaris-Label__Text"
                                                                >
                                                                    Upload file
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="Polaris-DropZone Polaris-DropZone--hasOutline Polaris-DropZone--sizeExtraLarge"
                                                            aria-disabled="false" style={{ minHeight: "100%" }}
                                                        >
                                                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "uploadArtwork", params: JSON.stringify({"productId": product.id, "orderId": props.orderId, "type": orderType}) } }}>
                                                                <a>
                                                                    <div className="Polaris-DropZone__Container" style={{ top: "77px" }}>
                                                                        <div className="Polaris-DropZone-FileUpload">
                                                                            <div className="Polaris-Stack Polaris-Stack--vertical">
                                                                                <div className="Polaris-Stack__Item" style={{minHeight:"29rem"}}>
                                                                                    <svg
                                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                                                                        width="100"
                                                                                        height="101"
                                                                                        viewBox="0 0 100 101"
                                                                                    >
                                                                                        <defs>
                                                                                            <filter
                                                                                                id="e4wz33le7a"
                                                                                                width="101%"
                                                                                                height="102%"
                                                                                                x="-.5%"
                                                                                                y="-.5%"
                                                                                                filterUnits="objectBoundingBox"
                                                                                            >
                                                                                                <feOffset
                                                                                                    dy="1"
                                                                                                    in="SourceAlpha"
                                                                                                    result="shadowOffsetOuter1"
                                                                                                />
                                                                                                <feComposite
                                                                                                    in="shadowOffsetOuter1"
                                                                                                    in2="SourceAlpha"
                                                                                                    operator="out"
                                                                                                    result="shadowOffsetOuter1"
                                                                                                />
                                                                                                <feColorMatrix
                                                                                                    in="shadowOffsetOuter1"
                                                                                                    values="0 0 0 0 0.0863 0 0 0 0 0.1137 0 0 0 0 0.1451 0 0 0 0.1 0"
                                                                                                />
                                                                                            </filter>
                                                                                            <filter
                                                                                                id="gmu8jmmgod"
                                                                                                width="102%"
                                                                                                height="103%"
                                                                                                x="-1%"
                                                                                                y="-1%"
                                                                                                filterUnits="objectBoundingBox"
                                                                                            >
                                                                                                <feMorphology
                                                                                                    in="SourceAlpha"
                                                                                                    radius="1"
                                                                                                    result="shadowSpreadInner1"
                                                                                                />
                                                                                                <feOffset
                                                                                                    dy="1"
                                                                                                    in="shadowSpreadInner1"
                                                                                                    result="shadowOffsetInner1"
                                                                                                />
                                                                                                <feComposite
                                                                                                    in="shadowOffsetInner1"
                                                                                                    in2="SourceAlpha"
                                                                                                    k2="-1"
                                                                                                    k3="1"
                                                                                                    operator="arithmetic"
                                                                                                    result="shadowInnerInner1"
                                                                                                />
                                                                                                <feColorMatrix
                                                                                                    in="shadowInnerInner1"
                                                                                                    values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0"
                                                                                                />
                                                                                            </filter>
                                                                                            <linearGradient
                                                                                                id="jc9hrm2kqc"
                                                                                                x1="50%"
                                                                                                x2="50%"
                                                                                                y1="0%"
                                                                                                y2="100%"
                                                                                            >
                                                                                                <stop
                                                                                                    offset="0%"
                                                                                                    stopColor="#606FC7"
                                                                                                />
                                                                                                <stop
                                                                                                    offset="100%"
                                                                                                    stopColor="#5865C1"
                                                                                                />
                                                                                            </linearGradient>
                                                                                            <rect
                                                                                                id="z9htwajuzb"
                                                                                                width="100"
                                                                                                height="100"
                                                                                                x="0"
                                                                                                y="0"
                                                                                                rx="50"
                                                                                            />
                                                                                        </defs>
                                                                                        <g
                                                                                            fill="none"
                                                                                            fillRule="evenodd"
                                                                                        >
                                                                                            <g>
                                                                                                <g>
                                                                                                    <g transform="translate(-239 -597) translate(172 303) translate(67 294)">
                                                                                                        <g>
                                                                                                            <use
                                                                                                                fill="#000"
                                                                                                                filter="url(#e4wz33le7a)"
                                                                                                                xlinkHref="#z9htwajuzb"
                                                                                                            />
                                                                                                            <use
                                                                                                                fill="url(#jc9hrm2kqc)"
                                                                                                                xlinkHref="#z9htwajuzb"
                                                                                                            />
                                                                                                            <use
                                                                                                                fill="#000"
                                                                                                                filter="url(#gmu8jmmgod)"
                                                                                                                xlinkHref="#z9htwajuzb"
                                                                                                            />
                                                                                                            <rect
                                                                                                                width="99"
                                                                                                                height="99"
                                                                                                                x=".5"
                                                                                                                y=".5"
                                                                                                                stroke="#4F5DBA"
                                                                                                                strokeLinejoin="square"
                                                                                                                rx="49.5"
                                                                                                            />
                                                                                                        </g>
                                                                                                        <rect
                                                                                                            width="50"
                                                                                                            height="8"
                                                                                                            x="25"
                                                                                                            y="46"
                                                                                                            fill="#FFF"
                                                                                                            rx="4"
                                                                                                        />
                                                                                                        <rect
                                                                                                            width="50"
                                                                                                            height="8"
                                                                                                            x="25"
                                                                                                            y="46"
                                                                                                            fill="#FFF"
                                                                                                            rx="4"
                                                                                                            transform="rotate(90 50 50)"
                                                                                                        />
                                                                                                    </g>
                                                                                                </g>
                                                                                            </g>
                                                                                        </g>
                                                                                    </svg>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <span className="Polaris-VisuallyHidden">
                                                                        <input
                                                                            id="PolarisDropZone2"
                                                                            type="file"
                                                                            multiple=""
                                                                            autoComplete="off"
                                                                        />
                                                                    </span>
                                                                </a>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>) : null
                                            }
                                            {artwork.length > 0
                                                ? artwork.map((art, index) => {
                                                    return (
                                                        <Fragment key={index}>
                                                            <div className="artwork__placed artwork__box" id={'artwork_' + art.id}>
                                                                <div className="Polaris-Card" style={{}}>
                                                                    <div className="Polaris-MediaCard">
                                                                        <div className="Polaris-MediaCard__MediaContainer">
                                                                            {/* <!--Components--Tags--> */}
                                                                            {(art.artwork_type == "" || art.artwork_type == null) ? null : (
                                                                                <div className="mediacard--tag">
                                                                                    <span className="Polaris-Tag color--cyan">
                                                                                        <span
                                                                                            className="Polaris-Tag__TagText White-space Word-wrap"
                                                                                        >
                                                                                            {art.artwork_type}
                                                                                        </span>
                                                                                    </span>
                                                                                    <div id="PolarisPortalsContainer"></div>
                                                                                </div>
                                                                            )}
                                                                            <img
                                                                                alt=""
                                                                                width="100%"
                                                                                height="120"
                                                                                src={art.thumbnail_url !== null ? art.thumbnail_url : art.artwork_url}
                                                                                style={{
                                                                                    objectFit: 'contain',
                                                                                    objectPosition: 'center center'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        <div className="Polaris-MediaCard__InfoContainer">
                                                                            <div className="Polaris-Card__Section">
                                                                                <div className="Polaris-Stack Polaris-Stack--vertical Polaris-Stack--spacingTight">
                                                                                    <div className="Polaris-Stack__Item">
                                                                                        <div className="Polaris-MediaCard__Heading" style={{minHeight:"4.5rem"}}>
                                                                                            <h2 className="Polaris-Heading Word-wrap">
                                                                                                {art.artwork_name}
                                                                                            </h2>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="Polaris-Stack__Item">
                                                                                        <div className="Polaris-MediaCard__ActionContainer">
                                                                                            <div className="Polaris-ButtonGroup">
                                                                                                <div className="Polaris-ButtonGroup__Item">
                                                                                                    <div className="Polaris-MediaCard__PrimaryAction">
                                                                                                        <button
                                                                                                            className="Polaris-Button"
                                                                                                            type="button"
                                                                                                            onClick={() => {
                                                                                                                setAssignArtwork(art);
                                                                                                                setUniqueKey(new Date().getUTCMilliseconds())
                                                                                                                if (document.getElementsByClassName('place__artwork_modal')[0]) {
                                                                                                                    document.getElementsByClassName('place__artwork_modal')[0].style.display = "block";
                                                                                                                }
                                                                                                                setShowModal(true);
                                                                                                            }}
                                                                                                        >
                                                                                                            <span className="Polaris-Button__Content">
                                                                                                                <span className="Polaris-Button__Text">
                                                                                                                    Assign
                                                                                                                </span>
                                                                                                            </span>
                                                                                                        </button>
                                                                                                        <button className="Polaris-Button" type="button"
                                                                                                            onClick={() => { deleteArtWork(art.id, art.artwork_name) }}
                                                                                                        >
                                                                                                            <span className="Polaris-Button__Content">
                                                                                                                <span className="Polaris-Button__Text">
                                                                                                                    Remove
                                                                                                                </span>
                                                                                                            </span>
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div id="PolarisPortalsContainer">
                                                                    <div data-portal-id="popover-Polarisportal8"></div>
                                                                </div>
                                                            </div>
                                                        </Fragment>
                                                    )
                                                })
                                                : artworkCategory == "public" ? (
                                                    <div className="_1z7Ob" style={{paddingLeft:"42%"}}>
                                                        <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <img src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e" alt="Empty search results" draggable="false" />
                                                            </div>
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                                                No artwork found
                                                                </p>
                                                            </div>
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <span className="Polaris-TextStyle--variationSubdued_1segu">
                                                                    <p>Try changing the filters or search term</p>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : artworkCategory == "customer" && searchStringComplete != "" ? (
                                                    <div className="_1z7Oc" style={{paddingLeft:"30%"}}>
                                                        <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <img src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e" alt="Empty search results" draggable="false" />
                                                            </div>
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                                                No artwork found
                                                                </p>
                                                            </div>
                                                            <div className="Polaris-Stack__Item_yiyol">
                                                                <span className="Polaris-TextStyle--variationSubdued_1segu">
                                                                    <p>Try changing the filters or search term</p>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            {/* <!--Component--DropZone--> */}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="PolarisPortalsContainer">
                        <div data-portal-id="popover-Polarisportal3"></div>
                    </div>
                </div>
                {active === true ? (
                    <Frame>
                        <Toast content={errorMessage} error onDismiss={toggleActive} />
                    </Frame>
                ) : null
                }
                {toggleActiveT === true ? (
                    <Frame>
                        <Toast content={toggleMsg} onDismiss={toggleActiveChange} />
                    </Frame>
                ) : null}
            </div>
            {showModal === true ? (
                <PlaceArtwork toggleShowModal={toggleShowModal} product={product} artwork={assignArtwork} uniqueKey={uniqueKey} display="block" type={orderType} orderId={props.orderId} />
            ) :null}
            {showPopUp ? (
                <div style={{ height: '500px', marginTop: '10px' }}>
                    <Modal
                        small
                        open={showPopUp}
                        onClose={handleChange}
                        title="Really need to remove?"
                        titleHidden
                        primaryAction={{
                            content: 'Remove',
                            onClick: removeArtwork
                        }}
                        secondaryActions={[
                            {
                                content: 'Cancel',
                                onAction: handleChange,
                            },
                        ]}
                    >
                        <Modal.Section>
                            <TextContainer>
                                <p>
                                    Are you sure you want to delete the artwork {artworkName.substring(0,25)}?
                                </p>
                            </TextContainer>
                        </Modal.Section>
                    </Modal>
                </div>
            ) : null}
        </>
    );
};
export default ArtworkList;
