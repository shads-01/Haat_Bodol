import React, { useState, useRef } from "react";
import { Camera, X } from "lucide-react";
import "../css/PostItem.css";
import { Button } from "react-bootstrap";

function PhotoUploadBox({ onChange }) {
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);

      if (onChange) onChange(file);
    }
  };

  const handleRemove = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onChange) onChange(null);
  };

  return (
    <div
      className="photo-upload-box d-flex align-items-center justify-content-center border border-2 rounded-3 overflow-hidden position-relative"
      style={{
        height: "100px",
        backgroundColor: image ? "transparent" : "#f8f9fa",
        cursor: "pointer",
      }}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {image ? (
        <>
          <img src={image} alt="Item photo preview" className="item-preview" />
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="position-absolute top-0 end-0 btn-sm  rounded-circle"
          >
            <X size={15} />
          </Button>
        </>
      ) : (
        <div className="text-center">
          <Camera size={24} className="text-muted mb-1" />
        </div>
      )}
    </div>
  );
}

export default PhotoUploadBox;
