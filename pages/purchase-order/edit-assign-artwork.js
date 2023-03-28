import React, { useState, useEffect, Fragment, useCallback, useRef} from 'react';
import {Button} from '@shopify/polaris';
import { useRouter } from "next/router";
import Image from 'next/image';
import Link from 'next/link';
import { Spinner, Modal, TextContainer, Tooltip, TextStyle } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import ArtworkList from '../artwork/list';
import EditCustomization from "../purchase-order/edit-customization";
import IconEdit from "../../images/icon_edit.png";
import IconDelete from "../../images/icon_delete.png";

let lineItems = {};
const EditAssignArtwork = (props) => {
	const router = useRouter();
	const params = JSON.parse(props.params);
	const productId = params.productId;
	const orderId = params.orderId;
	const [product, setProduct] = useState([]);
	const [puchaseOrder, setPurchaseOrder] = useState({});
	const [variants, setVariants] = useState({});
	const [loading, setLoading] = useState(true);
	const [placedArtwork, setPlacedArtwork] = useState([]);
	const [selectedSide, setSelectedSide] = useState('front');
	const [showModal, setShowModal] = useState(false);
	const [showArtModal, setArtCheckModal] = useState(false);
	const [uniqueKey, setUniqueKey] = useState("");
    const [message, setMessage] = useState("");
	const [active, setActive] = useState(true);
	const handleChange = useCallback(() => setArtCheckModal(!showArtModal), [showArtModal]);
	const [customizedProduct, setCustomizedProduct] = useState({});
	const assignArtwork = {};
	const [isFrontButtonActive, setIsFrontButtonActive] = useState(true);
	const [isBackButtonActive, setIsBackButtonActive] = useState(false);
	const [isSleeveButtonActive, setIsSleeveButtonActive] = useState(false);
	const [artsCountFlag, setArtsCountFlag] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [imageSized, setImageSized] = useState("");
	const isCancelled = useRef(false);
    const toggleShowModal = (modalStatus) => {
        setShowModal(modalStatus);
    }
	const handleFrontButtonClick = useCallback(() => {
		setIsFrontButtonActive(true);
		setIsBackButtonActive(false);
		setIsSleeveButtonActive(false);
	}, [isFrontButtonActive]);
	const handleBackButtonClick = useCallback(() => {
		setIsFrontButtonActive(false);
		setIsBackButtonActive(true);
		setIsSleeveButtonActive(false);
	}, [isBackButtonActive]);
	const handleSleeveButtonClick = useCallback(() => {
		setIsFrontButtonActive(false);
		setIsBackButtonActive(false);
		setIsSleeveButtonActive(true);
	}, [isSleeveButtonActive]);
	let customer = {};
	if (localStorage.getItem('customer')) {
		customer = JSON.parse(localStorage.getItem('customer'));
	}
	let preview = null;
	if (localStorage.getItem('preview')) {
		preview = JSON.parse(localStorage.getItem('preview'));
	}
	useEffect(() => {
		if (showModal) {
		  document.body.style.overflow = 'hidden';
		} else {
		  document.body.style.overflow = 'unset';
		}
	  }, [showModal]);

	useEffect(() => {
		isCancelled.current = false;
		router.prefetch("/header?tab=create-PO&page=poDetails&params=" + orderId);
		(async () => {
			try {
				setLoading(true);
				await getProduct();
				await getPurchaseOrder();
				if (isCancelled.current) {
					return false;
				}
				setArtsCountFlag(false);
				setLoading(false);
				let customizationInfo = localStorage.getItem('customizationInfo'); 
				if (customizationInfo) {
					getPlacedArtwork(customizationInfo);
				}
			} catch (e) {
				console.log(e);
			}
		})()
		return () => {
			isCancelled.current = true;
		};
	}, [props]);

	const getProduct = async (signal = null) => {
		let url = API.products + '/' + productId;
		const productDetails = await ApiHelper.get(url, signal);
		if (isCancelled.current) {
			return false;
		}
		if (productDetails && productDetails.message == 'success') {
			setProduct(productDetails.body.product);
			let sizedImg = productDetails.body.product.images[0].src;
			let sizedImgExt = sizedImg.split('?')[0].split('.').pop();
			sizedImg = sizedImg.replace('.'+sizedImgExt, '_360x.'+sizedImgExt);
			setImageSized(sizedImg);
		}
	};
	/* get purchase order detail by id */
	const getPurchaseOrder = async (signal = null) => {
        let url = API.puchaseOrder + '/' + orderId;
        const purchaseOrderDetails = await ApiHelper.get(url, signal);
		if (isCancelled.current) {
			return false;
		}
        if (purchaseOrderDetails && purchaseOrderDetails.message == "success") {
            setPurchaseOrder(purchaseOrderDetails.body.purchase_order);
			customer = purchaseOrderDetails.body.purchase_order.customer;
			let selectedCustomer = {
				"id": customer.id,
				"name": customer.name
			};
			localStorage.setItem('customer', JSON.stringify(selectedCustomer));
			lineItems = purchaseOrderDetails.body.purchase_order.line_items;
			let customizationDetails = JSON.parse(purchaseOrderDetails.body.purchase_order.metafield.value);
			let customizationElements = customizationDetails[productId];
			if (localStorage.getItem('customizationInfo') == null) {
				try {
					localStorage.setItem("customizationInfo", JSON.stringify(customizationElements));
				} catch(e) {
					console.log(e);
				}
			}

			/* Set the preview image from the endpoint data */
			if (!localStorage.getItem('preview')) {
				let customProduct = purchaseOrderDetails.body.purchase_order.customized_products[productId];
				let custom = {};
				if  (customProduct.custom_product_front != "") {
					custom["front"] = customProduct.custom_product_front;
				}
				if ( customProduct.custom_product_back != "") {
					custom["back"] = customProduct.custom_product_back;
				}
				if ( customProduct.custom_product_sleeve != "") {
					custom["sleeve"] = customProduct.custom_product_sleeve; 
				}
				if(custom["front"] != undefined && custom["front"] != ''){
					handleFrontButtonClick();
				} else if (custom["back"] != undefined && custom["back"] != ''){
					handleBackButtonClick();
				} else if(custom["sleeve"] != undefined && custom["sleeve"] != ''){
					handleSleeveButtonClick();
				}
				setCustomizedProduct(custom);
				localStorage.setItem("existingPreview", JSON.stringify(custom));
			}

			/* set line item details */
			let existingVariants = {};
			Object.keys(lineItems).map((key) => {
				lineItems[key].items.map((item, itemKey) => {
					existingVariants[item.variant_id] = {
						'variantId': item.variant_id,
						'quantity': item.quantity
					};
				})
			});
			setVariants(existingVariants);
        }
    }

	const getPlacedArtwork = (customizationInfo) => {
		customizationInfo = JSON.parse(customizationInfo);
		let arts = [];
		let customizationElements = customizationInfo.customization_elements;
		$.each(customizationElements, function(key, artElement) {
			if(Object.keys(artElement.art_image_array).length > 0){
				setArtsCountFlag(true);
			}
			if (artElement.art_image_status) {
				$.each(artElement.art_image_array, function(index, artImageData) {
					artImageData.side = key;
					arts.push(artImageData);
				});
			}
		});
		setPlacedArtwork(arts);
	};

	const saveUpdates = () => {
		setLoading(true);
		if (localStorage.getItem('customizationInfo') == null || localStorage.getItem('preview') == null) {
			router.replace("/header?tab=create-PO&page=poDetails&params=" + orderId);
		} else {
			let cartItems = [];
			cartItems[productId] = {
				'preview': localStorage.getItem('preview'),
				'customization_info': localStorage.getItem('customizationInfo'),
				'lineItems': variants
			}
			let cart = { 'items': Object.assign({}, cartItems) };
			localStorage.setItem("cartData", JSON.stringify(cart));
			updateDraftOrder(JSON.stringify(cart));
		}
	}	
	
	const saveArtUpdates = () => {
		let customizationInfo = localStorage.getItem('customizationInfo');
		customizationInfo = JSON.parse(customizationInfo);
		let arts = [];
		let customizationElements = customizationInfo.customization_elements;
		$.each(customizationElements, function(key, artElement) {
			if (artElement.art_image_status) {
				$.each(artElement.art_image_array, function(index, artImageData) {
					arts.push(artImageData);
				});
			}
		});
		if(arts.length == 0){
			setArtCheckModal(true);
			setErrorMessage("Please select at least one artwork.");
		} else if(arts.length >= 31){
			setArtCheckModal(true);
			setErrorMessage("The maximum count of artwork should be less than 30.");
		} else {
			saveUpdates();
		}
	}

	/* function to create draft order */
    const updateDraftOrder = async (cartDetails = null) => {
        $(".Polaris-Spinner--sizeLarge").css("display", "block");
        if (cartDetails != null) {
            let cartItems = JSON.parse(cartDetails).items;
            let fdataobj = new FormData(document.forms[0]);
            for (let prodId of Object.keys(cartItems)) {
                let preview = JSON.parse(cartItems[prodId].preview);
                dataURItoBlob(preview.front, fdataobj, 'front', prodId);
                dataURItoBlob(preview.back, fdataobj, 'back', prodId);
                dataURItoBlob(preview.sleeve, fdataobj, 'sleeve', prodId);
                delete cartItems[prodId].preview;
            }
            fdataobj.append('customer_id', customer.id);
            fdataobj.append('custom_product', JSON.stringify(cartItems));
			let url = API.puchaseOrder + "/" + orderId;
            const orderDetails = await ApiHelper.postFormData(url, fdataobj);
            $(".Polaris-Spinner--sizeLarge").css("display", "none");
            if (orderDetails && orderDetails.message == 'success') {
                let orderName = orderDetails.body.order_name;
                setMessage("Purchase order " + orderName + " is updated successfully");
                setTimeout(function () {
                    router.replace("/header?tab=create-PO&page=poDetails&params=" + orderId);
                }, 1000);
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
	

	return (
		<>
			<div
				className="Polaris-Tabs__Panel"
				id="create-po"
				role="tabpanel"
				aria-labelledby="Create-PO"
				tabIndex="-1"
			>
				<div className="Polaris-Card__Section" id="assign-art">
					{/* <!--Components--List--> */}
					<div className="list--breabcrumbs">
						<ul className="Polaris-List">
							<li className="Polaris-List__Item">
								<Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: orderId } }}>{puchaseOrder.name ? "PO Details - " + puchaseOrder.name : "PO Details" }</Link>
							</li>
							<li className="Polaris-List__Item breadcrumbs--icon">
								<Image src={IconArrow} alt="Icon arrow right" width={8} height={12} />
							</li>
							<li className="Polaris-List__Item">
								Assign Artwork
							</li>
						</ul>
						<div id="PolarisPortalsContainer"></div>
					</div>
					{/* <!--Components--DisplayText--> */}
					<div>
						<div className="display-text">
							{ customer.name != undefined ? (
								<>
								<div className="display-text--title">
									{ loading === false ? (
										<div>
											<p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
												{ "PO " + puchaseOrder.name } 
											</p>
										</div>
									) : null }
									{/* <!--Components--Tag--> */}
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
									{/* <!--Compnents--ButtonGroup--> */}
									<div>
										<div className="Polaris-ButtonGroup">
											<div className="Polaris-ButtonGroup__Item">
												<Link href={{ pathname: '/', query: { tab: 'create-PO', page: "poDetails", params: orderId },}}>
													<button className="Polaris-Button" type="button">
														<span className="Polaris-Button__Content">
															<span className="Polaris-Button__Text">
																Cancel
															</span>
														</span>
													</button>
												</Link>
											</div>
											<div className="Polaris-ButtonGroup__Item">
												<button id="save-variants"
													className="Polaris-Button Polaris-Button--primary"
													type="button" onClick={() => saveArtUpdates() }>
													<span className="Polaris-Button__Content">
														<span className="Polaris-Button__Text">
															Save Changes
														</span>
													</span>
												</button>
											</div>
										</div>
										<div id="PolarisPortalsContainer"></div>
									</div>
								</div>
								</>
							) : null }
						</div>
						<div id="PolarisPortalsContainer"></div>
					</div>
					<div>
						<div className="Polaris-Layout">
							<div className="Polaris-Layout__Section">
								<div>
									<div className="Polaris-Card">
										{loading ? (
											<Spinner
												accessibilityLabel="Spinner example"
												size="large"
											/>
										) : Object.keys(product).length > 0 ? (
											<>
												<div className="Polaris-Card__Section">
													<div>
														{/* <!--Components--DisplayText--> */}
														<div>
															<p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
																Assign Artwork
															</p>
															<div id="PolarisPortalsContainer"></div>
														</div>
														{/* <!--Components--Layout--> */}
														<div>
															<div className="Polaris-Layout assign_artwork--assign">
																<div className="Polaris-Layout__Section" style={{minWidth: '24%'}}>
																	{ artsCountFlag && preview !== null || customizedProduct != null ? (
																	<div>
																		{ isFrontButtonActive == true ? (<div className="pro_sides front-sides">
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
                                                                                <img src={preview !== null && preview.front !== undefined ? preview.front : customizedProduct !== null && customizedProduct.front !== undefined ? customizedProduct.front : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>) : (<div className="pro_sides front-sides" style={{display:"none"}}>
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
                                                                                <img src={preview !== null && preview.front !== undefined ? preview.front : customizedProduct !== null && customizedProduct.front !== undefined ? customizedProduct.front : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>)}

																		{ product.images.map((image, index) => {
																		return (
																			<Fragment key={ index } >
																				{image.alt == "back" ? isBackButtonActive == true ? (
																				<div className="pro_sides back-sides">
																					<div>
																						<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																						<img src={preview !== null && preview.back !== undefined ? preview.back : customizedProduct !== null && customizedProduct.back !== undefined ? customizedProduct.back : image.src} alt="Image"/>
																						</span>
																						<div id="PolarisPortalsContainer"></div>
																					</div>
																				</div>) : (
																				<div className="pro_sides back-sides" style={{display:"none"}}>
																					<div>
																						<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																						<img src={preview !== null && preview.back !== undefined ? preview.back : customizedProduct !== null && customizedProduct.back !== undefined ? customizedProduct.back : image.src} alt="Image"/>
																						</span>
																						<div id="PolarisPortalsContainer"></div>
																					</div>
																				</div>) : image.alt == "side" ? isSleeveButtonActive == true ? (
																					<div className="pro_sides sleeve-sides">
																						<div>
																							<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																							<img src={preview !== null && preview.sleeve !== undefined ? preview.sleeve : customizedProduct !== null && customizedProduct.sleeve !== undefined ? customizedProduct.sleeve : image.src} alt="Image"/>
																							</span>
																							<div id="PolarisPortalsContainer"></div>
																						</div>
																					</div>) : (
																					<div className="pro_sides sleeve-sides" style={{display:"none"}}>
																						<div>
																							<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																							<img src={preview !== null && preview.sleeve !== undefined ? preview.sleeve : customizedProduct !== null && customizedProduct.sleeve !== undefined ? customizedProduct.sleeve : image.src} alt="Image"/>
																							</span>
																							<div id="PolarisPortalsContainer"></div>
																						</div>
																					</div>) : null }
																			</Fragment>
																		)
																	})}
																	</div>
																 ) : (
																	<div className="pro_sides front-sides">
																		<div>
																			<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																				<img src={imageSized} alt="Image"/>
																			</span>
																			<div id="PolarisPortalsContainer"></div>
																		</div>
																	</div>
																 ) } 
																 { artsCountFlag ? (
																	<div style={{marginTop: '3%'}}>
																		<div className="Polaris-ButtonGroup">
																			<div className="Polaris-ButtonGroup__Item">
																				<Button
																					className="Polaris-Button"
																					type="button"
																					pressed={isFrontButtonActive}
																					onClick={ () => { 
																						handleFrontButtonClick();
																						$(".pro_sides").css("display","none");
																						$(".front-sides").css("display","block");
																					} }
																				>
																					<span className="Polaris-Button__Content">
																						<span className="Polaris-Button__Text">
																							Front
																						</span>
																					</span>
																				</Button>
																			</div>
																			<div className="Polaris-ButtonGroup__Item" style={{marginLeft: '11%'}}>
																				<Button
																					className="Polaris-Button"
																					type="button"
																					pressed={isBackButtonActive}
																					onClick={ () => { 
																						handleBackButtonClick();
																						$(".pro_sides").css("display","none");
																						$(".back-sides").css("display","block");
																					} }
																				>
																					<span className="Polaris-Button__Content">
																						<span className="Polaris-Button__Text">
																							Back
																						</span>
																					</span>
																				</Button>
																			</div>
																			<div className="Polaris-ButtonGroup__Item" style={{marginLeft: '10%'}}>
																				<Button
																					className="Polaris-Button"
																					type="button"
																					pressed={isSleeveButtonActive}
																					onClick={ () => { 
																						handleSleeveButtonClick();
																						$(".pro_sides").css("display","none");
																						$(".sleeve-sides").css("display","block");
																					} }
																				>
																					<span className="Polaris-Button__Content">
																						<span className="Polaris-Button__Text">
																							Sleeve
																						</span>
																					</span>
																				</Button>
																			</div>
																		</div>	
																	</div>
																	) : null }
																</div>
																<div className="Polaris-Layout__Section">
																	<div>
																		<div className="Polaris-Card__Header">
																			<h2 className="Polaris-Heading">
																				{ product.title }
																			</h2>
																		</div>
																		{ placedArtwork.length == 0 ? (
																			<div className="Polaris-Card__Section">
																				<p>
																					Assign and Place artwork below
																				</p>
																			</div>
																		) : (	
																			<div className="Polaris-Card__Section">
																				<div>
																					<span className="Polaris-Tag Polaris-Tag color--blue Margin-left-5">
																						Garments Selected
																					</span>
																					<span className="Polaris-Tag Polaris-Tag color--purple Margin-left-5">
																						Artwork Assigned
																					</span>
																					<div id="PolarisPortalsContainer"></div>
																				</div>
																				<div>
																					<div>
																						<div className="Polaris-Page-Header Polaris-Page-Header--isSingleRow Polaris-Page-Header--mobileView Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
																							<div className="Polaris-Page-Header__Row">
																								<div className="Polaris-Page-Header__TitleWrapper">
																									<div>
																										<div className="Polaris-Header-Title__TitleAndSubtitleWrapper">
																											<h1 className="Polaris-Header-Title">
																												Artwork
																											</h1>
																										</div>
																									</div>
																								</div>
																							</div>
																						</div>
																						<div className="Polaris-Page__Content">
																							<div>
																								<div>
																									<div className="Polaris-DataTable__Navigation">
																										<button
																											className="Polaris-Button Polaris-Button--disabled Polaris-Button--plain Polaris-Button--iconOnly"
																											aria-label="Scroll table left one column"
																											type="button"
																											disabled=""
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
																										<button
																											className="Polaris-Button Polaris-Button--plain Polaris-Button--iconOnly"
																											aria-label="Scroll table right one column"
																											type="button"
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
																									</div>
																									<div className="Polaris-DataTable">
																										<div className="Polaris-DataTable__ScrollContainer">
																											<table className="Polaris-DataTable__Table">
																												<thead>
																													<tr>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
																															scope="col"
																														>
																															SKU
																														</th>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
																															scope="col"
																														>
																															NAME
																														</th>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
																															scope="col"
																														>
																															ARTWORK TYPE
																														</th>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
																															scope="col"
																														>
																															ARTWORK INSTRUCTIONS	
																														</th>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
																															scope="col"
																														>
																															NUMBER OF COLORS
																														</th>
																														<th
																															data-polaris-header-cell="true"
																															className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
																															scope="col"
																														></th>
																													</tr>
																												</thead>
																												<tbody>
																													{ placedArtwork.map((placedArt, index) => {
																														return (
																															<tr className="Polaris-DataTable__TableRow" key={ index }>
																																<th
																																	className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
																																	scope="row"
																																>
																																	{ placedArt.id }
																																</th>
																																<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																	{ placedArt.name.substring(0, 20) }
																																</td>
																																<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																	{ placedArt.type !== "undefined" &&  placedArt.type !== "null" ? placedArt.type.substring(0, 20) : "" }
																																</td>
																																<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																	{placedArt.instruction.length > 20 ? 
																																		(<Tooltip content={placedArt.instruction} dismissOnMouseOut>																					
																																	  		<TextStyle>{ placedArt.instruction.substring(0, 20) }</TextStyle>
																																		</Tooltip>)
																																	: placedArt.instruction.substring(0, 20)}
																																</td>
																																<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																	{ placedArt.color }
																																</td>
																																<td	className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																	<div className="Polaris-ButtonGroup">
																																		<div className="Polaris-ButtonGroup__Item">
																																		<span className="Polaris-Icon" style={{ cursor: "pointer" }} onClick={ () => {
																																			setSelectedSide(placedArt.side);
																																			setUniqueKey(new Date().getUTCMilliseconds())
																																			if (document.getElementsByClassName('edit__artwork_modal')[0]) {
																																				document.getElementsByClassName('edit__artwork_modal')[0].style.display = "block";
																																			}
																																			if (document.getElementsByClassName('front-side')[0]) {
																																				document.getElementsByClassName("front-side")[0].style.display = "block";
																																			}
																																			setShowModal(true)}}>
																																			<span className="Polaris-Button__Content">
																																				<img src={IconEdit} alt="Edit"/>
																																			</span>
																																		</span>
																																		</div>
																																		<div className="Polaris-ButtonGroup__Item">
																																		<span className="Polaris-Icon" style={{ cursor: "pointer" }} onClick={ () => {
																																			setSelectedSide(placedArt.side);
																																			setUniqueKey(new Date().getUTCMilliseconds())
																																			if (document.getElementsByClassName('edit__artwork_modal')[0]) {
																																				document.getElementsByClassName('edit__artwork_modal')[0].style.display = "block";
																																			}
																																			if (document.getElementsByClassName('front-side')[0]) {
																																				document.getElementsByClassName("front-side")[0].style.display = "block";
																																			}
																																			setShowModal(true)}}>
																																				<span className="Polaris-Button__Content">
																																					<img src={IconDelete} alt="Remove"/>
																																				</span>
																																			</span>
																																		</div>
																																	</div>
																																</td>
																															</tr>
																														)
																													}) }
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
																				<div>
																					<div className="Polaris-ButtonGroup">
																						<div className="Polaris-ButtonGroup__Item">
																							<button
																								className="Polaris-Button"
																								type="button"
																								onClick={ () => {
																									setUniqueKey(new Date().getUTCMilliseconds())
																									if (document.getElementsByClassName('edit__artwork_modal')[0]) {
																										document.getElementsByClassName('edit__artwork_modal')[0].style.display = "block";
																									}
																									if (document.getElementsByClassName('front-side')[0]) {
																										document.getElementsByClassName("front-side")[0].style.display = "block";
																									}
																									setShowModal(true);
																								}}
																							>
																								<span className="Polaris-Button__Content">
																									<span className="Polaris-Button__Text">
																										Edit Artwork
																									</span>
																								</span>
																							</button>
																						</div>
																						<div className="Polaris-ButtonGroup__Item">
																							<Link href={{ pathname: "/", query: { tab: "create-PO", page: "editColorSizeQuantity", params: JSON.stringify({"product": product, "orderId": orderId, "orderName": puchaseOrder.name, "lineItems" : variants}) } }}>
																								<button className="Polaris-Button Polaris-Button--primary" type="button">
																									<span className="Polaris-Button__Content">
																										<span className="Polaris-Button__Text">
																											Choose Sizes and Quantities
																										</span>
																									</span>
																								</button>
																							</Link>
																						</div>
																					</div>
																					<div id="PolarisPortalsContainer"></div>
																				</div>
																			</div>
																		)}
																	</div>
																</div>
															</div>
															<div id="PolarisPortalsContainer"></div>
														</div>
													</div>
												</div>
												{/* <!--Components--DisplayText--> */}
 												<ArtworkList product={product} orderId={ orderId } type="orderUpdate" />
											</>
										) : null}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{ showModal === true ? (
				<EditCustomization toggleShowModal={toggleShowModal} product={ product } artwork={ assignArtwork } uniqueKey={ uniqueKey } display="block" orderId={ orderId } type="orderUpdate" selectedSide={selectedSide} />
			) : null }
			{showArtModal === true ? (
                <div style={{height: '500px'}}>
				<Modal
					small
				  open={active}
				  onClose={handleChange}
				  primaryAction={{
					content: 'Okay',
					onAction: handleChange,
				  }}
				>
				  <Modal.Section>
					<TextContainer>
					  <p>
						{ errorMessage }
					  </p>
					</TextContainer>
				  </Modal.Section>
				</Modal>
			  </div>
            ) : null}
		</>
	);
};

export default EditAssignArtwork;
