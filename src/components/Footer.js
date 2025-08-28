import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function Footer() {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center py-5 bg-dark"
      style={{
        flexDirection: "column",
        color: "white",
        minHeight: "20vh",
      }}
    >
      <h2>হাতবদল</h2>
      <Col className="d-flex align-items-center my-3">
        <p className="px-2">About</p>
        <p className="px-2">Contact</p>
        <p className="px-2">Privacy Policy</p>
        <p className="px-2">Terms of Service</p>
      </Col>
      <Col style={{ color: "#dadad0ff" }}>©2025 হাতবদল. All rights reserved.</Col>
    </Container>
  );
}

export default Footer;
