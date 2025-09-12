import React, { useState, useRef, useEffect } from "react";
import { Avatar, Tooltip, Box, CircularProgress } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import toast from "react-hot-toast";

const ProfilePictureUploadBox = ({ currentImage, onImageChange, uploading }) => {
  const [previewImage, setPreviewImage] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPreviewImage(currentImage || null);
  }, [currentImage]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    if (onImageChange) onImageChange(file, previewUrl);
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/webp,image/jpeg,image/jpg,image/png"
        style={{ display: "none" }}
      />

      <Tooltip title="Click to upload/change profile picture">
        <Box position="relative">
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
            {!previewImage && <PhotoCamera sx={{ fontSize: 150 * 0.3, color: "gray" }} />}
          </Avatar>

          {/* Loading overlay */}
          {uploading && (
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="rgba(255,255,255,0.6)"
              borderRadius="50%"
            >
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Tooltip>
    </Box>
  );
};
export default ProfilePictureUploadBox;