import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "../css/HomePage.css";
import { Container, Card, Row, Col } from "react-bootstrap";
import {
  Search,
  HeartHandshake,
  Send,
  ChevronRight,
  HandHeart,
  Leaf,
  Users,
  Rocket,
} from "lucide-react";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const categories = [
    {
      name: "Clothes",
      value: "clothes",
      image: require("../assets/categories/clothes.jpg"),
    },
    {
      name: "Books",
      value: "books",
      image: require("../assets/categories/books.jpg"),
    },
    {
      name: "Utensils",
      value: "utensils",
      image: require("../assets/categories/utensils.jpg"),
    },
    {
      name: "Electronics",
      value: "electronics",
      image: require("../assets/categories/electronics.jpg"),
    },
    {
      name: "Furnitures",
      value: "furnitures",
      image: require("../assets/categories/furnitures.jpg"),
    },
    {
      name: "Toys",
      value: "toys",
      image: require("../assets/categories/toys.jpg"),
    },
    {
      name: "Appliances",
      value: "appliances",
      image: require("../assets/categories/appliances.jpg"),
    },
  ];
  const aboutcards = [
    {
      title: "Community Connection",
      logo: Users,
      body: "We bring people together by creating a trusted space where kindness and sharing lead the way.",
    },
    {
      title: "Sustainable Impact",
      logo: Leaf,
      body: "By encouraging reuse and exchange, we help reduce waste and promote eco-friendly living.",
    },
    {
      title: "Kindness in Action",
      logo: HandHeart,
      body: "Every donation is more than just an item — it’s an act of care that touches lives.",
    },
    {
      title: "Simple & Accessible",
      logo: Rocket,
      body: "Our platform is designed to make giving and receiving effortless, so everyone can take part in change.",
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
                src={require("../assets/home1.jpeg")}
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
                src={require("../assets/home2.jpg")}
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
                src={require("../assets/home3.jpg")}
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
            <button
              className="slider-btn mt-1"
              onClick={() => {
                window.location.href = "/login-register";
              }}
            >
              Join Us Now
            </button>
          </Carousel.Caption>
        </Container>

        <Container
          fluid
          className="about-body mt-5 mb-4"
          style={{
            backgroundColor: "rgb(242,236,219)",
            width: "99.2vw",
            marginLeft: "-3rem",
            padding: "4rem 4rem",
          }}
        >
          <h1 className="fw-bold">Our Vision</h1>
          <p
            className="my-3"
            style={{
              fontWeight: "500",
              fontSize: "1.3rem",
              textAlign: "justify",
            }}
          >
            At <b>হাতবদল</b>, we imagine a world where no useful item is left
            unused and no helping hand goes unnoticed. Our vision is to create a
            simple and accessible platform that encourages people to donate,
            share, and exchange everyday items with ease. By connecting givers
            and receivers, we reduce waste, promote sustainability, and
            strengthen the bonds of community. Through small acts of kindness,
            we believe we can build a culture of generosity that makes a lasting
            difference.
            <Row className="d-flex justify-content-center g-0 mt-3">
              {aboutcards.map((acard, idx) => {
                const Logo = acard.logo;
                return (
                  <Col xs={12} md={6} lg={3} className="d-flex">
                    <Card className="px-4 my-3 h-100 d-flex align-items-center text-center">
                      <div
                        className="d-flex align-items-center justify-content-center mb-3 border border-dark rounded-circle"
                        style={{ width: "70px", height: "70px" }}
                      >
                        <Logo strokeWidth={2} size={32} className="logo" />
                      </div>

                      <Card.Body className="p-0">
                        <Card.Title className="fw-bold mb-2">
                          {acard.title}
                        </Card.Title>
                        <Card.Text
                          className="px-4"
                          style={{ fontWeight: "300", fontSize: "1.1rem" }}
                        >
                          {acard.body}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                    {idx !== aboutcards.length - 1 && <div className="vline" />}
                  </Col>
                );
              })}
            </Row>
          </p>
        </Container>

        {/* Simple Steps Section */}
        <Container fluid className="steps-body my-5 py-5">
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

        {/* Explore by Category */}
        <Container fluid className="categories-body">
          <h1 className="fw-bold">Explore by Category</h1>
          <p className="my-2">
            Browse different item categories to easily find what you need or
            share what you have.
          </p>
          <Row className="d-flex justify-content-center g-5 mt-2">
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
                <Card
                  className="shadow-sm"
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/donations?category=${cat.value}`);
                  }}
                >
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
                className="sm-card shadow-sm"
                style={{
                  width: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                }}
                onClick={() => {
                  window.location.href = "/donations";
                }}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  <ChevronRight
                    size={30}
                    strokeWidth={3}
                    style={{ color: "rgb(104, 189, 159)" }}
                  />
                  <Card.Title
                    className="mb-0"
                    style={{ color: "rgb(104, 189, 159)" }}
                  >
                    See more
                  </Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default HomePage;
