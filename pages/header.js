import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import { Tabs } from '@shopify/polaris';
import AllPurchaseOrders from './purchase-order/all-po-list';
import MyPurchaseOrders from './purchase-order/my-po-list';
import CreatePoMaster from './purchase-order/create-po-master';
import AllCustomersMaster from './customers/customer-master';
import AllCustomers from './customers/list';
import SalesrepMaster from './sales-reps/salesrep-master';
import ArtworksMaster from './artwork/artwork-master';

const Header = ({ router }) => {
	const queryTab = router.query.tab;
	const orderId = router.query.id;
	const queryPage = router.query.page;
	const queryParams = router.query.params;
	const [selected, setSelected] = useState(0);
	const [tab, setTab] = useState('');
	const [page, setPage] = useState('');
	const [params, setParams] = useState('');
	let paramObj = null;
	useEffect(() => {
		handleTabChange(queryTab, queryPage, queryParams, orderId);
	}, [queryTab, queryPage, queryParams, orderId]);

	const handleTabChange = (id, page = null, params = null, orderId) => {
		setPage(page);
		if (id == 'all-POs') {
			setTab('all-POs');
		} else if (id == 'my-POs') {
			setTab('my-POs');
		} else if (id == 'create-PO') {
			setTab('create-PO');
			setParams(params);
		} else if (id == 'customers-PO') {
			setTab('customers-PO');
			setParams(params);
		} else if (id == 'sales-reps') {
			setTab('sales-reps');
			setParams(params);
		} else if (id == 'artworks') {
			setTab('artworks');
			setParams(params);
		} else if (orderId) {
			setTab('create-PO');
			setParams(orderId);
			setPage('poPreview');
		} else {
			setTab('all-POs');
			setSelected(0);
		}
	};

	return (
		<>
			<link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css"/>
			<script type="text/javascript" src="http://dev80.p80w.com/Lago/js/jquery-1.12.4.js" />
        	<script type="text/javascript" src="http://dev80.p80w.com/Lago/js/jquery-ui.js" />
			<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
			<script type="text/javascript" src="http://dev80.p80w.com/Lago/js/html2canvas.js"></script>
			<div>
				<div className="Polaris-Card Polaris-Card__no-style">
					<div>
						<div className="Polaris-Tabs__Wrapper">
							<div className="Polaris-Tabs Polaris-Tabs__TabMeasurer">
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="all-POs"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="true"
									>
										<span className="Polaris-Tabs__Title">
											All POs
										</span>
									</button>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="my-POs"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="false"
									>
										<span className="Polaris-Tabs__Title">
											My POs
										</span>
									</button>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="create-PO"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="false"
									>
										<span className="Polaris-Tabs__Title">
											Create PO
										</span>
									</button>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="customers-PO"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="false"
									>
										<span className="Polaris-Tabs__Title">
											Customers
										</span>
									</button>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="sales-reps"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="false"
									>
										<span className="Polaris-Tabs__Title">
											Sales Reps
										</span>
									</button>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<button
										id="artworks"
										role="tab"
										type="button"
										tabIndex="-1"
										className="Polaris-Tabs__Tab"
										aria-selected="false"
									>
										<span className="Polaris-Tabs__Title">
											Artwork
										</span>
									</button>
								</li>
								<button
									type="button"
									className="Polaris-Tabs__DisclosureActivator"
									aria-label="More tabs"
								>
									<span className="Polaris-Tabs__Title">
										<span className="Polaris-Icon Polaris-Icon--colorSubdued Polaris-Icon--applyColor">
											<svg
												viewBox="0 0 20 20"
												className="Polaris-Icon__Svg"
												focusable="false"
												aria-hidden="true"
											>
												<path d="M6 10a2 2 0 1 1-4.001-.001A2 2 0 0 1 6 10zm6 0a2 2 0 1 1-4.001-.001A2 2 0 0 1 12 10zm6 0a2 2 0 1 1-4.001-.001A2 2 0 0 1 18 10z"></path>
											</svg>
										</span>
									</span>
								</button>
							</div>
							<ul
								role="tablist"
								className="Polaris-Tabs Polaris-Tabs--fitted"
							>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'all-POs' },
										}}
									>
										<button
											id="all-POs"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'all-POs'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="true"
										>
											<span className="Polaris-Tabs__Title">
												All POs
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'my-POs' },
										}}
									>
										<button
											id="my-POs"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'my-POs'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="false"
										>
											<span className="Polaris-Tabs__Title">
												My POs
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'create-PO' },
										}}
									>
										<button
											id="create-PO"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'create-PO'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="false"
										>
											<span className="Polaris-Tabs__Title">
												Create PO
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'customers-PO' },
										}}
									>
										<button
											id="customers-PO"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'customers-PO'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="false"
										>
											<span className="Polaris-Tabs__Title">
												Customers
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'sales-reps' },
										}}
									>
										<button
											id="sales-reps"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'sales-reps'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="false"
										>
											<span className="Polaris-Tabs__Title">
												Sales Reps
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__TabContainer"
									role="presentation"
								>
									<Link
										href={{
											pathname: '/',
											query: { tab: 'artworks' },
										}}
									>
										<button
											id="artworks"
											role="tab"
											type="button"
											tabIndex="-1"
											className={
												tab == 'artworks'
													? 'Polaris-Tabs__Tab Polaris-Tabs__Tab--selected'
													: 'Polaris-Tabs__Tab'
											}
											aria-selected="false"
										>
											<span className="Polaris-Tabs__Title">
												Artwork
											</span>
										</button>
									</Link>
								</li>
								<li
									className="Polaris-Tabs__DisclosureTab"
									role="presentation"
								>
									<div>
										<button
											type="button"
											className="Polaris-Tabs__DisclosureActivator"
											aria-label="More tabs"
											tabIndex="0"
											aria-controls="Polarispopover12"
											aria-owns="Polarispopover12"
											aria-expanded="false"
										>
											<span className="Polaris-Tabs__Title">
												<span className="Polaris-Icon Polaris-Icon--colorSubdued Polaris-Icon--applyColor">
													<svg
														viewBox="0 0 20 20"
														className="Polaris-Icon__Svg"
														focusable="false"
														aria-hidden="true"
													>
														<path d="M6 10a2 2 0 1 1-4.001-.001A2 2 0 0 1 6 10zm6 0a2 2 0 1 1-4.001-.001A2 2 0 0 1 12 10zm6 0a2 2 0 1 1-4.001-.001A2 2 0 0 1 18 10z"></path>
													</svg>
												</span>
											</span>
										</button>
									</div>
								</li>
							</ul>
						</div>
						{tab == 'all-POs' ? ( <AllPurchaseOrders handleTabChange={handleTabChange} />) 
						: tab == 'my-POs' ? ( <MyPurchaseOrders handleTabChange={handleTabChange} />) 
						: tab == 'create-PO' ? ( <CreatePoMaster page={page} params={params} />) 
						: tab == 'customers-PO' ? (<AllCustomersMaster page={page} params={params} />)
						: tab == 'sales-reps' ? (<SalesrepMaster page={page} params={params} />)
						: tab == 'artworks' ? (<ArtworksMaster page={page} params={params} />)
						: null}
					</div>
				</div>
			</div>
		</>
	);
};
export default withRouter(Header);
