import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
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
  Person,
} from "@mui/icons-material";
import ProfilePictureUploadBox from "./ProfilePictureUploadBox";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [picLoading, setPicLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [userItems, setUserItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
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
  });
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    dob: "",
    phone: "",
    email: "",
    address: "",
  });
  const [originalInfo, setOriginalInfo] = useState({});

  useEffect(() => {
    fetchUserData();
    fetchUserItems();
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

      if (response.ok) {
        const data = await response.json();

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

        setUserData({
          name: data.name || "User",
          profilePic: data.profilePic?.url || "",
          joinDate,
          donations: userItems.filter((item) => item.status === "donated")
            .length,
          claims: data.claims || 0,
          level: data.level || "Bronze",
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
  const fetchUserItems = async () => {
    try {
      setItemsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setSnackbar({
          open: true,
          message: "Not authenticated. Please login again.",
          severity: "error",
        });
        return;
      }
      const profileResponse = await fetch(
        "http://localhost:5000/api/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const userId = profileData._id;

        // Fetch user's items
        const itemsResponse = await fetch(
          `http://localhost:5000/api/items/user/${userId}/items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (itemsResponse.ok) {
          const itemsData = await itemsResponse.json();
          setUserItems(itemsData);
        } else {
          throw new Error("Failed to fetch items");
        }
      }
    } catch (error) {
      console.error("Error fetching user items:", error);
      setSnackbar({
        open: true,
        message: "Error loading your items",
        severity: "error",
      });
    } finally {
      setItemsLoading(false);
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

      setUserData((prev) => ({
        ...prev,
        profilePic: data.user.profilePic.url,
      }));
      setPicLoading(false);
      toast.success("Successfully uploaded profile picture.");
    } catch (err) {
      console.error(err);
      setPicLoading(false);
      toast.error("Error uploading profile picture");
    }
  };

  const handleMarkAsDonated = async (itemId) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setSnackbar({
        open: true,
        message: "Not authenticated. Please login again.",
        severity: "error",
      });
      return;
    }

    // Make API call to update item status to 'donated'
    const response = await fetch(`http://localhost:5000/api/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'donated' }),
    });

    if (response.ok) {
      // Show success message
      setSnackbar({
        open: true,
        message: "Item marked as donated successfully!",
        severity: "success",
      });

      // Refresh the items list using your existing function
      fetchUserItems();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to mark item as donated");
    }
  } catch (error) {
    console.error("Error marking item as donated:", error);
    setSnackbar({
      open: true,
      message: error.message || "Error marking item as donated",
      severity: "error",
    });
  }
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

  return (
    <Box sx={{ backgroundColor: "#f3eee6", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Profile Overview Section (restored) */}
        <Box sx={cardStyle} className="py-5">
          <Grid container spacing={3} alignItems="center">
            {/* Profile Picture */}
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

            {/* Name, joinDate, stats */}
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

              <Grid container spacing={2}>
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
              </Grid>
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
              {/* Date of Birth */}
              <Box display="flex" alignItems="center" mb={3}>
                <Cake sx={{ mr: 2, color: "text.secondary" }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={personalInfo.dob}
                    onChange={(e) => handleInfoChange("dob", e.target.value)}
                    placeholder="e.g., 23/05/2001"
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

              {/* Phone */}
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
              {/* Email (read-only) */}
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

              {/* Address */}
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

        {/* Items Section with Tabs */}
        <Box sx={{ ...cardStyle, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            My Items
          </Typography>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              mb: 2,
              "& .MuiTab-root": {
                textTransform: "none",
              },
            }}
          >
            <Tab
              label={`Available Items (${
                userItems.filter(
                  (item) =>
                    item.status === "available" || item.status === "reserved"
                ).length
              })`}
            />
            <Tab
              label={`Donated Items (${
                userItems.filter((item) => item.status === "donated").length
              })`}
            />
          </Tabs>

          {tabValue === 0 && (
            <Box>
              {itemsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : userItems.filter(
                  (item) =>
                    item.status === "available" || item.status === "reserved"
                ).length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {userItems
                    .filter(
                      (item) =>
                        item.status === "available" ||
                        item.status === "reserved"
                    )
                    .map((item) => (
                      <Paper
                        key={item._id}
                        elevation={2}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          "&:hover": {
                            elevation: 2,
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        {/* Item Image */}
                        <Box
                          component="img"
                          src={
                            item.photos[0]?.url ||
                            "https://placehold.co/600x400"
                          }
                          alt={item.title}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />

                        {/* Item Details */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {item.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                              label={item.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ textTransform: "capitalize" }}
                            />
                            <Chip
                              label={item.status || "available"}
                              size="small"
                              color={
                                item.status === "reserved" ? "info" : "success"
                              }
                              sx={{ textTransform: "capitalize" }}
                            />
                          </Box>
                        </Box>

                        {/* Status & Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            onClick={() =>
                              window.open(`/item/${item._id}`, "_blank")
                            }
                          >
                            View Details
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Currently no items claimable.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items you donate will appear here until they're claimed.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              {itemsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : userItems.filter((item) => item.status === "donated" || item.status === "reserved").length >
                0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {userItems
                    .filter((item) => item.status === "donated" || item.status === "reserved")
                    .map((item) => (
                      <Paper
                        key={item._id}
                        elevation={2}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          "&:hover": {
                            elevation: 2,
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      >
                        {/* Item Image */}
                        <Box
                          component="img"
                          src={
                            item.photos[0]?.url ||
                            "https://placehold.co/600x400"
                          }
                          alt={item.title}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />

                        {/* Item Details */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="h6" component="h3" gutterBottom>
                            {item.title}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                              label={item.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ textTransform: "capitalize" }}
                            />
                            <Chip
                              label={item.status || "available"}
                              size="small"
                              color={
                                item.status === "reserved" ? "info" : "success"
                              }
                              sx={{ textTransform: "capitalize" }}
                            />
                          </Box>
                        </Box>

                        {/* Status & Actions */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="info"
                              onClick={() =>
                                window.open(`/item/${item._id}`, "_blank")
                              }
                            >
                              View Details
                            </Button>
                            {item.status === "reserved" && (
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => handleMarkAsDonated(item._id)}
                                sx={{
                                  minWidth: "120px",
                                }}
                              >
                                Mark as Donated
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No donated or reserved items yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items will appear here once they are reserved or donated!
                  </Typography>
                  <Button
                    variant="contained"
                    color="info"
                    sx={{ mt: 2 }}
                    onClick={() => (window.location.href = "/post-item")}
                  >
                    Donate Your First Item
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>

      {/* Snackbar */}
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
