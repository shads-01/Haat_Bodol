import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, Trash2, Check, X } from "lucide-react";
import {
  Dropdown,
  Badge,
  ListGroup,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useNotifications } from "../context/NotificationContext";
import { toast } from "react-hot-toast";

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    processNotificationAction,
  } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState({});
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowDeleteMenu({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setShowDeleteMenu((prev) => ({ ...prev, [notificationId]: false }));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      try {
        await deleteAllNotifications();
        toast.success("All notifications deleted");
      } catch (error) {
        toast.error("Failed to delete all notifications");
      }
    }
  };

  const toggleDeleteMenu = (notificationId) => {
    setShowDeleteMenu((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }));
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  const handleApprove = async (notificationId) => {
    await processNotificationAction(notificationId, "approved");
  };

  const handleReject = async (notificationId) => {
    await processNotificationAction(notificationId, "rejected");
  };

  // Check if notification requires action
  const requiresAction = (notification) => {
    return (
      notification.type === "item_request" && notification.status === "pending"
    );
  };

  return (
    <div ref={dropdownRef} className="position-relative">
      <Dropdown show={showDropdown} onToggle={setShowDropdown}>
        <Dropdown.Toggle
          variant="link"
          className="nav-link p-0 position-relative"
          style={{ color: "inherit", border: "none" }}
        >
          <Bell strokeWidth={2.5} size={20} />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              className="position-absolute top-0 start-100 translate-middle"
              style={{
                fontSize: "0.6rem",
                padding: "0.25rem 0.4rem",
                borderRadius: "50%",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu
          align="end"
          className="p-2"
          style={{
            width: "380px",
            maxHeight: "400px",
            overflowY: "auto",
            border: "1px solid #dee2e6",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            <div className="d-flex gap-1">
              {unreadCount > 0 && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Mark all as read</Tooltip>}
                >
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-primary"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCircle size={16} />
                  </Button>
                </OverlayTrigger>
              )}
              {notifications.length > 0 && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete all notifications</Tooltip>}
                >
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={handleDeleteAllNotifications}
                  >
                    <Trash2 size={16} />
                  </Button>
                </OverlayTrigger>
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
                  className={`p-2 mb-1 rounded ${
                    !notification.read ? "bg-light" : ""
                  }`}
                  style={{ border: "1px solid #f8f9fa" }}
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-grow-1 me-2">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong
                          className="text-dark"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {notification.title}
                        </strong>
                        <div className="d-flex gap-1">
                          {/* Action buttons for item requests */}
                          {requiresAction(notification) && (
                            <>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Approve</Tooltip>}
                              >
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="p-1"
                                  onClick={() =>
                                    handleApprove(notification._id)
                                  }
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "0.1rem 0.4rem",
                                  }}
                                >
                                  <Check size={14} className="p-0"/>
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Reject</Tooltip>}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="p-1"
                                  onClick={() => handleReject(notification._id)}
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "0.1rem 0.4rem",
                                  }}
                                >
                                  <X size={14} className="p-0"/>
                                </Button>
                              </OverlayTrigger>
                            </>
                          )}

                          {/* Existing buttons */}
                          {!notification.read &&
                            !requiresAction(notification) && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Mark as read</Tooltip>}
                              >
                                <Button
                                  variant="link"
                                  className="p-0"
                                  onClick={() => markAsRead(notification._id)}
                                >
                                  <CheckCircle
                                    size={14}
                                    className="text-success"
                                  />
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
                              onClick={() =>
                                deleteNotification(notification._id)
                              }
                            >
                              <Trash2 size={14} className="text-danger" />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {notification.message}
                      </p>
                      {requiresAction(notification) && (
                        <div className="mt-2">
                          <small className="text-warning">
                            <strong>Action required</strong>
                          </small>
                        </div>
                      )}
                      <small className="text-muted d-block">
                        {formatTime(notification.createdAt)} •{" "}
                        {formatDate(notification.createdAt)}
                      </small>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default NotificationDropdown;
