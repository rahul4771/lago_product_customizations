import React, { useState, useEffect, useCallback, useRef } from 'react';
import {Button, Tooltip, TextStyle } from '@shopify/polaris';
import Image from 'next/image';
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Spinner } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import ArtworkList from '../artwork/list';
import EditCustomization from "../purchase-order/edit-customization";
import IconEdit from "../../images/icon_edit.png";
import IconDelete from "../../images/icon_delete.png";

const AssignArtwork = (props) => {
	const productId = props.productId;
	const [product, setProduct] = useState([]);
	const [loading, setLoading] = useState(true);
	const [placedArtwork, setPlacedArtwork] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [uniqueKey, setUniqueKey] = useState("");
	const [selectedSide, setSelectedSide] = useState('front');
	const assignArtwork = {};
	let customer = null;
	const [isFrontButtonActive, setIsFrontButtonActive] = useState(true);
	const [isBackButtonActive, setIsBackButtonActive] = useState(false);
	const [isSleeveButtonActive, setIsSleeveButtonActive] = useState(false);
	const [artsCountFlag, setArtsCountFlag] = useState(false);
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
	if (localStorage.getItem('customer')) {
		customer = JSON.parse(localStorage.getItem('customer'));
	}
	let setSignal = null;
	let controller = null;
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
		try {
			controller = new AbortController();
			setSignal = controller.signal;
			getProduct(setSignal);
			setArtsCountFlag(false);
			let customizationInfo = localStorage.getItem('customizationInfo'); 
			if (customizationInfo) {
				getPlacedArtwork(customizationInfo);
			}
			return () => {
				isCancelled.current = true;
				if (setSignal) {
					controller.abort();
				}
			};
		} catch (e) {
			console.log(e);
		}
		
	}, [props]);

	const getProduct = async (signal = null) => {
		let url = API.products + '/' + productId;
		setLoading(true);
		const productDetails = await ApiHelper.get(url, signal);
		if (isCancelled.current) {
			return false;
		}
		setLoading(false);
		if (productDetails && productDetails.message == 'success') {
			setProduct(productDetails.body.product);
			let sizedImg = productDetails.body.product.images[0].src;
			let sizedImgExt = sizedImg.split('?')[0].split('.').pop();
			sizedImg = sizedImg.replace('.'+sizedImgExt, '_360x.'+sizedImgExt);
			setImageSized(sizedImg);
		}
	};

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
		if(customizationElements.front != undefined && customizationElements.front != ''){
			handleFrontButtonClick();
		} else if (customizationElements.back != undefined && customizationElements.back != ''){
			handleBackButtonClick();
		} else if(customizationElements.sleeve != undefined && customizationElements.sleeve != ''){
			handleSleeveButtonClick();
		}
		setPlacedArtwork(arts);
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
				<div className="Polaris-Card__Section" id="assign-art">
					{/* <!--Components--List--> */}
					<div className="list--breabcrumbs">
						<ul className="Polaris-List">
							<li className="Polaris-List__Item">
								<Link href={{ pathname: "/", query: { tab: "create-PO", page: "create" } }}>Create PO</Link>
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
								Assign Artwork
							</li>
						</ul>
						<div id="PolarisPortalsContainer"></div>
					</div>
					{/* <!--Components--DisplayText--> */}
					<div>
						<div className="display-text">
							<div className="display-text--title">
								{/* <!--Components--Tag--> */}
								<div>
									<span className="Polaris-Tag color--purple">
										<span className="Polaris-Tag__TagText">
											{customer.name}
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
											<Link href={{ pathname: '/', query: { tab: 'create-PO' },}}>
												<button className="Polaris-Button" type="button">
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
																{ preview !== null ? (
																	<div>
																		{isFrontButtonActive == true ? (<div className="pro_sides front-sides">
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && preview.front !== undefined ? preview.front : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>) : (<div className="pro_sides front-sides" style={{display:"none"}}>
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && preview.front !== undefined ? preview.front : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>)}
																		{isBackButtonActive == true ? (<div className="pro_sides back-sides">
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && preview.back !== undefined ? preview.back : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>) : (<div className="pro_sides back-sides" style={{display:"none"}}>
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && (preview.back !== undefined || preview.back != "data:,") ? preview.back : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>)}
																		{isSleeveButtonActive == true ? (<div className="pro_sides sleeve-sides">
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && (preview.sleeve !== undefined || preview.sleeve != "data:,") ? preview.sleeve : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>) : (<div className="pro_sides sleeve-sides" style={{display:"none"}}>
																			<div>
																				<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																					<img src={preview !== null && preview.sleeve !== undefined ? preview.sleeve : imageSized} alt="Image"/>
																				</span>
																				<div id="PolarisPortalsContainer"></div>
																			</div>
																		</div>)}
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

																	{ artsCountFlag && preview !== null ? (
																		<div style={{marginTop : "3%"}}>
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
																																	{/* <a href="#"> */}
																																		{ placedArt.name.substring(0, 20) }
																																	{/* </a> */}
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
																							<Link href={{ pathname: "/", query: { tab: "create-PO", page: "assignColorSizeQuantity", params: JSON.stringify(product) } }}>
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
												{product &&
 												<ArtworkList product={product} type="orderCreate" />
												}
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
				<EditCustomization toggleShowModal={toggleShowModal} product={ product } artwork={ assignArtwork } uniqueKey={ uniqueKey } display="block" type="orderCreate" selectedSide={selectedSide} />
			) : null }
		</>
	);
};

export default AssignArtwork;
