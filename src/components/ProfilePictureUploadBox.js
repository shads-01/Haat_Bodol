import React, { useState, useRef, useEffect } from "react";
import { Avatar, Tooltip, Box } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import toast from "react-hot-toast";

const ProfilePictureUploadBox = ({ currentImage, onImageChange }) => {
  const [previewImage, setPreviewImage] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  // 🔑 keep previewImage in sync with prop
useEffect(() => {
  setPreviewImage(currentImage || null);
}, [currentImage]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Call parent component's handler
      if (onImageChange) {
        onImageChange(file, previewUrl);
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/webp,image/jpeg,image/jpg,image/png"
        style={{ display: "none" }}
        className="profilePhoto"
      />

      {/* Clickable profile picture */}
      <Tooltip title="Click to upload/change profile picture">
        <Avatar
          onClick={handleAvatarClick}
          src={previewImage}
          sx={{
            width: 150,
            height: 150,
            bgcolor: "grey.200",
            border: "3px solid",
            borderColor: "background.paper",
            boxShadow: 2,
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: 3,
              bgcolor: previewImage ? "transparent" : "grey.300",
            },
          }}
        >
          {!previewImage && (
            <PhotoCamera sx={{ fontSize: 150 * 0.3, color: "gray" }} />
          )}
        </Avatar>
      </Tooltip>
    </Box>
  );
};

export default ProfilePictureUploadBox;
