import React, { useCallback, useState, useEffect } from 'react'
import AbortController from 'abort-controller'
import Link from 'next/link'
import { Icon, Spinner, Autocomplete, Tag, InlineError,Frame,Toast } from '@shopify/polaris'
import { SearchMinor } from '@shopify/polaris-icons';
import { useRouter } from 'next/router'
import ApiHelper from '../../helpers/api-helper'
import { API } from '../../constants/api'

const AddCustomer = (props) => {

  const router = useRouter();
  const salesRepId = JSON.parse(props.params);
  const [customers, setCustomers] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [existOptions, setExistSelectedOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState(customers);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nameValidation, setNameValidation] = useState(false);
  const [emailValidation, setEmailValidation] = useState(false);
  const [newAssignCustomer, setNewAssignCustomer] = useState([]);
  const [deleteCustomer, setDeleteCustomer] = useState([]);
  const [firstNameError, setFirstNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [toggleActiveT, settoggleActiveT] = useState(false);
  const [toggleMessage, setToggleMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [active, setActive] = useState(false);
  const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
  const toggleActive = useCallback(() => setActive((active) => !active), []);

  let setSignal = null
  let controller = null


  useEffect(() => {
    router.prefetch("/header?tab=customers-PO&page=addCustomer");
    try {
      controller = new AbortController()
      setSignal = controller.signal;
      setLoading(false);
      return () => {
        if (setSignal) {
          controller.abort()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [props]);

  useEffect(() => {
    try {
      controller = new AbortController()
      setSignal = controller.signal;
      return () => {
        if (setSignal) {
          controller.abort()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [searchString]);

  useEffect(() => {

    var difference = [];
    difference = existOptions.concat(selectedOptions);

    difference = difference.filter(function (item) {
      return selectedOptions.indexOf(item) < 0 || existOptions.indexOf(item) < 0;
    });

    setNewAssignCustomer(difference);
    selectedOptions.map((id) => {
      if (deleteCustomer.includes(id)) {
        let tempDelete = deleteCustomer;
        tempDelete.splice(tempDelete.indexOf(id), 1);
        setDeleteCustomer(tempDelete);
      }
    })

  }, [selectedOptions]);

  useEffect(() => {
  }, [newAssignCustomer]);


  useEffect(() => {
    setOptions(customers);
  }, [customers]);

  const updateText = useCallback(

    (value) => {

      setInputValue(value);
      setSearchString(value);
      if (!searchLoading) {
        setSearchLoading(true);
      }

      setTimeout(() => {
        if (value === '') {
          setOptions(customers);
          setSearchLoading(false);
          return;
        }
        const filterRegex = new RegExp(value, '');
        const resultOptions = options.filter((option) =>
          option.label.match(filterRegex),
        );
        setOptions(resultOptions);
        setSearchLoading(false);
      }, 300);
    },
    [customers, searchLoading, options],
  );

  const removeTag = useCallback(
    (tag) => () => {
      const options = [...selectedOptions];
      const deleteOptions = [...deleteCustomer];
      if (existOptions.includes(tag)) {
        deleteOptions.push(tag);
        setDeleteCustomer(deleteOptions);
      }
      options.splice(options.indexOf(tag), 1);
      setSelectedOptions(options);

    },
    [selectedOptions],
  );

  const tagsMarkup = selectedOptions.map((option) => {
    let tagLabel = '';
    tagLabel = option.replace('_', ' ');
    tagLabel = titleCase(tagLabel);

    const customerNameArray = listCustomers.map((customer) => {
      if (customer.value == tagLabel) {
        return customer.label;
      }
    });

    var customerName = customerNameArray.filter(function (el) {
      return el != null;
    });

    return (
      <Tag key={`option${option}`} onRemove={removeTag(option)}>
        {customerName}
      </Tag>
    );
  });

  const textField = (
    <Autocomplete.TextField
      disablePortal
      onChange={updateText}
      label="Customer"
      value={inputValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Search customers to add"

    />
  );

  function titleCase(string) {
    return string
      .toLowerCase()
      .split(' ')
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join('');
  }

  const addCustomer = async () => {
    setLoading(true);
    let url = API.customers;
    let data = {
      firstName: firstName,
      lastName: lastName,
      email: email,
    };
    const createCustomer = await ApiHelper.post(url, data, null);
    if (createCustomer && createCustomer.message == 'success') {
      setLoading(false);
      setToggleMessage("Successfully created customer - "+firstName+" "+lastName);
      settoggleActiveT(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      router.replace("/header?tab=customers-PO&page=salesList");
    } else {
      setLoading(false);
      setActive(true);
      setErrorMessage("Customer create failed")
    }
  };

  const validator = () => {
    var isValid = "false";
    try {
      if (firstName == '') {
        setFirstNameError("Please enter first name");
        setNameValidation(true);
      } else {
        setFirstNameError("");
        setNameValidation(false);
      }

      if (email == '') {
        setEmailError("Please enter email address");
        setEmailValidation(true);
        isValid = false;
      } else {
        var pattern = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

        if (!pattern.test(email)) {

          isValid = false;
          setEmailValidation(true);
          setEmailError("Please enter valid email address.");

        } else {

          isValid = true;
          setEmailValidation(false);
          setEmailError("");
        }
      }
      if (firstName != '' && email != '' && isValid == true) {
        setFirstNameError("");
        setNameValidation(false);
        setEmailError("");
        setEmailValidation(false);
        addCustomer();
        return () => {
          if (setSignal) {
            controller.abort();
          }
        };
      }
    } catch (e) {
      console.log(e);
    }
  }


  return (

    <>

      <div className="Polaris-Tabs__Panel" id="edit-customer" role="tabpanel" aria-labelledby="Edit-customer" tabIndex="-1" >
        <div className="Polaris-Card__Section">
          <div>
            <div className="display-text">
              <div className="display-text--title">
                <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                  Add Customer
                </p>
              </div>
              <div className="one-half text-right">
                <Link
                  href={{
                    pathName: "/",
                    query: { tab: 'customers-PO', page: "customerList" },
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
          </div>

          <div >
            <div className="" id="assign-art">
              <div>
                {loading ? (
                  <Spinner accessibilityLabel="Spinner example" size="large" />
                ) : (
                  <div>
                    <div className="Polaris-Card">
                      <div className="Polaris-Card__Section">

                        <div className="Polaris-Card__Section min--height">
                          <div className="Polaris-FormLayout">
                            <div role="group" className="Polaris-FormLayout--grouped">

                              <div className="Polaris-FormLayout__Items">
                                <div className="Polaris-FormLayout__Item">
                                  <div className="">
                                    <div className="Polaris-Labelled__LabelWrapper">
                                      <div className="Polaris-Label"><label id="FirstNameLabel" htmlFor="FirstName" className="Polaris-Label__Text">First Name</label></div>
                                    </div>
                                    <div className="Polaris-Connected">
                                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                        <div className="Polaris-TextField">
                                          <input id="firstName" autoComplete="off" className="Polaris-TextField__Input" type="text" aria-labelledby="FirstNameLabel" name="firstName" aria-invalid="false" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                          <div className="Polaris-TextField__Backdrop"></div>
                                        </div>
                                        {nameValidation == true && (
                                          <InlineError message={firstNameError} fieldID="firstName" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="Polaris-FormLayout__Item">
                                  <div className="">
                                    <div className="Polaris-Labelled__LabelWrapper">
                                      <div className="Polaris-Label"><label id="lastNameLabel" htmlFor="lastName" className="Polaris-Label__Text">Last Name</label></div>
                                    </div>
                                    <div className="Polaris-Connected">
                                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                        <div className="Polaris-TextField">
                                          <input id="lastName" autoComplete="off" className="Polaris-TextField__Input" type="text" aria-labelledby="lastNameLabel" name="lastName" aria-invalid="false" value={lastName} onChange={(e) => setLastName(e.target.value)} />

                                          <div className="Polaris-TextField__Backdrop"></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="Polaris-FormLayout__Items">
                                <div className="Polaris-FormLayout__Item">
                                  <div className="">
                                    <div className="Polaris-Labelled__LabelWrapper">
                                      <div className="Polaris-Label"><label id="emailIdLabel" htmlFor="emailId" className="Polaris-Label__Text">Email Address</label></div>
                                    </div>
                                    <div className="Polaris-Connected">
                                      <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                        <div className="Polaris-TextField">
                                          <input id="emailId" autoComplete="off" className="Polaris-TextField__Input" type="email" aria-labelledby="emailIdLabel" aria-invalid="false" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                          <div className="Polaris-TextField__Backdrop"></div>
                                        </div>
                                        {emailValidation == true && (
                                          <InlineError message={emailError} fieldID="emailId" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="display-text">
                                <div className="one-half text-right" style={{'padding-left':'89%'}}>
                                  <button
                                    className="Polaris-Button Polaris-Button--primary"
                                    type="button"
                                    onClick={validator}
                                  >
                                    <span className="Polaris-Button__Content">
                                      <span className="Polaris-Button__Text">Add Account</span>
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div id="PolarisPortalsContainer"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {toggleActiveT === true ? (
        <div style={{ height: '250px' }}>
          <Frame>
            <Toast content={toggleMessage} onDismiss={toggleActiveChange} />
          </Frame>
        </div>
      ) : null}

      {active === true ? (
        <div style={{ height: '250px' }}>
          <Frame>
                <Toast content={errorMessage} error onDismiss={toggleActive} />
          </Frame>
        </div>
      ) : null}
    </>
  )
}
export default AddCustomer;
