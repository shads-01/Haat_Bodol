# 🤝 হাতবদল (Haat Bodol)

A community-driven donation platform where people can give away items they no longer need to those who can use them. Built with the MERN stack and real-time communication powered by Socket.io.

## ✨ Technologies

- `React`
- `Express.js`
- `MongoDB` / `Mongoose`
- `Socket.io`
- `React Bootstrap` / `MUI`
- `Cloudinary`
- `JWT` / `bcryptjs`
- `Nodemailer`

## 🚀 Features

- Email-verified user registration with OTP codes
- Post donation items with up to 4 photos and detailed descriptions
- Browse, search, and filter donations by category, condition, status, and time listed
- Real-time one-on-one chat between donors and receivers
- Live notification system with read/unread tracking
- User profiles with donation stats, levels, and profile picture uploads
- Public donor profiles to view other users' activity
- Pagination and sorting on the donations page
- Protected routes with JWT authentication

## 📍 The Process

The idea behind হাতবদল is simple — connect people who have something to give with people who need it. We started with a React frontend and an Express backend, wired together through a MongoDB database. The registration flow uses email verification with 6-digit OTP codes sent via Nodemailer, so every user is real. Once logged in, users can post items they want to donate, complete with photos uploaded straight to Cloudinary. The donations page has a full filtering system — by category, condition, availability, and time listed — so finding what you need is quick. The real highlight is the real-time chat system built on Socket.io, which lets donors and receivers talk instantly without refreshing. Notifications pop in live too, so nobody misses a message. It's not perfect yet, but it's a solid foundation for a platform that encourages sharing and sustainability in the community.

## 🚦 Running the Project

1. Clone the repository
2. Install client dependencies: `npm install`
3. Install server dependencies: `cd server && npm install`
4. Create a `server/.env` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
5. Start the backend: `cd server && npm run dev`
6. Start the frontend (from root): `npm start`
7. Open `http://localhost:3000` in your browser
