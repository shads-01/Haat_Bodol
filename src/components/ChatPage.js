import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
    Container,
    Box,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Badge,
    IconButton,
    InputAdornment,
    Paper,
    Divider
} from '@mui/material';
import {
    Send as SendIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const socket = useRef();
    const messagesEndRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login-register');
            return;
        }

        // Initialize socket connection
        socket.current = io('http://localhost:5000', {
            auth: {
                token: token
            }
        });

        // Get user ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId;

        // Join user room
        socket.current.emit('join-user', userId);

        // Listen for incoming messages
        socket.current.on('receive-message', (message) => {
            if (selectedConversation &&
                (message.sender._id === selectedConversation || message.receiver._id === selectedConversation)) {
                setMessages(prev => [...prev, message]);
            }

            // Refresh conversations to update last message and unread count
            loadConversations();
        });

        // Listen for typing indicators
        socket.current.on('typing-start', () => setIsTyping(true));
        socket.current.on('typing-stop', () => setIsTyping(false));

        // Load conversations
        loadConversations();

        // Check if we need to start a chat with a specific user
        if (location.state?.startChatWith) {
            startNewConversationWithUser(location.state.startChatWith);
        }

        return () => {
            socket.current.disconnect();
        };
    }, [navigate, location]);

    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(response.data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async (otherUserId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/chat/messages/${otherUserId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);
            setSelectedConversation(otherUserId);

            // Find the user info for the selected conversation (convo.user._id is the other user's id)
            const convo = conversations.find(c => c.user && String(c.user._id) === String(otherUserId));
            if (convo) {
                setSelectedUser(convo.user);
            } else {
                // Fallback: fetch the user info
                try {
                    const userResp = await axios.get(`http://localhost:5000/api/chat/user/${otherUserId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSelectedUser(userResp.data);
                } catch (err) {
                    console.error('Error fetching user for selected conversation:', err);
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const startNewConversationWithUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');

            // First check if we already have a conversation with this user
            const existingConvo = conversations.find(c => c.user && String(c.user._id) === String(userId));

            if (existingConvo) {
                // If conversation exists, load it using the other user's id
                loadMessages(String(existingConvo.user._id));
            } else {
                // If not, get user info and start new conversation
                const response = await axios.get(`http://localhost:5000/api/chat/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setSelectedConversation(userId);
                setSelectedUser(response.data);
                setMessages([]);
                setSearchQuery('');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error starting new conversation:', error);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const token = localStorage.getItem('token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const senderId = payload.userId;

        socket.current.emit('send-message', {
            senderId,
            receiverId: selectedConversation,
            content: newMessage.trim()
        });

        // Add message to local state immediately for instant feedback
        const newMessageObj = {
            _id: Date.now(), // temporary ID
            sender: { _id: senderId },
            receiver: { _id: selectedConversation },
            content: newMessage.trim(),
            timestamp: new Date(),
            read: false
        };

        setMessages(prev => [...prev, newMessageObj]);
        setNewMessage('');
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/chat/search-users?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const startNewConversation = (user) => {
        setSelectedConversation(user._id);
        setSelectedUser(user);
        setMessages([]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Styled components
    const MessageBubble = styled(Paper)(({ theme, isown }) => ({
        padding: theme.spacing(1, 2),
        margin: theme.spacing(0.5, 1),
        maxWidth: '70%',
        backgroundColor: isown ? theme.palette.primary.main : theme.palette.grey[100],
        color: isown ? theme.palette.primary.contrastText : theme.palette.text.primary,
        alignSelf: isown ? 'flex-end' : 'flex-start',
        borderTopLeftRadius: isown ? 16 : 4,
        borderTopRightRadius: isown ? 4 : 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    }));

    const ConversationListItem = styled(ListItem)(({ theme, selected }) => ({
        backgroundColor: selected ? theme.palette.action.selected : 'transparent',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    }));

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'rgb(243,238,230)' }}>
            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 2, flexGrow: 1 }}>
                <Paper elevation={2} sx={{ display: 'flex', height: '80vh' }}>
                    {/* Conversations Sidebar */}
                    <Box sx={{ width: 350, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Messages
                            </Typography>
                            <TextField
                                fullWidth
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Box>

                        <Divider />

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <Box sx={{ overflow: 'auto' }}>
                                <List dense>
                                    {searchResults.map(user => (
                                        <ListItem
                                            key={user._id}
                                            button
                                            onClick={() => startNewConversation(user)}
                                        >
                                            <ListItemAvatar>
                                                <Avatar
                                                    src={user.profilePic?.url}
                                                    alt={user.name}
                                                >
                                                    {!user.profilePic?.url && <PersonIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={user.email}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {/* Conversations List */}
                        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                            <List>
                                {conversations.map(convo => (
                                    <ConversationListItem
                                        key={convo._id}
                                        button
                                        selected={selectedConversation === String(convo.user._id)}
                                        onClick={() => loadMessages(String(convo.user._id))}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                badgeContent={convo.unreadCount}
                                                color="primary"
                                                invisible={convo.unreadCount === 0}
                                            >
                                                <Avatar
                                                    src={convo.user.profilePic?.url}
                                                    alt={convo.user.name}
                                                >
                                                    {!convo.user.profilePic?.url && <PersonIcon />}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {convo.user.name}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="textSecondary" noWrap>
                                                    {convo.lastMessage?.content}
                                                </Typography>
                                            }
                                        />
                                    </ConversationListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>

                    {/* Chat Area */}
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversation && selectedUser ? (
                            <>
                                <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                                    <IconButton onClick={() => {
                                        setSelectedConversation(null);
                                        setSelectedUser(null);
                                    }} sx={{ mr: 1 }}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                    <Avatar
                                        src={selectedUser.profilePic?.url}
                                        sx={{ mr: 2 }}
                                    >
                                        {!selectedUser.profilePic?.url && <PersonIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {selectedUser.name}
                                        </Typography>
                                        {isTyping && (
                                            <Typography variant="caption" color="textSecondary">
                                                Typing...
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1, display: 'flex', flexDirection: 'column' }}>
                                    {messages.length === 0 ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <Typography color="textSecondary">
                                                No messages yet. Start a conversation!
                                            </Typography>
                                        </Box>
                                    ) : (
                                        messages.map((message, index) => {
                                            const token = localStorage.getItem('token');
                                            const payload = JSON.parse(atob(token.split('.')[1]));
                                            const userId = payload.userId;
                                            const isOwnMessage = message.sender._id === userId || message.senderId === userId;

                                            return (
                                                <MessageBubble
                                                    key={message._id || index}
                                                    isown={isOwnMessage ? 1 : 0}
                                                >
                                                    {message.content}
                                                </MessageBubble>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </Box>

                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleSendMessage();
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={handleSendMessage}
                                                        disabled={!newMessage.trim()}
                                                    >
                                                        <SendIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h6" color="textSecondary">
                                    Select a conversation to start chatting
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ChatPage;