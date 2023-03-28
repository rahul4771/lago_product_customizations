import React, { useCallback, useState, useEffect } from 'react';
import { Frame, Toast, Select, Modal, TextContainer, FormLayout, InlineError } from "@shopify/polaris";
import { useRouter } from "next/router";
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import ArtNoImage from "../../images/icon_no_image.jpg";
import AbortController from 'abort-controller';

const EditArtwork = (props) => {
    const router = useRouter();
    const artworkId = props.artworkId;
    const [artName, setArtName] = useState("");
    const [artType, setArtType] = useState("");
    const [artImage, setArtImage] = useState("");
    const [artThumbnail, setArtThumbnail] = useState("");
    const [imageGetStatus, setImageGetStatus] = useState(false);
    const [artCustomer, setArtCustomer] = useState("");
    const [artColors, setArtColors] = useState(0);
    const [active, setActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [toggleMsg, setToggleMsg] = useState("");
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [customers, setCustomers] = useState([]);
    const [artwork, setArtwork] = useState([]);
    const [option, setOptions] = useState(customers);
    const [colorOptions, setColorOptions] = useState([]);
    const [showPopUp, setShowPopUp] = useState(false);
    const [selected, setSelected] = useState(1);
    const [nameValidation, setNameValidation] = useState(false);
    const [typeValidation, setTypeValidation] = useState(false);
    const [artNameError, setArtNameError] = useState("");
    const [artTypeError, setArtTypeError] = useState("");
    const handleSelectChange = useCallback((value) => setSelected(value), []);
    const handleChange = useCallback(() => { setShowPopUp(!showPopUp)
        $("#spinner_loader").css("display", "none");}, [showPopUp]);
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    let setSignal = null;
    let controller = null;
    const pattern = /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”'"<>?\\]/g;
    const [selectedCustomer, setSelectedCustomer] = useState('1');
    const handleCustomerSelectChange = useCallback((value) => setSelectedCustomer(value), []);
    
    useEffect(() => {
        try{
            controller = new AbortController();
            setSignal = controller.signal;
            getCustomers(setSignal);
            getArtwork(setSignal);
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            return () => {
                if (setSignal) {
                controller.abort();
                }
            }
        } catch(e) {
            console.log(e);
        }
    }, [props]);

    const getCustomers = async (signal = null) => {
        let customerArray = [{label: "Lago", value: "lago"}];
        let url = API.customerList;
        const customerDetails = await ApiHelper.get(url, signal);
        if (customerDetails && customerDetails.message == "success") {
            customerDetails.body.customers.map((customer, key) => {
                customerArray.push({label: customer.label, value: customer.value});
            });
            setCustomers(customerArray);
        }
    };
    const getArtwork = async (signal = null) => {
        let url = API.artwork + '/' + artworkId;
        const artworkDetails = await ApiHelper.get(url, signal);
        if(artworkDetails){
            setArtwork(artworkDetails);
            setArtName(artworkDetails[0].artwork_name);
            setArtType(artworkDetails[0].artwork_type);
            setSelectedCustomer(artworkDetails[0].sh_customer_id);
            setArtCustomer(artworkDetails[0].customer_name);
            setArtImage(artworkDetails[0].artwork_url);
            setArtThumbnail(artworkDetails[0].thumbnail_url);
            setSelected("'"+artworkDetails[0].artwork_colors+"'");
            let optionsColours = [];
            for (let i = 1; i <= 100; i++) {
                optionsColours.push({label: i, value: "'"+i+"'"});
            }
            setColorOptions(optionsColours);
            let imageStatus = new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                request.open("GET", artworkDetails[0].thumbnail_url, true);
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
            });
        }
    };
    useEffect(() => {
        setOptions(customers);
    }, [customers]);

    const artworkUpload = async () => {
        let artNameAdded = artName;
        artNameAdded = artNameAdded.trim();
        artNameAdded = artNameAdded.replace(/  +/g, ' ');
        setArtName(artNameAdded);
        let artTypeAdded = artType;
        artTypeAdded = artTypeAdded.trim();
        artTypeAdded = artTypeAdded.replace(/  +/g, ' ');
        setArtType(artTypeAdded);
        if (artNameAdded == ''){
            setArtNameError('Please enter artwork name');
            setNameValidation(true);
        } else if (pattern.test(artNameAdded)) {
            setArtNameError('Artwork name cannot contain special characters');
            setNameValidation(true);
        } else if (artNameAdded.length <= 2) {
            setArtNameError('Use 3 characters or more for your artwork name');
            setNameValidation(true);
        } else if (artTypeAdded == ''){
            setArtTypeError('Please enter artwork type')
            setTypeValidation(true);
        } else if (pattern.test(artTypeAdded)) {
            setArtTypeError('Artwork type cannot contain special characters')
            setTypeValidation(true)
        } else if (artTypeAdded.length <= 2) {
            setArtTypeError('Use 3 characters or more for your artwork type')
            setTypeValidation(true)
        } else if (artTypeAdded != '' && artNameAdded.length >= 3 && artTypeAdded.length >= 3 && !pattern.test(artNameAdded) && !pattern.test(artTypeAdded)) {
            $(".Polaris-Spinner--sizeLarge").css("display", "flex");
            $(".Polaris-Spinner--sizeLarge").css("top", 0);
            $(".Polaris-Spinner--sizeLarge").css("background", "#0000002b");
            $(".Polaris-Spinner--sizeLarge").css("position", "fixed");
            $(".Polaris-Spinner--sizeLarge").css("z-index", "9999");
            $(".Polaris-Spinner--sizeLarge").css("height", "100%");
            $(".Polaris-Spinner--sizeLarge").css("width", "100%");
            $(".Polaris-Spinner--sizeLarge").css("left", 0);
            $(".Polaris-Spinner--sizeLarge svg").css("position", "absolute");
            $(".Polaris-Spinner--sizeLarge svg").css("top", "45%");
            const formData = new FormData();
            formData.append('artworkName', artNameAdded);
            formData.append('artworkType', artTypeAdded);
            formData.append('artworkColors', selected.replaceAll("'",""));
            formData.append('customerId', selectedCustomer);
            let url = API.artwork + '/customer/' + artworkId;
            const artworkDetails = await ApiHelper.postFormData(url, formData);
            if (artworkDetails && artworkDetails.message == "success") {
                $(".Polaris-Spinner--sizeLarge").css("display", "none");
                setToggleMsg("Artwork updated successfully");
                settoggleActiveT(true);
                setTimeout(function () {
                    router.replace('/header?tab=artworks&page=artworkList' );
                }, 500);
            } else {
                $(".Polaris-Spinner--sizeLarge").css("display", "none");
                setErrorMessage("Edit artwork failed, please try again.");
                setActive(true);
            }
        }
    };
    const deleteArtWork = async () => {
        setShowPopUp(true);
    }
    const removeArtwork = async () => {
        setShowPopUp(false);
        if (artworkId) {
            let url = API.artwork + "/remove-artwork";
            let data = { id: artworkId }
            const removedArtwork = await ApiHelper.post(url, data);
            if (removedArtwork && removedArtwork.message == 'success') {
                $("#spinner_loader").css("display", "none");
                $("#artwork_" + artworkId).remove();
                setToggleMsg("Artwork deleted successfully");
                settoggleActiveT(true);
                router.replace('/header?tab=artworks&page=artworkList' );
            } else if (removedArtwork && removedArtwork.message == 'error') {
                $("#spinner_loader").css("display", "none");
                setErrorMessage("Delete artwork failed, please try again");
                setActive(true);
            }
        }
    }

    const validateName = (artNameAdded) => {
        if (artNameAdded == ''){
            setArtNameError('Please enter artwork name');
            setNameValidation(true);
        } else if (pattern.test(artNameAdded)) {
            setArtNameError('Artwork name cannot contain special characters');
            setNameValidation(true);
        } else if (artNameAdded.length <= 2) {
            setArtNameError('Use 3 characters or more for your artwork name');
            setNameValidation(true);
        } else {
            setArtNameError('');
            setNameValidation(false);
        }
    };

    const validateType = (artTypeAdded) => {
        if (artTypeAdded == ''){
            setArtTypeError('Please enter artwork type')
            setTypeValidation(true);
        } else if (pattern.test(artTypeAdded)) {
            setArtTypeError('Artwork type cannot contain special characters');
            setTypeValidation(true);
        } else if (artTypeAdded.length <= 2) {
            setArtTypeError('Use 3 characters or more for your artwork type')
            setTypeValidation(true);
        } else {
            setArtTypeError('');
            setTypeValidation(false);
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
                    <Spinner
                        accessibilityLabel="Spinner example"
                        size="large"
                    />
                    <div className="list--breabcrumbs">
                        <ul className="Polaris-List">
                            <li className="Polaris-List__Item breadcrumbs--icon">
                                <Image src={IconArrow} alt="Icon arrow left" width={8} height={12} />
                            </li>
                            <li className="Polaris-List__Item">
                                <Link href={{ pathname: "/", query: { tab: "artworks", page: "artworkList" } }}>Back to Artwork </Link>
                            </li>
                        </ul>
                        <div id="PolarisPortalsContainer"></div>
                    </div>
                    <div className="display-text">
                        <div className="display-text--title">
                                <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                    Edit Artwork
                                </p>
                                <div id="PolarisPortalsContainer"></div>
                        </div>
                        <div>
                            <div className="Polaris-ButtonGroup">
                                <div className="Polaris-ButtonGroup__Item">
                                    <Link href={{ pathname: "/", query: { tab: "artworks", page: "artworkList" } }}>
                                        <button
                                            className="Polaris-Button"
                                            type="button"
                                        >
                                            <span className="Polaris-Button__Content">
                                                <span className="Polaris-Button__Text">
                                                    Cancel
                                                </span>
                                            </span>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            <div id="PolarisPortalsContainer"></div>
                        </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                    <div className="Polaris-Layout">
                        <div className="Polaris-Layout__Section">
                            <div className="Polaris-Card">
                                <div className="Polaris-Card__Section">
                                    <div style={{display: 'grid',
                                    gridTemplateColumns: '50% 50%'}} >
                                        <div className="">
                                            {/* <!--Components--Tags--> */}
                                            {imageGetStatus == true ? (<img src={artImage} alt="" width="90%" height="90%" style={{objectFit: 'contain',objectPosition: 'center center',border: '#695555'}}/>) :
                                            (<Spinner accessibilityLabel="Spinner example" size="small"/>)}
                                        </div>
                                        <form method="post" encType="multipart/form-data">
                                            <br />
                                            <div className="">
                                                <div className="Polaris-Labelled__LabelWrapper">
                                                    <div className="Polaris-Label">
                                                        <label
                                                            id="PolarisTextField8Label"
                                                            htmlFor="PolarisTextField8"
                                                            className="Polaris-Label__Text"
                                                        >Artwork name</label
                                                        >
                                                    </div>
                                                </div>
                                                <div className="Polaris-Connected">
                                                    <div className="Polaris-Connected__Item Polaris-Connected__Item--primary" >
                                                        <div className="Polaris-TextField Polaris-TextField--hasValue" >
                                                            <input
                                                                id="artwork_name"
                                                                className="Polaris-TextField__Input"
                                                                aria-labelledby="PolarisTextField8Label"
                                                                aria-invalid="false"
                                                                name="artwork_name"
                                                                autoComplete="off"
                                                                value={artName}
                                                                onChange={(eName) => {setArtName(eName.target.value),validateName(eName.target.value)}}
                                                                onBlur={(eName) => {setArtName(eName.target.value),validateName(eName.target.value)}}
                                                                maxLength="44"
                                                            />
                                                            <div className="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                        {nameValidation == true && (
                                                            <InlineError message={artNameError} fieldID="artName" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="PolarisPortalsContainer"></div>
                                            <br />
                                            <div className="">
                                                <div className="Polaris-Labelled__LabelWrapper">
                                                    <div className="Polaris-Label">
                                                        <label
                                                            id="PolarisTextField9Label"
                                                            htmlFor="PolarisTextField9"
                                                            className="Polaris-Label__Text"
                                                        >
                                                            Artwork type
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="Polaris-Connected">
                                                    <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                        <div className="Polaris-TextField Polaris-TextField--hasValue">
                                                            <input
                                                                id="artwork_type"
                                                                className="Polaris-TextField__Input"
                                                                aria-labelledby="PolarisTextField9Label"
                                                                aria-invalid="false"
                                                                name="artwork_type"
                                                                autoComplete="off"
                                                                value={artType}
                                                                onChange={(eType) => {setArtType(eType.target.value),validateType(eType.target.value)}}
                                                                onBlur={(eType) => {setArtType(eType.target.value),validateType(eType.target.value)}}
                                                                maxLength="49"
                                                            />
                                                            <div className="Polaris-TextField__Backdrop"></div>
                                                        </div>
                                                        {typeValidation == true && (
                                                            <InlineError message={artTypeError} fieldID="artType" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="PolarisPortalsContainer"></div>
                                            <br/>
                                            <FormLayout>
                                                <FormLayout.Group>
                                                    
                                                <Select
                                                    id="artwork_colors"
                                                    name="artwork_colors"
                                                    label="Number of Colors"
                                                    options={colorOptions}
                                                    onChange={handleSelectChange}
                                                    value={selected}
                                                    />

                                                <Select
                                                    id="owner"
                                                    name="owner"
                                                    label="Owner"
                                                    options={option}
                                                    onChange={handleCustomerSelectChange}
                                                    value={selectedCustomer}
                                                    />
                                                    
                                                </FormLayout.Group>
                                                </FormLayout>
                                            <div>
                                                <br/>
                                                &nbsp;&nbsp;&nbsp;<button
                                                    className="Polaris-Button Polaris-Button--primary"
                                                    type="button"
                                                    style={{ width: '500px' }}
                                                    onClick={() => artworkUpload()}
                                                >
                                                    <span className="Polaris-Button__Content"
                                                    ><span className="Polaris-Button__Text"
                                                    >Save</span></span>
                                                </button>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div>
                                                <br/>
                                                &nbsp;&nbsp;&nbsp;<button
                                                    className="Polaris-Button Polaris-Button--primary"
                                                    style={{ backgroundColor: '#878787', width: '500px' }}
                                                    type="button"
                                                    onClick={() => { deleteArtWork() }}
                                                >
                                                    <span className="Polaris-Button__Content">
                                                        <span className="Polaris-Button__Text">
                                                            Delete Artwork
                                                        </span>
                                                    </span>
                                                </button>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {active ? (
                    <Frame>
                        <Toast content={errorMessage} error onDismiss={toggleActive} />
                    </Frame>
                ) : null
                }
            </div>
            {showPopUp ? (
                <div style={{ height: '500px', marginTop: '10px', width: '600px' }}>
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
                                {imageGetStatus == true ? (<img src={artThumbnail} alt="" style={{ maxHeight: '45px', maxWidth: '45px' }}/>) :
                                (<img src={ArtNoImage} alt="" style={{ maxHeight: '45px', maxWidth: '45px' }}/>)}
                                </div>
                                <div style={{marginLeft: '9px'}} className="Word-wrap">
                                {artCustomer}<br></br>{artName}
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
export default EditArtwork;
