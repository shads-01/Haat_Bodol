import React, { useState, useEffect } from "react";
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
  NavDropdown,
} from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { MessageSquareText, Bell, Search, Menu, X, User, LogOut } from "lucide-react";
import toast from "react-hot-toast";

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
  const [showDropdown, setShowDropdown] = useState(false);
  const handleToggle = (isOpen) => {
    setShowDropdown(isOpen);
  };

  const isSignedIn = () => {
    const token = localStorage.getItem("token");

    if (!token) return false;

    try {
      // Decode JWT to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime; // Check if token is not expired
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSignedIn()) return; // Only fetch if user is signed in

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
        setProfilePic(data.profilePic?.url || "placeholder.png");
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
    e.preventDefault();
    if (!searchTerm.trim()) return;

    navigate(`/donations?query=${encodeURIComponent(searchTerm.trim())}`);
    setSearchResults([]);
    setSearchResultsChecked(false);
    setSearchFocused(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchResultsChecked(false);
    setSearchFocused(false);
    navigate("/donations");
  };

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("token");

      // Clear tokens
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Redirect to login
      navigate("/login-register");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear and redirect on error
      localStorage.clear();
      navigate("/login-register");
    }
  };

  // Fixed: Use navigate directly instead of onClick handler
  const handleChatNavigation = () => {
    navigate('/chat');
  };

  return (
    <>
      <Navbar data-bs-theme="light" sticky="top" className="navbar shadow-md">
        <Container fluid className="d-flex align-items-center">
          <Row className="w-100 d-flex align-items-center justify-content-between">
            <Col xs="auto" className="d-flex align-items-center">
              <NavLink className="py-1 px-4" to="/donations">
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
                        variant="outline-dark"
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

            {/* Desktop navigation - show different content based on auth */}
            {isSignedIn() ? (
              <Col xs="auto" className="d-none d-lg-flex align-items-end me-3">
                <Nav className="ms-auto d-flex align-items-center gap-4">
                  <Button
                    as={NavLink}
                    to={"/post-item"}
                    variant="dark"
                    className="list-btn fw-400 border border-2 border-black"
                  >
                    Post an Item
                  </Button>
                  
                  {/* FIXED: Use Button with onClick instead of NavLink */}
                  <Button
                    variant="link"
                    className="nav-link p-0"
                    onClick={handleChatNavigation}
                    style={{ color: 'inherit' }}
                  >
                    <MessageSquareText strokeWidth={2.5} />
                  </Button>
                  
                  <Button
                    variant="link"
                    className="nav-link p-0"
                    style={{ color: 'inherit' }}
                  >
                    <Bell strokeWidth={2.5} />
                  </Button>
                  
                  <div className="profile-dropdown">
                    <NavDropdown
                      title={
                        <img
                          src={profilePic}
                          alt="Profile picture"
                          className="rounded-circle border border-2 border-black"
                          width={60}
                          height={60}
                        />
                      }
                      id="profile-dropdown"
                      show={showDropdown}
                      onToggle={handleToggle}
                      align="end"
                    >
                      <NavDropdown.Item
                        as={NavLink}
                        to="/profile"
                        className="d-flex align-items-center"
                      >
                        <User size={20} className="me-2" />
                        Profile
                      </NavDropdown.Item>
                      <NavDropdown.Divider />
                      <NavDropdown.Item
                        onClick={handleSignOut}
                        className="d-flex align-items-center text-danger"
                        style={{ cursor: "pointer" }}
                      >
                        <LogOut size={20} className="me-2" />
                        Sign Out
                      </NavDropdown.Item>
                    </NavDropdown>
                  </div>
                </Nav>
              </Col>
            ) : (
              <Col xs="auto" className="d-none d-lg-flex align-items-center">
                <Button
                  as={NavLink}
                  to="/login-register"
                  variant="outline-dark"
                  className="border-2 border-black fw-500"
                >
                  Sign In / Sign Up
                </Button>
              </Col>
            )}

            {/* Mobile menu bar */}
            <Col className="d-lg-none d-flex align-items-center justify-content-end ms-auto">
              {isSignedIn() && (
                <div className="profile-dropdown me-2">
                  <NavDropdown
                    title={
                      <img
                        src={profilePic}
                        alt="Profile picture"
                        className="rounded-circle border border-2 border-black"
                        width={50}
                        height={50}
                      />
                    }
                    id="profile-dropdown-mobile"
                    show={showDropdown}
                    onToggle={handleToggle}
                    align="end"
                  >
                    <NavDropdown.Item
                      as={NavLink}
                      to="/profile"
                      className="d-flex align-items-center"
                    >
                      <User size={20} className="me-2" />
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item
                      onClick={handleSignOut}
                      className="d-flex align-items-center text-danger"
                      style={{ cursor: "pointer" }}
                    >
                      <LogOut size={20} className="me-2" />
                      Sign Out
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              )}

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

      {/* Mobile menu offcanvas */}
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
          {isSignedIn() ? (
            <Nav className="flex-column gap-3">
              <div className="d-flex justify-content-center mb-3">
                <Button
                  as={NavLink}
                  to="/post-item"
                  variant="dark"
                  className="list-btn w-100"
                  onClick={handleClose}
                >
                  Post an Item
                </Button>
              </div>
              <div className="d-flex flex-column gap-3">
                {/* FIXED: Use Button with onClick for mobile chat navigation */}
                <Button
                  variant="outline-dark"
                  className="d-flex align-items-center gap-3 p-2 border border-black w-100"
                  onClick={() => {
                    handleChatNavigation();
                    handleClose();
                  }}
                >
                  <MessageSquareText strokeWidth={2} size={20} />
                  <span>Messages</span>
                </Button>
                <Button
                  as={NavLink}
                  to="/profile"
                  variant="outline-dark"
                  className="d-flex align-items-center gap-3 p-2 border border-black w-100"
                  onClick={handleClose}
                >
                  <Bell strokeWidth={2} size={20} />
                  <span>Notifications</span>
                </Button>
              </div>
            </Nav>
          ) : (
            <div className="d-flex justify-content-center">
              <Button
                as={NavLink}
                to="/login-register"
                variant="dark"
                className="w-100 py-3"
                onClick={handleClose}
              >
                Sign In / Sign Up
              </Button>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Mobile search bar */}
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
                    onClick={() => {
                      navigate(`/item/${item._id}`);
                      setSearchFocused(false);
                    }}
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