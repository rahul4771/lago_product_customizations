import React, { useCallback, useState, useEffect, useRef } from 'react'
import AbortController from 'abort-controller'
import Link from 'next/link'
import { Icon, Spinner, Autocomplete, TextContainer, Stack, Tag, Modal, InlineError,Frame,Toast } from '@shopify/polaris'
import { SearchMinor } from '@shopify/polaris-icons';
import { useRouter } from 'next/router'
import ApiHelper from '../../helpers/api-helper'
import { API } from '../../constants/api'

const EditSalesrep = (props) => {
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
  const [lastNameValidation, setLastNameValidation] = useState(false);
  const [emailValidation, setEmailValidation] = useState(false);
  const [newAssignCustomer, setNewAssignCustomer] = useState([]);
  const [deleteCustomer, setDeleteCustomer] = useState([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [toggleActiveT, settoggleActiveT] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [active, setActive] = useState(false);
  const toggleActiveChange = useCallback(() => settoggleActiveT((toggleActiveT) => !toggleActiveT), []);
  const toggleActive = useCallback(() => setActive((active) => !active), []);
  const handleChange = useCallback(() => setShowPopUp(!showPopUp), [showPopUp]);
  const isCancelled = useRef(false);
  let setSignal = null
  let controller = null
  let concernedElement = null;
  const patternEmail = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);
  const patternName = /[-’/`~!#*$@_%+=.,^&(){}[\]|;:”'"<>?\\]/g;

  useEffect(() => {
    isCancelled.current = false;
    router.prefetch("/header?tab=sales-reps&page=editSalesRep&params=" + salesRepId);
    try {
      controller = new AbortController()
      setSignal = controller.signal;
      setLoading(true);
      getSalesRepDetails(null, null, setSignal)
      return () => {
        isCancelled.current = true;
        if (setSignal) {
          controller.abort()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [props]);

  useEffect(() => {
    isCancelled.current = false;
    try {
      controller = new AbortController()
      setSignal = controller.signal;
      getCustomers(setSignal);
      return () => {
        isCancelled.current = true;
        if (setSignal) {
          controller.abort()
        }
      }
    } catch (e) {
      console.log(e)
    }
  }, [searchString]);

  useEffect(() => {
    isCancelled.current = false;
    let difference = [];
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
    return () => {
      isCancelled.current = true;
    };
  }, [selectedOptions]);
	
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

  const getSalesRepDetails = async (cursor = null, value = null, signal = null) => {
    let url = API.salesReps + "/" + salesRepId;
    setLoading(true);
    const fetchsalesRepDetails = await ApiHelper.get(url, signal);
    if(isCancelled.current ) {
      return false;
    }
    setLoading(false);
    if (fetchsalesRepDetails && fetchsalesRepDetails.message == 'success') {
      setFirstName(fetchsalesRepDetails.body.first_name);
      setLastName(fetchsalesRepDetails.body.last_name);
      setEmail(fetchsalesRepDetails.body.email);
      const srCustomer = fetchsalesRepDetails.body.sales_rep_customers;
      srCustomer.map((customer, key) => {
        setExistSelectedOptions(existOptions => [...existOptions, customer.id]);
        setSelectedOptions(selectedOptions => [...selectedOptions, customer.id]);
      });
    }
  }

  const getCustomers = async (signal = null) => {
    let url = API.customerList;
    if (searchString != "") {
      url += "?query=" + searchString;
    }
    const customerDetails = await ApiHelper.get(url, signal);
    if(isCancelled.current) {
      return false;
    }
    if (customerDetails && customerDetails.message == "success") {
      let customer = customerDetails.body.customers;
      setCustomers(customerDetails.body.customers);
      let newListCustomers = listCustomers;
      customer.map((option) => {
        newListCustomers.push(option);
        let removeDuplicates = multiDimensionalUnique(newListCustomers);
        setListCustomers(removeDuplicates);
      })
    }
  };

  function multiDimensionalUnique(arr) {
    let uniques = [];
    let itemsFound = {};
    for (let i = 0, l = arr.length; i < l; i++) {
      let stringified = JSON.stringify(arr[i]);
      if (itemsFound[stringified]) { continue; }
      uniques.push(arr[i]);
      itemsFound[stringified] = true;
    }
    return uniques;
  }


  useEffect(() => {
    setOptions(customers);
  }, [customers]);

  const updateText = useCallback(
    (value) => {
      if (patternName.test(value)) {
        setInputValue(value);
        setActive(true);
        setErrorMessage("Please enter valid customer name.");
      } else {
        setErrorMessage("");
        setActive(false);
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
      }
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
    let customerName = customerNameArray.filter(function (element) {
      return element != null;
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

  const editSalesRep = async () => {
    setLoading(true);
    let removeCustomer = [...new Set(existOptions.filter(element => deleteCustomer.includes(element)))];
    let newCustomer = newAssignCustomer.filter(x => !existOptions.includes(x));
    let url = API.salesReps + '/' + salesRepId;
    let data = {
      id: salesRepId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      newCustomers: newCustomer,
      removedCustomers: removeCustomer
    };
    const updateSalesRep = await ApiHelper.post(url, data, null);
    if (updateSalesRep && updateSalesRep.message == 'success') {
      setLoading(false);
      settoggleActiveT(true);
      setTimeout(function () {
        router.replace("/header?tab=sales-reps&page=salesList");
      }, 1000);
    }
  };

  const deleteSalesRep = async () => {
    setShowPopUp(true);
  }

  const removeSalesRep = async () => {
    setShowPopUp(false);
    if (salesRepId) {
      let url = API.salesReps + '/remove-salesrep/' + salesRepId;
      let data = {
        existingCustomer: existOptions
      }
      const deletedSalesRep = await ApiHelper.post(url, data, null);
      if (deletedSalesRep && deletedSalesRep.message == 'success') {
        setLoading(true);
        router.replace("/header?tab=sales-reps&page=salesList");
      }else{
        setLoading(false);
        setActive(true);
        setErrorMessage(deletedSalesRep.body.error);
      }
    }
  }

  const validator = () => {
    let isFirstNameValid = false;
    let isLastNameValid = false;
    let isEmailValid = false;
    try {
      switch (true) {
        case firstName.length == 0:
          setFirstNameError("Please enter first name");
          setNameValidation(true);
          isFirstNameValid = false;
          break;
        case patternName.test(firstName):
              setFirstNameError("First name cannot contain special characters");
              setNameValidation(true);
              isFirstNameValid = false;
          break;
        case firstName.length < 3:
          setFirstNameError("Use 3 characters or more for your first name");
          setNameValidation(true);
          isFirstNameValid = false;
          break;
        case firstName.length >= 3 && !patternName.test(firstName):
          setFirstNameError("");
          setNameValidation(false);
          isFirstNameValid = true;
          break;
      }

      switch (true) {
        case lastName.length == 0:
          setLastNameError("Please enter last name");
          setLastNameValidation(true);
          isLastNameValid = false;
          break;
        case patternName.test(lastName):
          setLastNameError("Last name cannot contain special characters");
          setLastNameValidation(true);
          isLastNameValid = false;
          break;
        case lastName.length < 3:
          setLastNameError("Use 3 characters or more for your last name");
          setLastNameValidation(true);
          isLastNameValid = false;
          break;
        
        case lastName.length >= 3 && !patternName.test(lastName):
          setLastNameError("");
          setLastNameValidation(false);
          isLastNameValid = true;
          break;
      }
     

      if (email == '') {
        setEmailError("Please enter email address");
        setEmailValidation(true);
        isEmailValid = false;
      } else if (!patternEmail.test(email)) {
        isEmailValid = false;
        setEmailValidation(true);
        setEmailError("Please enter valid email address.");
      } else {
        isEmailValid = true;
        setEmailValidation(false);
        setEmailError("");
      }
      if (isFirstNameValid == true && isLastNameValid == true && isEmailValid == true) {
        setFirstNameError("");
        setNameValidation(false);
        setEmailError("");
        setEmailValidation(false);
        editSalesRep();
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

  const validateFirstName = (firstNameAdded) => {

    switch (true) {
      case firstNameAdded.length == 0:
        setFirstNameError("Please enter first name");
        setNameValidation(true);
        break;
      case patternName.test(firstNameAdded):
        setFirstNameError("First name cannot contain special characters");
        setNameValidation(true);
        break;
      case firstNameAdded.length < 3:
        setFirstNameError("Use 3 characters or more for your first name");
        setNameValidation(true);
        break;
      case firstNameAdded.length >= 3 && !patternName.test(firstNameAdded):
        setFirstNameError("");
        setNameValidation(false);
        break;
    }
  };

  const validateLastName = (lastNameAdded) => {
    switch (true) {
      case lastNameAdded.length == 0:
        setLastNameError("Please enter last name");
        setLastNameValidation(true);
        break;
      case patternName.test(lastNameAdded):
        setLastNameError("Last name cannot contain special characters");
        setLastNameValidation(true);
        break;
      case lastNameAdded.length < 3:
        setLastNameError("Use 3 characters or more for your last name");
        setLastNameValidation(true);
        break;
      case lastNameAdded.length >= 3 && !patternName.test(lastNameAdded):
        setLastNameError("");
        setLastNameValidation(false);
        break;
    }

  };

  const validateEmail = (emailAdded) => {
    if (emailAdded == '') {
      setEmailError("Please enter email address");
      setEmailValidation(true);
    } else if (!patternEmail.test(emailAdded)) {
      setEmailValidation(true);
      setEmailError("Please enter valid email address.");
    } else {
      setEmailValidation(false);
      setEmailError("");
    }
  };

  return (
    <>
      <div className="Polaris-Tabs__Panel" id="edit-customer" role="tabpanel" aria-labelledby="Edit-customer" tabIndex="-1" >
        <div className="Polaris-Card__Section">
          <div className="display-text">
            <div className="display-text--title">
              <p className="Polaris-DisplayText Polaris-DisplayText--sizeLarge">
                Edit Sales Rep
              </p>
            </div>
            <div className="one-half text-right">
              <Link
                href={{
                  pathName: "/",
                  query: { tab: 'sales-reps', page: "salesList" },
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
            <div>
              <div className="Polaris-Card">
                {loading ? (
                  <Spinner accessibilityLabel="Spinner example" size="large" />
                ) : (
                <div className="Polaris-Card__Section">
                  <div className="Polaris-Card__Section min--height">
                    <div className="Polaris-FormLayout">
                      <div role="group" className="Polaris-FormLayout--grouped">
                        <div className="Polaris-FormLayout__Items">
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Labelled__LabelWrapper">
                              <div className="Polaris-Label"><label id="FirstNameLabel" htmlFor="FirstName" className="Polaris-Label__Text">First Name</label></div>
                            </div>
                            <div className="Polaris-Connected">
                              <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                <div className="Polaris-TextField">
                                  <input id="firstName" autoComplete="off" maxLength="50" className="Polaris-TextField__Input" type="text" aria-labelledby="FirstNameLabel" name="firstName" aria-invalid="false" value={firstName} onChange={(e) => {setFirstName(e.target.value),validateFirstName(e.target.value)}} onKeyUp={(e) => {setFirstName(e.target.value),validateFirstName(e.target.value)}} />
                                  <div className="Polaris-TextField__Backdrop"></div>
                                </div>
                                {nameValidation == true && (
                                  <InlineError message={firstNameError} fieldID="firstName" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Labelled__LabelWrapper">
                              <div className="Polaris-Label"><label id="lastNameLabel" htmlFor="lastName" className="Polaris-Label__Text">Last Name</label></div>
                            </div>
                            <div className="Polaris-Connected">
                              <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                <div className="Polaris-TextField">
                                  <input id="lastName" autoComplete="off" maxLength="50" className="Polaris-TextField__Input" type="text" aria-labelledby="lastNameLabel" name="lastName" aria-invalid="false" value={lastName} onChange={(e) => {setLastName(e.target.value),validateLastName(e.target.value)}} onKeyUp={(e) => {setLastName(e.target.value),validateLastName(e.target.value)}} />
                                  <div className="Polaris-TextField__Backdrop"></div>
                                </div>
                                {lastNameValidation == true && (
                                  <InlineError message={lastNameError} fieldID="lastName" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="Polaris-FormLayout__Items">
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Labelled__LabelWrapper">
                              <div className="Polaris-Label"><label id="emailIdLabel" htmlFor="emailId" className="Polaris-Label__Text">Email Address</label></div>
                            </div>
                            <div className="Polaris-Connected">
                              <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                <div className="Polaris-TextField">
                                  <input id="emailId" autoComplete="off" maxLength="100" className="Polaris-TextField__Input" type="email" aria-labelledby="emailIdLabel" aria-invalid="false" name="email" value={email} onChange={(e) => {setEmail(e.target.value),validateEmail(e.target.value)}} onKeyUp={(e) => {setEmail(e.target.value),validateEmail(e.target.value)}} />
                                  <div className="Polaris-TextField__Backdrop"></div>
                                </div>
                                {emailValidation == true && (
                                  <InlineError message={emailError} fieldID="emailId" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="Polaris-FormLayout__Items">
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Labelled__LabelWrapper">
                            </div>
                            <div className="Polaris-Connected">
                              <div className="Polaris-Connected__Item Polaris-Connected__Item--primary">
                                <br />
                                <Autocomplete
                                  allowMultiple
                                  options={options}
                                  selected={selectedOptions}
                                  textField={textField}
                                  onSelect={setSelectedOptions}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="Polaris-FormLayout__Items">
                          <div className="Polaris-FormLayout__Item">
                            <div className="Polaris-Labelled__LabelWrapper">
                              <div className="Polaris-Label">
                                <TextContainer>
                                  <Stack>{tagsMarkup}</Stack>
                                </TextContainer>
                              </div>
                              <div className="Polaris-TextField">
                                <input id="hiddenId" autoComplete="off" className="Polaris-TextField__Input" type="hidden" aria-labelledby="PolarisTextField05Label" aria-invalid="false" value={salesRepId} />
                                <div className="Polaris-TextField__Backdrop"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="display-text">
                          <div className="one-half text-left">
                            <button
                              className="Polaris-Button Polaris-Button--destructive"
                              type="button"
                              onClick={deleteSalesRep}
                            >
                              <span className="Polaris-Button__Content">
                                <span className="Polaris-Button__Text">Delete Sales Rep</span>
                              </span>
                            </button>
                          </div>
                          <div className="one-half text-right">
                            <button
                              className="Polaris-Button Polaris-Button--primary"
                              type="button"
                              onClick={validator}
                            >
                              <span className="Polaris-Button__Content">
                                <span className="Polaris-Button__Text">Save</span>
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div id="PolarisPortalsContainer"></div>
                  </div>
                </div>
                )}
              </div>
            </div>
            {showPopUp ? (
              <div style={{ height: '500px' }}>
                <Modal
                  small
                  open={showPopUp}
                  onClose={handleChange}
                  title="Really need to remove?"
                  titleHidden
                  primaryAction={{
                    content: 'Remove',
                    onClick: removeSalesRep
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
                        Do you want to remove the sales rep <b>{firstName} {lastName}</b>?
                      </p>
                    </TextContainer>
                  </Modal.Section>
                </Modal>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {toggleActiveT === true ? (
        <div style={{ height: '250px' }}>
          <Frame>
            <Toast content="Successfully updated sales rep details" onDismiss={toggleActiveChange} />
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
export default EditSalesrep;
