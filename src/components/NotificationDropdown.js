import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, XCircle, Trash2, MoreVertical } from 'lucide-react';
import { Dropdown, Badge, ListGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        // Close all delete menus when dropdown closes
        setShowDeleteMenu({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    setShowDeleteMenu(prev => ({ ...prev, [notificationId]: false }));
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      await deleteAllNotifications();
    }
  };

  const toggleDeleteMenu = (notificationId) => {
    setShowDeleteMenu(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} className="position-relative">
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Toggle
          variant="link"
          className="nav-link p-0 position-relative"
          style={{ color: 'inherit', border: 'none' }}
        >
          <Bell strokeWidth={2.5} size={20} />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle"
              style={{ 
                fontSize: '0.6rem',
                padding: '0.25rem 0.4rem',
                borderRadius: '50%'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu 
          align="end" 
          className="p-2"
          style={{ 
            width: '380px', 
            maxHeight: '400px', 
            overflowY: 'auto',
            border: '1px solid #dee2e6',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            <div className="d-flex gap-1">
              {unreadCount > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-primary"
                  onClick={handleMarkAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCircle size={16} />
                </Button>
              )}
              {notifications.length > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 text-danger"
                  onClick={handleDeleteAllNotifications}
                  title="Delete all notifications"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center text-muted py-3">
              <Bell size={40} className="mb-2 opacity-50" />
              <p className="mb-0">No notifications yet</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.slice(0, 10).map((notification) => (
                <ListGroup.Item
                  key={notification._id}
                  className={`p-2 mb-1 rounded ${!notification.read ? 'bg-light' : ''}`}
                  style={{ border: '1px solid #f8f9fa' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-grow-1 me-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong className="text-dark" style={{ fontSize: '0.9rem' }}>
                          {notification.title}
                        </strong>
                        <div className="d-flex gap-1">
                          {!notification.read && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Mark as read</Tooltip>}
                            >
                              <Button
                                variant="link"
                                className="p-0"
                                onClick={() => handleMarkAsRead(notification._id)}
                              >
                                <CheckCircle size={14} className="text-success" />
                              </Button>
                            </OverlayTrigger>
                          )}
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete</Tooltip>}
                          >
                            <Button
                              variant="link"
                              className="p-0"
                              onClick={() => handleDeleteNotification(notification._id)}
                            >
                              <Trash2 size={14} className="text-danger" />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                      <p className="mb-1 text-muted" style={{ fontSize: '0.8rem' }}>
                        {notification.message}
                      </p>
                      <small className="text-muted">
                        {formatTime(notification.createdAt)} • {formatDate(notification.createdAt)}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

          {notifications.length > 10 && (
            <div className="text-center mt-2">
              <Button variant="outline-primary" size="sm">
                View all notifications ({notifications.length})
              </Button>
            </div>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default NotificationDropdown;