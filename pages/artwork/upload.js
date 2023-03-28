import React, { useCallback, useState, useEffect } from 'react';
import { Caption, DropZone, Stack, Thumbnail, Frame, Toast, Banner, List, Select, InlineError } from "@shopify/polaris";
import { NoteMinor } from "@shopify/polaris-icons";
import { useRouter } from "next/router";
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';

const UploadArtwork = (props) => {
    const router = useRouter();
    const productId = JSON.parse(props.productId).productId;
    const orderId = JSON.parse(props.productId).orderId;
    const orderType = JSON.parse(props.productId).type;
    const [artName, setArtName] = useState("");
    const [artType, setArtType] = useState("");
    const [active, setActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [files, setFiles] = useState([]);
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const [sizeRejectedFiles, setSizeRejectedFiles] = useState([]);
    const [selected, setSelected] = useState('1');
    const [imageValidation, setImageValidation] = useState(false);
    const [nameValidation, setNameValidation] = useState(false);
    const [typeValidation, setTypeValidation] = useState(false);
    const [artImageError, setArtImageError] = useState("");
    const [artNameError, setArtNameError] = useState("");
    const [artTypeError, setArtTypeError] = useState("");
    const pattern = /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”'"<>?\\]/g;
    const handleSelectChange = useCallback((value) => setSelected(value), []);
    let options = [];
    for(let i=1;i<=100;++i){
        options.push({label: ''+i+'', value: ''+i+''})
    }

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, rejectedFiles) => {
            setFiles([]);
            setSizeRejectedFiles([]);
            setFiles(files => [...files, ...acceptedFiles]);
            setRejectedFiles(rejectedFiles);
            acceptedFiles.map((file, index) => {
                setImageValidation(false);
                if (file.size > 16986931) { //16986931 - 16.2MB
                    setSizeRejectedFiles(_dropFiles);
                    setFiles([]);
                }
                if (!validImageTypes.includes(file.type)) {
                    setRejectedFiles(_dropFiles);
                    setFiles([]);
                }
            });
        }, []);

    useEffect(() => {
        if (orderType == 'orderUpdate') {
            router.prefetch('/header?tab=create-PO&page=editAssignArtwork&params=' + JSON.stringify({ orderId: orderId, productId: productId }));
        } else {
            router.prefetch('/header?tab=create-PO&page=assignArtwork&params=' + productId);
        }
        $(".Polaris-Spinner--sizeLarge").css("display", "none");
    }, []);
    const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const hasError = rejectedFiles.length > 0 || sizeRejectedFiles.length > 0;
    const fileUpload = <DropZone.FileUpload />

    const uploadedFiles = files.length > 0 && (
        <Stack vertical>
            {files.map((file, index) => (
                <Stack alignment="center" key={index}>
                    <div id="upload-artwork">
                        <Thumbnail
                            size="large"
                            alt={file.name}
                            source={
                                validImageTypes.includes(file.type)
                                    ? window.URL.createObjectURL(file)
                                    : NoteMinor
                            }
                        />
                    </div>
                    <div>
                        {file.name} <Caption>{file.size} bytes</Caption>
                    </div>
                </Stack>
            ))}
        </Stack>
    );

    const fileUploadErrorMessage = hasError && (
        <Banner
            title="The following image couldn’t be uploaded:"
            status="critical"
        >
            <List type="bullet">
                {rejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. Image type must be .jpg, .jpeg, .png, .svg, .gif`}
                    </List.Item>
                ))}
                {sizeRejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. Image size must be less than 16MB`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );

    let customer = null;
    if (localStorage.getItem("customer")) {
        customer = JSON.parse(localStorage.getItem("customer"));
    }

    const artworkUpload = async () => {
        let artNameAdded = artName;
        artNameAdded = artNameAdded.trim();
        artNameAdded = artNameAdded.replace(/  +/g, ' ');
        setArtName(artNameAdded);
        let artTypeAdded = artType;
        artTypeAdded = artTypeAdded.trim();
        artTypeAdded = artTypeAdded.replace(/  +/g, ' ');
        setArtType(artTypeAdded);
        if (files && files.length == 0 || files[0] === "undefined") {
            setArtImageError("Choose an image to upload");
            setImageValidation(true);
        } else if (artNameAdded == ''){
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
        } else if (files.length > 0 && files[0] !== "undefined" && artNameAdded != '' && artTypeAdded != '' && artNameAdded.length >= 3 && artTypeAdded.length >= 3) {
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
            formData.append('artUrl', files[0]);
            formData.append('artworkName', artNameAdded);
            formData.append('artworkType', artTypeAdded);
            formData.append('artworkColors', selected);
            formData.append('customerId', customer.id);
            let url = API.artwork + '/customer';
            const artworkDetails = await ApiHelper.postFormData(url, formData);
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            if (orderType == 'orderUpdate') {
                router.replace('/header?tab=create-PO&page=editAssignArtwork&params=' + JSON.stringify({ orderId: orderId, productId: productId }));
            } else {
                router.replace('/header?tab=create-PO&page=assignArtwork&params=' + productId);
            }
        }
    };

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
                        {orderType == "orderCreate" ? (<><li className="Polaris-List__Item">
								<Link href={{ pathname: "/", query: { tab: "create-PO", page: "create" } }}>Create </Link>
							</li>
							<li className="Polaris-List__Item breadcrumbs--icon">
								<Image src={IconArrow} alt="Icon arrow right" width={8} height={12} />
							</li>
							<li className="Polaris-List__Item">
								<Link href={{ pathname: "/", query: { tab: "create-PO", page: "selectGarment" } }}>Select Garment </Link>
							</li>
							<li className="Polaris-List__Item breadcrumbs--icon">
								<Image src={IconArrow} alt="Icon arrow right" width={8} height={12} />
							</li>
							<li className="Polaris-List__Item">
                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "assignArtwork", params: productId } }}> Assign Artwork </Link>
							</li></>) : (<><li className="Polaris-List__Item">
								<Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: orderId } }}>PO Details</Link>
							</li>
							<li className="Polaris-List__Item breadcrumbs--icon">
								<Image src={IconArrow} alt="Icon arrow right" width={8} height={12} />
							</li>
							<li className="Polaris-List__Item">
                            <Link href={{ pathname: "/", query: { tab: "create-PO", page: "editAssignArtwork", params: JSON.stringify({ orderId: orderId, productId: productId }) } }}> Assign Artwork </Link>
							</li></>) }
						</ul>
						<div id="PolarisPortalsContainer"></div>
					</div>
                    <div>
                        <div className="display-text">
                            <div className="display-text--title">
                                <span className="Polaris-Tag color--purple">
                                    <span
                                        title="Wholesale"
                                        className="Polaris-Tag__TagText">
                                        {customer.name}
                                    </span>
                                </span>
                                <div id="PolarisPortalsContainer"></div>
                            </div>
                            <div>
                                <div className="Polaris-ButtonGroup">
                                    <div className="Polaris-ButtonGroup__Item">
                                        {orderType == "orderUpdate" ? (<Link href={{ pathname: "/", query: { tab: "create-PO", page: "editAssignArtwork", params: JSON.stringify({ orderId: orderId, productId: productId }) } }}>
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
                                        </Link>) : (<Link href={{ pathname: "/", query: { tab: "create-PO", page: "assignArtwork", params: productId } }}>
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
                                        </Link>) }
                                    </div>
                                </div>
                                <div id="PolarisPortalsContainer"></div>
                            </div>
                        </div>
                        <div id="PolarisPortalsContainer"></div>
                    </div>
                    <div>
                        <div className="Polaris-Layout">
                            <div className="Polaris-Layout__Section">
                                <div className="Polaris-Card">
                                    <div className="Polaris-Card__Section">
                                        <form method="post" encType="multipart/form-data">
                                            <div>
                                                <p
                                                    className="Polaris-DisplayText Polaris-DisplayText--sizeSmall"
                                                >
                                                    Upload Artwork
                                                </p>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div>
                                                <div
                                                    className="Polaris-Stack Polaris-Stack--vertical"
                                                >
                                                    <div className="Polaris-Stack__Item">
                                                        {fileUploadErrorMessage ? (<>{fileUploadErrorMessage}<br/></>) : null}
                                                        <DropZone onDrop={handleDropZoneDrop} type="image" allowMultiple={false} accept="image/*" errorOverlayText="Image type must be .jpg, .jpeg, .png, .svg, .gif">
                                                            <div>
                                                                {uploadedFiles}
                                                                {fileUpload}
                                                            </div>
                                                        </DropZone>
                                                    </div>
                                                </div>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            {imageValidation == true && (
                                                <InlineError message={artImageError} fieldID="artImage" />
                                            )}
                                            <br />
                                            <div>
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
                                                                    onKeyUp={(eName) => {setArtName(eName.target.value),validateName(eName.target.value)}}
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
                                            </div>
                                            <br />
                                            <div>
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
                                                                    onKeyUp={(eType) => {setArtType(eType.target.value),validateType(eType.target.value)}}
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
                                            </div>
                                            <br />
                                            <div>
                                                <div className="">
                                                    <div className="Polaris-Connected">
                                                        <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <Select
                                                            id="artwork_colors"
                                                            name="artwork_colors"
                                                            label="Number of Colors"
                                                            options={options}
                                                            onChange={handleSelectChange}
                                                            value={selected}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <br />
                                            <div>
                                                <button
                                                    className="Polaris-Button Polaris-Button--primary"
                                                    type="button"
                                                    onClick={() => artworkUpload()}
                                                >
                                                    <span className="Polaris-Button__Content"
                                                    ><span className="Polaris-Button__Text"
                                                    >Upload Artwork</span
                                                        ></span
                                                    >
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
        </>
    );
};
export default UploadArtwork;
