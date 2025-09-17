import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Verified as VerifiedIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as CakeIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DonorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donorData, setDonorData] = useState(null);
  const [donorItems, setDonorItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [error, setError] = useState(null);

  const availableItems = donorItems.filter(
    (item) => item.status === "available" || item.status === "reserved"
  );
  const donatedItems = donorItems.filter((item) => item.status === "donated");

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch donor profile data
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/auth/donor/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.data.success) {
          setDonorData(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch donor data");
        }
      } catch (error) {
        console.error("Error fetching donor data:", error);

        if (error.response?.status === 404) {
          setError("Donor not found");
        } else if (error.response?.status === 400) {
          setError("Invalid donor ID");
        } else if (error.response?.status === 401) {
          setError("Please log in to view this profile");
        } else {
          setError("Failed to load donor information. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDonorData();
    } else {
      setError("No donor ID provided");
      setLoading(false);
    }
  }, [id]);

  // Fetch donor's items
  useEffect(() => {
    const fetchDonorItems = async () => {
      try {
        setItemsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No token available, skipping items fetch");
          setDonorItems([]);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/items/user/${id}/items`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDonorItems(response.data.data || response.data.items || []);
        } else {
          console.log("No items found for this donor");
          setDonorItems([]);
        }
      } catch (error) {
        console.error("Error fetching donor items:", error);
        // If the specific endpoint fails, try the general items endpoint
        try {
          const token = localStorage.getItem("token");
          const allItemsResponse = await axios.get(
            "http://localhost:5000/api/items",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (allItemsResponse.data.success) {
            // Filter items by user ID on the client side
            const userItems = allItemsResponse.data.data.filter(
              (item) => item.donor?._id === id || item.donor?.id === id
            );
            setDonorItems(userItems);
          } else {
            setDonorItems([]);
          }
        } catch (fallbackError) {
          console.error("Fallback items fetch also failed:", fallbackError);
          setDonorItems([]);
        }
      } finally {
        setItemsLoading(false);
      }
    };

    if (!id) return;
    fetchDonorItems();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "orange.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
            Loading donor information...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "orange.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 2, color: "text.primary" }}
          >
            Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f3eee6", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Donor Overview Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            {/* Profile Picture */}
            <Grid
              item
              xs={12}
              md={3}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={donorData?.profilePic?.url || "/placeholder.png"}
                  alt={donorData?.name}
                  sx={{
                    width: 160,
                    height: 160,
                    border: `2px solid`,
                    "& .MuiAvatar-img": {
                      objectFit: "cover",
                    },
                  }}
                />
                {donorData?.verified && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      bgcolor: "primary.main",
                      borderRadius: "50%",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VerifiedIcon sx={{ color: "white", fontSize: 24 }} />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Donor Info */}
            <Grid item xs={12} md={9}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="h4" component="h1" fontWeight="bold">
                  {donorData?.name || "Unknown User"}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  color: "text.secondary",
                }}
              >
                <EventIcon fontSize="small" />
                <Typography variant="body2">
                  Member since: {donorData?.joinDate}
                </Typography>
              </Box>

              {/* Statistics */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      bgcolor: "primary.50",
                      p: 3,
                      textAlign: "center",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {donorData?.donations || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Donations
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper
                    sx={{
                      bgcolor: "secondary.50",
                      p: 3,
                      textAlign: "center",
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="secondary"
                    >
                      {donorData?.claims || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Claims
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>

        {/* Contact Information */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
            Contact Information
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <PhoneIcon color="action" />
                <Typography>
                  <Box component="span" fontWeight="medium">
                    Phone:
                  </Box>{" "}
                  {donorData?.phone || "Not provided"}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <EmailIcon color="action" />
                <Typography>
                  <Box component="span" fontWeight="medium">
                    Email:
                  </Box>{" "}
                  {donorData?.email || "Not provided"}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <CakeIcon color="action" />
                <Typography>
                  <Box component="span" fontWeight="medium">
                    Date of Birth:
                  </Box>{" "}
                  {donorData?.dob || "Not provided"}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <LocationIcon color="action" />
                <Typography>
                  <Box component="span" fontWeight="medium">
                    Address:
                  </Box>{" "}
                  {donorData?.address || "Not provided"}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Items Section */}
        <Paper
          sx={{
            p: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
            Donor's Items
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab
                value="available"
                label={`Available Items (${availableItems.length})`}
                sx={{
                  fontWeight: activeTab === "available" ? "bold" : "normal",
                }}
              />
              <Tab
                value="donated"
                label={`Donated Items (${donatedItems.length})`}
                sx={{ fontWeight: activeTab === "donated" ? "bold" : "normal" }}
              />
            </Tabs>
          </Box>

          {/* Items Content */}
          {itemsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <Box>
              {activeTab === "available" ? (
                availableItems.length > 0 ? (
                  <Grid container spacing={3}>
                    {availableItems.map((item) => (
                      <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Card
                          elevation={1}
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            boxShadow: 1,
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="200"
                            image={item.photos?.[0]?.url || "/placeholder.png"}
                            alt={item.title}
                            onError={(e) => {
                              e.target.src = "/placeholder.png";
                            }}
                          />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography
                              gutterBottom
                              variant="h6"
                              component="h3"
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {item.description}
                            </Typography>
                            <Box
                              sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                            >
                              <Chip
                                label={item.category}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={item.status}
                                size="small"
                                sx={{
                                  color:
                                    item.status === "available"
                                      ? "success.dark"
                                      : "warning.dark",
                                }}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No available items
                    </Typography>
                  </Box>
                )
              ) : donatedItems.length > 0 ? (
                <Grid container spacing={3}>
                  {donatedItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <Card
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: 1,
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={item.photos?.[0]?.url || "/placeholder.png"}
                          alt={item.title}
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="h3">
                            {item.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                          >
                            {item.description}
                          </Typography>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            <Chip
                              label={item.category}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label="Donated"
                              size="small"
                              sx={{
                                color: "success.dark",
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary">
                    No donated items yet
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default DonorProfilePage;
