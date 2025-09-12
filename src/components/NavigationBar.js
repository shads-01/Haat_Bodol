import { React, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import {
  Navbar,
  Nav,
  Container,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  Offcanvas,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { MessageSquareText, Bell, Search, Menu, X } from "lucide-react";

function NavigationBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsChecked, setSearchResultsChecked] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);
  const [profilePic, setProfilePic] = useState("placeholder.png");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfilePic(data.profilePic?.url || null);
      } catch (err) {
        console.error("Error fetching profile pic:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setSearchResultsChecked(false);
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/items/search?query=${encodeURIComponent(
          value
        )}`
      );

      setSearchResults(res.data);
      setSearchResultsChecked(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchResultsChecked(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
    if (!searchTerm.trim()) return;

    navigate(`/donations?query=${encodeURIComponent(searchTerm.trim())}`);
    setSearchResults([]); // Clear dropdown
    setSearchResultsChecked(false);
    setSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchResultsChecked(false);
    setSearchFocused(false);
    navigate("/donations"); // Reset view to all items
  };

  return (
    <>
      <Navbar data-bs-theme="light" sticky="top" className="navbar shadow-md">
        <Container fluid className="d-flex align-items-center">
          <Row className="w-100 d-flex align-items-center justify-content-between">
            <Col xs="auto" className="d-flex align-items-center">
              <NavLink to="/donations" className="py-1 px-4">
                <img src="/logo.jpg" alt="logo" width={100} height={60} />
              </NavLink>
            </Col>

            {/* Desktop search bar - hidden on mobile */}
            <Col className="d-none d-lg-flex justify-content-center">
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "500px",
                }}
              >
                <Form className="w-100" onSubmit={handleSearchSubmit}>
                  <InputGroup className="searchbox">
                    <Form.Control
                      type="text"
                      placeholder="Search"
                      className="search-input border-1 border-black "
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setSearchFocused(false), 150)
                      }
                    />
                    {searchTerm && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        onClick={handleClearSearch}
                      >
                        <X size={14} />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="dark"
                      className="search-btn py-0 border-2 border-black"
                    >
                      <Search size={18} />
                    </Button>
                  </InputGroup>
                </Form>

                {/* Search results dropdown */}
                {searchFocused && searchTerm.trim() !== "" && (
                  <div
                    className="search-dropdown bg-white border p-2 mt-1 rounded shadow"
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      width: "100%",
                      maxHeight: "300px",
                      overflowY: "auto",
                      top: "100%",
                      left: 0,
                    }}
                  >
                    {searchResults.length > 0 ? (
                      searchResults.map((item) => (
                        <div
                          key={item._id}
                          className="search-result-item py-1 px-2"
                          onClick={() => navigate(`/item/${item._id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.title}
                        </div>
                      ))
                    ) : searchResultsChecked ? (
                      <div className="text-muted">No items found</div>
                    ) : null}
                  </div>
                )}
              </div>
            </Col>

            {/* desktop navigation - hidden on mobile */}
            <Col xs="auto" className="d-none d-lg-flex align-items-end me-3">
              <Nav className="ms-auto d-flex align-items-center gap-4">
                <Button
                  as={NavLink}
                  to={"/post-item"}
                  variant="dark"
                  className="list-btn fw-400 border ackborder-2 border-black"
                >
                  Post an Item
                </Button>
                <NavLink to="#" className="nav-link">
                  <MessageSquareText strokeWidth={2.5} />
                </NavLink>
                <NavLink to="#" className="nav-link">
                  <Bell strokeWidth={2.5} />
                </NavLink>
                <NavLink to="/profile" className="nav-link">
                  <img
                    src={profilePic}
                    alt="Profile picture"
                    className="rounded-circle border border-2 border-black"
                    width={50}
                    height={50}
                  />
                </NavLink>
              </Nav>
            </Col>
            {/* Mobile menu bar */}
            <Col className="d-lg-none d-flex align-items-center justify-content-end ms-auto">
              <NavLink
                to="/profile"
                className="nav-link me-4"
                onClick={handleClose}
              >
                <img
                  src="/placeholder.png"
                  alt="Profile picture"
                  className="rounded-circle border border-2 border-black"
                  width={40}
                  height={40}
                />
              </NavLink>
              <Button
                variant="dark"
                className="menu-btn py-1 px-2"
                onClick={handleShow}
              >
                <Menu size={24} />
              </Button>
            </Col>
          </Row>
        </Container>
      </Navbar>

      {/* mobile menu offcanvas */}
      <Offcanvas
        show={showOffcanvas}
        onHide={handleClose}
        scroll={true}
        backdrop={true}
        placement="end"
        className="bg-light"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fs-4">Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column gap-3">
            <div className="d-flex justify-content-center mb-3">
              <Button
                as={NavLink}
                to="/post-item"
                variant="dark"
                className="list-btn w-100"
              >
                Post an Item
              </Button>
            </div>
            <div className="d-flex flex-column gap-3">
              <Button
                as={NavLink}
                to="/profile"
                variant="outline-dark"
                className="d-flex align-items-center gap-3 p-2 border border-black w-100"
              >
                <MessageSquareText strokeWidth={2} size={20} />
                <span>Messages</span>
              </Button>
              <Button
                as={NavLink}
                to="/profile"
                variant="outline-dark"
                className="d-flex align-items-center gap-3 p-2 border border-black w-100"
              >
                <Bell strokeWidth={2} size={20} />
                <span>Notifications</span>
              </Button>
            </div>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* mobile search bar */}
      <Row
        className="d-lg-none d-flex justify-content-center mt-3 position-relative"
        style={{ marginBottom: "-10px" }}
      >
        <div style={{ width: "90%", position: "relative" }}>
          <Form className="w-100" onSubmit={handleSearchSubmit}>
            <InputGroup className="searchbox bg-light">
              <Form.Control
                type="search"
                placeholder="Search"
                className="search-input border-1 border-black"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleClearSearch}
                >
                  <X size={14} />
                </Button>
              )}
              <Button
                type="submit"
                variant="dark"
                className="search-btn py-0 border border-black"
              >
                <Search size={18} />
              </Button>
            </InputGroup>
          </Form>

          {/* Mobile dropdown suggestion */}
          {searchFocused && searchTerm.trim() !== "" && (
            <div
              className="search-dropdown bg-white border p-2 mt-1 rounded shadow"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 999,
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item._id}
                    className="search-result-item py-1 px-2"
                    onClick={() => navigate(`/item/${item._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.title}
                  </div>
                ))
              ) : searchResultsChecked ? (
                <div className="text-muted">No items found</div>
              ) : null}
            </div>
          )}
        </div>
      </Row>
    </>
  );
}
export default NavigationBar;
