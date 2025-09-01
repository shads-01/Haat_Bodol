import React, { use, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import NavigationBar from "./NavigationBar";
import "../css/PostItem.css";
import PhotoUploadBox from "./PhotoUploadBox";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ItemsPostingPage() {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    condition: "",
    address: "",
  });

  const handleInput = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/items", formData);

      //Added alert
      toast.success("Item Added successfully!");

      //Reset formData
      setFormData({
        title: "",
        description: "",
        category: "",
        condition: "",
        address: "",
      });

      navigate("/donations");
    } catch (error) {
      toast.error("Couldn't add the item!");
      console.log("Error adding item.", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ backgroundColor: "rgb(243,238,230)", minHeight: "100vh" }}>
      <NavigationBar />
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
                  required
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
                  required
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
                  {["like-new", "good", "used", "broken"].map(
                    (condition) => (
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
                        required
                        onChange={(e) =>
                          handleInput("condition", e.target.value)
                        }
                      />
                    )
                  )}
                </div>
              </div>

              {/* Add photos */}
              <div className="form-container mb-4">
                <Form.Label className="fw-semibold">Add photos</Form.Label>
                <Row className="g-3">
                  {[...Array(4).fill(null)].map((_, index) => (
                    <Col xs={6} md={4} lg={3} key={index}>
                      <PhotoUploadBox />
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
                  required
                  onChange={(e) => handleInput("address", e.target.value)}
                />
                <div className="fs-6 text-center my-2 fw-semibold">or</div>
                <Button variant="outline-dark" className="w-100">
                  Current Location
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="dark w-100 my-4 p-2 fw-semibold"
                disabled={loading}
              >
                {loading ? "Posting Item..." : "Post Item"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ItemsPostingPage;
