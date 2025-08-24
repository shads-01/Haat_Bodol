import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "../css/HomePage.css";
import home1 from "../assets/home1.jpeg";
import home2 from "../assets/home2.jpg";
import home3 from "../assets/home3.jpg";
import { Container, Card, Row, Col, Button } from "react-bootstrap";
import { Search, HeartHandshake, Send, ChevronRight } from "lucide-react";

function HomePage() {
  const categories = [
    { name: "Clothes", image: require("../assets/categories/clothes.jpg") },
    { name: "Books", image: require("../assets/categories/books.jpg") },
    { name: "Utensils", image: require("../assets/categories/utensils.jpg") },
    {
      name: "Electronics",
      image: require("../assets/categories/electronics.jpg"),
    },
    {
      name: "Furnitures",
      image: require("../assets/categories/furnitures.jpg"),
    },
    { name: "Toys", image: require("../assets/categories/toys.jpg") },
    {
      name: "Appliances",
      image: require("../assets/categories/appliances.jpg"),
    },
  ];

  return (
    <>
      <div className="home-body">
        <Container fluid>
          <Carousel className="shadow-sm rounded">
            <Carousel.Item interval={3000}>
              <img
                className="d-block w-100"
                src={home1}
                alt="First slide"
                style={{
                  height: "85vh",
                  objectFit: "cover",
                  minHeight: "300px",
                }}
              />
            </Carousel.Item>
            <Carousel.Item interval={3000}>
              <img
                className="d-block w-100"
                src={home2}
                alt="Second slide"
                style={{
                  height: "85vh",
                  objectFit: "cover",
                  minHeight: "300px",
                }}
              />
            </Carousel.Item>
            <Carousel.Item interval={3000}>
              <img
                className="d-block w-100"
                src={home3}
                alt="Third slide"
                style={{
                  height: "85vh",
                  objectFit: "cover",
                  minHeight: "300px",
                }}
              />
            </Carousel.Item>
          </Carousel>
          <Carousel.Caption>
            <h2 className="fw-700">Give New Life to Your Unused Items</h2>
            <p>
              Donate what you don't need and help someone in your community.
            </p>
            <button className="slider-btn mt-1">Join Us Now</button>
          </Carousel.Caption>
        </Container>

        <Container fluid className="steps-body my-5">
          <h1 className="fw-bold">Simple Steps To Make A Difference</h1>
          <p className="my-2">
            Out platform makes it easy to give and receive donations.
          </p>

          <Row className="d-flex justify-content-center g-4 mt-2">
            <Col xs={12} sm={6} md={4} lg={4}>
              <Card className="px-4 py-3 h-100">
                <Search strokeWidth={1.5} className="mb-3" />
                <Card.Body className="p-0">
                  <Card.Title className="fw-bold">Browse Donations</Card.Title>
                  <Card.Text className="text-muted">
                    Explore a wide range of available donations in your area.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Card className="px-4 py-3 h-100">
                <HeartHandshake strokeWidth={1.5} className="mb-3" />

                <Card.Body className="p-0">
                  <Card.Title className="fw-bold">
                    Exchange Donations
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Request or offer donations through our secure platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Card className="px-4 py-3 h-100">
                <Send strokeWidth={1.5} className="mb-3" />
                <Card.Body className="p-0">
                  <Card.Title className="fw-bold">
                    Connect With People
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Easily connect with donors and recipients to give or receive
                    items hassle-free.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <Container fluid className="categories-body">
          <h1 className="fw-bold">Explore by Category</h1>
          <p className="my-2">
            Browse different item categories to easily find what you need or
            share what you have.
          </p>
          <Row className="d-flex justify-content-center g-4 mt-2">
            {categories.map((cat, index) => (
              <Col
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={3}
                xxl={3}
                className="d-flex justify-content-center mb-4"
              >
                <Card className="shadow-sm" style={{ width: "100%" }}>
                  <Card.Img variant="top" src={cat.image} height={150} />
                  <Card.Body>
                    <Card.Title>{cat.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            <Col
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={3}
              xxl={3}
              className="d-flex justify-content-center mb-3"
            >
              <Card
                className="sm-card shadow-sm d-flex align-items-center justify-content-center text-center"
                style={{
                  width: "100%",
                  minHeight: "250px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                }}
                onClick={() => {
                  window.location.href = "/donations";
                }}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                    <ChevronRight size={30} strokeWidth={3} style={{color: "rgb(104, 189, 159)"}}/>
                  <Card.Title className="mb-0" style={{ color: "rgb(104, 189, 159)" }}>
                    See more
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default HomePage;
