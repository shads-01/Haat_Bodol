import React, { use, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "../css/PostItem.css";
import PhotoUploadBox from "./PhotoUploadBox";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ItemsPostingPage() {
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [locationLoading, setLocationLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    address: "",
  });

  const validateImage = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPEG, JPG, PNG, WebP) are allowed!");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB!");
      return false;
    }

    return true;
  };

  const handlePhotoChange = (file, index) => {
    if (file && !validateImage(file)) {
      return;
    }
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);
  };
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title for your item!");
      return false;
    }
    if (!formData.category) {
      toast.error("Please choose a category!");
      return false;
    }
    if (!formData.condition) {
      toast.error("Please select the item condition!");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter your location!");
      return false;
    }

    const hasPhotos = photos.some((photo) => photo !== null);
    if (!hasPhotos) {
      toast.error("Please add at least one photo of your item!");
      return false;
    }
    return true;
  };
  const getMyLocation = async () => {
    setLocationLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Fetch user profile data
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = response.data;

      // Check if user has an address saved
      if (userData.address && userData.address.trim()) {
        handleInput("address", userData.address);
        toast.success("Your saved location has been added!");
      } else {
        toast.error(
          "No saved address found. Please update your profile first."
        );
      }
    } catch (error) {
      console.log("Error fetching user location:", error);

      if (error.response?.status === 401) {
        toast.error("Please login to use this feature");
      } else if (error.response?.status === 404) {
        toast.error("User profile not found");
      } else {
        toast.error("Couldn't fetch your saved location");
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const handleInput = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Adding your item...");

    try {
      const formDataObj = new FormData();

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      // Add photos
      photos.forEach((file) => {
        if (file) {
          formDataObj.append("itemPhotos", file);
        }
      });

      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/items", formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(loadingToast);
      toast.success("Item added successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        address: "",
      });
      setPhotos([null, null, null, null]);

      navigate("/donations");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Couldn't add the item!");
      console.log("Error adding item:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ backgroundColor: "rgb(243,238,230)", minHeight: "100vh" }}>
      <Container
        fluid
        className="d-flex justify-content-center p-5 "
        style={{ maxWidth: "700px" }}
      >
        <Row>
          <Col>
            <h2>Add a New Item</h2>
            <i>
              Share what you no longer need with someone who can make use of it.
              Fill in the details below and make a difference today.
            </i>

            <Form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="form-container my-4">
                <Form.Label className="fw-semibold">
                  Title of your item
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="A white sofa, Atomic habits..."
                  className="bg-light px-3 py-2"
                  onChange={(e) => handleInput("title", e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-container mb-4">
                <Form.Label className="fw-semibold">
                  Description of your ad
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Include details such as brand, model, size and item, colour, size etc. (Max 400 character)"
                  className="bg-light"
                  style={{ resize: "none" }}
                  maxLength={400}
                  onChange={(e) => handleInput("description", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-container mb-4">
                <Form.Label className="fw-semibold">
                  Choose a category
                </Form.Label>
                <Form.Select
                  className="bg-light"
                  onChange={(e) => handleInput("category", e.target.value)}
                >
                  <option value="">Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="furnitures">Furnitures</option>
                  <option value="books">Books</option>
                  <option value="clothes">Clothes</option>
                  <option value="toys">Toys</option>
                  <option value="utensils">Utensils</option>
                  <option value="appliances">Appliances</option>
                  <option value="others">Others</option>
                </Form.Select>
              </div>

              {/* Item condition */}
              <div className="mb-4">
                <Form.Label className="fw-semibold">
                  Condition of your item
                </Form.Label>
                <div>
                  {["like-new", "good", "used", "broken"].map((condition) => (
                    <Form.Check
                      key={condition}
                      type="radio"
                      id={condition}
                      name="condition"
                      value={condition}
                      label={
                        condition === "like-new"
                          ? "Like New"
                          : condition === "good"
                          ? "Good condition"
                          : condition === "used"
                          ? "Used"
                          : "Broken"
                      }
                      className="mb-2"
                      onChange={(e) => handleInput("condition", e.target.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Add photos */}
              <div className="form-container mb-4">
                <Form.Label className="fw-semibold">Add photos</Form.Label>
                <Row className="g-3">
                  {photos.map((photo, index) => (
                    <Col xs={6} md={4} lg={3} key={index}>
                      <PhotoUploadBox
                        photo={photo}
                        onChange={(file) => handlePhotoChange(file, index)}
                      />
                    </Col>
                  ))}
                </Row>
                <div
                  style={{
                    color: "gray",
                    textAlign: "right",
                    fontSize: "12px",
                  }}
                >
                  4 photos max
                </div>
              </div>

              {/* Address */}
              <div className="form-container mb-4">
                <Form.Label className="fw-semibold">Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter an address"
                  className="bg-light px-3 py-2"
                  value={formData.address}
                  onChange={(e) => handleInput("address", e.target.value)}
                />
                <div className="fs-6 text-center my-2 fw-semibold">or</div>
                <Button
                  variant="outline-dark"
                  className="w-100"
                  onClick={getMyLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Loading...
                    </>
                  ) : (
                    "My Location"
                  )}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="dark w-100 my-4 p-2 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Posting Item...{" "}
                  </>
                ) : (
                  "Post Item"
                )}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ItemsPostingPage;
