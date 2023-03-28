import React, { useState, useEffect } from 'react'
import AbortController from 'abort-controller'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ApiHelper from '../../helpers/api-helper'
import { API } from '../../constants/api'

const EditCustomer = (props) => {

    const router = useRouter();
    const customerId = JSON.parse(props.params);
    const [customerDetails, setCustomer] = useState([]);
    const [shippingAddress, setShippingAddress] = useState([]);
    const [billingAddress, setBillingAddress] = useState([]);
    const [loading, setLoading] = useState(true);

    let setSignal = null
    let controller = null

    useEffect(() => {
        try {
            controller = new AbortController()
            setSignal = controller.signal
            getCustomerDetails(null, null, setSignal)
            return () => {
                if (setSignal) {
                    controller.abort()
                }
            }
        } catch (e) {
            console.log(e)
        }
    }, []);

    const getCustomerDetails = async (cursor = null, value = null, signal = null) => {
        let url = API.customers + "/" + customerId;
        setLoading(true);
        const fetchCustomerDetails = await ApiHelper.get(url, signal);
        setLoading(false);
        if (fetchCustomerDetails && fetchCustomerDetails.message == 'success') {
            setCustomer(fetchCustomerDetails.body);
            setBillingAddress(fetchCustomerDetails.body.billing_address);
            setShippingAddress(fetchCustomerDetails.body.shipping_address)
        }
    }

    return (
        <>

            <div className="Polaris-Tabs__Panel" id="edit-customer" role="tabpanel" aria-labelledby="Edit-customer" tabIndex="-1" >
                <div className="Polaris-Card__Section">
                    <div className="display-text">
                        <div className="display-text--title">
                            <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                                Edit Customers
                            </p>
                        </div>
                        <div className="one-half text-right">
                            <Link
                                href={{
                                    pathName: "/",
                                    query: { tab: 'customers', page: "customerList" },
                                }}
                            >
                                <button
                                    className="Polaris-Button Polaris-Button"
                                    type="button"
                                >
                                    <span className="Polaris-Button__Content">
                                        <span className="Polaris-Button__Text">Cancel</span>
                                    </span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="" id="assign-art">
                        <div className="Polaris-Card">
                            <div className="Polaris-Card__Section">
                                <div className="Polaris-Card__Section min--height">
                                    <div class="Polaris-FormLayout">
                                        <div role="group" class="Polaris-FormLayout--grouped">
                                            <div class="Polaris-FormLayout__Items">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Labelled__LabelWrapper">
                                                        <div class="Polaris-Label"><label id="PolarisTextField19Label" for="PolarisTextField19" class="Polaris-Label__Text">First Name</label></div>
                                                    </div>
                                                    <div class="Polaris-Connected">
                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <div class="Polaris-TextField">
                                                                <input id="PolarisTextField19" autocomplete="off" class="Polaris-TextField__Input" type="text" aria-labelledby="PolarisTextField19Label" aria-invalid="false" value={customerDetails.first_name} />
                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Labelled__LabelWrapper">
                                                        <div class="Polaris-Label"><label id="PolarisTextField20Label" for="PolarisTextField20" class="Polaris-Label__Text">Last Name</label></div>
                                                    </div>
                                                    <div class="Polaris-Connected">
                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <div class="Polaris-TextField">
                                                                <input id="PolarisTextField20" autocomplete="off" class="Polaris-TextField__Input" type="text" aria-labelledby="PolarisTextField20Label" aria-invalid="false" value={customerDetails.last_name} />
                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="Polaris-FormLayout__Items">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Labelled__LabelWrapper">
                                                        <div class="Polaris-Label"><label id="PolarisTextField20Label" for="PolarisTextField20" class="Polaris-Label__Text">Email Address</label></div>
                                                    </div>
                                                    <div class="Polaris-Connected">
                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <div class="Polaris-TextField">
                                                                <input id="PolarisTextField20" autocomplete="off" class="Polaris-TextField__Input" type="email" aria-labelledby="PolarisTextField20Label" aria-invalid="false" value={customerDetails.email} />
                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="Polaris-Layout">
                                                    <div class="Polaris-Layout__Section">
                                                        <div class="Polaris-Card">
                                                            <div class="Polaris-Card__Header">
                                                                <h2 class="Polaris-Heading">Billing Address</h2>
                                                            </div>
                                                            <div class="Polaris-Card__Section">
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="Polaris-Layout__Section Polaris-Layout__Section--secondary">
                                                        <div class="Polaris-Card">
                                                            <div class="Polaris-Card__Header">
                                                                <h2 class="Polaris-Heading">Shipping Address</h2>
                                                            </div>
                                                            <div class="Polaris-Card__Section">
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="PolarisPortalsContainer"></div>
                                            </div>
                                            <div class="Polaris-FormLayout__Items">
                                                <div class="Polaris-FormLayout__Item">
                                                    <div class="Polaris-Labelled__LabelWrapper">
                                                        <div class="Polaris-Label"><label id="PolarisTextField20Label" for="PolarisTextField20" class="Polaris-Label__Text">Shipping Address</label></div>
                                                    </div>
                                                    <div class="Polaris-Connected">
                                                        <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                                            <div class="Polaris-TextField">
                                                                <input id="PolarisTextField20" autocomplete="off" class="Polaris-TextField__Input" type="text" aria-labelledby="PolarisTextField20Label" aria-invalid="false" value={shippingAddress.address1} />
                                                                <div class="Polaris-TextField__Backdrop"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="display-text">
                                                <div className="one-half text-left">
                                                    <Link
                                                        href={{
                                                            pathName: "/",
                                                            query: { tab: 'customers', page: "customerList" },
                                                        }}
                                                    >
                                                        <button
                                                            className="Polaris-Button Polaris-Button--destructive"
                                                            type="button"
                                                        >
                                                            <span className="Polaris-Button__Content">
                                                                <span className="Polaris-Button__Text">Delete Customer</span>
                                                            </span>
                                                        </button>
                                                    </Link>
                                                </div>
                                                <div className="one-half text-left">
                                                    <Link
                                                        href={{
                                                            pathName: "/",
                                                            query: { tab: 'customers', page: "customerList" },
                                                        }}
                                                    >
                                                        <button
                                                            className="Polaris-Button Polaris-Button--primary"
                                                            type="button"
                                                        >
                                                            <span className="Polaris-Button__Content">
                                                                <span className="Polaris-Button__Text">Save</span>
                                                            </span>
                                                        </button>
                                                    </Link>
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
            </div>
        </>
    )
}
export default EditCustomer;
