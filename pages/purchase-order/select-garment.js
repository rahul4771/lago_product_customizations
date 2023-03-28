import React, { useState, useEffect, Fragment, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AbortController from 'abort-controller';
import { Card, EmptyState, Spinner } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import IconArrow from '../../images/icon_arrow.png';
import IconNoImage from '../../images/icon_no_image.jpg';

const SelectGarment = () => {
  const [products, setProducts] = useState([]);
  const [previous, setPrevious] = useState('');
  const [next, setNext] = useState('');
  const [searchString, setSearchString] = useState('');
  const [searchStringComplete, setSearchStringComplete] = useState('');
  const [productType, setProductType] = useState('');
  const [vendor, setVendor] = useState('');
  const [productSort, setProductSort] = useState('');
  const [allProductTypes, setAllProductTypes] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const isCancelled = useRef(false);
  let customer = null;
  const eventKeyCodes = {
    enter: 13,
  };
  if (localStorage.getItem('customer')) {
    customer = JSON.parse(localStorage.getItem('customer'));
  }
  let setSignal = null;
  let controller = null;
  localStorage.removeItem('customizationInfo');
  localStorage.removeItem('preview');
  localStorage.removeItem('existingPreview');
  localStorage.removeItem('cartData');

  useEffect(() => {
    isCancelled.current = false;
    try {
      controller = new AbortController();
      setSignal = controller.signal;
      getProducts(null, null, setSignal);
      return () => {
        isCancelled.current = true;
        if (setSignal) {
          controller.abort();
        }
      };
    } catch (e) {
      console.log(e);
    }
  }, [searchStringComplete, productType, vendor, productSort]);

  useEffect(() => {
    isCancelled.current = false;
    try {
      controller = new AbortController();
      setSignal = controller.signal;
      getProductTypesAndVendors(null, null, setSignal);
      return () => {
        isCancelled.current = true;
        if (setSignal) {
          controller.abort();
        }
      };
    } catch (e) {
      console.log(e);
    }
  }, []);

  const getProductTypesAndVendors = async (
    cursor = null,
    value = null,
    signal = null,
  ) => {
    let url = API.typesAndVendors;
    setLoading(true);
    const productTypesAndVendors = await ApiHelper.get(url, signal);
    if (isCancelled.current) {
      return false;
    }
    setLoading(false);
    if (productTypesAndVendors && productTypesAndVendors.message == 'success') {
      setAllVendors(productTypesAndVendors.body.vendor);
      setAllProductTypes(productTypesAndVendors.body.type);
    }
  };

  const getProducts = async (cursor = null, value = null, signal = null) => {
    let url = API.products;
    if (
      (cursor != null && value != null) ||
      searchString != '' ||
      productType != '' ||
      vendor != '' ||
      productSort != ''
    ) {
      url += '?';
      let urlParams = '';
      if (searchString != '') {
        urlParams += 'query=' + searchString;
      }
      if (productType != '') {
        urlParams +=
          urlParams != ''
            ? '&product-type=' + productType
            : 'product-type=' + productType;
      }
      if (vendor != '') {
        urlParams += urlParams != '' ? '&vendor=' + vendor : 'vendor=' + vendor;
      }
      if (productSort != '') {
        urlParams +=
          urlParams != ''
            ? '&sort-by=' + productSort
            : 'sort-by=' + productSort;
      }
      if (cursor != null && value != null) {
        urlParams +=
          urlParams != '' ? '&' + cursor + '=' + value : cursor + '=' + value;
      } else {
        setPageCount(0);
      }
      url += urlParams;
    }
    if (cursor == 'previous') {
      setPageCount((pageCount) => pageCount - 1);
    }
    if (cursor == 'next') {
      setPageCount((pageCount) => pageCount + 1);
    }
    setLoading(true);
    const productDetails = await ApiHelper.get(url, signal);
    if (isCancelled.current) {
      return false;
    }
    setLoading(false);
    if (productDetails && productDetails.message == 'success') {
      setProductCount(productDetails.body.products.length);
      setProducts(productDetails.body.products);
      setPrevious(productDetails.body.previous_cursor);
      setNext(productDetails.body.next_cursor);
    }
  };

  return (
    <>
      <div className="app-root">
        <style jsx>
          {`
            .app-root {
              --p-background: rgba(246, 246, 247, 1);
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
              --p-popover-shadow: -1px 0px 20px
                  var(--p-shadow-from-ambient-light),
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
            <div className="list--breabcrumbs">
              <ul className="Polaris-List">
                <li className="Polaris-List__Item">
                  <Link
                    href={{
                      pathname: '/',
                      query: { tab: 'create-PO', page: 'create' },
                    }}
                  >
                    Create PO
                  </Link>
                </li>
                <li className="Polaris-List__Item breadcrumbs--icon">
                  <Image
                    src={IconArrow}
                    alt="Icon arrow right"
                    width={8}
                    height={12}
                  />
                </li>
                <li className="Polaris-List__Item">Select Garment</li>
              </ul>
              <div id="PolarisPortalsContainer"></div>
            </div>
            <div>
              <div className="display-text">
                <div className="display-text--title">
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
                  <Link href={{ pathname: '/', query: { tab: 'create-PO' } }}>
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
            <div>
              <div className="Polaris-Layout">
                <div className="Polaris-Layout__Section">
                  <div>
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Section">
                        <div className="Polaris-FormLayout">
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Stack Polaris-Stack--spacingLoose Polaris-Stack--alignmentLeading Polaris-Stack--noWrap">
                              <div className="Polaris-Stack__Item Polaris-Stack__Item--fill">
                                <div className="Polaris-FormLayout">
                                  <div
                                    role="group"
                                    className="Polaris-FormLayout--condensed"
                                  >
                                    <div className="Polaris-FormLayout__Items">
                                      <div className="Polaris-FormLayout__Item">
                                        <div className="Polaris-Labelled--hidden">
                                          <div className="Polaris-Labelled__LabelWrapper">
                                            <div className="Polaris-Label">
                                              <label
                                                id="PolarisSelect5Label"
                                                htmlFor="PolarisSelect5"
                                                className="Polaris-Label__Text"
                                              >
                                                Collection rule type
                                              </label>
                                            </div>
                                          </div>

                                          <div className="Polaris-TopBar-SearchField">
                                            <span className="Polaris-VisuallyHidden">
                                              <label htmlFor="PolarisSearchField1">
                                                Search base garments
                                              </label>
                                            </span>
                                            <div
                                              onClick={() => {
                                                try {
                                                  controller =
                                                    new AbortController();
                                                  setSignal = controller.signal;
                                                  getProducts(
                                                    null,
                                                    null,
                                                    setSignal,
                                                  );
                                                } catch (e) {
                                                  console.log(e);
                                                }
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            >
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
                                              id="PolarisSearchField1"
                                              className="Polaris-TopBar-SearchField__Input"
                                              placeholder="Search base garment"
                                              type="search"
                                              autoCapitalize="off"
                                              autoComplete="off"
                                              autoCorrect="off"
                                              value={searchString}
                                              onChange={(e) =>
                                                setSearchString(e.target.value)
                                              }
                                              onKeyDown={(e) => {
                                                if (
                                                  e.keyCode ==
                                                  eventKeyCodes.enter
                                                ) {
                                                  setSearchStringComplete(
                                                    e.target.value,
                                                  );
                                                }
                                              }}
                                              onBlur={(e) => {
                                                setSearchStringComplete(
                                                  e.target.value,
                                                );
                                              }}
                                            />
                                            <div className="Polaris-TopBar-SearchField__Backdrop Polaris-TopBar-SearchField__BackdropShowFocusBorder"></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="Polaris-FormLayout__Item">
                                        <div className="Polaris-Labelled--hidden">
                                          <div className="Polaris-Labelled__LabelWrapper">
                                            <div className="Polaris-Label">
                                              <label
                                                id="PolarisSelect6Label"
                                                htmlFor="PolarisSelect6"
                                                className="Polaris-Label__Text"
                                              >
                                                Collection rule condition
                                              </label>
                                            </div>
                                          </div>
                                          <div>
                                            <div className="">
                                              <div className="Polaris-Select">
                                                <select
                                                  id="PolarisSelect2"
                                                  className="Polaris-Select__Input"
                                                  aria-invalid="false"
                                                  onChange={(e) =>
                                                    setProductType(
                                                      e.target.value,
                                                    )
                                                  }
                                                >
                                                  <option value="">All</option>
                                                  {allProductTypes.map(
                                                    (type, key) => {
                                                      return (
                                                        <option
                                                          value={type.name}
                                                          key={'type' + key}
                                                        >
                                                          {type.name}
                                                        </option>
                                                      );
                                                    },
                                                  )}
                                                </select>
                                                <div
                                                  className="Polaris-Select__Content"
                                                  aria-hidden="true"
                                                >
                                                  <span className="Polaris-Select__InlineLabel">
                                                    Product type
                                                  </span>
                                                  <span className="Polaris-Select__SelectedOption">
                                                    {productType ? (
                                                      <> ({productType}) </>
                                                    ) : (
                                                      '(All)'
                                                    )}
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
                                            <div id="PolarisPortalsContainer"></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="Polaris-FormLayout__Item">
                                        <div className="Polaris-Labelled--hidden">
                                          <div className="Polaris-Labelled__LabelWrapper">
                                            <div className="Polaris-Label">
                                              <label
                                                id="PolarisSelect6Label"
                                                htmlFor="PolarisSelect6"
                                                className="Polaris-Label__Text"
                                              >
                                                Collection rule condition
                                              </label>
                                            </div>
                                          </div>
                                          <div>
                                            <div className="">
                                              <div className="Polaris-Select">
                                                <select
                                                  id="PolarisSelect3"
                                                  className="Polaris-Select__Input"
                                                  aria-invalid="false"
                                                  onChange={(e) =>
                                                    setVendor(e.target.value)
                                                  }
                                                >
                                                  <option value="">All</option>
                                                  {allVendors.map(
                                                    (type, key) => {
                                                      return (
                                                        <option
                                                          value={type.name}
                                                          key={'type' + key}
                                                        >
                                                          {type.name}
                                                        </option>
                                                      );
                                                    },
                                                  )}
                                                </select>
                                                <div
                                                  className="Polaris-Select__Content"
                                                  aria-hidden="true"
                                                >
                                                  <span className="Polaris-Select__InlineLabel">
                                                    Vendor
                                                  </span>
                                                  <span className="Polaris-Select__SelectedOption">
                                                    {vendor ? (
                                                      <> ({vendor}) </>
                                                    ) : (
                                                      '(All)'
                                                    )}
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
                                            <div id="PolarisPortalsContainer"></div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="Polaris-FormLayout__Item">
                                        <div className="Polaris-Labelled--hidden">
                                          <div className="Polaris-Labelled__LabelWrapper">
                                            <div className="Polaris-Label">
                                              <label
                                                id="ruleContentLabel"
                                                htmlFor="ruleContent"
                                                className="Polaris-Label__Text"
                                              >
                                                Collection rule content
                                              </label>
                                            </div>
                                          </div>
                                          <div className="Polaris-Connected">
                                            <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                              <div>
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
                                                      onChange={(e) =>
                                                        setProductSort(
                                                          e.target.value,
                                                        )
                                                      }
                                                    >
                                                      <option value="created-desc">
                                                        Created (newest first)
                                                      </option>
                                                      <option value="created-asc">
                                                        Created (oldest first)
                                                      </option>
                                                      <option value="updated-asc">
                                                        Updated (oldest first)
                                                      </option>
                                                      <option value="updated-desc">
                                                        Updated (newest first)
                                                      </option>
                                                      <option value="name-asc">
                                                        Product title A-Z
                                                      </option>
                                                      <option value="name-desc">
                                                        Product title Z-A
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
                                                        {productSort ==
                                                        'created-asc' ? (
                                                          <>
                                                            {' '}
                                                            Created (oldest
                                                            first){' '}
                                                          </>
                                                        ) : productSort ==
                                                          'created-desc' ? (
                                                          <>
                                                            {' '}
                                                            Created (newest
                                                            first){' '}
                                                          </>
                                                        ) : productSort ==
                                                          'updated-asc' ? (
                                                          <>
                                                            {' '}
                                                            Updated (oldest
                                                            first){' '}
                                                          </>
                                                        ) : productSort ==
                                                          'updated-desc' ? (
                                                          <>
                                                            {' '}
                                                            Updated (newest
                                                            first){' '}
                                                          </>
                                                        ) : productSort ==
                                                          'name-asc' ? (
                                                          <>
                                                            {' '}
                                                            Product title A-Z{' '}
                                                          </>
                                                        ) : productSort ==
                                                          'name-desc' ? (
                                                          <>
                                                            {' '}
                                                            Product title Z-A{' '}
                                                          </>
                                                        ) : (
                                                          'Created (newest first)'
                                                        )}
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
                                                <div id="PolarisPortalsContainer"></div>
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
                          </div>
                          <div>
                            <div className="Polaris-Stack Polaris-Stack--spacingTight">
                              {productType.length > 0 ? (
                                <div className="Polaris-Stack__Item">
                                  <span className="Polaris-Tag Polaris-Tag--removable">
                                    <span
                                      title="type"
                                      className="Polaris-Tag__TagText"
                                    >
                                      Product type: {productType}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        setProductType('');
                                        $('#PolarisSelect2').val('1');
                                      }}
                                      type="button"
                                      aria-label="Remove Refurbished"
                                      className="Polaris-Tag__Button"
                                    >
                                      <span className="Polaris-Icon">
                                        <svg
                                          viewBox="0 0 20 20"
                                          className="Polaris-Icon__Svg"
                                          focusable="false"
                                          aria-hidden="true"
                                        >
                                          <path d="M11.414 10l4.293-4.293a.999.999 0 1 0-1.414-1.414L10 8.586 5.707 4.293a.999.999 0 1 0-1.414 1.414L8.586 10l-4.293 4.293a.999.999 0 1 0 1.414 1.414L10 11.414l4.293 4.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z"></path>
                                        </svg>
                                      </span>
                                    </button>
                                  </span>
                                </div>
                              ) : null}
                              {vendor.length > 0 ? (
                                <div className="Polaris-Stack__Item">
                                  <span className="Polaris-Tag Polaris-Tag--removable">
                                    <span
                                      title="vendor"
                                      className="Polaris-Tag__TagText"
                                    >
                                      Vendor: {vendor}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        setVendor('');
                                        $('#PolarisSelect3').val('1');
                                      }}
                                      type="button"
                                      aria-label="Remove Refurbished"
                                      className="Polaris-Tag__Button"
                                    >
                                      <span className="Polaris-Icon">
                                        <svg
                                          viewBox="0 0 20 20"
                                          className="Polaris-Icon__Svg"
                                          focusable="false"
                                          aria-hidden="true"
                                        >
                                          <path d="M11.414 10l4.293-4.293a.999.999 0 1 0-1.414-1.414L10 8.586 5.707 4.293a.999.999 0 1 0-1.414 1.414L8.586 10l-4.293 4.293a.999.999 0 1 0 1.414 1.414L10 11.414l4.293 4.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z"></path>
                                        </svg>
                                      </span>
                                    </button>
                                  </span>
                                </div>
                              ) : null}
                              {productSort.length > 0 ? (
                                <div className="Polaris-Stack__Item">
                                  <span className="Polaris-Tag Polaris-Tag--removable">
                                    <span
                                      title="vendor"
                                      className="Polaris-Tag__TagText"
                                    >
                                      Sort by:{' '}
                                      {productSort == 'created-asc' ? (
                                        <> Created (oldest first) </>
                                      ) : productSort == 'created-desc' ? (
                                        <> Created (newest first) </>
                                      ) : productSort == 'updated-asc' ? (
                                        <> Updated (oldest first) </>
                                      ) : productSort == 'updated-desc' ? (
                                        <> Updated (newest first) </>
                                      ) : productSort == 'name-asc' ? (
                                        <> Product title A-Z </>
                                      ) : productSort == 'name-desc' ? (
                                        <> Product title Z-A </>
                                      ) : (
                                        'Created (newest first)'
                                      )}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        setProductSort('');
                                        $('#PolarisSelect4').val('1');
                                      }}
                                      type="button"
                                      aria-label="Remove Refurbished"
                                      className="Polaris-Tag__Button"
                                    >
                                      <span className="Polaris-Icon">
                                        <svg
                                          viewBox="0 0 20 20"
                                          className="Polaris-Icon__Svg"
                                          focusable="false"
                                          aria-hidden="true"
                                        >
                                          <path d="M11.414 10l4.293-4.293a.999.999 0 1 0-1.414-1.414L10 8.586 5.707 4.293a.999.999 0 1 0-1.414 1.414L8.586 10l-4.293 4.293a.999.999 0 1 0 1.414 1.414L10 11.414l4.293 4.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z"></path>
                                        </svg>
                                      </span>
                                    </button>
                                  </span>
                                </div>
                              ) : null}
                            </div>
                            <div id="PolarisPortalsContainer"></div>
                          </div>
                        </div>
                      </div>

                      <div className="Polaris-Card__Section">
                        {loading ? (
                          <Spinner
                            accessibilityLabel="Spinner example"
                            size="large"
                          />
                        ) : products.length > 0 ? (
                          <>
                            <div>
                              <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                Select Base Garment
                              </p>
                              <div id="PolarisPortalsContainer"></div>
                            </div>
                            <div className="thumbnail__grid">
                              {products.map((product, index) => {
                                return (
                                  <Fragment key={index}>
                                    <div className="Polaris-Card">
                                      {product.stock == true ? (
                                        <Link
                                          href={{
                                            pathname: '/',
                                            query: {
                                              tab: 'create-PO',
                                              page: 'assignArtwork',
                                              params: product.id,
                                            },
                                          }}
                                        >
                                          <div
                                            className="Polaris-Card__Header"
                                            style={{ cursor: 'pointer' }}
                                          >
                                            <div
                                              className="Polaris-Heading"
                                              style={{ minHeight: '45.4rem' }}
                                            >
                                              <img
                                                alt="hoody"
                                                src={
                                                  product.image == null
                                                    ? IconNoImage
                                                    : product.image
                                                }
                                              />
                                            </div>
                                          </div>
                                        </Link>
                                      ) : (
                                        <>
                                          <div className="mediacard--tag">
                                            <span className="Polaris-Tag color--cyan">
                                              <span className="Polaris-Tag__TagText White-space Word-wrap">
                                                Out of Stock
                                              </span>
                                            </span>
                                            <div id="PolarisPortalsContainer"></div>
                                          </div>
                                          <div className="Polaris-Card__Header">
                                            <div
                                              className="Polaris-Heading"
                                              style={{ minHeight: '45.4rem' }}
                                            >
                                              <img
                                                alt="hoody"
                                                src={
                                                  product.image == null
                                                    ? IconNoImage
                                                    : product.image
                                                }
                                              />
                                            </div>
                                          </div>
                                        </>
                                      )}

                                      <div className="Polaris-Card__Section">
                                        <div>
                                          <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">
                                            {product.name}
                                          </p>
                                          <div id="PolarisPortalsContainer"></div>
                                        </div>
                                        {product.stock == true ? (
                                          <Link
                                            href={{
                                              pathname: '/',
                                              query: {
                                                tab: 'create-PO',
                                                page: 'assignArtwork',
                                                params: product.id,
                                              },
                                            }}
                                          >
                                            <button
                                              className="Polaris-Button Polaris-Button--fullWidth"
                                              type="button"
                                            >
                                              <span className="Polaris-Button__Content">
                                                <span className="Polaris-Button__Text">
                                                  Select Garment
                                                </span>
                                              </span>
                                            </button>
                                          </Link>
                                        ) : (
                                          <button
                                            className="Polaris-Button Polaris-Button--fullWidth Polaris-Button--disabled"
                                            type="button"
                                          >
                                            <span className="Polaris-Button__Content">
                                              <span className="Polaris-Button__Text">
                                                Select Garment
                                              </span>
                                            </span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </Fragment>
                                );
                              })}
                            </div>
                            {previous == null && next == null ? null : (
                              <div className="Polaris-DataTable__Footer">
                                <nav aria-label="Pagination">
                                  <div
                                    className="Polaris-ButtonGroup"
                                    data-buttongroup-segmented="false"
                                  >
                                    <div
                                      className={
                                        'Polaris-ButtonGroup__Item ' +
                                        (previous ? '' : 'Border_color')
                                      }
                                    >
                                      <a
                                        href="#"
                                        onClick={() =>
                                          getProducts('previous', previous)
                                        }
                                        className={
                                          previous
                                            ? ''
                                            : 'Polaris-Button--disabled'
                                        }
                                      >
                                        <button
                                          id="previousURL"
                                          className={
                                            'Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly ' +
                                            (previous
                                              ? ''
                                              : 'Polaris-Button--disabled')
                                          }
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

                                    <div
                                      className={
                                        'Polaris-ButtonGroup__Item ' +
                                        (next ? '' : 'Border_color')
                                      }
                                    >
                                      <a
                                        href="#"
                                        onClick={() =>
                                          getProducts('next', next)
                                        }
                                        className={
                                          next ? '' : 'Polaris-Button--disabled'
                                        }
                                      >
                                        <button
                                          id="nextURL"
                                          className={
                                            'Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly ' +
                                            (next
                                              ? ''
                                              : 'Polaris-Button--disabled')
                                          }
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
                          </>
                        ) : searchString != '' ||
                          productType != '' ||
                          vendor != '' ? (
                          <div className="_1z7Ob">
                            <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                              <div className="Polaris-Stack__Item_yiyol">
                                <img
                                  src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e"
                                  alt="Empty search results"
                                  draggable="false"
                                />
                              </div>
                              <div className="Polaris-Stack__Item_yiyol">
                                <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                  No Products found
                                </p>
                              </div>
                              <div className="Polaris-Stack__Item_yiyol">
                                <span className="Polaris-TextStyle--variationSubdued_1segu">
                                  <p>Try changing the filters or search term</p>
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Card sectioned>
                            <EmptyState
                              heading="There is no product is available in the store."
                              image="https://cdn.shopify.com/shopifycloud/web/assets/v1/ca2164e72f3221921e4cf1febe0571ae.svg"
                              fullWidth
                            ></EmptyState>
                          </Card>
                        )}
                      </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                    {loading ? null : productCount > 0 ? (
                      <div className="display-text">
                        <div className="one-half text-left">
                          <p
                            className="Polaris-DisplayText Polaris-DisplayText--sizeExtraSmall"
                            style={{ marginLeft: '7px' }}
                          >
                            Showing {pageCount * 8 + 1} to{' '}
                            {pageCount * 8 + productCount} out of total products
                          </p>
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
              <div id="PolarisPortalsContainer"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SelectGarment;
