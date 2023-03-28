import React, { useState, useCallback, useEffect } from "react";
import {Frame, Toast} from '@shopify/polaris';
import { PUBLIC_PREVIEW_URL } from "../../constants/common";
import {CopyToClipboard} from 'react-copy-to-clipboard';

const SharePublicPreviewLink = (props) => {
	const orderId = props.orderId;
	const encodedOrderId = btoa(orderId);
    const encoded2OrderId = btoa(encodedOrderId);
    const publicPreviewUrl = PUBLIC_PREVIEW_URL + '&orderKey=' + encoded2OrderId;
    const [active, setActive] = useState(false);
    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const [errorMessage, setErrorMessage] = useState("");
    const [toggleMsg, setToggleMsg] = useState("");
    const [toggleActiveT, settoggleActiveT] = useState(false);
    const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
    let concernedElement = null;
	const eventKeyCodes = {
		escape: 27,
	}
    
    useEffect(() => {
		(async () => {
			concernedElement = document.querySelector(".Polaris-Modal-Dialog__Modals_Bulk");
		})();
	}, [props]);

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
            <div id="PolarisPortalsContainer" className="share_public_preview_link" >
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
                                        Share preview
                                        </h2>
                                    </div>
                                    <button
                                        className="Polaris-Modal-CloseButton"
                                        aria-label="Close"
                                        onClick={ () => {
                                            document.getElementsByClassName('share_public_preview_link')[0].style.display = "none"; 
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
                                                Share this preview link to view the <b>Custom Print Sheet</b> for the order.<br /><br />
                                                Anyone with this link can access the preview.<br /> <br />
                                                <div>
                                                    <div
                                                        className="Polaris-Stack Polaris-Stack--horizontal"
                                                    >
                                                        <input
                                                            id="PolarisTextField28"
                                                            className="Polaris-TextField__Input"
                                                            aria-describedby="PolarisTextField28CharacterCounter"
                                                            aria-labelledby="PolarisTextField28Label"
                                                            aria-invalid="false"
                                                            value={publicPreviewUrl}
                                                            style={{borderBlockColor: "darkgray"}}
                                                        />
                                                        <div
                                                            id="PolarisTextField28CharacterCounter"
                                                            className="Polaris-TextField__CharacterCount"
                                                            aria-label="11 of 20 characters used"
                                                            aria-live="off"
                                                            aria-atomic="true"
                                                        >
                                                        </div>
                                                        <section className="section">
                                                            <CopyToClipboard
                                                            options={{ debug: publicPreviewUrl, message: "" }}
                                                            onCopy={() => {settoggleActiveT(true)
                                                                setToggleMsg('Copied to clipboard')}}
                                                            text={publicPreviewUrl}
                                                            >
                                                            <button id="approveButton" className="Polaris-Button Polaris-Button--primary admin--approved" type="button" onClick={() => {settoggleActiveT(true)
                                                                setToggleMsg('Copied to clipboard')}}>
                                                                <span className="Polaris-Button__Content">
                                                                    <span className="Polaris-Button__Text">Copy Link</span>
                                                                </span>
                                                            </button>
                                                            </CopyToClipboard>
                                                        </section>
                                                    </div>
                                                    <div id="PolarisPortalsContainer"></div>
                                                </div>
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
                                                                document.getElementsByClassName('share_public_preview_link')[0].style.display = "none"; 
                                                            } }
                                                        >
                                                            <span className="Polaris-Button__Content">
                                                                <span className="Polaris-Button__Text">
                                                                    Close
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

export default SharePublicPreviewLink;
