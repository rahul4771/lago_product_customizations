import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Spinner, InlineError, TextContainer, Modal, Frame, Toast, Tooltip, TextStyle } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import momentTimezone from 'moment-timezone';
import { TOKEN, PREVIEW_URL } from "../../constants/common";

const PurchaseOrderDetails = (props) => {
	localStorage.removeItem('customizationInfo');
	localStorage.removeItem('preview');
	localStorage.removeItem('existingPreview');
	localStorage.removeItem('cartData');
	localStorage.removeItem('customer');
	const [orderId, setOrderId] = useState(props.orderId);
	const [purchaseOrder, setPurchaseOrder] = useState({});
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
	const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
	const handleChange = useCallback(() => setShowPopUp(!showPopUp), [showPopUp]);
	let setSignal = null;
	let controller = null;
	let uniqueId = 0 ;
	let dates = [];
    let concernedElement = null;

	useEffect(() => {
		try {
			controller = new AbortController();
			setSignal = controller.signal;
			getPurchaseOrder(setSignal);
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
	
	useEffect(() => {
		(async () => {
			concernedElement = document.querySelector(".Polaris-Modal-Dialog__Modal");
		})();
	}, [showPopUp]);

	document.addEventListener("mousedown", (event) => {
		if(concernedElement != null){
			if (!concernedElement.contains(event.target)) {
				concernedElement = null;
				setShowPopUp(false);
			}
		}
	});

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

	const confirmApproval = async () => {
		setShowPopUp(true);
		$(".Polaris-Modal-Dialog__Modals").addClass("Polaris-Modal-Dialog--sizeSmall");

	};

	const productApproval = async () => {
		setShowPopUp(false);
		$("#po-details").css("z-index", "-100");
		$(".Polaris-Spinner--sizeLarge").css("display", "block");
		if (orderId && lineItemKey) {
			let url = API.adminApproveOrder;
			let data = {
				order_id: orderId,
				product_id: lineItemKey
			}
			const adminApproval = await ApiHelper.post(url, data, null);
			if (adminApproval && adminApproval.message == 'success') {
				$("#editButton").css("display", "none");
				$("#approveButton").css("display", "none");
				setApprovedFlag(true);
				settoggleActiveT(true);
				$(".Polaris-Spinner--sizeLarge").css("display", "none");
				$("#po-details").css("z-index", "519");
			}
		}
	}

	return (
		<div className="Polaris-Tabs__Panel customer__approval" id="create-po" role="tabpanel" aria-labelledby="Create-PO" tabIndex="-1">
			<div className="Polaris-Card__Section">
				<div className="list--breabcrumbs">
					<ul className="Polaris-List">
						<li className="Polaris-List__Item">{purchaseOrder.name ? "PO Details - " + purchaseOrder.name : "PO Details"}</li>
					</ul>
					<div id="PolarisPortalsContainer"></div>
				</div>

				{loading === false ? (
					<div>
						<div className="display-text">
							<div className="display-text--title">
								<div>
									<p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">{'PO ' + purchaseOrder.name}</p>
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
										{loading == true ? (
											<Spinner accessibilityLabel="Spinner example" size="large" />
										) : (
											<>
												<div>
													<div>
														<p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">Selected Garment</p>
														<div id="PolarisPortalsContainer"></div>
													</div>
													{Object.keys(lineItems).map((key) => {
														let customProduct = purchaseOrder.customized_products[key];
														let customImage = '';
														if(customProduct != undefined){
															if (customProduct.custom_product_front != undefined && customProduct.custom_product_front != '') {
																customImage = customProduct.custom_product_front;
															} else if (customProduct.custom_product_back != undefined && customProduct.custom_product_back != '') {
																customImage = customProduct.custom_product_back;
															} else {
																customImage = customProduct.custom_product_sleeve;
															}
														}
														let customizationDetails = JSON.parse(purchaseOrder.metafield.value);
														let arts = [];
														{
															lineItems[key].status == 'pendingAdminApproval' ? status='Awaiting Admin Approval':
															lineItems[key].status == 'pendingCustomerApproval' ? status='Awaiting Client Approval':
															lineItems[key].status == 'customerApproved' ? status='Client Approved':
															lineItems[key].status == 'adminApproved' ? status='Admin Approved': null
														}
														let customizationElements = customizationDetails[key].customization_elements;

														$.each(customizationElements, function (key, artElement) {
															if (artElement.art_image_status) {
																$.each(artElement.art_image_array, function (index, artImageData) {
																	arts.push(artImageData);
																});
															}
														});
														let placedArtwork = arts;

														return (
															<Fragment key={"l" + key}>
																<div>
																	<div className="Polaris-Layout assign_artwork--assign" style={{ borderBottom: "1px solid #d2d2d5" }}>
																		<div className="Polaris-Layout__Section">
																			<div>
																				<div>
																					<span className="Polaris-Thumbnail Polaris-Thumbnail--sizeLarge">
																						<img src={customImage} alt="Image" />
																					</span>
																					<div id="PolarisPortalsContainer"></div>
																				</div>
																			</div>
																		</div>
																		<div className="Polaris-Layout__Section">
																			<div>
																				<div className="Polaris-Card__Header">
																					<h2 className="Polaris-Heading">{lineItems[key].product_name}</h2>
																				</div>
																				<div className="Polaris-Card__Section">
																					<div>
																						<span className="Polaris-Tag Polaris-Tag color--blue Margin-left-5">
																							Garments Selected
																						</span>
																						<span className="Polaris-Tag Polaris-Tag color--purple Margin-left-5">
																							Artwork Assigned
																						</span>
																						<span className="Polaris-Tag Polaris-Tag color--cyan Margin-left-5">
																							Color, Size, Quantity Assigned
																						</span>
																						{lineItems[key].status == 'pendingAdminApproval' ? (
																						<button id="approveButton" className="Polaris-Button Polaris-Button--primary" type="button" style={{ float: 'right', marginRight: '3rem' }}
																							onClick={() => {
																								setLineItemKey(key)
																								confirmApproval()
																							}}
																						>
																							<span className="Polaris-Button__Content">
																								<span className="Polaris-Button__Text">Approve</span>
																							</span>
																						</button>
																						) : lineItems[key].status == 'adminApproved' || lineItems[key].status == 'customerApproved' ? (
																							<>
																							<span className={"Polaris-Tag admin--approved"} style={{ float: 'right', marginRight: '3rem' }}>
																								<span className="Polaris-Tag__TagText">Approved</span>
																							</span>
																							<div id="PolarisPortalsContainer"></div></>
																						) : null}
																						{approvedFlag == true ? (
																							<>
																							<span className={"Polaris-Tag admin--approved"} style={{ float: 'right', marginRight: '3rem' }}>
																								<span className="Polaris-Tag__TagText">Approved</span>
																							</span>
																							<div id="PolarisPortalsContainer"></div></>
																						) : null}

																						{lineItems[key].status == 'adminApproved' || lineItems[key].status == 'customerApproved' ? null : (
																						<Link
																							href={{
																								pathname: '/',
																								query: {
																									tab: 'create-PO',
																									page: 'editAssignArtwork',
																									params: JSON.stringify({ orderId: orderId, productId: key }),
																								},
																							}}
																						>
																							<button
																								id="editButton"
																								className="Polaris-Button Polaris-Button--primary"
																								type="button"
																								style={{ float: 'right', marginRight: '1rem' }}
																							>
																								<span className="Polaris-Button__Content">
																									<span className="Polaris-Button__Text">Edit</span>
																								</span>
																							</button>
																						</Link>)}
																						<div id="PolarisPortalsContainer"></div>
																					</div>
																					<div>
																						<ul className="Polaris-List">
																							{lineItems[key].items.map((item, itemKey) => {
																								let options = 'Qty: ' + item.quantity;
																								item.options.map((option) => {
																									options += ', ' + option.name + ': ' + option.value;
																								});

																								return (
																									<li className="Polaris-List__Item" key={'op' + key + 'i' + itemKey}>
																										{options}
																									</li>
																								);
																							})}
																						</ul>
																						<div id="PolarisPortalsContainer"></div>
																					</div>
																					<div>
																						<div>
																							<div className="Polaris-Page-Header Polaris-Page-Header--isSingleRow Polaris-Page-Header--mobileView Polaris-Page-Header--noBreadcrumbs Polaris-Page-Header--mediumTitle">
																								<div className="Polaris-Page-Header__Row">
																									<div className="Polaris-Page-Header__TitleWrapper">
																										<div>
																											<div className="Polaris-Header-Title__TitleAndSubtitleWrapper">
																												<h1 className="Polaris-Header-Title">Artwork</h1>
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
																														</tr>
																													</thead>
																													<tbody>
																														{placedArtwork.map((placedArt, index) => {
																															uniqueId++;
																															return (
																																<Fragment key={"placedart" + placedArt.id+uniqueId}>
																																	<tr className="Polaris-DataTable__TableRow" >
																																		<th
																																			className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
																																			scope="row"
																																			>
																																			{placedArt.id}
																																		</th>
																																		<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																			{placedArt.name.substring(0, 20)}
																																		</td>
																																		<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																			{ placedArt.type !== "undefined" &&  placedArt.type !== "null" ? placedArt.type : "" }
																																		</td>
																																		<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																			{placedArt.instruction.length > 20 ? 
																																				(<Tooltip content={placedArt.instruction} dismissOnMouseOut>																					
																																					<TextStyle>{ placedArt.instruction.substring(0, 20) }</TextStyle>
																																				</Tooltip>)
																																			: placedArt.instruction.substring(0, 20)}
																																		</td>
																																		<td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--numeric">
																																			{placedArt.color}
																																		</td>
																																	</tr>
																																</Fragment>
																															);
																														})}
																													</tbody>
																												</table>
																											</div>
																											<a href={PREVIEW_URL + "&orderId=" + orderId + "&productId=" + key + "&token=" + TOKEN}  target="_blank">View All</a>
																										</div>
																									</div>
																								</div>
																							</div>
																						</div>
																						<div id="PolarisPortalsContainer"></div>
																					</div>
																				</div>
																			</div>
																		</div>
																	</div>
																	<div id="PolarisPortalsContainer"></div>
																</div>
															</Fragment>
														);
													})}
													<div>
														<div className="Polaris-ButtonGroup Align-center">
															<div className="Polaris-ButtonGroup__Item">
																<Link
																	href={{
																		pathname: '/',
																		query: { tab: 'create-PO', page: 'addPoInstructions', params: JSON.stringify(poDetails) },
																	}}
																>
																	<button className="Polaris-Button Polaris-Button--primary" type="button">
																		<span className="Polaris-Button__Content">
																			<span className="Polaris-Button__Text">Add Order Instructions</span>
																		</span>
																	</button>
																</Link>
																<div id="PolarisPortalsContainer"></div>
															</div>
															<div className="Polaris-ButtonGroup__Item">
																<Link href={{ pathname: '/', query: { tab: 'create-PO', page: 'reviewAndComplete', params: JSON.stringify({ orderId: orderId, approveFlow: false }) } }}>
																	<button className="Polaris-Button Polaris-Button--primary" type="button">
																		<span className="Polaris-Button__Content">
																			<span className="Polaris-Button__Text">Complete Garment / Artwork Combo</span>
																		</span>
																	</button>
																</Link>
															</div>
														</div>
														<div id="PolarisPortalsContainer"></div>
													</div>
												</div>
											</>
										)}
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
						{commendDetails.length > 0 ? (<div className="customer--comments">
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
										<Fragment key={"c" + itemKey}>
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
										</Fragment>
									);
								})}
							</ul>
						</div>) : null}
					</div>
				</div>
			) : null}

{showPopUp ? (
				<div style={{ height: '500px' }}>
					<Modal
						open={showPopUp}
						onClose={handleChange}
						title="Really need to Approve?"
						titleHidden
						primaryAction={{
							content: 'Approve',
							onClick: productApproval

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
									<b>Do you want to approve this order?</b>
								</p>
							</TextContainer>
						</Modal.Section>
					</Modal>
				</div>

			) : null}

			{toggleActiveT === true ? (
				<div style={{ height: '250px' }}>
					<Frame>
						<Toast content="Order successfully approved" onDismiss={toggleActiveChange} />
					</Frame>
				</div>
			) : null}
			
			<div id="PolarisPortalsContainer"></div>
		</div>
	);
};
export default PurchaseOrderDetails;
