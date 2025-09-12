import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  CalendarToday,
  Email,
  Phone,
  Home,
  Cake,
  Save,
  Cancel,
} from "@mui/icons-material";
import NavigationBar from "./NavigationBar";
import ProfilePictureUploadBox from "./ProfilePictureUploadBox";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [picLoading, setPicLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [userData, setUserData] = useState({
    name: "",
    profilePic: "",
    joinDate: "",
    donations: 0,
    claims: 0,
    level: "Bronze",
    rating: 0,
    reviews: [],
  });
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
  });
  const [originalInfo, setOriginalInfo] = useState({});

  // Fetch user data from backend
  useEffect(() => {
    const fetchData = async () => {
      await fetchUserData();
      const userId = userData._id;
      if (userId) {
        await fetchReviewsSeparately(userId);
      }
    };

    fetchData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setSnackbar({
          open: true,
          message: "Not authenticated. Please login again.",
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Profile response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data);

        // Format join date
        let joinDate = "Recent";
        if (data.joinDate) {
          joinDate = new Date(data.joinDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          });
        } else if (data.createdAt) {
          joinDate = new Date(data.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          });
        }

        // Check if reviews exist in the response and handle the data structure
        let reviews = [];
        if (data.reviews && Array.isArray(data.reviews)) {
          reviews = data.reviews.map((review) => ({
            // Handle both old and new review structures
            reviewerName: review.reviewerName || review.user || "Anonymous",
            rating: review.rating || 0,
            comment: review.comment || "",
            createdAt: review.createdAt,
          }));
        }

        setUserData({
          name: data.name || "User",
          profilePic: data.profilePic?.url || "",
          joinDate: joinDate,
          donations: data.donations || 0,
          claims: data.claims || 0,
          level: data.level || "Bronze",
          rating: data.rating || 0,
          reviews: reviews,
        });

        setPersonalInfo({
          name: data.name || "",
          dob: data.dob || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });

        setOriginalInfo({
          name: data.name || "",
          dob: data.dob || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server returned ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error loading profile data",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch reviews separately if needed
  const fetchReviewsSeparately = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/reviews/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const reviews = await response.json();
        setUserData((prevData) => ({
          ...prevData,
          reviews: reviews,
        }));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      saveProfileChanges();
    } else {
      setEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setPersonalInfo({ ...originalInfo });
    setEditMode(false);
  };

  const handleInfoChange = (field, value) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const saveProfileChanges = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: personalInfo.name,
          dob: personalInfo.dob,
          phone: personalInfo.phone,
          address: personalInfo.address,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        setUserData((prevData) => ({
          ...prevData,
          name: updatedUser.name || prevData.name,
        }));

        setOriginalInfo({ ...personalInfo });
        setEditMode(false);

        setSnackbar({
          open: true,
          message: "Profile updated successfully!",
          severity: "success",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: error.message || "Error updating profile",
        severity: "error",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const cardStyle = {
    backgroundColor: "white",
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    padding: 3,
    marginBottom: 3,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  };

  if (isLoading) {
    return (
      <Box sx={{ backgroundColor: "#f3eee6", minHeight: "100vh" }}>
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress />
        </Container>
      </Box>
    );
  }
  const onProfileImageChange = async (file, previewUrl) => {
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      setPicLoading(true);
      const res = await fetch(
        "http://localhost:5000/api/auth/profile/picture",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      // ✅ Update userData with new profileImage URL from server
      setUserData((prev) => ({
        ...prev,
        profilePic: data.user.profilePic.url, // depends on your response
      }));
      setPicLoading(false);
      toast.success("Successfully uploaded profile picture.");
    } catch (err) {
      console.error(err);
      toast.error("Error uploading profile picture");
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f3eee6", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Profile Overview Section */}
        <Box sx={cardStyle} className="py-5">
          <Grid container spacing={3} alignItems="center">
            {/* Profile Picture Section */}
            <Grid
              item
              xs={12}
              md={3}
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{ py: 2 }}
              style={{ margin: "0 2rem" }}
            >
              <ProfilePictureUploadBox
                currentImage={userData.profilePic || null}
                onImageChange={onProfileImageChange}
                uploading={picLoading}
                size={150}
              />
            </Grid>

            {/* Profile Info Section */}
            <Grid item xs={12} md={9}>
              <Typography variant="h4" gutterBottom>
                {userData.name}
              </Typography>

              <Box display="flex" alignItems="center" mb={1}>
                <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                <Typography color="text.secondary">
                  Member since: {userData.joinDate}
                </Typography>
              </Box>

              <Chip
                label={`${userData.level} Level`}
                color={userData.level === "Gold" ? "warning" : "primary"}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} mb={2}>
                <Grid item>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    fontWeight="medium"
                  >
                    {userData.donations} Donations
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    fontWeight="medium"
                  >
                    {userData.claims} Claims
                  </Typography>
                </Grid>
                <Grid item>
                  <Box display="flex" alignItems="center">
                    <Rating
                      value={userData.rating}
                      precision={0.1}
                      size="small"
                      readOnly
                    />
                    <Typography
                      variant="body1"
                      color="text.primary"
                      ml={1}
                      fontWeight="medium"
                    >
                      {userData.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Reviews Section */}
              {userData.reviews && userData.reviews.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom mt={2}>
                    Recent Reviews
                  </Typography>
                  <List>
                    {userData.reviews.map((review, index) => (
                      <ListItem
                        key={index}
                        alignItems="flex-start"
                        sx={{ px: 0 }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {review.reviewerName
                              ? review.reviewerName.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={review.reviewerName || "Anonymous"}
                          secondary={
                            <>
                              <Rating
                                value={review.rating}
                                size="small"
                                readOnly
                              />
                              <Typography variant="body2" color="text.primary">
                                {review.comment}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" mt={2}>
                  No reviews yet.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>

        {/* Personal Information Section */}
        <Box sx={cardStyle}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Personal Information</Typography>
            <Box>
              {editMode && (
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={editMode ? <Save /> : <Edit />}
                onClick={handleEditToggle}
                disabled={saveLoading}
              >
                {editMode
                  ? saveLoading
                    ? "Saving..."
                    : "Save Changes"
                  : "Edit Profile"}
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={3}>
                <Cake sx={{ mr: 2, color: "text.secondary" }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={personalInfo.dob}
                    onChange={(e) => handleInfoChange("dob", e.target.value)}
                    placeholder="e.g., May 23, 2001"
                  />
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ minWidth: 120 }}
                    >
                      Date of Birth:
                    </Typography>
                    <Typography variant="body1">
                      {personalInfo.dob || "Not provided"}
                    </Typography>
                  </>
                )}
              </Box>

              <Box display="flex" alignItems="center" mb={3}>
                <Phone sx={{ mr: 2, color: "text.secondary" }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={personalInfo.phone}
                    onChange={(e) => handleInfoChange("phone", e.target.value)}
                    placeholder="e.g., 01XXXXXXXXX"
                  />
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ minWidth: 120 }}
                    >
                      Phone:
                    </Typography>
                    <Typography variant="body1">
                      {personalInfo.phone || "Not provided"}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={3}>
                <Email sx={{ mr: 2, color: "text.secondary" }} />
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ minWidth: 120 }}
                  >
                    Email:
                  </Typography>
                  <Typography variant="body1">
                    {personalInfo.email || "Not provided"}
                  </Typography>
                </>
              </Box>

              <Box display="flex" alignItems="flex-start" mb={3}>
                <Home sx={{ mr: 2, color: "text.secondary", mt: 0.5 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Home Address"
                    value={personalInfo.address}
                    onChange={(e) =>
                      handleInfoChange("address", e.target.value)
                    }
                    multiline
                    rows={2}
                    placeholder="Enter your full address"
                  />
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ minWidth: 120 }}
                    >
                      Address:
                    </Typography>
                    <Typography variant="body1">
                      {personalInfo.address || "Not provided"}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
