import React, { useState, useEffect, Fragment, useCallback, useRef} from "react";
import Link from "next/link";
import AbortController from "abort-controller";
import { ListMajor, ThemesMajor } from '@shopify/polaris-icons';
import { Spinner, TextStyle, Modal, TextContainer, Frame, Toast, Select , FormLayout, Icon } from "@shopify/polaris";
import ApiHelper from "../../helpers/api-helper";
import { API } from "../../constants/api";
import IconNoImage from "../../images/icon_no_image.jpg";

const ArtworkAllList = (props) => {
    const [artwork, setArtwork] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [artworkCategory, setArtworkCategory] = useState("customer");
    const [searchString, setSearchString] = useState("");
    const [searchStringComplete, setSearchStringComplete] = useState("");
    const [searchStringCustomer, setSearchStringCustomer] = useState("all");
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [artworkId, setArtWorkId] = useState("");
    const [customerArtWorkSort, setCustomerArtWorkSort] = useState("");
    const [publicArtWorkSort, setPublicArtWorkSort] = useState("");
    const [searchFlag, setSearchFlag] = useState(false);
    const [sortFlag, setSortFlag] = useState("");
    const [artworkName, setArtWorkName] = useState("");
    const [artworkImage, setArtWorkImage] = useState("");
    const [artworkThumbnail, setArtWorkThumbnail] = useState("");
    const [artworkCustomer, setArtWorkCustomer] = useState("");
    const handleChange = useCallback(() => { setShowPopUp(!showPopUp)
        $("#spinner_loader").css("display", "none");}, [showPopUp]);
    const [active, setActive] = useState(false);
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [toggleMsg, setToggleMsg] = useState("");
    const [next, setNext] = useState(1);
    const [currentPageNo, setCurrentPageNo] = useState(1);
    const [totalArtwork, setTotalArtwork] = useState(1);
    const [previous, setPrevious] = useState(1);
    const [customers, setCustomers] = useState([]);
    const [option, setOptions] = useState(customers);
    const [gridFlag, setGridFlag] = useState(true);
    const [listFlag, setListFlag] = useState(false);
    const [imageGetStatus,setImageGetStatus] = useState(true);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    const isCancelled = useRef(false);
    let setSignal = null;
    let controller = null;
    const eventKeyCodes = {
        enter: 13,
    }
    const [selectedCustomer, setSelectedCustomer] = useState('1');
    const handleCustomerSelectChange = useCallback((value) => {
        setSelectedCustomer(value)
        setSearchStringCustomer(value)
    }, []);
    const getCustomers = async (signal = null) => {
        let customerArray = [{label: "All Owners", value: "all"},{label: "Lago", value: "lago"}];
        let url = API.customerList;
        const customerDetails = await ApiHelper.get(url, signal);
        if (isCancelled.current) {
            return false;
        }
        if (customerDetails && customerDetails.message == "success") {
            customerDetails.body.customers.map((customer, key) => {
                customerArray.push({label: customer.label, value: customer.value});
            });
            setCustomers(customerArray);
        }
    };
    useEffect(() => {
        setTimeout(setArtworkHeight, 300);
    },[artwork]);
    useEffect(() => {
        isCancelled.current = false;
        setOptions(customers);
        return () => {
            isCancelled.current = true;
        };
    }, [customers]);
    useEffect(() => {
        isCancelled.current = false;
        try {
            controller = new AbortController();
            setSignal = controller.signal;
            getCustomers(setSignal);
            getArtwork(setSignal,1);
        } catch (e) {
            console.log(e);
        }
        return () => {
            isCancelled.current = true;
        };
    }, [artworkCategory, searchStringComplete, customerArtWorkSort, publicArtWorkSort, pagination, searchStringCustomer]);

    const getArtwork = async (signal = null, pageCount) => {
        setLoading(true);
        setArtwork([]);
        let url = '';
        let page = pageCount;
        if (artworkCategory == "customer") {
            url = API.allArtworks + "?customer-id=" + searchStringCustomer + "&page=" + page;
            if (searchString != "") {
                if (searchFlag === false) {
                    setLoading(true);
                    setSearchFlag(true);
                    setArtwork([]);
                    setPageNo(0);
                    url = API.allArtworks + "?query=" + searchString + "&customer-id=" + searchStringCustomer + "&page=1";
                } else {
                    url = API.allArtworks + "?query=" + searchString + "&customer-id=" + searchStringCustomer + "&page=" + page;
                }
            } else if (searchFlag === true) {
                setLoading(true);
                setSearchFlag(false);
                setArtwork([]);
                setPageNo(0);
                url = API.allArtworks + "?customer-id=" + searchStringCustomer + "&page=1";
            } else {
                url = API.allArtworks + "?customer-id=" + searchStringCustomer + "&page=" + page;
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
                    url = API.allArtworks + "?query=" + searchString + "&customer-id=" + searchStringCustomer + "&page=" + page + "&sort-by=" + customerArtWorkSort;
                } else {
                    url = API.allArtworks + "?customer-id=" + searchStringCustomer + "&page=" + page + "&sort-by=" + customerArtWorkSort;
                }
            }
        } else if (artworkCategory == "public") {
            url = API.publicArtwork + "?page=" + page;
            if (searchString != "") {
                url = API.publicArtwork + "?query=" + searchString + "&page=" + page;
            }
            if (publicArtWorkSort != "") {
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
        if (artworkDetails && artworkDetails.message == 'success') {
            let currentPage = artworkDetails.body.currentPage;
            setCurrentPageNo(artworkDetails.body.currentPage);
            setTotalArtwork(artworkDetails.body.totalArtwork);
            if (artworkDetails.body.currentPage >= artworkDetails.body.totalPages) {
                $("#load-more-btn").css("display", "none");
                setPageNo(0);
                setPrevious(Number(currentPage-1))
                setNext(0)
            } else {
                $("#load-more-btn").css("display", "block");
                setPageNo(artworkDetails.body.currentPage);
                setPrevious(Number(currentPage-1))
                setNext(Number(currentPage+1))
            }
            if (artwork.length == 0) {
                setArtwork(artworkDetails.body.artwork);
            } else if(artworkDetails.body && artworkDetails.body.artwork.length > 0){
                artworkDetails.body.artwork.map((art) => {
                    setArtwork((artwork) => [...artwork, art]);
                })
            }
        }
        setLoading(false);
    };

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

    const deleteArtWork = async (artworkId, artworkName, artworkImage, artworkThumbnail, artworkCustomer) => {
        setArtWorkId(artworkId);
        setArtWorkName(artworkName);
        setArtWorkImage(artworkImage);
        setArtWorkThumbnail(artworkThumbnail);
        let imageStatus = new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open("GET", artworkThumbnail, true);
            request.send();
            request.onload = () => resolve({"img_status":request.status})
            request.onerror = reject
        });
        imageStatus.then( result => {
            if(result.img_status == 200){
                setImageGetStatus(true);
            } else if (result.img_status == 500){
                setImageGetStatus(false);
            }
            setShowPopUp(true);
        });
        setArtWorkCustomer(artworkCustomer);
    }
    
    const removeArtwork = async () => {
        setShowPopUp(false);
        if (artworkId) {
            let url = API.artwork + "/remove-artwork";
            let data = { id: artworkId }
            const removedArtwork = await ApiHelper.post(url, data);
            if (removedArtwork && removedArtwork.message == 'success') {
                $("#spinner_loader").css("display", "none");
                $("#artwork_" + artworkId).hide();
                setToggleMsg("Artwork deleted successfully");
                settoggleActiveT(true);
            }
            if (removedArtwork && removedArtwork.message == 'error') {
                $("#spinner_loader").css("display", "none");
                setErrorMessage("Delete artwork failed, please try again");
                setActive(true);
            }
        }
    }

    const listView = () => {
        setGridFlag(false);
        setListFlag(true);
      }
      const gridView = () => {
        setGridFlag(true);
        setListFlag(false);
    }
    
    const setSearchStringCompleteTrim = (searchKeywork) => {
        let artSearchValue = searchKeywork.trim();
        artSearchValue = artSearchValue.replace(/  +/g, ' ');
        setSearchStringComplete(artSearchValue);
        setSearchString(artSearchValue);
    }

    return (
        <>
            <div className="Polaris-Card__Section">
                <div>
                    <div className="display-text">
                        <div className="one-half text-left">
                        <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                        Artwork
                        </p>
                        </div>
                        <div className="one-half text-right">
                        <Link href={{ pathname: "/", query: { tab: "artworks", page: "uploadArtwork" } }}>
                                <button
                                className="Polaris-Button Polaris-Button--primary"
                                type="button"
                                >
                                <span className="Polaris-Button__Content">
                                    <span className="Polaris-Button__Text">
                                    <TextStyle variation="strong" preferredPosition="above">Upload Artwork</TextStyle>
                                    </span>
                                </span>
                                </button>
                            </Link>
                        </div>
                    </div>
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
                                                           
                                                        <FormLayout>
                                                            <FormLayout.Group condensed>
                                                            <div className="Polaris-TextField">
                                                                <div onClick={() => {
                                                                        try {
                                                                            controller = new AbortController();
                                                                            setSignal = controller.signal;
                                                                            getArtwork(setSignal,1);
                                                                            getCustomers(setSignal);
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
                                                                                viewBox="0 0 20 20"
                                                                                className="Polaris-Icon__Svg"
                                                                                focusable="false"
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
                                                                    placeholder="Search artwork"
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
                                                                    onChange={(e) => setSearchString(e.target.value)}
                                                                    onKeyDown={(e) => {if(e.keyCode == eventKeyCodes.enter){
                                                                        setSearchStringCompleteTrim(e.target.value)}}}
                                                                    onBlur={(e) => {
                                                                        setSearchStringCompleteTrim(e.target.value)}}
                                                                />
                                                                <div className="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                            <Select
                                                                id="owner"
                                                                name="owner"
                                                                options={option}
                                                                onChange={handleCustomerSelectChange}
                                                                value={selectedCustomer}
                                                                />
                  

                                                            </FormLayout.Group>
                                                            </FormLayout>
                                                            
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
                                {/* <!--Components--Select--> */}
                        <div className="Polaris-Layout__Section Polaris-Layout__Section--secondary">
                            <div>
                                {/* <!--Components--Select--> */}
                                <div>
                                <FormLayout>
                                <FormLayout.Group condensed>
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
                                                onChange={(e) => setCustomerArtWorkSort(e.target.value)}

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
                                    <div className="Polaris-ButtonGroup">
                                        <div className="Polaris-ButtonGroup__Item">
                                            <div className="Polaris-MediaCard__PrimaryAction" style={{display: 'table-row'}}>
                                                <button
                                                    className="Polaris-Button"
                                                    type="button"
                                                    onClick={listView}
                                                >
                                                    <span className="Polaris-Button__Content">
                                                        <span className="Polaris-Button__Text">
                                                        <Icon
                                                        source={ListMajor}
                                                        color="base" />
                                                        </span>
                                                    </span>
                                                </button>
                                                <button className="Polaris-Button" type="button"
                                                     onClick={gridView}
                                                >
                                                    <span className="Polaris-Button__Content">
                                                        <span className="Polaris-Button__Text">
                                                        <Icon
                                                            source={ThemesMajor}
                                                            color="base" />
                                                        </span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    </FormLayout.Group>
                                    </FormLayout>
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
                <div className="Polaris-Card">
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
                            ) : artwork.length > 0 ? gridFlag == true ? (
                                <div id="grid">
                                    <div id="artwork-list" className="Polaris-Tabs__Panel--columns" >
                                        {/* <!--Components--MediaCard--> */}
                                        {artwork.length > 0
                                            ? artwork.map((art, index) => {
                                                return (
                                                    <Fragment key={index}>
                                                        <div className="artwork__placed artwork__box" id={'artwork_' + art.id} >
                                                            <div className="Polaris-Card" >
                                                                <div className="Polaris-MediaCard">
                                                                    <div className="Polaris-MediaCard__MediaContainer">
                                                                        {/* <!--Components--Tags--> */}
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
                                                                                    <div className="Polaris-MediaCard__Heading" style={{minHeight:"9rem"}}>
                                                                                        <h2 className="Polaris-Heading Word-wrap">
                                                                                            {art.customer_name}
                                                                                        </h2>
                                                                                        <br></br>
                                                                                        <h2 className="Polaris-Heading Word-wrap">
                                                                                            {art.artwork_name}
                                                                                        </h2>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="Polaris-Stack__Item">
                                                                                    <div className="Polaris-MediaCard__ActionContainer">
                                                                                        <div className="Polaris-ButtonGroup">
                                                                                            <div className="Polaris-ButtonGroup__Item">
                                                                                                <div className="Polaris-MediaCard__PrimaryAction" style={{display: 'table-row'}}>
                                                                                                <Link href={{ pathname: "/", query: { tab: "artworks", page: "editArtwork", params: art.id } }}>
                                                                                                    <button
                                                                                                        className="Polaris-Button"
                                                                                                        type="button"
                                                                                                    >
                                                                                                        <span className="Polaris-Button__Content">
                                                                                                            <span className="Polaris-Button__Text">
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
                                                                                                                        transform="translate(-1145 -345) translate(1145 345)"
                                                                                                                        />
                                                                                                                    </g>
                                                                                                                    </g>
                                                                                                                </g>
                                                                                                                </svg>
                                                                                                            </span>
                                                                                                        </span>
                                                                                                    </button>
                                                                                                </Link>

                                                                                                &nbsp;&nbsp;&nbsp; <button className="Polaris-Button" type="button"

                                                                                                        onClick={() => { deleteArtWork(art.id, art.artwork_name, art.artwork_url, art.thumbnail_url, art.customer_name) }}
                                                                                                    >
                                                                                                        <span className="Polaris-Button__Content">
                                                                                                            <span className="Polaris-Button__Text">
                                                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                                                                                                    <g fill="none" fillRule="evenodd">
                                                                                                                        <g fill="#212B36">
                                                                                                                            <g>
                                                                                                                                <path d="M11 16h3V8h-3v8zm-5 0h3V8H6v8zM8 6h4V4H8v2zm9 0h-3V4c0-1.103-.897-2-2-2H8c-1.103 0-2 .897-2 2v2H3c-.553 0-1 .448-1 1s.447 1 1 1h1v9c0 .552.447 1 1 1h10c.553 0 1-.448 1-1V8h1c.553 0 1-.448 1-1s-.447-1-1-1z" transform="translate(-1145 -428) translate(1145 428)"/>
                                                                                                                            </g>
                                                                                                                        </g>
                                                                                                                    </g>
                                                                                                                </svg>
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
                                                <TextStyle variation="subdued">No artwork listed</TextStyle>
                                            ) : null}
                                        {/* <!--Component--DropZone--> */}
                                    </div>
                                </div>
                            ) : null : (
                                <div className="_1z7Ob">
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
                            ) }
                            {artwork.length > 0 ? listFlag == true ? (
                                <div className="Polaris-DataTable" id="list">
                                    <div className="Polaris-DataTable__ScrollContainer">
                                        <table className="Polaris-DataTable__Table">
                                        <thead>
                                            <tr>
                                                <th
                                                    data-polaris-header-cell="true"
                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                    scope="col"
                                                >
                                                    <b>ARTWORK</b>
                                                </th>
                                                <th
                                                    data-polaris-header-cell="true"
                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                    scope="col"
                                                ></th>
                                                <th
                                                    data-polaris-header-cell="true"
                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                    scope="col"
                                                >
                                                    <b>OWNER</b>
                                                </th>
                                                <th
                                                    data-polaris-header-cell="true"
                                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                                    scope="col"
                                                ></th>
                                            </tr>
                                        </thead>
                                        
                                            <tbody>
                                                {artwork.map((art, index) => {
                                                   
                                                    return (
                                                        <tr key={index}
                                                            className="Polaris-DataTable__TableRow"
                                                            data-index={index}
                                                        >
                                                            <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                                        
                                                                <img
                                                                    alt=""
                                                                    width="8% !important"
                                                                    height="6% !important"
                                            
                                                                    src={art.thumbnail_url !== null ? art.thumbnail_url : art.artwork_url}
                                                                    style={{
                                                                        objectFit: 'contain',
                                                                        objectPosition: 'center center',
                                                                        paddingTop:'10px'
                                                                        
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">{art.artwork_name}</td>
                                                            <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                            <h2 className="Polaris-Heading">
                                                                    {art.customer_name}
                                                                    </h2>
                                                            </td>
                                                            <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                                            <Link href={{ pathname: "/", query: { tab: "artworks", page: "editArtwork", params: art.id } }}>
                                                                <button
                                                                    className="Polaris-Button"
                                                                    type="button"
                                                                >
                                                                    <span className="Polaris-Button__Content">
                                                                        <span className="Polaris-Button__Text">
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
                                                                                    transform="translate(-1145 -345) translate(1145 345)"
                                                                                    />
                                                                                </g>
                                                                                </g>
                                                                            </g>
                                                                            </svg>
                                                                        </span>
                                                                    </span>
                                                                </button>
                                                            </Link>

                                                            <button className="Polaris-Button" type="button"
                                                                onClick={() => { deleteArtWork(art.id, art.artwork_name, art.artwork_url, art.customer_name) }}
                                                                >
                                                                <span className="Polaris-Button__Content">
                                                                    <span className="Polaris-Button__Text">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                                                            <g fill="none" fillRule="evenodd">
                                                                                <g fill="#212B36">
                                                                                    <g>
                                                                                        <path d="M11 16h3V8h-3v8zm-5 0h3V8H6v8zM8 6h4V4H8v2zm9 0h-3V4c0-1.103-.897-2-2-2H8c-1.103 0-2 .897-2 2v2H3c-.553 0-1 .448-1 1s.447 1 1 1h1v9c0 .552.447 1 1 1h10c.553 0 1-.448 1-1V8h1c.553 0 1-.448 1-1s-.447-1-1-1z" transform="translate(-1145 -428) translate(1145 428)"/>
                                                                                    </g>
                                                                                </g>
                                                                            </g>
                                                                        </svg>
                                                                    </span>
                                                                </span>
                                                            </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="Polaris-DataTable__Footer">
                                            <div id="PolarisPortalsContainer"></div>
                                    </div>
                                </div>
                            ) : null : null }
                        </div>
                    </div>
                    {artwork.length > 0 ? (
                        <div>
                            {previous == 0 && next == 0 ? null : (
                            <div className="Polaris-DataTable__Footer">
                                <nav aria-label="Pagination">
                                    <div
                                    className="Polaris-ButtonGroup"
                                    data-buttongroup-segmented="false"
                                    >
                                    <div className={"Polaris-ButtonGroup__Item " + (previous ? 0 : "Border_color")}>
                                        <a href="#" onClick={() => {
                                            try {
                                                controller = new AbortController();
                                                setSignal = controller.signal;
                                                getArtwork(setSignal,previous);
                                    
                                            } catch (e) {
                                                console.log(e);
                                            }
                                            }} className={(previous ? 0 : "Polaris-Button--disabled")}>
                                        <button
                                            id="previousURL"
                                            className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (previous ? 0 : "Polaris-Button--disabled")}
                                            aria-label="Previous"
                                            type="button"
                                            disabled={previous == null}
                                        >
                                            <span className="Polaris-Button__Content">
                                            <span className="Polaris-Button__Icon">
                                                <span className="Polaris-Icon">
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    className="Polaris-Icon__Svg"
                                                    focusable="false"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                                </svg>
                                                </span>
                                            </span>
                                            </span>
                                        </button>
                                        </a>
                                    </div>
                                    <div className={"Polaris-ButtonGroup__Item " + (next ? 0 : "Border_color")} >
                                        <a href="#" onClick={() => {
                                            try {
                                                controller = new AbortController();
                                                setSignal = controller.signal;
                                                getArtwork(setSignal,next);
                                    
                                            } catch (e) {
                                                console.log(e);
                                            }
                                            }} className={(next ? 0 : "Polaris-Button--disabled")} >
                                        <button
                                            id="nextURL"
                                            className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (next ? 0 : "Polaris-Button--disabled")}
                                            aria-label="Next"
                                            type="button"
                                            disabled={next == null}
                                        >
                                            <span className="Polaris-Button__Content">
                                            <span className="Polaris-Button__Icon">
                                                <span className="Polaris-Icon">
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    className="Polaris-Icon__Svg"
                                                    focusable="false"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                                </svg>
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
                    ) : null}
                </div>
                {loading ? null : artwork.length > 0 ? (<div className="display-text">
                    <div className="one-half text-left">
                        <p className="Polaris-DisplayText Polaris-DisplayText--sizeExtraSmall"style={{ marginLeft: '7px' }}>
                            Showing {(currentPageNo-1)*12+1} to {(currentPageNo)*12} out of total artwork
                        </p>
                    </div>
                </div>): ''}
                <div id="PolarisPortalsContainer">
                    <div data-portal-id="popover-Polarisportal3"></div>
                </div>
                {active === true ? (
                    <Frame>
                        <Toast content={errorMessage} error onDismiss={toggleActive} />
                    </Frame>
                ) : null
                }
            </div>

            {showPopUp ? (
                <div style={{ height: '500px', marginTop: '10px' }}>
                    <Modal
                        small
                        open={showPopUp}
                        onClose={handleChange}
                        title="Really need to remove?"
                        titleHidden
                        primaryAction={{
                            content: 'Yes, Delete',
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
                            <div>
                            <p style={{textAlign: 'left'}}><b>Are you sure you want to delete the artwork?</b></p>
                            </div>
                            <div className="box">
                                <div >
                                    {imageGetStatus == true ? (<img src={artworkThumbnail} alt="" style={{ maxHeight: '45px', maxWidth: '45px' }}/>) : 
                                    (<img src={IconNoImage} alt="" style={{ maxHeight: '45px', maxWidth: '45px' }}/>)}
                                </div>
                                <div style={{marginLeft: '9px'}} className="Word-wrap">
                                {artworkCustomer}<br></br>{artworkName}
                                </div>
                            </div>
                            </TextContainer>
                        </Modal.Section>
                        
                    </Modal>
                </div>

            ) : null}
            {toggleActiveT === true ? (
                <Frame>
                    <Toast content={toggleMsg} onDismiss={toggleActiveChange} />
                </Frame>
            ) : null}
        </>
    );
};
export default ArtworkAllList;
