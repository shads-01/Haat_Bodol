import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import NavigationBar from "./NavigationBar";
import "../css/PostItem.css";
import PhotoUploadBox from "./PhotoUploadBox";
import axios from "axios";

function ItemsPostingPage() {
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

            {/* Title */}
            <div className="form-container my-4">
              <Form.Label className="fw-semibold">
                Title of your item
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="A white sofa, Atomic habits..."
                className="bg-light px-3 py-2"
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
                placeholder="Include details such as brand, model, size and item, colour, size etc."
                className="bg-light"
                style={{ resize: "none" }}
              />
            </div>

            {/* Category */}
            <div className="form-container mb-4">
              <Form.Label className="fw-semibold">Choose a category</Form.Label>
              <Form.Select className="bg-light">
                <option value="">Category</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furnitures</option>
                <option value="books">Books</option>
                <option value="clothing">Clothes</option>
                <option value="sports">Toys</option>
                <option value="sports">Utensils</option>
                <option value="sports">Appliances</option>
                <option value="other">Other</option>
              </Form.Select>
            </div>

            {/* Item condition */}
            <div className="mb-4">
              <Form.Label className="fw-semibold">
                Condition of your item
              </Form.Label>
              <div>
                {["like-new", "good-condition", "used", "broken"].map(
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
                          : condition === "good-condition"
                          ? "Good condition"
                          : condition === "used"
                          ? "Used"
                          : "Broken"
                      }
                      className="mb-2"
                    />
                  )
                )}
              </div>
            </div>

            {/* Add photos */}
            <div className="form-container mb-4">
              <Form.Label className="fw-semibold">Add photos</Form.Label>
              <Row className="g-3">
                {[...Array(5).fill(null)].map((_, index) => (
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
                5 photos max
              </div>
            </div>

            {/* Meeting preferences */}
            <div className="form-container mb-4">
              <Form.Label className="fw-semibold">
                Meeting preferences
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Preferred meeting time"
                className="bg-light px-3 py-2"
              />
            </div>

            {/* Address */}
            <div className="form-container mb-4">
              <Form.Label className="fw-semibold">Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter an address"
                className="bg-light px-3 py-2"
              />
              <div className="fs-6 text-center my-2 fw-semibold">
                or
              </div>
              <Button variant="outline-dark" className="w-100">Current Location</Button>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="dark w-100 my-4 p-2 fw-semibold">Post Item</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ItemsPostingPage;
