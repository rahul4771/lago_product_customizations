import React, { useCallback, useState, useEffect, Fragment } from 'react';
import { useRouter } from "next/router";
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Icon, Autocomplete, TextContainer, Spinner, Frame, Toast ,TextField, InlineError} from '@shopify/polaris';
import {SearchMinor} from '@shopify/polaris-icons';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';

const CreatePurchaseOrder = () => {
	localStorage.removeItem("customizationInfo");
	localStorage.removeItem("preview");
	localStorage.removeItem("cartData");
	const router = useRouter();
	const [customers, setCustomers] = useState([]);
	const [searchString, setSearchString] = useState("");
	const [selectedOptions, setSelectedOptions] = useState([]);
	const [inputValue, setInputValue] = useState(' ');
	const [options, setOptions] = useState(customers);
	const [loading, setLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [emptyState, setEmptyState] = useState("");
	const [active, setActive] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const toggleActive = useCallback(() => setActive((active) => !active), []);
	let setSignal = null;
	let controller = null;
	let selectedCustomer = {};
	const [show, setShow] = useState("none");
	const isCancelled = React.useRef(false);
	const patternName = /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”'"<>?\\]/g;
	const [nameValidation, setNameValidation] = useState(false);
	const [customerNameError, setCustomerNameError] = useState("");

	useEffect(() => {
		router.prefetch("/header?tab=create-PO&page=selectGarment");
		try{
			localStorage.removeItem("customer");
			setEmptyState("");
		  	setLoading(true);
		  	controller = new AbortController();
		  	setSignal = controller.signal;
		  
			getCustomers(setSignal);
			return () => {
				isCancelled.current = true;
				if (setSignal) {
				controller.abort();
				}
			}
		} catch(e) {
		  console.log(e);
		}
	}, [searchString]);

	const getCustomers = async (signal = null) => {
		let url = API.customersAll;
		if (searchString != "") {
			let searchStringTrim = searchString;
			searchStringTrim= searchStringTrim.trim();
			url += "?query=" + searchStringTrim;
		}
		const customerDetails = await ApiHelper.get(url, signal);
		if (customerDetails && customerDetails.message == "success") {
			let customerNames = customerDetails.body.customers.map((customer, key) => {
				return {
						value: customer.id,
						label: customer.name
				};
			});
			if (customerDetails.body.customers.length == 0){
				if(!isCancelled.current) {
					setEmptyState(
						<React.Fragment>
						  <Icon source={SearchMinor} />
						  <div style={{textAlign: 'center'}}>
							<TextContainer>Could not find any results</TextContainer>
						  </div>
						</React.Fragment>
					  );
				}
				
			}
			setCustomers(customerNames);
			setOptions(customerNames);
			setLoading(false);
		} else {
			if(!isCancelled.current) {
			setEmptyState(
				<React.Fragment>
				  <Icon source={SearchMinor} />
				  <div style={{textAlign: 'center'}}>
					<TextContainer>Could not find any results</TextContainer>
				  </div>
				</React.Fragment>
			  );
			}
		}
		
	};

	const updateText = useCallback(
		(value) => {
			if (patternName.test(value)) {
				setCustomerNameError("Search word cannot contain special characters");
        		setNameValidation(true);
				setInputValue(value);
			} else {
				setCustomerNameError("");
        		setNameValidation(false);
				setInputValue(value);
				setSearchString(value);
	  
				if (!loading) {
				  setLoading(true);
				}
		  
				setTimeout(() => {
				  if (value === '') {
					setOptions(customers);
					setLoading(false);
					setShow('none');
					return;
				  }
				  const filterRegex = new RegExp(value, 'i');
				  const resultOptions = options.filter((option) =>
					option.label.match(filterRegex),
				  );
				  setOptions(resultOptions);
				  setLoading(false);
				}, 300);				
			}
		},
		[customers, loading, options],
	  );

	  const updateSelection = useCallback(
		(selected) => {
			selectedCustomer = {};
		  	const selectedText = selected.map((selectedItem) => {
			selectedCustomer["id"] = selectedItem;
				const matchedOption = options.find((option) => {
				return option.value.match(selectedItem);
				});
				return matchedOption && matchedOption.label;
			});
			setSelectedOptions(selected);
			setInputValue(selectedText[0]);
			selectedCustomer["name"] = selectedText[0];
			localStorage.setItem('customer', JSON.stringify(selectedCustomer));
			if(Object.keys(selectedCustomer).length > 0){
				setShow('block');
			}
			
		},
		[options],
	  );

	  const textField = (
		<Autocomplete.TextField
		  onChange={updateText}
		  label="Select Customer"
		  autocomplete="off"
		  value={inputValue==''?' ': inputValue }
		  prefix={<Icon source={SearchMinor} color="base" />}
		  placeholder="Search"
		  style={{width: '30%'}}
		/>
	  );

	  const checkCustomer = () => {
		if (localStorage.getItem("customer") === null) {
			setErrorMessage("Customer is required");
            setActive(true);
		} else {
			setPageLoading(true);
			router.replace("/header?tab=create-PO&page=selectGarment");
		}
	  }
	
	
	return (
		<>
		<div className="app-root">
    <style jsx>{`
   .app-root {  --p-background: rgba(246, 246, 247, 1);
    --p-background-hovered: rgba(241, 242, 243, 1);
    --p-background-pressed: rgba(237, 238, 239, 1);
    --p-background-selected: rgba(237, 238, 239, 1);
    --p-surface: rgba(255, 255, 255, 1);
    --p-surface-neutral: rgba(228, 229, 231, 1);
    --p-surface-neutral-hovered: rgba(219, 221, 223, 1);
    --p-surface-neutral-pressed: rgba(201, 204, 208, 1);
    --p-surface-neutral-disabled: rgba(241, 242, 243, 1);
    --p-surface-neutral-subdued: rgba(246, 246, 247, 1);
    --p-surface-subdued: rgba(250, 251, 251, 1);
    --p-surface-disabled: rgba(250, 251, 251, 1);
    --p-surface-hovered: rgba(246, 246, 247, 1);
    --p-surface-pressed: rgba(241, 242, 243, 1);
    --p-surface-depressed: rgba(237, 238, 239, 1);
    --p-backdrop: rgba(0, 0, 0, 0.5);
    --p-overlay: rgba(255, 255, 255, 0.5);
    --p-shadow-from-dim-light: rgba(0, 0, 0, 0.2);
    --p-shadow-from-ambient-light: rgba(23, 24, 24, 0.05);
    --p-shadow-from-direct-light: rgba(0, 0, 0, 0.15);
    --p-hint-from-direct-light: rgba(0, 0, 0, 0.15);
    --p-on-surface-background: rgba(241, 242, 243, 1);
    --p-border: rgba(140, 145, 150, 1);
    --p-border-neutral-subdued: rgba(186, 191, 195, 1);
    --p-border-hovered: rgba(153, 158, 164, 1);
    --p-border-disabled: rgba(210, 213, 216, 1);
    --p-border-subdued: rgba(201, 204, 207, 1);
    --p-border-depressed: rgba(87, 89, 89, 1);
    --p-border-shadow: rgba(174, 180, 185, 1);
    --p-border-shadow-subdued: rgba(186, 191, 196, 1);
    --p-divider: rgba(225, 227, 229, 1);
    --p-icon: rgba(92, 95, 98, 1);
    --p-icon-hovered: rgba(26, 28, 29, 1);
    --p-icon-pressed: rgba(68, 71, 74, 1);
    --p-icon-disabled: rgba(186, 190, 195, 1);
    --p-icon-subdued: rgba(140, 145, 150, 1);
    --p-text: rgba(32, 34, 35, 1);
    --p-text-disabled: rgba(140, 145, 150, 1);
    --p-text-subdued: rgba(109, 113, 117, 1);
    --p-interactive: rgba(44, 110, 203, 1);
    --p-interactive-disabled: rgba(189, 193, 204, 1);
    --p-interactive-hovered: rgba(31, 81, 153, 1);
    --p-interactive-pressed: rgba(16, 50, 98, 1);
    --p-focused: rgba(69, 143, 255, 1);
    --p-surface-selected: rgba(242, 247, 254, 1);
    --p-surface-selected-hovered: rgba(237, 244, 254, 1);
    --p-surface-selected-pressed: rgba(229, 239, 253, 1);
    --p-icon-on-interactive: rgba(255, 255, 255, 1);
    --p-text-on-interactive: rgba(255, 255, 255, 1);
    --p-action-secondary: rgba(255, 255, 255, 1);
    --p-action-secondary-disabled: rgba(255, 255, 255, 1);
    --p-action-secondary-hovered: rgba(246, 246, 247, 1);
    --p-action-secondary-pressed: rgba(241, 242, 243, 1);
    --p-action-secondary-depressed: rgba(109, 113, 117, 1);
    --p-action-primary: #5c6ac4;
    --p-action-primary-disabled: rgba(241, 241, 241, 1);
    --p-action-primary-hovered: rgba(0, 110, 82, 1);
    --p-action-primary-pressed: rgba(0, 94, 70, 1);
    --p-action-primary-depressed: rgba(0, 61, 44, 1);
    --p-icon-on-primary: rgba(255, 255, 255, 1);
    --p-text-on-primary: rgba(255, 255, 255, 1);
    --p-text-primary: rgba(0, 123, 92, 1);
    --p-text-primary-hovered: rgba(0, 108, 80, 1);
    --p-text-primary-pressed: rgba(0, 92, 68, 1);
    --p-surface-primary-selected: rgba(241, 248, 245, 1);
    --p-surface-primary-selected-hovered: rgba(179, 208, 195, 1);
    --p-surface-primary-selected-pressed: rgba(162, 188, 176, 1);
    --p-border-critical: rgba(253, 87, 73, 1);
    --p-border-critical-subdued: rgba(224, 179, 178, 1);
    --p-border-critical-disabled: rgba(255, 167, 163, 1);
    --p-icon-critical: rgba(215, 44, 13, 1);
    --p-surface-critical: rgba(254, 211, 209, 1);
    --p-surface-critical-subdued: rgba(255, 244, 244, 1);
    --p-surface-critical-subdued-hovered: rgba(255, 240, 240, 1);
    --p-surface-critical-subdued-pressed: rgba(255, 233, 232, 1);
    --p-surface-critical-subdued-depressed: rgba(254, 188, 185, 1);
    --p-text-critical: rgba(215, 44, 13, 1);
    --p-action-critical: rgba(216, 44, 13, 1);
    --p-action-critical-disabled: rgba(241, 241, 241, 1);
    --p-action-critical-hovered: rgba(188, 34, 0, 1);
    --p-action-critical-pressed: rgba(162, 27, 0, 1);
    --p-action-critical-depressed: rgba(108, 15, 0, 1);
    --p-icon-on-critical: rgba(255, 255, 255, 1);
    --p-text-on-critical: rgba(255, 255, 255, 1);
    --p-interactive-critical: rgba(216, 44, 13, 1);
    --p-interactive-critical-disabled: rgba(253, 147, 141, 1);
    --p-interactive-critical-hovered: rgba(205, 41, 12, 1);
    --p-interactive-critical-pressed: rgba(103, 15, 3, 1);
    --p-border-warning: rgba(185, 137, 0, 1);
    --p-border-warning-subdued: rgba(225, 184, 120, 1);
    --p-icon-warning: rgba(185, 137, 0, 1);
    --p-surface-warning: rgba(255, 215, 157, 1);
    --p-surface-warning-subdued: rgba(255, 245, 234, 1);
    --p-surface-warning-subdued-hovered: rgba(255, 242, 226, 1);
    --p-surface-warning-subdued-pressed: rgba(255, 235, 211, 1);
    --p-text-warning: rgba(145, 106, 0, 1);
    --p-border-highlight: rgba(68, 157, 167, 1);
    --p-border-highlight-subdued: rgba(152, 198, 205, 1);
    --p-icon-highlight: rgba(0, 160, 172, 1);
    --p-surface-highlight: rgba(164, 232, 242, 1);
    --p-surface-highlight-subdued: rgba(235, 249, 252, 1);
    --p-surface-highlight-subdued-hovered: rgba(228, 247, 250, 1);
    --p-surface-highlight-subdued-pressed: rgba(213, 243, 248, 1);
    --p-text-highlight: rgba(52, 124, 132, 1);
    --p-border-success: rgba(0, 164, 124, 1);
    --p-border-success-subdued: rgba(149, 201, 180, 1);
    --p-icon-success: rgba(0, 127, 95, 1);
    --p-surface-success: rgba(174, 233, 209, 1);
    --p-surface-success-subdued: rgba(241, 248, 245, 1);
    --p-surface-success-subdued-hovered: rgba(236, 246, 241, 1);
    --p-surface-success-subdued-pressed: rgba(226, 241, 234, 1);
    --p-text-success: rgba(0, 128, 96, 1);
    --p-decorative-one-icon: rgba(126, 87, 0, 1);
    --p-decorative-one-surface: rgba(255, 201, 107, 1);
    --p-decorative-one-text: rgba(61, 40, 0, 1);
    --p-decorative-two-icon: rgba(175, 41, 78, 1);
    --p-decorative-two-surface: rgba(255, 196, 176, 1);
    --p-decorative-two-text: rgba(73, 11, 28, 1);
    --p-decorative-three-icon: rgba(0, 109, 65, 1);
    --p-decorative-three-surface: rgba(146, 230, 181, 1);
    --p-decorative-three-text: rgba(0, 47, 25, 1);
    --p-decorative-four-icon: rgba(0, 106, 104, 1);
    --p-decorative-four-surface: rgba(145, 224, 214, 1);
    --p-decorative-four-text: rgba(0, 45, 45, 1);
    --p-decorative-five-icon: rgba(174, 43, 76, 1);
    --p-decorative-five-surface: rgba(253, 201, 208, 1);
    --p-decorative-five-text: rgba(79, 14, 31, 1);
    --p-border-radius-base: 0.4rem;
    --p-border-radius-wide: 0.8rem;
    --p-border-radius-full: 50%;
    --p-card-shadow: 0px 0px 5px var(--p-shadow-from-ambient-light),
      0px 1px 2px var(--p-shadow-from-direct-light);
    --p-popover-shadow: -1px 0px 20px var(--p-shadow-from-ambient-light),
      0px 1px 5px var(--p-shadow-from-direct-light);
    --p-modal-shadow: 0px 26px 80px var(--p-shadow-from-dim-light),
      0px 0px 1px var(--p-shadow-from-dim-light);
    --p-top-bar-shadow: 0 2px 2px -1px var(--p-shadow-from-direct-light);
    --p-button-drop-shadow: 0 1px 0 rgba(0, 0, 0, 0.05);
    --p-button-inner-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.2);
    --p-button-pressed-inner-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.15);
    --p-override-none: none;
    --p-override-transparent: transparent;
    --p-override-one: 1;
    --p-override-visible: visible;
    --p-override-zero: 0;
    --p-override-loading-z-index: 514;
    --p-button-font-weight: 500;
    --p-non-null-content: '';
    --p-choice-size: 2rem;
    --p-icon-size: 1rem;
    --p-choice-margin: 0.1rem;
    --p-control-border-width: 0.2rem;
    --p-banner-border-default: inset 0 0.1rem 0 0
        var(--p-border-neutral-subdued),
      inset 0 0 0 0.1rem var(--p-border-neutral-subdued);
    --p-banner-border-success: inset 0 0.1rem 0 0
        var(--p-border-success-subdued),
      inset 0 0 0 0.1rem var(--p-border-success-subdued);
    --p-banner-border-highlight: inset 0 0.1rem 0 0
        var(--p-border-highlight-subdued),
      inset 0 0 0 0.1rem var(--p-border-highlight-subdued);
    --p-banner-border-warning: inset 0 0.1rem 0 0
        var(--p-border-warning-subdued),
      inset 0 0 0 0.1rem var(--p-border-warning-subdued);
    --p-banner-border-critical: inset 0 0.1rem 0 0
        var(--p-border-critical-subdued),
      inset 0 0 0 0.1rem var(--p-border-critical-subdued);
    --p-badge-mix-blend-mode: luminosity;
    --p-thin-border-subdued: 0.1rem solid var(--p-border-subdued);
    --p-text-field-spinner-offset: 0.2rem;
    --p-text-field-focus-ring-offset: -0.4rem;
    --p-text-field-focus-ring-border-radius: 0.7rem;
    --p-button-group-item-spacing: -0.1rem;
    --p-duration-1-0-0: 100ms;
    --p-duration-1-5-0: 150ms;
    --p-ease-in: cubic-bezier(0.5, 0.1, 1, 1);
    --p-ease: cubic-bezier(0.4, 0.22, 0.28, 1);
    --p-range-slider-thumb-size-base: 1.6rem;
    --p-range-slider-thumb-size-active: 2.4rem;
    --p-range-slider-thumb-scale: 1.5;
    --p-badge-font-weight: 400;
    --p-frame-offset: 0px;
    
}
    `}
    </style>
			<div
				className="Polaris-Tabs__Panel"
				id="create-po"
				role="tabpanel"
				aria-labelledby="Create-PO"
				tabIndex="-1"
			>
				<div className="Polaris-Card__Section">
					<div>
						<div className="display-text">
							<div className="display-text--title">
								<div>
									<p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
										Create PO
									</p>
								</div>
							</div>
							<div>
								<Link href={{ pathname: "/", query: { tab: "all-POs"} }}>
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
					<div>
						<div className="Polaris-Layout">
							<div className="Polaris-Layout__Section">
								<div>
									<div className="Polaris-Card">
									{pageLoading ? (
											<Spinner accessibilityLabel="Spinner example" size="large" />
										) : (
										<div className="Polaris-Card__Section">
											<div>
												<div className="Polaris-Card__Section min--height">
													<div>
														<div style={{width: '28%'}}>
															<Autocomplete
															options={options}
															selected={selectedOptions}
															onSelect={updateSelection}
														
															loading={loading}
															textField={textField}
															/>
														</div>
														<div id="PolarisPortalsContainer"></div>
													</div>
													<div className="create_po--displaytext" style={{ display: show }} >
														<p className="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
															Garment / Artwork
															Combinations
														</p>
														<div id="PolarisPortalsContainer"></div>
													</div>
													<div className="create_po--card" style={{ display: show }} >
														<div className="Polaris-Labelled--hidden">
															<div className="Polaris-Labelled__LabelWrapper">
																<div className="Polaris-Label">
																	<label
																		id="PolarisDropZone2Label"
																		htmlFor="PolarisDropZone2"
																		className="Polaris-Label__Text"
																	>
																		Upload
																		file
																	</label>
																</div>
															</div>
															<div
																className="Polaris-DropZone Polaris-DropZone--hasOutline Polaris-DropZone--sizeExtraLarge"
																aria-disabled="false"
															>
																<a onClick={() => checkCustomer()}>
																	<div className="Polaris-DropZone__Container">
																		<div className="Polaris-DropZone-FileUpload">
																			<div className="Polaris-Stack Polaris-Stack--vertical" style={{marginTop:"2rem"}}>
																				<div className="Polaris-Stack__Item">
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
																				<div
																					className="Polaris-Stack__Item"
																					style={{
																						display:
																							'none',
																					}}
																				>
																					<div className="Polaris-DropZone-FileUpload__Button">
																						Add
																						file
																					</div>
																				</div>
																				<div
																					className="Polaris-Stack__Item"
																					style={{
																						display:
																							'none',
																					}}
																				>
																					<span className="Polaris-TextStyle--variationSubdued">
																						or
																						drop
																						files
																						to
																						upload
																					</span>
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
															</div>
														</div>
														<div id="PolarisPortalsContainer"></div>
													</div>
													{nameValidation == true && (
														<InlineError message={customerNameError} fieldID="firstName" />
													)}
												</div>
											</div>
										</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{ active ? (
				<Frame>
					<Toast content={errorMessage} error onDismiss={toggleActive} />
				</Frame>
				) : null
			}
			</div>
		</>
	);
};

export default CreatePurchaseOrder;
