import React, { useState, useEffect, Fragment } from "react";
import AbortController from "abort-controller";
import Link from 'next/link';
import { Card, EmptyState, Spinner, TextStyle, Toast, Frame } from '@shopify/polaris';
import ApiHelper from "../../helpers/api-helper";
import { API } from "../../constants/api";
import { TOKEN, PREVIEW_URL } from "../../constants/common";
import IconView from "../../images/icon_view.png"

const MyPurchaseOrders = (props) => {
	localStorage.removeItem('customizationInfo');
	localStorage.removeItem('preview');
	localStorage.removeItem('existingPreview');
	localStorage.removeItem('cartData');
	localStorage.removeItem('customer');
  const [myPurchaseOrders, setMyPurchaseOrders] = useState([]);
  const [artwork, setArtwork] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [next, setNext] = useState("");
  const [previous, setPrevious] = useState("");
  const [searchString, setSearchString] = useState("");
  const [searchStringComplete, setSearchStringComplete] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [error, setError] = useState(false);
  const [errorMesage, setErrorMessage] = useState(false);
  let setSignal = null;
  let controller = null;
  const eventKeyCodes = {
      enter: 13,
  }
	const patternName = /[(@!\$%\^\&*\)\(+=._]{1,}/;

  useEffect(() => {
    try {
      if (patternName.test(searchStringComplete)) {
        setErrorMessage("Search word cannot contain special characters");
        setError(true);
        setLoading(false);
      } else {
        setError(false);
        controller = new AbortController();
        setSignal = controller.signal;
        getMyPurchaseOrders(null, null, setSignal);
        return () => {
          if (setSignal) {
            controller.abort();
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [searchStringComplete]);

  /* get purchase order details from endpoint */
  const getMyPurchaseOrders = async (cursor = null, value = null, signal = null) => {
    if (searchString.includes("\\") || searchString.includes("\"")) {
      setErrorMessage("Invalid keyword");
      setError(true);
      return false;
    }
    let url = API.puchaseOrder + "?created-by=admin";
    if (cursor != null && value != null || searchString != "") {
      if (searchString != "") {
        url += "&query=" + searchString.replace("#", "%23");
        if (cursor != null && value != null) {
          url += "&" + cursor + "=" + value;
        } else {
          setPageCount(0);
        }
      } else {
        url += "&" + cursor + "=" + value;
      }
    }
    if (cursor == "previous") {
      setPageCount((pageCount) => (pageCount-1));
    }
    if (cursor == "next") {
      setPageCount((pageCount) => (pageCount+1));
    }

    setLoading(true);
    const purchaseOrders = await ApiHelper.get(url, signal);
    if (purchaseOrders && purchaseOrders.message == "success") {
      setOrderCount(purchaseOrders.body.purchase_orders.length);
      setMyPurchaseOrders(purchaseOrders.body.purchase_orders);
      setArtwork(purchaseOrders.body.artwork);
      setSalesReps(purchaseOrders.body.sales_reps);
      setNext(purchaseOrders.body.next_cursor);
      setPrevious(purchaseOrders.body.previous_cursor);
      setLoading(false);
    }

    if(purchaseOrders && purchaseOrders.message == "error") {
      setOrderCount(0);
      setMyPurchaseOrders([]);
      setArtwork([]);
      setSalesReps([]);
      setLoading(false);
      setNext("");
      setPrevious("");
      setLoading(false);
      setError(true);
      setErrorMessage("Failed to get Orders");
    }
   
  };

  return (
    <>
      <div
        className="Polaris-Tabs__Panel"
        id="all-pos"
        role="tabpanel"
        aria-labelledby="all-pos"
        tabIndex="-1"
      >
        <div className="Polaris-Card__Section">
          <div>
            <div className="display-text">
              <div className="one-half text-left">
                <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                  My Purchase Orders
                </p>
              </div>
              <div className="one-half text-right">
                <Link href={{ pathname: "/", query: { tab: "create-PO", page: "create" } }}>
                  <button
                    className="Polaris-Button Polaris-Button--primary"
                    type="button"
                  >
                    <span className="Polaris-Button__Content">
                      <span className="Polaris-Button__Text">
                        <TextStyle variation="strong" preferredPosition="above">Create PO</TextStyle>
                      </span>
                    </span>
                  </button>
                </Link>
              </div>
            </div>
            <div id="PolarisPortalsContainer"></div>
          </div>
          <div className="Polaris-Layout">
            <div className="Polaris-Layout__Section">
              <div>
                <div className="Polaris-Card">
                  <div className="Polaris-Card__Section">
                    <div>
                      <div
                        aria-expanded="false"
                        aria-owns="PolarisComboBox2"
                        aria-controls="PolarisComboBox2"
                        aria-haspopup="true"
                        tabIndex="0"
                        style={{ outline: "none" }}
                      >
                        <div>
                          <div className="">
                            <div className="Polaris-Labelled__LabelWrapper"></div>
                            <div className="Polaris-Connected" style={{ marginBottom: "5px" }}>
                              <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                <div className="Polaris-TextField">
                                  <div onClick={() => {
                                      try {
                                        controller = new AbortController();
                                        setSignal = controller.signal;
                                        getMyPurchaseOrders(null, null, setSignal);
                                      } catch (e) {
                                          console.log(e);
                                      }
                                    }} style={{cursor: 'pointer'}}>
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
                                    id="PolarisTextField2"
                                    role="combobox"
                                    placeholder="Search"
                                    autoComplete="off"
                                    className="Polaris-TextField__Input"
                                    aria-labelledby="PolarisTextField2Label PolarisTextField2Prefix"
                                    aria-invalid="false"
                                    aria-autocomplete="list"
                                    value={searchString}
                                    tabIndex="0"
                                    aria-controls="Polarispopover2"
                                    aria-owns="Polarispopover2"
                                    aria-expanded="false"
                                    onChange={(e) => setSearchString(e.target.value)}
                                    onKeyDown={(e) => {if(e.keyCode == eventKeyCodes.enter){setSearchStringComplete(e.target.value)}}}
                                    onBlur={(e) => {setSearchStringComplete(e.target.value)}}
                                  />
                                  <div className="Polaris-TextField__Backdrop"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="">
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
                          {loading ? (
                            <Spinner accessibilityLabel="Spinner example" size="large" />
                          ) : myPurchaseOrders.length > 0 ? (
                            <div className="Polaris-DataTable">
                              <div className="Polaris-DataTable__ScrollContainer">

                                <table className="Polaris-DataTable__Table purchase__orders">
                                  <thead>
                                    <tr style={{ backgroundColor: "#d8d8d8" }}>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        CUSTOMER
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        PO#
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        GARMENT
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        SALES REP
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        REQUIRED BY DATE
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      >
                                        STATUS
                                      </th>
                                      <th
                                        data-polaris-header-cell="true"
                                        className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                        scope="col"
                                      ></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {myPurchaseOrders.map((po, index) => {
                                      let lineItems = po.line_items;
                                      let n = 0;
                                      let salesRepId = po.customer.sales_rep_id;
                                      let salesRepName = salesReps[salesRepId];
                                      let status = "";
                                      let approveFlag = false;
                                      let requiredBy = null;
                                      n++;

                                      let rowClass = n == 1 ? "Polaris-DataTable__TableRow last_tr" : "Polaris-DataTable__TableRow last_tr";
                                      return (
                                        <tr className={rowClass} key={"o" + po.id }>
                                          <th
                                            className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                            scope="row"
                                          >
                                            {n == 1 ?
                                              <a
                                                href={'https://lago-apparel-cad.myshopify.com/admin/customers/' + po.customer.id} target='_blank'>
                                                <TextStyle variation="strong">{po.customer.name}</TextStyle>
                                              </a> : null}
                                          </th>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                            {n == 1 ?
                                              <a
                                                href={'https://lago-apparel-cad.myshopify.com/admin/draft_orders/' + po.id} target='_blank'>
                                                <TextStyle variation="strong">{po.name}</TextStyle>
                                              </a> : null}
                                          </td>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                          {
                                            Object.keys(lineItems).length > 0 ? (
                                              Object.keys(lineItems).map((key) => {
                                              requiredBy = lineItems[key].required_by;
                                              requiredBy = requiredBy.replace(/\//g, '-');
                                              return (<Fragment key={"garment" + key}>
                                              <span className="Polaris-Textstyle--variationStrong" style={{ textTransform: "capitalize" }}>
                                                <b> {lineItems[key].product_name} </b>
                                              </span>
                                              <br />
                                              {
                                                lineItems[key].items.map((item, itemKey) => {
                                                  let options = "Qty: " + item.quantity;
                                                  item.options.map((option) => {
                                                    options += ", " + option.name + ": " + option.value;
                                                  })

                                                  return (
                                                    <Fragment key={"o" + po.id + "i" + itemKey}>
                                                      {options}
                                                      <br />
                                                    </Fragment>
                                                  )
                                                })
                                              }

                                              {
                                                lineItems[key].properties.filter(prop => prop.name.startsWith("Artwork-")).map((art, artKey) => {
                                                  let orderArtwork = art.name;
                                                  let artId = orderArtwork.split('-').pop();
                                                  let artName = artwork[artId];
                                                  return (
                                                    <Fragment key={"o" + po.id + "a" + artKey}>
                                                      {artKey == 0 ?
                                                        <>
                                                          <b> Assigned Artwork </b>
                                                          <br />
                                                        </>
                                                        : null}
                                                      SKU: {artId},
                                                      Name:{" "}
                                                      <span className="Polaris-TextStyle--variationPositive" style={{ textTransform: "capitalize" }}>
                                                      {artName ? artName.substring(0, 15) : null}
                                                      </span>
                                                      <br />
                                                    </Fragment>
                                                  )
                                                })
                                              }<a href={PREVIEW_URL + "&orderId=" + po.id + "&productId=" + key + "&token=" + TOKEN}  target="_blank">View All</a><br /><br /></Fragment>)
                                            })
                                            ) : null}
                                            </td>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                            {n == 1 ? <a href={'https://lago-apparel-cad.myshopify.com/admin/customers/' + salesRepId} target='_blank'>
                                              <TextStyle variation="strong">{salesRepName}</TextStyle>
                                            </a> : null}
                                          </td>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                            {n == 1 ? requiredBy : null}
                                          </td>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                          {
                                            Object.keys(lineItems).length > 1 ? (
                                              Object.keys(lineItems).map((key) => {
                                              requiredBy = lineItems[key].required_by;
                                              requiredBy = requiredBy.replace(/\//g, '-');
                                              if (lineItems[key].status == "pendingAdminApproval") {
                                                status = "Awaiting Admin Approval";
                                                approveFlag = true;
                                              } else if (lineItems[key].status == "pendingCustomerApproval") {
                                                status = "Awaiting Client Approval";
                                                approveFlag = true;
                                              } else if (lineItems[key].status == "adminApproved") {
                                                status = "Admin Approved";
                                              } else if (lineItems[key].status == "customerApproved") {
                                                status = "Client Approved";
                                              }
                                              let brCount = (Number(lineItems[key].items.length) + Number(lineItems[key].properties.filter(prop => prop.name.startsWith("Artwork-")).length))/2;
                                              return (<Fragment key={"status" + key}>
                                              <br />
                                            {(() => {
                                              let optionsBR = [];
                                              for (let i = 1; i < brCount; i++) {
                                                optionsBR.push(<br />);
                                              }
                                              return optionsBR;
                                            })()}
                                            <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
                                              <span
                                                title=""
                                                className="Polaris-Tag__TagText"
                                              >
                                                {status}
                                              </span>
                                            </span>
                                            <br /><br /><br />
                                            {(() => {
                                              let optionsBR2 = [];
                                              for (let i2 = 1; i2 <= Math.ceil(brCount); i2++) {
                                                optionsBR2.push(<br />);
                                              }
                                              return optionsBR2;
                                            })()}
                                            </Fragment>)
                                            })
                                              ) : (Object.keys(lineItems).map((key) => {
                                                requiredBy = lineItems[key].required_by;
                                                requiredBy = requiredBy.replace(/\//g, '-');
                                                if (lineItems[key].status == "pendingAdminApproval") {
                                                  status = "Awaiting Admin Approval";
                                                  approveFlag = true;
                                                } else if (lineItems[key].status == "pendingCustomerApproval") {
                                                  status = "Awaiting Client Approval";
                                                  approveFlag = true;
                                                } else if (lineItems[key].status == "adminApproved") {
                                                  status = "Admin Approved";
                                                } else if (lineItems[key].status == "customerApproved") {
                                                  status = "Client Approved";
                                                }
                                                return (<Fragment key={"status" + key}>
                                              <span className={"Polaris-Tag " + (status == 'Admin Approved' ? 'admin--approved' : status == 'Client Approved' ? 'admin--approved' : 'awaiting--approval')}>
                                                <span
                                                  title=""
                                                  className="Polaris-Tag__TagText"
                                                >
                                                  {status}
                                                </span>
                                              </span>
                                              </Fragment>)
                                              }))}
                                          </td>
                                          <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                            {n == 1 && approveFlag ? (
                                              <Link href={{ pathname: "/", query: { tab: "create-PO", page: "poDetails", params: po.id } }}>
                                                <span className="Polaris-Icon" style={{ cursor: "pointer" }}>
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 20 20"
                                                  >
                                                    <g
                                                      fill="none"
                                                      fillRule="evenodd"
                                                    >
                                                      <g fill="#212B36">
                                                        <g>
                                                          <path
                                                            d="M18.878 1.085c-1.445-1.446-3.967-1.446-5.414 0l-11.17 11.17c-.108.108-.18.234-.228.368-.003.009-.012.015-.015.024l-2 6c-.12.359-.026.756.242 1.023.19.19.446.293.707.293.106 0 .212-.016.316-.051l6-2c.01-.003.015-.012.024-.015.134-.048.26-.12.367-.227L18.878 6.499C19.601 5.776 20 4.814 20 3.792c0-1.023-.399-1.984-1.122-2.707zm-1.414 4L17 5.549l-2.586-2.586.464-.464c.691-.691 1.895-.691 2.586 0 .346.346.536.805.536 1.293 0 .488-.19.947-.536 1.293zM3.437 14.814l1.712 1.712-2.568.856.856-2.568zM7 15.549l-2.586-2.586L13 4.377l2.586 2.586L7 15.549z"
                                                            transform="translate(-1145 -345) translate(1145 345)"
                                                          />
                                                        </g>
                                                      </g>
                                                    </g>
                                                  </svg>
                                                </span>
                                              </Link>
                                            ) : approveFlag == false ? (
                                              <Link href={{ pathname: "/", query: { tab: "create-PO", page: "poDetails", params: po.id } }}>
                                              <span className="Polaris-Icon" style={{ cursor: "pointer" }}>
                                              <img
																								src={IconView}
																								alt="Right button"
																							/>
                                              </span>
                                            </Link>) : null
                                            }
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                                {previous == null && next == null ? null : (
                                  <div className="Polaris-DataTable__Footer">
                                    <nav aria-label="Pagination">
                                      <div
                                        className="Polaris-ButtonGroup"
                                        data-buttongroup-segmented="false"
                                      >
                                        <div className={"Polaris-ButtonGroup__Item " + (previous ? '' : "Border_color")}>
                                          <a href="#" onClick={() => getMyPurchaseOrders("previous", previous)} className={(previous ? '' : "Polaris-Button--disabled")}>
                                            <button
                                              id="previousURL"
                                              className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (previous ? '' : "Polaris-Button--disabled")}
                                              aria-label="Previous"
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

                                        <div className={"Polaris-ButtonGroup__Item " + (next ? '' : "Border_color")} >
                                          <a href="#" onClick={() => getMyPurchaseOrders("next", next)} className={(next ? '' : "Polaris-Button--disabled")} >
                                            <button
                                              id="nextURL"
                                              className={"Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly " + (next ? '' : "Polaris-Button--disabled")}
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
                            </div>
                          ) : searchStringComplete != "" ? (
                            <div className="_1z7Ob">
                              <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                                <div className="Polaris-Stack__Item_yiyol">
                                  <img src="data:image/svg+xml,%3csvg width='60' height='60' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e" alt="Empty search results" draggable="false" />
                                </div>
                                <div className="Polaris-Stack__Item_yiyol">
                                  <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                                    No purchase orders found
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
                                heading="Create a purchase order to get started"
                                image="https://cdn.shopify.com/shopifycloud/web/assets/v1/ca2164e72f3221921e4cf1febe0571ae.svg"
                                fullWidth
                              >
                                <p>
                                  This is where you can manage and view the purchase order history.
                                </p>
                                <Link href={{ pathname: "/", query: { tab: "create-PO", page: "create" } }}>
                                  <button
                                    className="Polaris-Button Polaris-Button--primary"
                                    type="button" style={{ 'marginTop': "25px" }}
                                  >
                                    <span className="Polaris-Button__Content">
                                      <span className="Polaris-Button__Text">
                                        <TextStyle variation="strong" preferredPosition="above">Create PO</TextStyle>
                                      </span>
                                    </span>
                                  </button>
                                </Link>
                              </EmptyState>
                            </Card>
                          )}
                        </div>
                      </div>
                    </div>
                    <div id="PolarisPortalsContainer">
                      <div data-portal-id="popover-Polarisportal1"></div>
                    </div>
                  </div>
                </div>
                {loading ? null : orderCount > 0 ?  (<div className="display-text">
                    <div className="one-half text-left">
                    <p className="Polaris-DisplayText Polaris-DisplayText--sizeExtraSmall"style={{ marginLeft: '7px' }}>
                    Showing {pageCount*10+1} to {pageCount*10+orderCount} out of total orders
                    </p>
                    </div>
                </div>) : ''}
              </div>
            </div>
          </div>
          <div id="PolarisPortalsContainer"></div>
        </div>
      </div>
      { error  ? (<Frame>
        <Toast content={errorMesage} error onDismiss={() => {setError(false)}} />
      </Frame>) : ''}
    </>
  );
}

export default MyPurchaseOrders;
