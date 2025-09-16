import { Link } from "react-router-dom";
import { React, useState, useEffect } from "react";
import axios from "axios";
import Footer from "./Footer";
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
import {
  Clock,
  MapPin,
  SlidersHorizontal,
  ClockArrowUp,
  ClockArrowDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Donations() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [paginatedItems, setPaginatedItems] = useState([]);

  const handleClose = () => setShow(false);
  const toggleShow = () => setShow((s) => !s);

  const [sortByNewest, setSortByNewest] = useState(false);

  // Filter states - active filters applied to items
  const [appliedFilters, setAppliedFilters] = useState({
    status: {
      reserved: false,
      notReserved: false,
    },
    timeListed: "",
    condition: {
      good: false,
      likeNew: false,
      used: false,
      broken: false,
    },
  });

  // Temporary filters - what user is selecting
  const [tempFilters, setTempFilters] = useState({
    status: {
      reserved: false,
      notReserved: false,
    },
    timeListed: "",
    condition: {
      good: false,
      likeNew: false,
      used: false,
      broken: false,
    },
  });

  const location = useLocation();

  // Handle pagination
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(event.target.value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(filteredItems.slice(startIndex, endIndex));
  }, [filteredItems, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, sortByNewest]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Handle filter changes
  const handleStatusChange = (statusType, checked) => {
    setTempFilters((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [statusType]: checked,
      },
    }));
  };
  const handleTimeListedChange = (timeRange) => {
    setTempFilters((prev) => ({
      ...prev,
      timeListed: timeRange,
    }));
  };
  const handleConditionChange = (conditionType, checked) => {
    setTempFilters((prev) => ({
      ...prev,
      condition: {
        ...prev.condition,
        [conditionType]: checked,
      },
    }));
  };

  // Apply filters - move temp filters to applied filters
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    handleClose();
  };

  // Clear all filters
  const clearAllFilters = () => {
    const resetFilters = {
      status: {
        reserved: false,
        notReserved: false,
      },
      timeListed: "",
      condition: {
        good: false,
        likeNew: false,
        used: false,
        broken: false,
      },
    };
    setTempFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  // Apply filters to items
  const filterItems = (itemsToFilter) => {
    let filtered = [...itemsToFilter];

    // Status filter
    const { reserved, notReserved } = appliedFilters.status;
    if (reserved || notReserved) {
      filtered = filtered.filter((item) => {
        if (reserved && notReserved) return true;
        if (reserved) return item.status === "reserved";
        if (notReserved) return item.status === "available";
        return true;
      });
    }

    // Time listed filter
    if (appliedFilters.timeListed) {
      const now = new Date();
      const itemDate = (item) => new Date(item.createdAt);

      filtered = filtered.filter((item) => {
        const createdAt = itemDate(item);
        const diffInHours = (now - createdAt) / (1000 * 60 * 60);
        const diffInDays = diffInHours / 24;

        switch (appliedFilters.timeListed) {
          case "24hours":
            return diffInHours <= 24;
          case "7days":
            return diffInDays <= 7;
          case "30days":
            return diffInDays <= 30;
          default:
            return true;
        }
      });
    }
    // Condition filter
    const conditionFilters = appliedFilters.condition;
    const activeConditions = Object.entries(conditionFilters)
      .filter(([_, isActive]) => isActive)
      .map(([condition, _]) => condition);

    if (activeConditions.length > 0) {
      filtered = filtered.filter((item) => {
        const itemCondition = item.condition?.toLowerCase();
        return activeConditions.some((condition) => {
          switch (condition) {
            case "good":
              return itemCondition === "good";
            case "likeNew":
              return itemCondition === "like-new";
            case "used":
              return itemCondition === "used";
            case "broken":
              return itemCondition === "broken";
            default:
              return false;
          }
        });
      });
    }
    return filtered;
  };
  // Sort items
  const sortItems = (itemsToSort) => {
    if (!sortByNewest) return itemsToSort;

    return [...itemsToSort].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };
  // Apply filters and sorting
  useEffect(() => {
    const filtered = filterItems(items);
    const sorted = sortItems(filtered);
    setFilteredItems(sorted);
  }, [items, appliedFilters, sortByNewest]);

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
                navigate(`/donations?category=${selectedCategory}`);
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
                variant={"outline-dark"}
                className={`sort-btn d-flex align-items-center ${
                  sortByNewest ? "active" : ""
                }`}
                size="sm"
                onClick={() => setSortByNewest(!sortByNewest)}
              >
                {!sortByNewest ? (
                  <ClockArrowUp size={16} className="me-1" />
                ) : (
                  <ClockArrowDown size={16} className="me-1" />
                )}
                {!sortByNewest ? (
                  <span className="d-none d-sm-inline"> Sort By: Newest</span>
                ) : (
                  <span className="d-none d-sm-inline"> Sort By: Oldest</span>
                )}
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
                      checked={tempFilters.status.reserved}
                      onChange={(e) =>
                        handleStatusChange("reserved", e.target.checked)
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Available"
                      id="statusNotReserved"
                      checked={tempFilters.status.notReserved}
                      onChange={(e) =>
                        handleStatusChange("notReserved", e.target.checked)
                      }
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
                      checked={tempFilters.timeListed === "24hours"}
                      onChange={() => handleTimeListedChange("24hours")}
                    />
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="Last 7 days"
                      id="day7"
                      checked={tempFilters.timeListed === "7days"}
                      onChange={() => handleTimeListedChange("7days")}
                    />
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="Last month"
                      id="monthLast"
                      checked={tempFilters.timeListed === "30days"}
                      onChange={() => handleTimeListedChange("30days")}
                    />
                    <Form.Check
                      type="radio"
                      name="timeListed"
                      label="All time"
                      id="allTime"
                      checked={tempFilters.timeListed === ""}
                      onChange={() => handleTimeListedChange("")}
                    />
                  </div>
                  {/* Condition Filter */}
                  <div className="mb-4">
                    <h5>Condition</h5>
                    <Form.Check
                      type="checkbox"
                      label="Good"
                      id="conditionGood"
                      checked={tempFilters.condition.good}
                      onChange={(e) =>
                        handleConditionChange("good", e.target.checked)
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Like New"
                      id="conditionLikeNew"
                      checked={tempFilters.condition.likeNew}
                      onChange={(e) =>
                        handleConditionChange("likeNew", e.target.checked)
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Used"
                      id="conditionUsed"
                      checked={tempFilters.condition.used}
                      onChange={(e) =>
                        handleConditionChange("used", e.target.checked)
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      label="Broken"
                      id="conditionBroken"
                      checked={tempFilters.condition.broken}
                      onChange={(e) =>
                        handleConditionChange("broken", e.target.checked)
                      }
                    />
                  </div>
                  {/* Apply / Clear Buttons */}
                  <div className="mt-auto d-flex justify-content-between ac-btn">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                    <Button variant="dark" size="sm" onClick={applyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </Offcanvas.Body>
              </Offcanvas>
            </div>
          </Col>
        </Row>

        {/* Results summary and items per page selector */}
        <Row className="mx-1 mt-3 d-flex align-items-center justify-content-between">
          <Col xs="auto">
            <Typography
              variant="body2"
              sx={{ color: "#666", fontSize: "0.9rem" }}
            >
              Showing{" "}
              {paginatedItems.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
              -{Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
              {filteredItems.length} items
            </Typography>
          </Col>
          <Col xs="auto">
            <Box sx={{ minWidth: 120 }}>

              <FormControl
                size="small"
                sx={{ backgroundColor: "white", borderRadius: 1 }}
              >
                <InputLabel
                  id="items-per-page-label"
                  sx={{ fontSize: "0.875rem" }}
                >
                  Items Per Page
                </InputLabel>
                <Select
                  labelId="items-per-page-label"
                  value={itemsPerPage}
                  label="Per Page"
                  onChange={handleItemsPerPageChange}
                  sx={{
                    fontSize: "0.875rem",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#dee2e6",
                    },
                  }}
                >
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={16}>16</MenuItem>
                  <MenuItem value={32}>32</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Col>
        </Row>

        {/* Responsive card grid */}
        <Row className="g-2 g-md-4 my-1">
          {paginatedItems.map((item, index) => (
            <Col
              key={index}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={3}
              xxl={3}
              className="d-flex justify-content-center mb-3 mt-2"
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

          {filteredItems.length === 0 && !isFetching && (
            <div className="text-center my-5">
              <h5>No items found.</h5>
            </div>
          )}
        </Row>

        {/* Pagination */}
        {filteredItems.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  fontSize: "1rem",
                  fontWeight: 500,
                  "&.Mui-selected": {
                    backgroundColor: "#333",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#555",
                    },
                  },
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
      <Footer />
    </div>
  );
}
export default Donations;
