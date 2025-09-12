import { Link } from "react-router-dom";
import { React, useState, useEffect } from "react";
import axios from "axios";
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
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

function Donations() {
  const [show, setShow] = useState(false);
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);

  const location = useLocation();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const searchQuery = queryParams.get("query");
        const categoryFilter = queryParams.get("category");

        let url = "http://localhost:5000/api/items";

        if (searchQuery) {
          url = `http://localhost:5000/api/items/search?query=${encodeURIComponent(
            searchQuery
          )}`;
        } else if (categoryFilter) {
          url = `http://localhost:5000/api/items?category=${encodeURIComponent(
            categoryFilter
          )}`;
        }
        const res = await axios.get(url);
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchItems();
  }, [location.search]);

  if (isFetching) {
    return (
      <Box sx={{ backgroundColor: "#f3eee6", minHeight: "100vh" }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
          className="d-flex justify-content-center"
          style={{ marginTop: "20%" }}
        >
          <CircularProgress />
        </Container>
      </Box>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(243,238,230)" }}>
      <Container fluid className="px-3 px-md-5 py-4">
        <Row className="my-1 mx-1 d-flex align-items-center justify-content-between">
          <Col xs="auto">
            <DropdownButton
              title={
                <>
                  <span className="d-none d-sm-inline">Location</span>
                  <span className="d-sm-none">Loc</span>
                </>
              }
              as={ButtonGroup}
              variant="dark"
              size="sm"
              className="me-2 me-md-3 lc-btn"
            ></DropdownButton>
            <DropdownButton
              title={
                <>
                  <span className="d-none d-sm-inline">Categories</span>
                  <span className="d-sm-none">Cat</span>
                </>
              }
              as={ButtonGroup}
              variant="dark"
              size="sm"
              className="lc-btn"
              onSelect={(selectedCategory) => {
                window.location.href = `/donations?category=${selectedCategory}`;
              }}
            >
              <Dropdown.Item eventKey="">All</Dropdown.Item>
              <Dropdown.Item eventKey="electronics">Electronics</Dropdown.Item>
              <Dropdown.Item eventKey="furnitures">Furnitures</Dropdown.Item>
              <Dropdown.Item eventKey="books">Books</Dropdown.Item>
              <Dropdown.Item eventKey="clothes">Clothes</Dropdown.Item>
              <Dropdown.Item eventKey="toys">Toys</Dropdown.Item>
              <Dropdown.Item eventKey="utensils">Utensils</Dropdown.Item>
              <Dropdown.Item eventKey="appliances">Appliances</Dropdown.Item>
              <Dropdown.Item eventKey="others">Others</Dropdown.Item>
            </DropdownButton>
          </Col>
          <Col xs="auto" className="d-flex justify-content-center">
            <div className="me-2 me-md-3">
              <Button
                variant="outline-dark"
                className="sort-btn d-flex align-items-center"
                size="sm"
              >
                <ArrowUpDown size={16} className="me-1" />
                <span className="d-none d-sm-inline">Sort by</span>
              </Button>
            </div>
            <div>
              <Button
                variant="outline-dark"
                onClick={toggleShow}
                className="filter-btn me-2 d-flex align-items-center"
                size="sm"
              >
                <SlidersHorizontal size={16} className="me-1" />
                <span className="d-none d-sm-inline">More Filters</span>
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
                    <Button variant="secondary" size="sm">
                      Clear All
                    </Button>
                    <Button variant="dark" size="sm">
                      Apply Filters
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
            </div>
          </Col>
        </Row>

        {/* Responsive card grid */}
        <Row className="g-2 g-md-4 my-2">
          {items.map((item, index) => (
            <Col
              key={index}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={3}
              xxl={3}
              className="d-flex justify-content-center mb-3"
            >
              <Link
                key={item._id}
                to={`/item/${item._id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Card
                  className="product-card shadow-sm h-100"
                  style={{ width: "100%", maxWidth: "300px" }}
                >
                  <Card.Img
                    variant="top"
                    src={
                      item.photos[0]
                        ? `${item.photos[0].url}`
                        : "https://placehold.co/600x400"
                    }
                  />
                  <Card.Body className="d-flex flex-column">
                    <div className="pb-2 flex-grow-1">
                      <Card.Title className="h5 mb-2">{item.title}</Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {item.description?.slice(0, 60)}...
                      </Card.Text>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-auto">
                      <div className="text-muted d-flex flex-column mx-1">
                        <div className="d-flex align-items-center mb-2">
                          <Clock size={16} className="me-2" />
                          <small>
                            {formatDistanceToNow(new Date(item.createdAt), {
                              addSuffix: true,
                            })}{" "}
                          </small>
                        </div>
                        <div className="d-flex align-items-start">
                          <MapPin
                            size={16}
                            className="me-2 flex-shrink-0 mt-1"
                          />
                          <small
                            className="flex-grow-1 text-break"
                            style={{
                              lineHeight: "1.2",
                              maxWidth: "150px",
                            }}
                          >
                            {item.address}
                          </small>
                        </div>
                      </div>
                      <div>
                        <Badge
                          pill
                          bg={
                            item.status === "available"
                              ? "success"
                              : item.status === "reserved"
                              ? "info"
                              : "dark"
                          }
                          className="small"
                        >
                          {item.status === "available"
                            ? "Available"
                            : item.status === "reserved"
                            ? "Reserved"
                            : "Donated"}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}

          {items.length === 0 && (
            <div className="text-center my-5">
              <h5>No items found for your search.</h5>
            </div>
          )}
        </Row>
      </Container>
    </div>
  );
}
export default Donations;
