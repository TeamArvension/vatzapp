import React, {useState, useEffect} from "react";
import {Row, Col, Card, Modal, Accordion, Button, ListGroup, InputGroup, FormControl} from "react-bootstrap";
import {Grid, GridColumn as Column} from "@progress/kendo-react-grid";
import {process} from "@progress/kendo-data-query";
import moment from "moment";
import DatePicker from "react-datepicker";
import Select from "react-select";
import {FaAngleDown} from "react-icons/fa";
import {AiOutlineReload} from "react-icons/ai";
import {callApi} from "../../../services/apiService";
import {ApiConstants} from "../../../config/apiConstants";
import Spinner from "../../../components/Spinner";
import Preview from "../../../components/Preview";
import {entryTypeList} from "../../../enums/entryTypeList";
import {entryTypes} from "../../../enums/entryTypes";
import {showNotification} from "../../../services/toasterService";
import SalesForm from "./forms/salesForm";
import ExpenditureForm from "./forms/expenditureForm";
import PurchaseForm from "./forms/purchaseForm";

const CheckedEntries = (props) => {
	const [showLoader, setShowLoader] = useState(false);
	const [entriesList, setEntriesList] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [showPreview, setshowPreview] = useState(false);
	const [selectedEntry, setselectedEntry] = useState(null);
	const [selectedEntryType, setselectedEntryType] = useState("");
	const [gridState, setgridState] = useState({skip: 0, take: 10});
	const [gridData, setgridData] = useState(null);

	const [accordionList, setAccordionList] = useState([]);
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	React.useLayoutEffect(() => {
		setWindowWidth(window.innerWidth > 992);
	}, []);

	const pagerSettings = {buttonCount: 5, info: true, type: "numeric", pageSizes: true, previousNext: true};

	useEffect(() => getData(), []);

	useEffect(() => setgridData(process(entriesList, gridState)), [entriesList, gridState]);

	const pageChange = (event) => {
		setgridState({...gridState, skip: event.page.skip, take: event.page.take});
	};
	const filterChange = (event) => {
		setgridState({...gridState, filter: event.filter});
	};

	const onSearchFilter = () => {
		let dateFilters = [];
		if (startDate) {
			dateFilters.push({field: "invoice_date", operator: "gte", value: moment(startDate).format("YYYY-MM-DD")});
		}

		if (endDate) {
			dateFilters.push({field: "invoice_date", operator: "lte", value: moment(endDate).format("YYYY-MM-DD")});
		}

		let updatedState = {...gridState, filter: {logic: "and", filters: dateFilters}};
		setgridState(updatedState);
	};

	const resetFilters = () => {
		let updatedState = {...gridState, filter: null};
		setgridState(updatedState);
		setStartDate(null);
		setEndDate(null);
	};

	const getData = () => {
		setShowLoader(true);
		callApi("get", ApiConstants.entry.checkercheckedlist, {}, true)
			.then((response) => {
				setShowLoader(false);
				if (response && response.status_code === 200) {
					let temp = response.payload;
					console.log(response.payload);
					setEntriesList(temp);
					setAccordionList(temp);
				} else {
					showNotification("Error", response.message, "error");
				}
			})
			.catch((error) => {
				setShowLoader(false);
				showNotification("Error", "Something went wrong", "error");
			});
	};

	const viewEntry = (entry) => {
		setselectedEntry(entry);
		setselectedEntryType(entry.entry_type);
		setshowPreview(true);
	};

	const closeEntryModal = () => {
		setshowPreview(false);
		setselectedEntryType("");
	};

	const onEntrySubmit = () => {
		closeEntryModal();
		getData();
	};

	return (
		<React.Fragment>
			{showLoader && <Spinner />}
			<Row>
				<Col xl={12}>
					<Card className="rounded">
						<Card.Body className="p-4">
							<Row className="mb-3">
								<Col xs={12} md={4} xl={3}>
									<div className="date-picker-container">
										<DatePicker className="form-control mb-2" placeholderText="Start Date" dateFormat="dd/MM/yyyy" selected={startDate} onSelect={() => setEndDate(null)} onChange={setStartDate} />
										<i className="feather icon-calendar"></i>
									</div>
								</Col>
								<Col xs={12} md={4} xl={3}>
									<div className="date-picker-container">
										<DatePicker className="form-control mb-2" minDate={startDate} placeholderText="End Date" dateFormat="dd/MM/yyyy" selected={endDate} onChange={setEndDate} />
										<i className="feather icon-calendar"></i>
									</div>
								</Col>
								<Col xs={10} md={1} xl={1}>
									<button type="button" className="btn-icon btn btn-primary search-button" onClick={onSearchFilter}>
										<i className="feather icon-search"></i>
									</button>
								</Col>
								<Col xs={2} md={1} xl={1}>
									{(startDate || endDate) && (
										<div className="text-muted filter-close-btn" role="button" onClick={resetFilters}>
											<i className="feather icon-x"></i>
										</div>
									)}
								</Col>
								<Col md={1} xl={4} style={{display: "flex", justifyContent: "flex-end"}}>
									<Button size="sm" onClick={getData}>
										<AiOutlineReload size={`1.8em`} />
									</Button>
								</Col>
							</Row>

							{windowWidth && (
								<Grid data={gridData} skip={gridState.skip} pageSize={gridState.take} pageable={pagerSettings} onPageChange={pageChange} filterable={true} filter={gridState.filter} onFilterChange={filterChange}>
									<Column field="id" filterable={false} title="#" width="60px" cell={(props) => <td>{props.dataIndex + 1}</td>} />
									<Column field="name" title="Client Name" width="250px" />
									<Column
										field="invoice_at"
										filterable={false}
										width="180"
										title="Invoice Date"
										cell={(props) => (
											<td>
												<div>{moment(props.dataItem.invoice_date).format("DD-MMM-YYYY")}</div>
											</td>
										)}
									/>
									<Column field="invoice_number" title="Invoice #" width="180px" />
									{/* <Column
                  field="invoice_date"
                  filterable={false}
                  width="180"
                  title="Invoice Date"
                  cell={(props) => (
                    <td>
                      <div>
                        {moment(props.dataItem.invoice_date).format(
                          "DD-MMM-YYYY"
                        )}
                      </div>
                    </td>
                  )}
                /> */}
									<Column field="amount" title="Amount" width="150px" />
									<Column
										field="entry_type"
										title="Type"
										width="150px"
										cell={(props) => (
											<td>
												<div>{props.dataItem.entry_type === entryTypes.SALE ? "Sales" : props.dataItem.entry_type === entryTypes.PURCHASE ? "Purchase" : props.dataItem.entry_type === entryTypes.EXPENDITURE ? "Expenditure" : ""}</div>
											</td>
										)}
									/>
									<Column
										field="View"
										filterable={false}
										title="View"
										cell={(props) => (
											<td>
												<div className="action-panel">
													<button type="button" className="btn-icon btn btn-outline-primary" title="View" onClick={() => viewEntry(props.dataItem)}>
														<i className="feather icon-eye"></i>
													</button>
												</div>
											</td>
										)}
									/>
								</Grid>
							)}
							<div>
								{!windowWidth && (
									<>
										<InputGroup className="mb-2">
											<FormControl
												className="form-control"
												placeholder="Client Name"
												aria-label="Client Name"
												onChange={(event) => {
													setAccordionList(entriesList);
													return event.target.value ? setAccordionList(accordionList?.filter((data) => data.name?.includes(event.target.value))) : setAccordionList(entriesList);
												}}
											/>
										</InputGroup>
										<InputGroup className="mb-2">
											<FormControl
												className="form-control"
												placeholder="Checker Name"
												aria-label="Checker Name"
												onChange={(event) => {
													setAccordionList(entriesList);
													return event.target.value ? setAccordionList(accordionList?.filter((data) => data.checker_name?.includes(event.target.value))) : setAccordionList(entriesList);
												}}
											/>
										</InputGroup>

										<Accordion defaultActiveKey="0">
											{accordionList &&
												accordionList.length > 0 &&
												accordionList.map((row) => (
													<Card key={row.id} style={{marginBottom: 4}}>
														<Accordion.Toggle as={Card.Header} style={{backgroundColor: "#7599b1", color: "#ffffff", padding: "8px 16px"}} eventKey={row.id}>
															<div style={{display: "flex", justifyContent: "space-between"}}>
																Client: {row.name}
																<Button variant="outline-light" size="sm">
																	<FaAngleDown />
																</Button>
															</div>
														</Accordion.Toggle>
														<Accordion.Collapse eventKey={row.id}>
															<Card.Body>
																<div className="action-panel" style={{dispaly: "flex", justifyContent: "flex-end", marginBottom: 16}}>
																	<button type="button" className="btn btn-outline-primary" title="View" onClick={() => viewEntry(row)}>
																		View <i className="feather icon-eye"></i>
																	</button>
																</div>
																<ListGroup>
																	<ListGroup.Item>
																		<span style={{padding: "0 16px 0 8px"}}>Invoice Date:</span>
																		<span>{row.invoice_date}</span>
																	</ListGroup.Item>
																	<ListGroup.Item>
																		<span style={{padding: "0 16px 0 8px"}}>Invoice Number:</span>
																		<span>{row.invoice_number}</span>
																	</ListGroup.Item>
																	<ListGroup.Item>
																		<span style={{padding: "0 16px 0 8px"}}>Amount:</span>
																		<span>{row.amount}</span>
																	</ListGroup.Item>
																	<ListGroup.Item>
																		<span style={{padding: "0 16px 0 8px"}}>Type:</span>
																		<span>{row.entry_type === entryTypes.SALE ? "Sales" : row.entry_type === entryTypes.PURCHASE ? "Purchase" : row.entry_type === entryTypes.EXPENDITURE ? "Expenditure" : ""}</span>
																	</ListGroup.Item>
																</ListGroup>
															</Card.Body>
														</Accordion.Collapse>
													</Card>
												))}
										</Accordion>
									</>
								)}
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal size={selectedEntryType === entryTypes.PURCHASE ? "xl" : "lg"} show={showPreview} backdrop="static" keyboard={true}>
				<Modal.Body className="p-0">
					<button type="button" className="btn-icon btn close-btn" onClick={closeEntryModal}>
						<i className="feather icon-x-circle"></i>
					</button>
					<div className="px-4 py-5">
						<Row>
							<Col className={selectedEntryType === entryTypes.PURCHASE ? "col-lg-4" : "col-lg-6"}>
								<Preview source={selectedEntry?.file_path} containerStyles={{backgroundColor: "#f5f5f5", padding: 10}} zoom={true} />
							</Col>
							<Col className={selectedEntryType === entryTypes.PURCHASE ? "col-lg-8" : "col-lg-6"}>
								<Row>
									<Col className={selectedEntryType === entryTypes.PURCHASE ? "col-lg-6" : "col-lg-12"}>
										<div className="input-group mb-3">
											<Select
												className="w-100 form-control-select"
												classNamePrefix="select"
												isDisabled
												value={entryTypeList.find((i) => i.value === selectedEntry?.entry_type)}
												options={entryTypeList}
												placeholder="Entry type"
												isSearchable={false}
												onChange={(data) => setselectedEntryType(data.value)}
											/>
										</div>
									</Col>
								</Row>
								<Row>
									<Col lg={12}>
										<div className="input-group">
											{selectedEntryType === entryTypes.SALE && <SalesForm entry={selectedEntry} onSuccess={onEntrySubmit} onShowLoader={setShowLoader} />}
											{selectedEntryType === entryTypes.EXPENDITURE && <ExpenditureForm entry={selectedEntry} onSuccess={onEntrySubmit} onShowLoader={setShowLoader} />}
											{selectedEntryType === entryTypes.PURCHASE && <PurchaseForm entry={selectedEntry} onSuccess={onEntrySubmit} onShowLoader={setShowLoader} />}
										</div>
									</Col>
								</Row>
							</Col>
						</Row>
					</div>
				</Modal.Body>
			</Modal>
		</React.Fragment>
	);
};

export default CheckedEntries;