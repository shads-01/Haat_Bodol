import React from "react";
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
} from "react-bootstrap";
import { MessageSquareText, Bell, Search } from "lucide-react";

function NavigationBar() {
  return (
    <Navbar data-bs-theme="light" sticky="top" className="navbar shadow-md">
      <Container fluid className="d-flex align-items-center">
        <Row className="w-100 d-flex align-items-center justify-content-between">
          <Col xs="auto" className="d-flex align-items-center">
            {/* logo */}
            <Navbar.Brand href="/home" className="py-1 px-4">
              <img src="logo.jpg" alt="logo" width={100} height={60} />
            </Navbar.Brand>
          </Col>

          <Col className="d-flex justify-content-center">
            <Form className="w-100" style={{ maxWidth: "500px" }}>
              <InputGroup className="searchbox">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="search-input border-1 border-black "
                />
                <Button
                  variant="dark"
                  className="search-btn py-0 border-2 border-black"
                >
                  <Search size={18} />
                </Button>
              </InputGroup>
            </Form>
          </Col>

          <Col xs="auto" className="d-flex align-items-center me-3">
            <Nav className="ms-auto d-flex align-items-center gap-4">
              <Nav.Link href="/home" className="navitem">
                Home
              </Nav.Link>
              <Button variant="dark" className="list-btn fw-400 border ackborder-2 border-black">
                List an Item
              </Button>
              <MessageSquareText strokeWidth={2.5} />
              <Bell strokeWidth={2.5} />
              <Nav.Link href="/profile">
                <img
                  src="placeholder.png"
                  alt="Profile picture"
                  className="rounded-circle border border-2 border-black"
                  width={50}
                  height={50}
                />
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
