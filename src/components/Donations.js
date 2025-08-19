import React from "react";
import NavigationBar from "./NavigationBar";
import '../css/Donations.css';
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { Clock, MapPin } from "lucide-react";

function Donations() {
  const totalProducts = Array(8).fill(0);
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "rgb(243,238,230)" }}>
      <NavigationBar />
      <Container fluid className="px-5 py-4">
        <Row className="g-4 d-flex justify-content-start">
          {totalProducts.map((__, index) => (
            <Col lg="auto">
              <Card className="product-card mb-4 shadow-sm mx-1" style={{ width: "17rem" }}>
                <Card.Img variant="top" width={600} height={200} src="https://placehold.co/600x400" />
                <Card.Body>
                  <div className="pb-2">
                    <Card.Title>Product Name</Card.Title>
                    <Card.Text className="text-muted fs-6 mb-1">
                      <small>Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.</small>
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
