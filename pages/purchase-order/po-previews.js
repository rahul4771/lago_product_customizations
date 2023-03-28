import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Spinner, InlineError, Frame, Toast, TextStyle} from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import momentTimezone from 'moment-timezone';
import SharePublicPreviewLink from "../purchase-order/share-public-preview";
let artworkSidesArray = {};

const PurchaseOrderDetails = (props) => {
	localStorage.removeItem('customizationInfo');
	localStorage.removeItem('preview');
	localStorage.removeItem('existingPreview');
	localStorage.removeItem('cartData');
	localStorage.removeItem('customer');
	const router = useRouter();
	const urlQueryString = window.location.search;
	const urlParams =new URLSearchParams(urlQueryString);
	const orderId = urlParams.get('id');
	const [puchaseOrder, setPurchaseOrder] = useState({});
	const [customer, setCustomer] = useState({});
	const [lineItems, setLineItems] = useState({});
	const [loading, setLoading] = useState(true);
	const [poDetails, setPoDetails] = useState({});
	const [commendDetails, setCommendDetails] = useState([]);
	const [commendStatus, setCommendStatus] = useState(false);
	const [commend, setCommend] = useState('');
	const [validation, setValidation] = useState(false);
	const [customerName, setCustomername] = useState('');
	const [lineItemKey, setLineItemKey] = useState('');
	const [showPopUp, setShowPopUp] = useState(false);
	const [toggleActiveT, settoggleActiveT] = useState(false);
	const [approvedFlag, setApprovedFlag] = useState(false);
	const [customization, setCustomization] = useState([]);
	const [productName, setProductName] = useState("");
	const [requiredBy, setRequiredBy] = useState("");
	const [createdCustomer, setCreatedCustomer] = useState("");
	const [artworks, setArtworks] = useState([]);
	const [name, setName] = useState("");
	const [products, setProducts] = useState([]);
	const [allArtworks, setAllArtworks] = useState({});
	const [productArtworks, setProductArtwork] = useState([]);
	const [productNames, setProductNames] = useState('');
	const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
	const handleChange = useCallback(() => setShowPopUp(!showPopUp), [showPopUp]);
    const toggleShowModal = (showPopUp) => {
        setShowPopUp(showPopUp);
    }
	let setSignal = null;
	let controller = null;
	let dates = [];

	useEffect(() => {
		try {
			controller = new AbortController();
			setSignal = controller.signal;
			getPurchaseOrder(setSignal);
			getOrderPreviews(null, setSignal);
			getCommendOnOrder();
			return () => {
				if (setSignal) {
					controller.abort();
				}
			};
		} catch (e) {
			console.log(e);
		}
	}, []);

	const getOrderPreviews = async (cursor = null, value = null, signal = null) => {
		setLoading(true);
		const url = API.orderPreviews + '/' + orderId;
		const orderPreviews = await ApiHelper.get(url, signal);
		if (orderPreviews && orderPreviews.message == "success") {
			let customizedArray = orderPreviews.body.purchase_order.customized_products;
			var productTotalArtwork = orderPreviews.body.purchase_order.productArtwork;
			Object.keys(customizedArray).map((key) => {
				artworkSidesArray= Object.assign(artworkSidesArray, {[key]: {}});
				let productArtworkArray = productTotalArtwork[key];
				Object.entries(productArtworkArray).map(([keys, values]) => {
					if(keys == 'front' || keys == 'back' || keys == 'sleeve') {
						let artworks = values;
						Object.values(artworks).map((artwork) => {
							artworkSidesArray[key] = Object.assign(artworkSidesArray[key], {[keys]: artwork});
						});
					} else if (keys == 'artworks'){
						let artworkUpdated= Object.assign(artworks, {[key]: values});
						setArtworks(artworkUpdated);
					}
				});
			});
			setProductArtwork(artworkSidesArray);
			setPurchaseOrder(orderPreviews.body.purchase_order);
			setName(orderPreviews.body.purchase_order.name);
			setRequiredBy(orderPreviews.body.purchase_order.required_by);
			setCustomer(orderPreviews.body.purchase_order.customer);
			setCreatedCustomer(orderPreviews.body.purchase_order.createdCustomer);
			const customizedProducts = orderPreviews.body.purchase_order.customized_products;
			let customizedProductID = null;
			[customizedProductID] = Object.keys(orderPreviews.body.purchase_order.customized_products);
			setCustomization(customizedArray);
			const product = orderPreviews.body.purchase_order.productNames.hasOwnProperty(customizedProductID) ? orderPreviews.body.purchase_order.productNames[customizedProductID] : null;
			setProductNames(orderPreviews.body.purchase_order.productNames);
			setProductName(product);
			let productImage = [];
			const allProducts = orderPreviews.body.purchase_order.productById[0];
			Object.entries(allProducts).map(([key, allProduct]) => {
				let side = allProduct.alt == "front" ? "front" : allProduct.alt == "back" ? "back" : allProduct.alt == "side" ? "sleeve" : null;
				productImage[side] = allProduct.src;
			});
			setProducts(productImage);
			setAllArtworks(orderPreviews.body.purchase_order.productArtwork);
		}
		setLoading(false);
	  };

	const getPurchaseOrder = async (signal) => {
		let url = API.puchaseOrder + '/' + orderId;
		setLoading(true);
		const purchaseOrderDetails = await ApiHelper.get(url, signal);
		if (purchaseOrderDetails && purchaseOrderDetails.message == 'success') {
			setPurchaseOrder(purchaseOrderDetails.body.purchase_order);
			setCustomer(purchaseOrderDetails.body.purchase_order.customer);
			setLineItems(purchaseOrderDetails.body.purchase_order.line_items);
			let data = {};
			data['orderId'] = purchaseOrderDetails.body.purchase_order.id;
			data['orderName'] = purchaseOrderDetails.body.purchase_order.name;
			data['orderCustomer'] = purchaseOrderDetails.body.purchase_order.customer;
			data['requiredBy'] = purchaseOrderDetails.body.purchase_order.required_by;
			data['orderInstruction'] = purchaseOrderDetails.body.purchase_order.instruction;
			data['lineItems'] = purchaseOrderDetails.body.purchase_order.line_items;
			setPoDetails(data);
			setLoading(false);
			let customerFullName = data['orderCustomer'].name.split(/\s/).reduce((response, word) => (response += word.slice(0, 1)), '');
			customerFullName = customerFullName.slice(0, 2);
			if (customerFullName.length == 1) {
				customerFullName = data['orderCustomer'].name.slice(0, 2);
			}
			setCustomername(customerFullName);
		}
	};

	const validator = () => {
		try {
            let commendAdded = commend;
            commendAdded = commendAdded.trim();
            setCommend(commendAdded);
            if (commendAdded != '') {
				postCommendOnOrder();
				setValidation(false);
				return () => {
					if (setSignal) {
						controller.abort();
					}
				};
			} else {
				setValidation(true);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getCommendOnOrder = async () => {
        let url = API.orderComments + '/' + orderId;
        const getOrderCommend = await ApiHelper.get(url, null);
        let data = null;
        if (getOrderCommend && getOrderCommend.message == 'success') {
            let commentArray = getOrderCommend.body.comments;
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            for (let props in commentArray) {
                let year = commentArray[props].created_at.slice(0, 4);
                let month = Number(commentArray[props].created_at.slice(5, 7));
                let date = commentArray[props].created_at.slice(8, 10);
                let hours = commentArray[props].created_at.slice(11, 13); 
				let minutes = commentArray[props].created_at.slice(14, 16);
                let ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                let strTime = hours + ':' + minutes + ' ' + ampm;
                let created_date = monthNames[month-1] + ' ' + date + ', ' + year;
                data = {
                    order_id: commentArray[props].order_id,
                    comment: commentArray[props].comment.replace(/'/g, ''),
                    from: commentArray[props].sender_type,
                    to: commentArray[props].receiver_type,
                    created_date: created_date,
                    created_time: strTime,
                    created_at: commentArray[props].created_at,
                };
                Array.prototype.push.apply(commendDetails, [data]);
            }
        }
    };

	const postCommendOnOrder = async () => {
        let currentComment = commend;
        setCommend('');
		let url = API.orderComments;
		let newDateUS = new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
		let newDate = new Date(newDateUS.replace(/-/g, "/"));
		let date = newDate.getDate();
		let month = newDate.getMonth() + 1;
		let year = newDate.getFullYear();
		let momentTimeCreatedAt = momentTimezone().tz("America/Los_Angeles").format('YYYY-MM-DD HH:mm:ss');
		let momentCreatedAt = momentTimeCreatedAt.slice(0, 10);
		const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		let currentYear = momentCreatedAt.slice(0, 4);
		let currentMonth = Number(momentCreatedAt.slice(5, 7));
		let currentDay = momentCreatedAt.slice(8, 10);
		let created_date = monthNames[currentMonth-1] + ' ' + currentDay + ', ' + currentYear;
		let time = new Intl.DateTimeFormat('default', {
			hour12: true,
			hour: 'numeric',
			minute: 'numeric',
		}).format(new Date(momentTimeCreatedAt.replace(/-/g, "/")));
		let data = {
			order_id: orderId,
			comment: currentComment,
			from: 'admin',
			to: customer.id,
			created_date: created_date,
			created_time: time,
			created_at: year + '-' + month + '-' + date,
			created_on: momentTimeCreatedAt,
		};
		commendDetails.unshift(data);
        if(currentComment != ''){
			const postOrderCommend = await ApiHelper.post(url, data, null);
			setCommendStatus(true);
		}
	};

	return (
		<div className="Polaris-Tabs__Panel customer__approval" id="create-po" role="tabpanel" aria-labelledby="Create-PO" tabIndex="-1">
			<div className="Polaris-Card__Section">
				<div className="list--breabcrumbs">
					<ul className="Polaris-List">
						<li className="Polaris-List__Item">PO Details</li>
					</ul>
					<div id="PolarisPortalsContainer"></div>
				</div>

				{loading === false ? (
					<div>
						<div className="display-text">
							<div className="display-text--title">
								<div>
									<p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">{'PO ' + puchaseOrder.name}</p>
								</div>
								<div className="purchase__orders">
									<span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
										<span className="Polaris-Tag__TagText">
											{status}
										</span>
									</span>
									<div id="PolarisPortalsContainer"></div>
								</div>
							</div>
							<div>
								<div>
									<div className="Polaris-ButtonGroup">
									<div className="Polaris-ButtonGroup__Item">
                                        <button
                                        className="Polaris-Button Polaris-Button--primary"
                                        type="button"
                                        onClick={() => { setShowPopUp(true);
											if (document.getElementsByClassName('share_public_preview_link')[0]) {
												document.getElementsByClassName('share_public_preview_link')[0].style.display = "block";
											} }}
                                        >
                                        <span className="Polaris-Button__Content">
                                            <span className="Polaris-Button__Text">
                                            <TextStyle variation="strong" preferredPosition="above">Share Preview</TextStyle>
                                            </span>
                                        </span>
                                        </button>
                                    </div>
										<div className="Polaris-ButtonGroup__Item">
											<Link href={{ pathname: '/', query: { tab: 'all-POs' } }}>
												<button className="Polaris-Button" type="button">
													<span className="Polaris-Button__Content">
														<span className="Polaris-Button__Text">Cancel</span>
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
				) : null}
				<div id="po-details">
					<div className="Polaris-Layout">
						<div className="Polaris-Layout__Section">
							<div>
								<div className="Polaris-Card">
									<div className="Polaris-Card__Section">

										<div classNameName="Polaris-Tabs__Panel" id="create-po" role="tabpanel" aria-labelledby="Create-PO" tabindex="-1">
										{loading ? (
											<Spinner accessibilityLabel="Spinner example" size="large" />
										) : customization != "" ? (
											<div className="Polaris-Card__Section">
											<div className="list--breabcrumbs">
												<div id="PolarisPortalsContainer"></div>
											</div>
											<div>
												<div className="all-preview">
													<div className=" dropdown_selections">
														<div className="Polaris-DataTable">
															<div className="Polaris-DataTable__ScrollContainer">
																<table className="Polaris-DataTable__Table">
																	<thead>
																		<tr>
																			<td data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header" scope="col">
																				<span className="">ORDER</span>
																				<br />
																				<span className="">{name}</span>
																			</td>
																			<td data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header" scope="col">
																				<span className="">REQUIRED BY</span>
																				<br />
																				<span className="">{requiredBy != "" &&  requiredBy != null ? requiredBy: "- -"}</span>
																			</td>
																			<td data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header" scope="col">
																				<span className="">CREATED BY</span>
																				<br />
																				<span className="">{createdCustomer != null && createdCustomer != 'admin' ? createdCustomer.first_name : "Admin"}</span>
																			</td>
																			<td data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header" scope="col">
																				<span className="">CUSTOMER</span>
																				<br />
																				<span className="">{customer.name}</span>
																			</td>
																			<td data-polaris-header-cell="true" className="Polaris-DataTable__Cell Polaris-DataTable__Cell--header" scope="col">
																				<span className="">CONTACT INFORMATION</span>
																				<br />
																				<span className=""><a href={`mailto:${customer.email}&subject=Order${name}&body=Hi CUSTOMER,`}>{customer.email}</a></span>
																			</td>
																		</tr>
																	</thead>
																</table>
															</div>
														</div>
													</div>
												</div>
												<div id="PolarisPortalsContainer"></div>
											</div>
											{Object.keys(customization).map((keyID) => {
												let product = productNames.hasOwnProperty(keyID) ? productNames[keyID] : null;
												let artworkSidesArrayProduct = artworkSidesArray[keyID];
												return(
													<>
													<div className="display-text">
												<div className="display-text--title">
													<div>
														<p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">{product}</p>
													</div>
													<div>
														<div id="PolarisPortalsContainer"></div>
													</div>
												</div>
											</div>
											<div>
												<div className="Polaris-Layout">
												<div className="Polaris-Layout__Section">
													<div>
													<div className="Polaris-Card">
														<div className="Polaris-Card__Section">
														<div>
															<div>
															{/* <p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall"></p> */}
															<div id="PolarisPortalsContainer"></div>
															</div>

															<div>
															{Object.entries(customization[keyID]).map(([key, value]) => {
																let side = "";
																if (key == "custom_product_front") {
																side = "front";
																} else if (key == "custom_product_back") {
																side = "back";
																} else if (key == "custom_product_sleeve") {
																side = "sleeve";
																}
																return key == "custom_product_front" || key == "custom_product_back" || key == "custom_product_sleeve" ? (
																<div className="Polaris-Layout assign_artwork--assign">
																	<div className="Polaris-Layout__Section flex-2">
																	<div>
																		<div>
																		<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																			{value != "" ? <img src={value} alt="Image" /> : null}
																			{value == "" && <img src={products[side]} alt={side} />}
																		</span>
																		<div id="PolarisPortalsContainer"></div>
																		</div>
																	</div>
																	</div>
																	<div className="Polaris-Layout__Section">
																	<div>
																		<div className="Polaris-Card__Header">
																		<h2 className="Polaris-Heading">{key == "custom_product_front" ? "Custom Product Rendering - Front" : key == "custom_product_back" ? "Custom Product Rendering - Back" : key == "custom_product_sleeve" ? "Custom Product Rendering - Sleeve" : null}</h2>
																		</div>
																		<div className="Polaris-Card__Section">
																		<p>{value != "" ? "Artwork:" : "No customization"}</p>
																		</div>
																		{value != "" ? (
																		<div>
																			<div className="Polaris-DataTable__Navigation">
																			<button className="Polaris-Button Polaris-Button--disabled Polaris-Button--plain Polaris-Button--iconOnly" aria-label="Scroll table left one column" type="button" disabled="">
																				<span className="Polaris-Button__Content">
																				<span className="Polaris-Button__Icon">
																					<span className="Polaris-Icon">
																					<svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
																						<path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
																					</svg>
																					</span>
																				</span>
																				</span>
																			</button>
																			<button className="Polaris-Button Polaris-Button--plain Polaris-Button--iconOnly" aria-label="Scroll table right one column" type="button">
																				<span className="Polaris-Button__Content">
																				<span className="Polaris-Button__Icon">
																					<span className="Polaris-Icon">
																					<svg viewBox="0 0 20 20" className="Polaris-Icon__Svg" focusable="false" aria-hidden="true">
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
																				<tbody>
																					{Object.keys(productArtworks[keyID]).map((sideKey) => {
																						let productArtwork = productArtworks[keyID][sideKey];
																						return productArtwork != null || productArtwork != undefined ? (
																							<>
																							{Object.entries(productArtwork).map((artwork) => {
																								let artworkImage = artwork[1]["image_url"];
																								artworkImage = artworkImage.split('"');
																								artworkImage = artworkImage.slice(1, -1);
																								return (
																								<>
																									<tr className="Polaris-DataTable__TableRow">
																									<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn" scope="row">
																										<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeMedium cart-img" style={{ float: "left" }}>
																										<img src={artworkImage} alt="Hoody" />
																										</span>
																									</td>
																									<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">{artwork[1]["name"]}</td>
																									</tr>
																								</>
																								);
																							})}
																							</>
																						) : null;
																					})}
																				</tbody>
																				</table>
																			</div>
																			</div>
																		</div>
																		) : null}
																	</div>
																	</div>
																</div>
																) : null;
															})}
															<div id="PolarisPortalsContainer"></div>
															</div>
														</div>
														</div>

														<div className="Polaris-Card__Section assign_artwork--tabs">
														<div>
															<div>
															<p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">All Artwork:</p>
															<div id="PolarisPortalsContainer"></div>
															</div>

															<div className="Polaris-Card__Section assign_artwork--tabs">
															<div>
																<div className="Polaris-Tabs__Panel" id="" role="tabpanel" aria-labelledby="" tabindex="-1">
																<div className="Polaris-Tabs__Panel--columns">
																	{Object.entries(artworks[keyID]).map(([key, value]) => {
																	let artImage = value;
																	artImage = artImage.split('"');
																	artImage = artImage.slice(1, -1);
																	return (
																		<div className="artwork__placed artwork__box" id="artwork_422">
																		<div className="">
																			<div className="Polaris-MediaCard">
																			<div className="Polaris-MediaCard__MediaContainer">
																				<img
																				alt=""
																				width="100%"
																				height="120"
																				src={artImage}
																				style={{
																					objectFit: "contain",
																					objectPosition: "center center",
																				}}
																				/>
																			</div>
																			<div className="Polaris-MediaCard__InfoContainer">
																				<div className="Polaris-Card__Section">
																				<div className="Polaris-Stack Polaris-Stack--vertical Polaris-Stack--spacingTight">
																					<div className="Polaris-Stack__Item">
																					<div className="Polaris-MediaCard__Heading">
																						<p style={{ wordBreak: "break-all" }}>{key}</p>
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
																	);
																	})}
																	<div id="PolarisPortalsContainer">
																	<div data-portal-id="popover-Polarisportal8"></div>
																	</div>
																</div>
																</div>
															</div>
															</div>

															<div id="PolarisPortalsContainer">
															<div data-portal-id="popover-Polarisportal3"></div>
															</div>
														</div>
														</div>
													</div>
													</div>
												</div>
												</div>
											</div>
											</>
												);
												})
											}
											</div>
										) : null}
										</div>

										{Object.keys(lineItems).map((key) => {
											{
												lineItems[key].status == 'pendingAdminApproval' ? status='Awaiting Admin Approval':
												lineItems[key].status == 'pendingCustomerApproval' ? status='Awaiting Client Approval':
												lineItems[key].status == 'customerApproved' ? status='Client Approved':
												lineItems[key].status == 'adminApproved' ? status='Admin Approved': null
											}
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{loading === false ? (
				<div className="Polaris-Card__Section">
					<div>
						<h2 className="Polaris-Heading customer--heading">Conversations</h2>
						<div className="customer--user">
							<span aria-label="Farrah" role="img" className="Polaris-Avatar Polaris-Avatar--sizeMedium">
								<span className="Polaris-Avatar__Initials">LA</span> 
							</span>
							<span className="custom_input_btn">
								<div className="Polaris-Connected" style={{ width: '94%', float: 'left' }}>
									<div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
										<div className="Polaris-TextField Polaris-TextField--hasValue">
											<input
												id="PolarisTextField28"
												className="Polaris-TextField__Input"
												aria-describedby="PolarisTextField28CharacterCounter"
												aria-labelledby="PolarisTextField28Label"
												aria-invalid="false"
												value={commend}
												onBlur={(event) => setCommend(event.target.value)}
												onChange={(event) => setCommend(event.target.value)}
												onKeyUp={(event) => setCommend(event.target.value)}
											/>
											<div
												id="PolarisTextField28CharacterCounter"
												className="Polaris-TextField__CharacterCount"
												aria-label="11 of 20 characters used"
												aria-live="off"
												aria-atomic="true"
											>
											</div>
											<div className="Polaris-TextField__Backdrop"></div>
										</div>
									</div>
								</div>
								<div className="Polaris-ButtonGroup">
									<div className="Polaris-ButtonGroup__Item">
										<button
											className="Polaris-Button  Polaris-Button--primary"
											type="button"
											onClick={validator}
										>
											<span className="Polaris-Button__Content">
												<span className="Polaris-Button__Text">Post</span>
											</span>
										</button>
									</div>
								</div>
							</span>
						</div>
						{validation === true && (<div style={{ marginLeft: '4%' }}><InlineError message="Cannot add empty comments" fieldID="postButton" /></div>)}
						<div className="customer--comments">
							<ul className="Polaris-List">
								{commendDetails.map((item, itemKey) => {
									let options = item.comment;
									let optionsCreatedDate = item.created_date;
									const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
									let current_date = momentTimezone().tz("America/Los_Angeles").format('YYYY-MM-DD HH:mm:ss').slice(0, 10);
									let currentYear = current_date.slice(0, 4);
									let currentMonth = Number(current_date.slice(5, 7));
									let currentDay = current_date.slice(8, 10);
									let currentDate = monthNames[currentMonth-1] + ' ' + currentDay + ', ' + currentYear;
									let subHeading = '';
									if (optionsCreatedDate == currentDate && !dates.includes(optionsCreatedDate)) {
										subHeading = 'Today';
										dates.push(optionsCreatedDate);
									} else if (!dates.includes(optionsCreatedDate)) {
										subHeading = item.created_date;
										dates.push(optionsCreatedDate);
									}
									return (
										<>
											{subHeading ? (
												<h3 aria-label="Accounts" className="Polaris-Subheading">
													<b> {subHeading} </b>
												</h3>
											) : null}
											{item.from == 'admin' ? (
												<li className="Polaris-List__Item grid active">
													<span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
														{options}
													</span>
													<span className="date_posted"> {item.created_time} </span>
												</li>
											) : item.from == 'customer' ? (
												<li className="Polaris-List__Item grid">
													<span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
														{options}
													</span>
													<span className="date_posted"> {item.created_time} </span>
												</li>
											) : item.from == 'sales_rep' ? (
												<li className="Polaris-List__Item grid sales_rep">
													<span style={{ display: 'inline-block', verticalAlign: 'middle' }} className="data">
														{options}
													</span>
													<span className="date_posted"> {item.created_time} </span>
												</li>
											) : null}
										</>
									);
								})}
							</ul>
						</div>
					</div>
				</div>
			) : null}

			{toggleActiveT === true ? (
				<div style={{ height: '250px' }}>
					<Frame>
						<Toast content="Order successfully approved" onDismiss={toggleActiveChange} />
					</Frame>
				</div>
			) : null}

			{showPopUp ? (
                <SharePublicPreviewLink orderId={ orderId } toggleShowModal={toggleShowModal}/>
            ) : null}
			
			<div id="PolarisPortalsContainer"></div>

		</div>
	);
};
export default PurchaseOrderDetails;
