import { React, useState } from "react";
import NavigationBar from "./NavigationBar";
import "../css/Donations.css";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  Offcanvas,
  Form,
} from "react-bootstrap";
import { Clock, MapPin, SlidersHorizontal, ArrowUpDown } from "lucide-react";

function Donations() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);
  const totalProducts = Array(8).fill(0);
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(243,238,230)" }}>
      <NavigationBar />
      <Container fluid className="px-5 py-4">
        <Row className="my-2 mx-1 d-flex align-items-center justify-content-between">
          <Col xs="auto">
            <DropdownButton
              title={"Location"}
              as={ButtonGroup}
              variant="dark"
              className="me-3 lc-btn"
            ></DropdownButton>
            <DropdownButton
              title={"Categories"}
              as={ButtonGroup}
              variant="dark"
              className="lc-btn"
            ></DropdownButton>
          </Col>
          <Col xs="auto" className="d-flex justify-content-center">
            <div className="me-3">
              <Button
                variant="outline-dark"
                className="sort-btn d-flex align-items-center"
              >
                <ArrowUpDown size={16} className="me-1" />
                Sort by
              </Button>
            </div>
            <div>
              <Button
                variant="outline-dark"
                onClick={toggleShow}
                className="filter-btn me-2 d-flex align-items-center"
              >
                <SlidersHorizontal size={16} className="me-1" />
                More Filters
              </Button>
              {/* Filter offcanvas */}
              <Offcanvas
                show={show}
                onHide={handleClose}
                scroll={true}
                backdrop={true}
                placement="end"
              >
                <Offcanvas.Header closeButton>
                  <Offcanvas.Title className="fs-4">Filters</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="d-flex flex-column">
                  {/* Status Filter */}
                  <div className="mb-4">
                    <h5>Status</h5>
                    <Form.Check
                      type="checkbox"
                      label="Reserved"
                      id="statusReserved"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Not Reserved"
                      id="statusNotReserved"
                    />
                  </div>
                  {/* Time Listed Filter */}
                  <div className="mb-4">
                    <h5>Time Listed</h5>
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="Last 24 hours"
                      id="hr24"
                    />
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="Last 7 days"
                      id="day7"
                    />
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="Last month"
                      id="monthLast"
                    />
                  </div>
                  {/* Condition Filter */}
                  <div className="mb-4">
                    <h5>Condition</h5>
                    <Form.Check
                      type="checkbox"
                      label="Like New"
                      id="conditionNew"
                    />
                    <Form.Check
                      type="checkbox"
                      label="New"
                      id="conditionLikeNew"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Used"
                      id="conditionUsed"
                    />
                    <Form.Check
                      type="checkbox"
                      label="Damaged"
                      id="conditionDamaged"
                    />
                  </div>
                  {/* Apply / Clear Buttons */}
                  <div className="mt-auto d-flex justify-content-between ac-btn">
                    <Button variant="secondary" size="sm" onClick={() => {}}>
                      Clear All
                    </Button>
                    <Button variant="dark" size="sm" onClick={() => {}}>
                      Apply Filters
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
            </div>
          </Col>
        </Row>
        <Row className="g-4 my-2 d-flex justify-content-start">
          {totalProducts.map((__, index) => (
            <Col lg="auto">
              <Card
                className="product-card mb-4 shadow-sm mx-1"
                style={{ width: "17rem" }}
              >
                <Card.Img
                  variant="top"
                  width={600}
                  height={200}
                  src="https://placehold.co/600x400"
                />
                <Card.Body>
                  <div className="pb-2">
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text className="text-muted fs-6 mb-1">
                      <small>
                        Lorem ipsum dolor sit amet, conse ctetur adipiscing
                        elit.
                      </small>
                    </Card.Text>
                  </div>
                  <div className="d-flex align-items-center justify-content-between border-top py-2">
                    <div className="text-muted d-flex flex-column">
                      <div className="d-flex align-items-center mb-1">
                        <Clock size={17} className="me-2" />
                        <small>2 hours ago</small>
                      </div>
                      <div className="d-flex align-items-center">
                        <MapPin size={17} className="me-2" />
                        <small>Dhaka</small>
                      </div>
                    </div>

                    <div>
                      <Badge pill bg="info">
                        Reserved
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default Donations;
