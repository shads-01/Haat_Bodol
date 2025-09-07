import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Badge, Carousel } from "react-bootstrap";
import { Clock, MapPin } from "lucide-react";
import axios from "axios";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import "../css/ItemDetails.css";
import { formatDistanceToNow } from "date-fns";

function ProductDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error("Error fetching item:", err);
      }
    };

    fetchItem();
  }, [id]);

  const capitalizeWords = (str) => {
    if (!str) return "N/A";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (!item) return <p className="text-center mt-5">Item not found</p>;

  return (
    <>
      <div style={{ minHeight: "100vh", backgroundColor: "rgb(243,238,230)" }}>
        <NavigationBar />
        <Container className="py-4">
          <Row className="d-flex justify-content-center">
            {/* Left Column - Item Details */}
            <Col md={12} lg={8}>
              <div className="bg-light rounded shadow-sm p-3 mb-4">
                {/* Image Slider */}
                {item.photos && item.photos.length > 0 && (
                  <div className="slider-container mb-4">
                    <Carousel
                      indicators={item.photos.length > 1}
                      controls={item.photos.length > 1}
                      interval={null}
                      className="rounded"
                    >
                      {item.photos.map((photo, index) => (
                        <Carousel.Item key={index}>
                          <img
                            className="d-block w-100 rounded"
                            src={photo.url}
                            alt={`${item.title} - Photo ${index + 1}`}
                            style={{
                              height: "400px",
                              objectFit: "contain",
                            }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </div>
                )}
                {/* Item Details */}
                <div className="px-2">
                  <hr/>
                  <h3 className="mb-2">{item.title}</h3>
                  <h6>
                    {capitalizeWords(item.category)} <strong>.</strong>{" "}
                    {capitalizeWords(item.condition)} <strong>.</strong>{" "}
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
                  </h6>
                  <div className="mb-3 d-flex align-items-center">
                    <Clock size={17} className="me-2 text-muted" />
                    <small className="text-muted fs-6">
                      Posted{" "}
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}{" "}
                    </small>
                  </div>
                  <h5 className="mt-4">Item Description</h5>
                  <p className="text-muted mb-4">{item.description}</p>
                  <h5 className="mt-4">Location</h5>
                  <Row>
                    <Col sm={6}>
                      <div className="d-flex align-items-center">
                        <MapPin size={16} className="me-2 text-muted" />
                        <small className="text-muted">
                          {item.address || "Not specified"}
                        </small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>

            {/* Right Column - Donor Information */}
            <Col md={12} lg={4}>
              <div className="bg-white rounded shadow-sm p-4">
                <h4 className="mb-2">Donated By</h4>

                <div className="text-center mb-4">
                  <div
                    className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <span className="h2 text-muted mb-0">
                      {item.donorName
                        ? item.donorName.charAt(0).toUpperCase()
                        : "D"}
                    </span>
                  </div>
                  <h5 className="mt-3 mb-1">
                    {item.donorName || "Anonymous Donor"}
                  </h5>
                </div>

                <div className="border-top pt-3">
                  <div className="mb-2">
                    <strong>Email: </strong>
                    <span className="text-muted">
                      {item.donorEmail || "Not provided"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Phone: </strong>
                    <span className="text-muted">
                      {item.donorPhone || "Not provided"}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Member Since: </strong>
                    <span className="text-muted">
                      {item.donorJoinedDate
                        ? new Date(item.donorJoinedDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button className="btn btn-dark">Request Item</button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetails;
