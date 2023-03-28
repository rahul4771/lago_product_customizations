import React, { useState, Fragment, useEffect } from 'react';
import { TextStyle, Tooltip, Spinner, Scrollable } from '@shopify/polaris';
import ApiHelper from '../../helpers/api-helper';
import { API } from '../../constants/api';
import Moment from 'react-moment';
import moment from 'moment';

const ViewPendingOrders = (props) => {
  const [customerId, setCustomerId] = useState(props.customerId);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState('');
  const [previous, setPrevious] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [shopifyCustomerName, setShopifyCustomerName] = useState('');
  let setSignal = null;
  let controller = null;
  let concernedElement = null;
  const eventKeyCodes = {
    escape: 27,
  };

  useEffect(() => {
    (async () => {
      try {
        controller = new AbortController();
        setSignal = controller.signal;
        await getCustomerPendingOrders(null, null, setSignal);
        concernedElement = document.querySelector(
          '.Polaris-Modal-Dialog__Modals_Bulk',
        );
        return () => {
          if (setSignal) {
            controller.abort();
          }
        };
      } catch (e) {
        console.log(e);
      }
    })();
  }, [customerId]);

  document.addEventListener('mousedown', (event) => {
    if (concernedElement != null) {
      if (!concernedElement.contains(event.target)) {
        concernedElement = null;
        props.toggleShowModal(false);
      }
    }
  });

  const getCustomerPendingOrders = async (
    cursor = null,
    value = null,
    signal = null,
  ) => {
    let url = API.customers + '/pending-orders/' + customerId;
    if (cursor != null && value != null) {
      url += '?' + cursor + '=' + value;
    }
    if (cursor == 'previous') {
      setPageCount((pageCount) => pageCount - 1);
    }
    if (cursor == 'next') {
      setPageCount((pageCount) => pageCount + 1);
    }
    setLoading(true);
    const fetchCustomerDetails = await ApiHelper.get(url, signal);
    if (fetchCustomerDetails && fetchCustomerDetails.message == 'success') {
      let orderCount = fetchCustomerDetails.body.pendingOrders.length;
      setPendingOrderCount(orderCount);
      setPendingOrders(fetchCustomerDetails.body.pendingOrders);
      setNext(fetchCustomerDetails.body.nextCursor);
      setPrevious(fetchCustomerDetails.body.previousCursor);
      setLoading(false);
    }
  };
  const customerDetails = async (shCustomerId) => {
    controller = new AbortController();
    setSignal = controller.signal;
    let url = API.customers + '/details/' + shCustomerId;
    const fetchShopifyCustomerDetails = await ApiHelper.get(url, setSignal);
    if (
      fetchShopifyCustomerDetails &&
      fetchShopifyCustomerDetails.message == 'success'
    ) {
      setShopifyCustomerName(fetchShopifyCustomerDetails.body.name);
    }
  };

  $(document).keydown(function (e) {
    if (e.keyCode == eventKeyCodes.escape) {
      props.toggleShowModal(false);
    }
  });
  return (
    <>
      <div id="PolarisPortalsContainer" className="view_pending_orders">
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
                      Pending Purchase Orders
                    </h2>
                  </div>
                  <button
                    className="Polaris-Modal-CloseButton"
                    aria-label="Close"
                    onClick={() => {
                      document.getElementsByClassName(
                        'view_pending_orders',
                      )[0].style.display = 'none';
                      props.toggleShowModal(false);
                    }}
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
                {loading ? (
                  <Spinner accessibilityLabel="Spinner example" size="large" />
                ) : pendingOrders.length == 0 ? (
                  <div className="_1z7Ob">
                    <div className="Polaris-Stack_32wu2 Polaris-Stack--vertical_uiuuj Polaris-Stack--alignmentCenter_1rtaw">
                      <div className="Polaris-Stack__Item_yiyol">
                        <p className="Polaris-DisplayText_1u0t8 Polaris-DisplayText--sizeSmall_7647q">
                          No pending orders found
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="Polaris-Layout">
                    <div className="Polaris-Layout__Section">
                      <div className="Polaris-Card">
                        <div className="Polaris-Card__Section">
                          {window.innerHeight <= 800 ? (
                            <Scrollable
                              shadow
                              style={{ height: '200px' }}
                              focusable
                            >
                              <table
                                className="Polaris-DataTable__Table"
                                style={{ maxHeight: '50%' }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      data-polaris-header-cell="true"
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                      scope="col"
                                    >
                                      Order Name
                                    </th>
                                    <th
                                      data-polaris-header-cell="true"
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                      scope="col"
                                    >
                                      Order Price
                                    </th>
                                    <th
                                      data-polaris-header-cell="true"
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                      scope="col"
                                    >
                                      Created By
                                    </th>
                                    <th
                                      data-polaris-header-cell="true"
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                      scope="col"
                                    >
                                      Required By Date
                                    </th>
                                    <th
                                      data-polaris-header-cell="true"
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                      scope="col"
                                    >
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pendingOrders != null
                                    ? pendingOrders.map(
                                        (pendingOrder, pendingOrderIndex) => {
                                          let productId =
                                            pendingOrder.productId;
                                          let tags = pendingOrder.tags;
                                          let requiredBy = null;
                                          let createdBy = null;
                                          let createdById = null;
                                          let orderStatus = null;
                                          let status = null;
                                          tags.forEach((tag) => {
                                            if (tag.includes('requiredBy')) {
                                              requiredBy = tag.split(':').pop();
                                            }
                                            if (tag.includes('createdBy')) {
                                              createdBy = tag.split(':')[1];
                                              createdById = tag.split(':')[2];
                                              createdBy =
                                                createdBy
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                createdBy.slice(1);
                                            }
                                            if (tag.includes(productId)) {
                                              orderStatus = tag.split(':')[1];
                                            }
                                          });

                                          switch (orderStatus) {
                                            case 'pendingAdminApproval':
                                              status =
                                                'Awaiting Admin Approval';
                                              break;
                                            case 'pendingCustomerApproval':
                                              status =
                                                'Awaiting Client Approval';
                                              break;
                                            case 'adminApproved':
                                              orderStatus == 'adminApproved';
                                              break;
                                            case 'customerApproved':
                                              status = 'Client Approved';
                                              break;
                                          }
                                          return (
                                            <tr
                                              className="Polaris-DataTable__TableRow"
                                              key={pendingOrderIndex}
                                            >
                                              <th
                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                scope="row"
                                              >
                                                <Fragment
                                                  key={
                                                    'pendingorder' +
                                                    pendingOrderIndex
                                                  }
                                                >
                                                  <a
                                                    href={
                                                      'https://lago-apparel-cad.myshopify.com/admin/draft_orders/' +
                                                      pendingOrder.id
                                                    }
                                                    target="_blank"
                                                  >
                                                    <TextStyle
                                                      variation="strong"
                                                      preferredPosition="above"
                                                    >
                                                      {pendingOrder.name}
                                                    </TextStyle>
                                                    <br />
                                                  </a>
                                                </Fragment>
                                              </th>
                                              <th
                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                scope="row"
                                              >
                                                {'$' + pendingOrder.totalPrice}
                                              </th>
                                              <th
                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                scope="row"
                                              >
                                                {createdById ? (
                                                  <a
                                                    color="blue"
                                                    onMouseOver={() => {
                                                      setShopifyCustomerName(
                                                        '',
                                                      ),
                                                        customerDetails(
                                                          createdById,
                                                        );
                                                    }}
                                                    onMouseOut={() => {
                                                      setShopifyCustomerName(
                                                        '',
                                                      );
                                                    }}
                                                  >
                                                    <Tooltip
                                                      content={
                                                        shopifyCustomerName
                                                      }
                                                      active={false}
                                                    >
                                                      <TextStyle
                                                        variation="strong"
                                                        preferredPosition="above"
                                                      >
                                                        {createdBy}
                                                      </TextStyle>
                                                    </Tooltip>
                                                  </a>
                                                ) : (
                                                  createdBy
                                                )}
                                              </th>
                                              <th
                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                scope="row"
                                              >
                                                {requiredBy
                                                  ? moment(
                                                      new Date(requiredBy),
                                                    ).format('MMMM DD, YYYY')
                                                  : null}
                                              </th>
                                              <th
                                                className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                                scope="row"
                                              >
                                                {status}
                                              </th>
                                            </tr>
                                          );
                                        },
                                      )
                                    : null}
                                </tbody>
                              </table>
                            </Scrollable>
                          ) : (
                            <table className="Polaris-DataTable__Table">
                              <thead>
                                <tr>
                                  <th
                                    data-polaris-header-cell="true"
                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn Polaris-DataTable__Cell--header"
                                    scope="col"
                                  >
                                    Order Name
                                  </th>
                                  <th
                                    data-polaris-header-cell="true"
                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                    scope="col"
                                  >
                                    Order Price
                                  </th>
                                  <th
                                    data-polaris-header-cell="true"
                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                    scope="col"
                                  >
                                    Created By
                                  </th>
                                  <th
                                    data-polaris-header-cell="true"
                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                    scope="col"
                                  >
                                    Required By Date
                                  </th>
                                  <th
                                    data-polaris-header-cell="true"
                                    className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header Polaris-DataTable__Cell--numeric"
                                    scope="col"
                                  >
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {pendingOrders != null
                                  ? pendingOrders.map(
                                      (pendingOrder, pendingOrderIndex) => {
                                        let productId = pendingOrder.productId;
                                        let tags = pendingOrder.tags;
                                        let requiredBy = null;
                                        let createdBy = null;
                                        let createdById = null;
                                        let orderStatus = null;
                                        let status = null;
                                        tags.forEach((tag) => {
                                          if (tag.includes('requiredBy')) {
                                            requiredBy = tag.split(':').pop();
                                          }
                                          if (tag.includes('createdBy')) {
                                            createdBy = tag.split(':')[1];
                                            createdById = tag.split(':')[2];
                                            createdBy =
                                              createdBy
                                                .charAt(0)
                                                .toUpperCase() +
                                              createdBy.slice(1);
                                          }
                                          if (tag.includes(productId)) {
                                            orderStatus = tag.split(':')[1];
                                          }
                                        });
                                        if (
                                          orderStatus == 'pendingAdminApproval'
                                        ) {
                                          status = 'Awaiting Admin Approval';
                                        } else if (
                                          orderStatus ==
                                          'pendingCustomerApproval'
                                        ) {
                                          status = 'Awaiting Client Approval';
                                        } else if (
                                          orderStatus == 'adminApproved'
                                        ) {
                                          status = 'Admin Approved';
                                        } else if (
                                          orderStatus == 'customerApproved'
                                        ) {
                                          status = 'Client Approved';
                                        }
                                        return (
                                          <tr
                                            className="Polaris-DataTable__TableRow"
                                            key={pendingOrderIndex}
                                          >
                                            <th
                                              className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                              scope="row"
                                            >
                                              <Fragment
                                                key={
                                                  'pendingorder' +
                                                  pendingOrderIndex
                                                }
                                              >
                                                <a
                                                  href={
                                                    'https://lago-apparel-cad.myshopify.com/admin/draft_orders/' +
                                                    pendingOrder.id
                                                  }
                                                  target="_blank"
                                                >
                                                  <TextStyle
                                                    variation="strong"
                                                    preferredPosition="above"
                                                  >
                                                    {pendingOrder.name}
                                                  </TextStyle>
                                                  <br />
                                                </a>
                                              </Fragment>
                                            </th>
                                            <th
                                              className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                              scope="row"
                                            >
                                              {'$' + pendingOrder.totalPrice}
                                            </th>
                                            <th
                                              className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                              scope="row"
                                            >
                                              {createdById ? (
                                                <a
                                                  color="blue"
                                                  onMouseOver={() => {
                                                    setShopifyCustomerName(''),
                                                      customerDetails(
                                                        createdById,
                                                      );
                                                  }}
                                                  onMouseOut={() => {
                                                    setShopifyCustomerName('');
                                                  }}
                                                >
                                                  <Tooltip
                                                    content={
                                                      shopifyCustomerName
                                                    }
                                                    active={false}
                                                  >
                                                    <TextStyle
                                                      variation="strong"
                                                      preferredPosition="above"
                                                    >
                                                      {createdBy}
                                                    </TextStyle>
                                                  </Tooltip>
                                                </a>
                                              ) : (
                                                createdBy
                                              )}
                                            </th>
                                            <th
                                              className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                              scope="row"
                                            >
                                              {requiredBy
                                                ? moment(
                                                    new Date(requiredBy),
                                                  ).format('MMMM DD, YYYY')
                                                : null}
                                            </th>
                                            <th
                                              className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                              scope="row"
                                            >
                                              {status}
                                            </th>
                                          </tr>
                                        );
                                      },
                                    )
                                  : null}
                              </tbody>
                            </table>
                          )}
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
                                  style={{ marginLeft: '0' }}
                                >
                                  <a
                                    href="#"
                                    onClick={() => {
                                      if (previous != null) {
                                        getCustomerPendingOrders(
                                          'previous',
                                          previous,
                                        );
                                      }
                                    }}
                                    className={
                                      previous ? '' : 'Polaris-Button--disabled'
                                    }
                                  >
                                    <button
                                      style={{
                                        padding: '7px 8px',
                                        border: '1px solid',
                                        backgroundColor: 'transparent',
                                      }}
                                      id="previousURL"
                                      className={
                                        'Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly ' +
                                        (previous
                                          ? ''
                                          : 'Polaris-Button--disabled')
                                      }
                                      aria-label="Previous"
                                      type="button"
                                      disabled={previous == null}
                                    >
                                      <span className="Polaris-Button__Content">
                                        <span
                                          className="Polaris-Button__Icon last-child"
                                          style={{ margin: '0' }}
                                        >
                                          <span
                                            className="Polaris-Icon"
                                            style={{
                                              borderRadius: '4px 0 0 4px',
                                            }}
                                          >
                                            {previous == null ? (
                                              <svg
                                                viewBox="0 0 20 20"
                                                className="Polaris-Icon__Svg"
                                                focusable="false"
                                                aria-hidden="true"
                                                style={{ fill: '#babec3' }}
                                              >
                                                <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                              </svg>
                                            ) : (
                                              <svg
                                                viewBox="0 0 20 20"
                                                className="Polaris-Icon__Svg"
                                                focusable="false"
                                                aria-hidden="true"
                                              >
                                                <path d="M12 16a.997.997 0 0 1-.707-.293l-5-5a.999.999 0 0 1 0-1.414l5-5a.999.999 0 1 1 1.414 1.414L8.414 10l4.293 4.293A.999.999 0 0 1 12 16z"></path>
                                              </svg>
                                            )}
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
                                    onClick={() => {
                                      if (next != null) {
                                        getCustomerPendingOrders('next', next);
                                      }
                                    }}
                                    className={
                                      next ? '' : 'Polaris-Button--disabled'
                                    }
                                  >
                                    <button
                                      id="nextURL"
                                      style={{
                                        padding: '7px 8px',
                                        border: '1px solid',
                                        backgroundColor: 'transparent',
                                      }}
                                      className={
                                        'Polaris-Button Polaris-Button--outline Light_border Polaris-Button--iconOnly ' +
                                        (next ? '' : 'Polaris-Button--disabled')
                                      }
                                      aria-label="Next"
                                      type="button"
                                      disabled={next == null}
                                    >
                                      <span className="Polaris-Button__Content">
                                        <span
                                          className="Polaris-Button__Icon last-child"
                                          style={{ margin: '0' }}
                                        >
                                          <span
                                            className="Polaris-Icon"
                                            style={{
                                              borderRadius: '0 4px 3px 0',
                                            }}
                                          >
                                            {next == null ? (
                                              <svg
                                                viewBox="0 0 20 20"
                                                className="Polaris-Icon__Svg"
                                                focusable="false"
                                                aria-hidden="true"
                                                style={{ fill: '#babec3' }}
                                              >
                                                <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                              </svg>
                                            ) : (
                                              <svg
                                                viewBox="0 0 20 20"
                                                className="Polaris-Icon__Svg"
                                                focusable="false"
                                                aria-hidden="true"
                                              >
                                                <path d="M8 16a.999.999 0 0 1-.707-1.707L11.586 10 7.293 5.707a.999.999 0 1 1 1.414-1.414l5 5a.999.999 0 0 1 0 1.414l-5 5A.997.997 0 0 1 8 16z"></path>
                                              </svg>
                                            )}
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
                    </div>
                  </div>
                )}
                <div className="Polaris-Modal-Footer">
                  {loading == false && pendingOrders.length > 0 ? (
                    <div
                      className="one-half display-text"
                      style={{ marginLeft: '7px', width: '100%' }}
                    >
                      <div>
                        <p className="Polaris-DisplayText Polaris-DisplayText--sizeExtraSmall">
                          Showing {pageCount * 10 + 1} to{' '}
                          {pageCount * 10 + pendingOrderCount} out of total
                          pending orders
                        </p>
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                  <div className="Polaris-Modal-Footer__FooterContents">
                    <div className="Polaris-Stack Polaris-Stack--alignmentCenter">
                      <div className="Polaris-Stack__Item Polaris-Stack__Item--fill"></div>
                      <div className="Polaris-Stack__Item">
                        <div className="Polaris-ButtonGroup">
                          <div
                            className="Polaris-ButtonGroup__Item"
                            style={{ marginTop: '-20px' }}
                          >
                            <button
                              className="Polaris-Button"
                              type="button"
                              onClick={() => {
                                document.getElementsByClassName(
                                  'view_pending_orders',
                                )[0].style.display = 'none';
                                props.toggleShowModal(false);
                              }}
                            >
                              <span className="Polaris-Button__Content">
                                <span className="Polaris-Button__Text">
                                  Cancel
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
      </div>
    </>
  );
};

export default ViewPendingOrders;
