import React, { useEffect, useState, useCallback } from "react";
import {Caption, Stack, Thumbnail, DropZone, Frame, Toast, Banner, List} from '@shopify/polaris';
import { NoteMinor } from "@shopify/polaris-icons";
import { useRouter } from "next/router";
import ApiHelper from "../../helpers/api-helper";
import { API } from "../../constants/api";
const UploadBulkArtwork = (props) => {
    const router = useRouter();
    const [rejectedFiles, setRejectedFiles] = useState([]);
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [errorMessage, setErrorMessage] = useState("");
    const [toggleMsg, setToggleMsg] = useState("");
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const [sizeRejectedFiles, setSizeRejectedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, rejectedFiles) => {
            setFiles([]);
            setSizeRejectedFiles([]);
            setFiles(files => [...files, ...acceptedFiles]);
            setRejectedFiles(rejectedFiles);
            acceptedFiles.map((file, index) => {
                if (file.size > 10485760) { //10485760 - 10MB
                    setSizeRejectedFiles(_dropFiles);
                    setFiles([]);
                }
            });
        }, []);
    let concernedElement = null;
	const eventKeyCodes = {
		escape: 27,
	}
    const hasError = rejectedFiles.length > 0 || sizeRejectedFiles.length > 0;
    const fileUpload = <DropZone.FileUpload />
    const uploadedFiles = files.length > 0 && (
        <Stack vertical>
            {files.map((file, index) => (
                <Stack alignment="center" key={index}>
                    <div id="bulk-file-artwork">
                        <Thumbnail
                            size="large"
                            alt={file.name}
                            source={NoteMinor}
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
                        {`"${file.name}" is not supported. File type must be .csv, .xls`}
                    </List.Item>
                ))}
                {sizeRejectedFiles.map((file, index) => (
                    <List.Item key={index}>
                        {`"${file.name}" is not supported. Image size must be less than 10MB`}
                    </List.Item>
                ))}
            </List>
        </Banner>
    );

    useEffect(() => {
		(async () => {
			concernedElement = document.querySelector(".Polaris-Modal-Dialog__Modals_Bulk");
		})();
	}, [props]);

    const artworkBulkUpload = async () => {
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
        formData.append('artworkCsv', files[0]);
        let url = API.artworkBulkUpload;
        const artworkBulkCSV = await ApiHelper.postFormData(url, formData);
        if (artworkBulkCSV && artworkBulkCSV.message == "success") {
            setToggleMsg("Successfully uploaded artwork");
            settoggleActiveT(true);
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            document.getElementsByClassName('upload_bulk_artwork_modal')[0].style.display = "none";
            setTimeout(function () {
                router.replace('/header?tab=artworks&page=artworkList' );
            }, 500);
        } else {
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            document.getElementsByClassName('upload_bulk_artwork_modal')[0].style.display = "none";
            setErrorMessage("Artwork upload failed");
            setActive(true);
        }
    };

    $(document).keydown(function(e) {
        if (e.keyCode == eventKeyCodes.escape) {
			props.toggleShowModal(false);
        }
    });

	document.addEventListener("mousedown", (event) => {
		if(concernedElement != null){
			if (!concernedElement.contains(event.target)) {
				concernedElement = null;
				props.toggleShowModal(false);
			}
		}
	  });
    return (
        <>
            <div id="PolarisPortalsContainer" className="upload_bulk_artwork_modal" >
                <div data-portal-id="modal-Polarisportal8">
                    <div
                        className="Polaris-Modal-Dialog__Container"
                        data-polaris-layer="true"
                        data-polaris-overlay="true"
                    >
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="Polarismodal-header8"
                            tabIndex="-1"
                            className="Polaris-Modal-Dialog"
                        >
                            <div className="Polaris-Modal-Dialog__Modals_Bulk">
                                <div className="Polaris-Modal-Header">
                                    <div
                                        id="Polarismodal-header8"
                                        className="Polaris-Modal-Header__Title"
                                    >
                                        <h2 className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
                                        Import artwork by CSV
                                        </h2>
                                    </div>
                                    <button
                                        className="Polaris-Modal-CloseButton"
                                        aria-label="Close"
                                        onClick={ () => {
                                            document.getElementsByClassName('upload_bulk_artwork_modal')[0].style.display = "none"; 
                                        } }
                                    >
                                        <span className="Polaris-Icon Polaris-Icon--colorBase Polaris-Icon--applyColor">
                                            <svg
                                                viewBox="0 0 20 20"
                                                className="Polaris-Icon__Svg"
                                                focusable="false"
                                                aria-hidden="true"
                                            >
                                                <path d="M11.414 10l6.293-6.293a1 1 0 1 0-1.414-1.414L10 8.586 3.707 2.293a1 1 0 0 0-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 1 0 1.414 1.414L10 11.414l6.293 6.293A.998.998 0 0 0 18 17a.999.999 0 0 0-.293-.707L11.414 10z"></path>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                                <div className="Polaris-Layout">
                                    <div className="Polaris-Layout__Section">
                                        <div className="Polaris-Card">
                                            <div className="Polaris-Card__Section">
                                                <form method="post" encType="multipart/form-data">
                                                    Download a <a href="https://dev80.p80w.com/Files/lago/lago-import-artwork.csv" target="_blank">sample CSV template</a> to see an example of the format required.<br />
                                                        
                                                    <div>
                                                        <div
                                                            className="Polaris-Stack Polaris-Stack--vertical"
                                                        >
                                                            <div className="Polaris-Stack__Item">
                                                                {fileUploadErrorMessage}
                                                                <br />
                                                                <DropZone onDrop={handleDropZoneDrop} allowMultiple={false} accept="text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" >
                                                                    <div>
                                                                        <div style={{margin:"-32px 0px -20px 63px"}}>{uploadedFiles}</div>
                                                                        {fileUpload}
                                                                    </div>
                                                                </DropZone>
                                                                
                                                            </div>
                                                        </div>
                                                        <div id="PolarisPortalsContainer"></div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="Polaris-Modal-Footer">
                                    <div className="Polaris-Modal-Footer__FooterContents">
                                        <div className="Polaris-Stack Polaris-Stack--alignmentCenter">
                                            <div className="Polaris-Stack__Item Polaris-Stack__Item--fill"></div>
                                            <div className="Polaris-Stack__Item">
                                                <div className="Polaris-ButtonGroup">
                                                    <div className="Polaris-ButtonGroup__Item" style={{marginTop:"-20px"}}>
                                                        <button
                                                            className="Polaris-Button"
                                                            type="button"
                                                            onClick={ () => {
                                                                document.getElementsByClassName('upload_bulk_artwork_modal')[0].style.display = "none"; 
                                                            } }
                                                        >
                                                            <span className="Polaris-Button__Content">
                                                                <span className="Polaris-Button__Text">
                                                                    Cancel
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </div>
                                                    <div className="Polaris-ButtonGroup__Item" style={{marginTop:"-20px"}}>
                                                        <button
                                                            className="Polaris-Button Polaris-Button--primary"
                                                            type="button"
                                                            onClick={() => artworkBulkUpload()}
                                                        >
                                                            <span className="Polaris-Button__Content">
                                                                <span className="Polaris-Button__Text">
                                                                    Upload and continue
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
                    <div className="Polaris-Backdrop"></div>
                </div>
                {active ? (
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
        </>
    );
};

export default UploadBulkArtwork;
