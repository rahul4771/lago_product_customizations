import React, { useState, useEffect } from 'react'
import AbortController from 'abort-controller'
import Link from 'next/link'
import { Spinner } from '@shopify/polaris'
import ApiHelper from '../../helpers/api-helper'
import { API } from '../../constants/api'
import moment from 'moment';

const SalesRepDetails = (props) => {
  const [loading, setLoading] = useState(true)
  const [salesRepName, setSalesRepName] = useState("")
  const [lifeTimeSales, setLifeTimeSales] = useState("")
  const [lastMonthSales, setLastMonthSales] = useState("")
  const [thisMonthSales, setThisMonthSales] = useState("")
  const [thisYearSales, setThisYearSales] = useState("")
  const [orderDetails, setOrderDetails] = useState("")
  let setSignal = null
  let controller = null
  const salesRepId = JSON.parse(props.params);
  
  useEffect(() => {
    try {
      controller = new AbortController()
      setSignal = controller.signal
      getSalesRepSales(null, null, setSignal);
      return () => {
        if (setSignal) {
          controller.abort()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [])

  const getSalesRepSales = async (cursor = null, value = null, signal = null) => {
    let url = API.salesReps + "/" + salesRepId;
    setLoading(true);
    const fetchsalesRepDetails = await ApiHelper.get(url, signal);
    setLoading(false);
    if (fetchsalesRepDetails && fetchsalesRepDetails.message == 'success') {
        setSalesRepName(fetchsalesRepDetails.body.name)
        setLifeTimeSales(fetchsalesRepDetails.body.lifetime_sales)
        setLastMonthSales(fetchsalesRepDetails.body.last_month_sales)
        setThisMonthSales(fetchsalesRepDetails.body.this_month_sales)
        setThisYearSales(fetchsalesRepDetails.body.this_year_sales)
        setOrderDetails(fetchsalesRepDetails.body.customer_order)
    }
  }

  return (
    <div
      className="Polaris-Tabs__Panel"
      id="all-pos"
      role="tabpanel"
      aria-labelledby="all-pos"
      tabIndex="-1"
    >
      <div className="Polaris-Card__Section">
        <div>
          <div className="list--breabcrumbs">
              <ul className="Polaris-List">
                  <li className="Polaris-List__Item">
                      <Link href={{ pathname: "/", query: { tab: "sales-reps", page: "salesList" } }}>Back to Sales Rep </Link>
                  </li>
              </ul>
          </div>
          <div className="display-text">
            <div className="one-half text-left">
              <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
               {salesRepName}
              </p>
            </div>
            <div className="one-half text-right">
              <Link
                href={{
                  pathName: "/",
                  query: { tab: 'sales-reps', page: "editSalesRep", params:salesRepId },
                }}
              >
                <button
                  className="Polaris-Button Polaris-Button--primary"
                  type="button"
                >
                  <span className="Polaris-Button__Content">
                    <span className="Polaris-Button__Text">Edit</span>
                  </span>
                </button>
              </Link>
            </div>
          </div>
          <div id="PolarisPortalsContainer"></div>
        </div>
        <div className="Polaris-Layout">
          <div className="Polaris-Layout__Section">
            <div className="Polaris-Card">
              <div className="grid grid_content" style={{display:"flex", width:"100%", flexWrap:"wrap"}}>
                <div className="one-quarter">
                  <div className="grid_container">
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Header">
                        <h2 className="Polaris-Heading">Lifetime Sales</h2>
                      </div>
                      <div className="Polaris-Card__Section">
                        <div className="Polaris-TextStyle--variationStrong" >
                          <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">  $ {Number(lifeTimeSales).toFixed(2)} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="one-quarter">
                  <div className="grid_container">
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Header">
                        <h2 className="Polaris-Heading">This Month Sales</h2>
                      </div>
                      <div className="Polaris-Card__Section">
                        <div className="Polaris-TextStyle--variationStrong" >
                          <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">  $ {Number(thisMonthSales).toFixed(2)} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="one-quarter">
                  <div className="grid_container">
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Header">
                        <h2 className="Polaris-Heading">Last Month Sales</h2>
                      </div>
                      <div className="Polaris-Card__Section">
                        <div className="Polaris-TextStyle--variationStrong" >
                          <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">  $ {Number(lastMonthSales).toFixed(2)} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="one-quarter">
                  <div className="grid_container">
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Header">
                        <h2 className="Polaris-Heading">This Year Sales</h2>
                      </div>
                      <div className="Polaris-Card__Section">
                        <div className="Polaris-TextStyle--variationStrong" >
                          <p className="Polaris-DisplayText Polaris-DisplayText--sizeMedium">  $ {Number(thisYearSales).toFixed(2)} </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Polaris-Card__Section">
                <div
                  aria-expanded="false"
                  aria-owns="PolarisComboBox2"
                  aria-controls="PolarisComboBox2"
                  aria-haspopup="true"
                  tabIndex="0"
                  style={{ outline: 'none' }}
                >
                  { orderDetails && orderDetails.length == 0 ? (
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
                    ) : loading && orderDetails && orderDetails.length == 0 ? (<div>
                    <div className="Polaris-Labelled__LabelWrapper">
                    </div>
                    <div className="Polaris-Connected">
                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                        <p className="Polaris-Heading">Customers</p>
                      </div>
                    </div>
                  </div>) : null}
                    {loading}
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
                      <Spinner
                        accessibilityLabel="Spinner example"
                        size="large"
                      />
                    ) : orderDetails.length > 0 ? (
                      <div className="Polaris-DataTable">
                        <div className="Polaris-DataTable__ScrollContainer">
                          <table className="Polaris-DataTable__Table SalesRep_Details_Table_Row">
                            <thead>
                              <tr>
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
                                  LAST ORDER
                                </th>
                                <th
                                  data-polaris-header-cell="true"
                                  className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                  scope="col"
                                >
                                  AVERAGE ORDER SIZE
                                </th>
                                <th
                                  data-polaris-header-cell="true"
                                  className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--header"
                                  scope="col"
                                >LIFETIME SALES</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails.map((customer, index) => {
                                let averageOrderSize = customer.lifetime_sales / customer.order_count
                                let lastOrder = customer.last_order.split('T')
                                lastOrder = moment(lastOrder[0]).format('MM-DD-YYYY');
                                return (
                                  <tr key={index}
                                    className="Polaris-DataTable__TableRow"
                                    data-index={index}
                                  >
                                    <th
                                      className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop Polaris-DataTable__Cell--firstColumn"
                                      scope="row"
                                    >
                                      {customer.customer_name}
                                    </th>
                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                      {lastOrder}
                                    </td>
                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                      $ {Number(averageOrderSize).toFixed(2)}
                                    </td>
                                    <td className="Polaris-DataTable__Cell Polaris-DataTable__Cell--verticalAlignTop">
                                      <strong>$ {Number(customer.lifetime_sales).toFixed(2)}</strong>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div id="PolarisPortalsContainer">
                  <div data-portal-id="popover-Polarisportal1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="PolarisPortalsContainer"></div>
      </div>
    </div>
  )
}
export default SalesRepDetails;
