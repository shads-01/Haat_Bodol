import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Carousel,
  Alert,
} from "react-bootstrap";
import { Clock, MapPin } from "lucide-react";
import axios from "axios";
import Footer from "./Footer";
import "../css/ItemDetails.css";
import { formatDistanceToNow } from "date-fns";
import { socketService } from "../utils/socket"; // Import socket service
import { notificationAPI } from "../services/notificationService";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [donor, setDonor] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(""); // 'success', 'error', ''
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Add this useEffect to fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsLoadingUser(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const userData = response.data;
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  // Check if current user is the donor
  const isCurrentUserDonor = user && donor && user._id === donor._id;
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/items/${id}`);
        setItem(res.data);
        setDonor(res.data.donatedBy);
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

  const handleMessageDonor = () => {
    if (!donor) return;

    // Navigate to chat page with donor ID
    navigate("/chat", { state: { startChatWith: donor._id } });
  };
  const handleRequestItem = async () => {
    if (!donor || !item) return;

    try {
      setIsRequesting(true);
      setRequestStatus("");

      // Send notification to donor
      await notificationAPI.sendItemRequest(donor._id, item._id, item.title);

      setRequestStatus("success");

      // Optional: You can also emit a socket event if needed
      const socket = socketService.getSocket();
      socket.emit("item-requested", {
        donorId: donor._id,
        itemId: item._id,
        itemName: item.title,
      });
    } catch (error) {
      console.error("Error sending item request:", error);
      setRequestStatus("error");
    } finally {
      setIsRequesting(false);
    }
  };

  if (!item) return <p className="text-center mt-5">Item not found</p>;

  return (
    <>
      <div style={{ minHeight: "70vh", backgroundColor: "rgb(243,238,230)" }}>
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
                  <hr />
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
                {donor ? (
                  <>
                    <div className="text-center mb-4">
                      <img
                        src={donor.profilePic?.url || "/placeholder.png"}
                        alt="Profile picture"
                        className="rounded-circle border border-2 border-black"
                        width={100}
                        height={100}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />

                      <h5 className="mt-3 mb-1">
                        {donor.name || "Anonymous Donor"}
                      </h5>
                    </div>

                    <div className="border-top pt-3">
                      <div className="mb-2">
                        <strong>Email: </strong>
                        <span className="text-muted">
                          {donor.email || "Not provided"}
                        </span>
                      </div>
                      <div className="mb-2">
                        <strong>Phone: </strong>
                        <span className="text-muted">
                          {donor.phone || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="d-grid gap-2 mt-4">
                      <button
                        className="btn btn-dark"
                        onClick={handleRequestItem}
                        disabled={
                          isRequesting ||
                          item.status !== "available" ||
                          isLoadingUser ||
                          isCurrentUserDonor
                        }
                      >
                        {isRequesting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Sending Request...
                          </>
                        ) : isLoadingUser ? (
                          "Loading..."
                        ) : isCurrentUserDonor ? (
                          "Your are the Donor"
                        ) : item.status === "available" ? (
                          "Request Item"
                        ) : (
                          "Not Available"
                        )}
                      </button>

                      {requestStatus === "success" && (
                        <Alert variant="success" className="mt-2 mb-0 small">
                          Request sent! The donor will be notified.
                        </Alert>
                      )}

                      {requestStatus === "error" && (
                        <Alert variant="danger" className="mt-2 mb-0 small">
                          Failed to send request. Please try again.
                        </Alert>
                      )}
                    </div>

                    <div className="d-grid gap-2 mt-3">
                      <button
                        className="btn btn-outline-dark"
                        onClick={handleMessageDonor}
                        disabled={isLoadingUser || isCurrentUserDonor}
                      >
                        {isLoadingUser
                          ? "Loading..."
                          : isCurrentUserDonor
                          ? "Your are the Donor"
                          : "Message Donor"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <img
                      src="/placeholder.png"
                      alt="Anonymous donor"
                      className="rounded-circle border border-2 border-black"
                      width={60}
                      height={60}
                    />
                    <h5 className="mt-3 mb-1">Anonymous Donor</h5>
                    <p className="text-muted">
                      Donor information not available
                    </p>
                  </div>
                )}
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
