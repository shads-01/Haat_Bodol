import React from "react";
import { useParams } from "react-router-dom";
import { Container, Card, Row, Col, Badge } from "react-bootstrap";
import NavigationBar from "./NavigationBar";
import { Clock, MapPin } from "lucide-react";
import { Category } from "@mui/icons-material";

function ProductDetails() {
  const { id } = useParams(); 

  const dummyProduct = {
    name: "Wooden Chair",
    description: "A study wooden chair in good condition. Minimal scratches.",
    condition: "Used",
    category: "Furniture",
    status: "Reserved",
    location: "Dhaka",
    postedTime: "2 hours ago",
    image: "https://placehold.co/600x400",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3eee6" }}>
      <NavigationBar />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Img variant="top" src={dummyProduct.image} />
              <Card.Body>
                <Card.Title className="h4">{dummyProduct.name}</Card.Title>
                <Card.Text className="text-muted">{dummyProduct.description}</Card.Text>

                <Row className="mt-4">
                  <Col sm={6}>
                    <div className="mb-2">
                      <strong>Condition:</strong> {dummyProduct.condition}
                    </div>
                    <div className="mb-2">
                      <strong>Category:</strong> {dummyProduct.category}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> <Badge bg="info">{dummyProduct.status}</Badge>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="mb-2 d-flex align-items-center">
                      <Clock size={16} className="me-2" />
                      <small>{dummyProduct.postedTime}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <MapPin size={16} className="me-2" />
                      <small>{dummyProduct.location}</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ProductDetails;
