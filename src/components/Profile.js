import React, { useState } from 'react';
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
    ListItemAvatar
} from '@mui/material';
import {
    Edit,
    CalendarToday,
    Email,
    Phone,
    Home,
    Cake
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';

// Sample data
const userData = {
    name: 'Hrittika Saha',
    profilePicture: 'placeholder.png',
    joinDate: 'January 2025',
    donations: 24,
    claims: 8,
    level: 'Gold',
    rating: 4.8,
    reviews: [
        { user: 'Samia Arpita', comment: 'Hrittika is a great donor! Items were exactly as described.', rating: 5 },
        { user: 'Shahadat Hasan', comment: 'Quick response and smooth transaction. Highly recommend!', rating: 4.5 }
    ],
    personalInfo: {
        name: 'Hrittika Saha',
        dob: 'May 23, 2001',
        phone: '01683******',
        email: 'hrittika.cse.20230104024@aust.edu',
        address: '42/C, Road : 15, Dhanmondi, Dhaka 1209'
    }
};

const ProfilePage = () => {
    const [editMode, setEditMode] = useState(false);
    const [personalInfo, setPersonalInfo] = useState(userData.personalInfo);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleInfoChange = (field, value) => {
        setPersonalInfo({ ...personalInfo, [field]: value });
    };

    const cardStyle = {
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: 'grey',
        borderRadius: 2,
        padding: 3,
        marginBottom: 3
    };

    return (
        <Box sx={{ backgroundColor: '#f3eee6' }}>
            <NavigationBar />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={cardStyle}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={3} display="flex" justifyContent="center">
                            <Avatar
                                src={userData.profilePicture}
                                alt={userData.name}
                                sx={{ width: 150, height: 150 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Typography variant="h4" gutterBottom>
                                {userData.name}
                            </Typography>
                            <Box display="flex" alignItems="center" mb={1}>
                                <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography color="text.secondary">
                                    Member since: {userData.joinDate}
                                </Typography>
                            </Box>
                            <Chip label={`${userData.level} Level`} color="success" sx={{ mb: 2 }} />

                            <Grid container spacing={2} mb={2}>
                                <Grid item>
                                    <Typography variant="body1" color="text.primary">
                                        {userData.donations} Donations
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" color="text.primary">
                                        {userData.claims} Claims
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="body1" color="text.primary">
                                        {userData.rating} Avg Rating
                                    </Typography>
                                </Grid>
                            </Grid>

                            <Typography variant="h6" gutterBottom mt={2}>
                                Recent Reviews
                            </Typography>
                            <List>
                                {userData.reviews.map((review, index) => (
                                    <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar>
                                            <Avatar />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={review.user}
                                            secondary={
                                                <>
                                                    <Rating value={review.rating} size="small" readOnly />
                                                    <Typography variant="body2" color="text.primary">
                                                        {review.comment}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Grid>
                    </Grid>
                </Box>

                {/* Personal Information Section */}
                <Box sx={cardStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">Personal Information</Typography>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={handleEditToggle}
                        >
                            {editMode ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" mb={editMode ? 2 : 3}>
                                <Cake sx={{ mr: 2, color: 'text.secondary' }} />
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        value={personalInfo.dob}
                                        onChange={(e) => handleInfoChange('dob', e.target.value)}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                                            Date of Birth:
                                        </Typography>
                                        <Typography variant="body1">{personalInfo.dob}</Typography>
                                    </>
                                )}
                            </Box>

                            <Box display="flex" alignItems="center" mb={editMode ? 2 : 3}>
                                <Phone sx={{ mr: 2, color: 'text.secondary' }} />
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={personalInfo.phone}
                                        onChange={(e) => handleInfoChange('phone', e.target.value)}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                                            Phone:
                                        </Typography>
                                        <Typography variant="body1">{personalInfo.phone}</Typography>
                                    </>
                                )}
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box display="flex" alignItems="center" mb={editMode ? 2 : 3}>
                                <Email sx={{ mr: 2, color: 'text.secondary' }} />
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={personalInfo.email}
                                        onChange={(e) => handleInfoChange('email', e.target.value)}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                                            Email:
                                        </Typography>
                                        <Typography variant="body1">{personalInfo.email}</Typography>
                                    </>
                                )}
                            </Box>

                            <Box display="flex" alignItems="center" mb={editMode ? 2 : 3}>
                                <Home sx={{ mr: 2, color: 'text.secondary' }} />
                                {editMode ? (
                                    <TextField
                                        fullWidth
                                        label="Home Address"
                                        value={personalInfo.address}
                                        onChange={(e) => handleInfoChange('address', e.target.value)}
                                        multiline
                                        rows={2}
                                    />
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                                            Address:
                                        </Typography>
                                        <Typography variant="body1">{personalInfo.address}</Typography>
                                    </>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default ProfilePage;