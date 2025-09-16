import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
    const [isLogin, setIsLogin] = useState(true);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check if there's a pending verification on component mount
    useEffect(() => {
        const pendingEmail = localStorage.getItem('pendingVerificationEmail');
        if (pendingEmail) {
            setUserEmail(pendingEmail);
            setPendingVerification(true);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleVerificationChange = (e) => {
        setVerificationCode(e.target.value);
        if (error) setError('');
    };

    // Validation
    const validateForm = () => {
        if (!isLogin && !showVerification) {
            const nameRegex = /^[A-Za-zÀ-ÿ\s\u0980-\u09FF]+$/;
            if (!nameRegex.test(formData.name.trim())) {
                setError("Name should only contain letters and spaces.");
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (!isLogin && !showVerification) {
            const phoneRegex = /^01[3-9]\d{8}$/;
            if (!phoneRegex.test(formData.phone.trim())) {
                setError("Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX).");
                return false;
            }

            const address = formData.address.trim();
            if (address.length < 5 || !/[A-Za-zÀ-ÿ\u0980-\u09FF]/.test(address)) {
                setError("Please enter a valid address.");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            if (isLogin) {
                // Handle login
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    navigate('/donations');
                    toast.success("Welcome back!");
                } else {
                    setError(data.message || 'Invalid credentials or email not verified');
                }
            } else {
                // Handle registration or verification access
                if (pendingVerification && userEmail === formData.email) {
                    // User has pending verification for this same email, show verification page
                    setShowVerification(true);
                    toast("Please complete your email verification");
                } else {
                    // New registration or different email
                    const response = await fetch('http://localhost:5000/api/auth/register', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Show verification form
                        setShowVerification(true);
                        setUserEmail(formData.email);
                        setPendingVerification(true);
                        localStorage.setItem('pendingVerificationEmail', formData.email);
                        toast.success("Verification code sent to your email!");
                    } else if (response.status === 400 && data.message.includes('Verification already sent')) {
                        // If backend says verification already sent, still allow access to verification page
                        setShowVerification(true);
                        setUserEmail(formData.email);
                        setPendingVerification(true);
                        localStorage.setItem('pendingVerificationEmail', formData.email);
                        toast("Verification code already sent. Please check your email.");
                    } else {
                        setError(data.message || 'An error occurred. Please try again.');
                    }
                }
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!verificationCode) {
            setError('Please enter the verification code');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-email', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    code: verificationCode
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear pending verification
                localStorage.removeItem('pendingVerificationEmail');
                setPendingVerification(false);
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/donations');
                toast.success("Welcome! You've just joined a community built on trust.");
            } else {
                setError(data.message || 'Invalid verification code. Please try again.');
            }
        } catch (error) {
            setError('Server error. Please try again later.');
            console.error('Verification Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resendVerificationCode = async () => {
        setError('');
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Verification code sent again!");
            } else {
                setError(data.message || 'Failed to resend verification code.');
            }
        } catch (error) {
            setError('Network error. Please try again.');
            console.error('Resend Error:', error);
        }
    };

    const SwitchContent = () => {
        setIsLogin(!isLogin);
        setShowVerification(false);
        setVerificationCode('');
        setError('');
    };

    const clearPendingVerification = () => {
        localStorage.removeItem('pendingVerificationEmail');
        setPendingVerification(false);
        setShowVerification(false);
        setUserEmail('');
        toast("Verification process cancelled");
    };

    const startNewRegistration = () => {
        localStorage.removeItem('pendingVerificationEmail');
        setPendingVerification(false);
        setUserEmail('');
        setFormData({
            name: '',
            email: '',
            password: '',
            phone: '',
            address: ''
        });
        toast("You can now register with a different email");
    };

    // Directly go to verification if user has pending verification
    const goToVerification = () => {
        setShowVerification(true);
    };

    return (
        <div className="body position-relative d-flex flex-column align-items-center">
            {/* Error message */}
            {error && (
                <div
                    className="alert alert-danger text-center shadow-sm"
                    style={{
                        position: "absolute",
                        top: "20px",
                        zIndex: 1050,
                        maxWidth: "400px",
                    }}
                >
                    {error}
                </div>
            )}

            {showVerification ? (
                // Verification Form
                <div className="content justify-content-center align-items-center d-flex shadow-lg mt-5 active">
                    <div className='col-md-6 d-flex justify-content-center'>
                        <div className="w-100 px-3">
                            <form onSubmit={handleVerificationSubmit}>
                                <div className='header-text mb-4 text-center'>
                                    <h1 className="fw-bold">Verify Your Email</h1>
                                    <p className="text-secondary">
                                        We've sent a verification code to
                                        <br />
                                        <span className="fw-semibold text-dark">{userEmail}</span>
                                    </p>
                                </div>
                                
                                <div className='input-group mb-4'>
                                    <input
                                        type='text'
                                        name='verificationCode'
                                        placeholder='Enter verification code'
                                        className='form-control form-control-lg bg-light fs-6 text-center'
                                        value={verificationCode}
                                        onChange={handleVerificationChange}
                                        required
                                        style={{
                                            letterSpacing: '0.5rem',
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            padding: '12px'
                                        }}
                                    />
                                </div>
                                
                                <div className='input-group mb-4 justify-content-center'>
                                    <button
                                        type='submit'
                                        className='btn btn-primary btn-lg w-100 fw-semibold'
                                        disabled={loading}
                                        style={{
                                            padding: '12px',
                                            fontSize: '1.1rem',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Verifying...
                                            </>
                                        ) : (
                                            'VERIFY & CREATE ACCOUNT'
                                        )}
                                    </button>
                                </div>
                                
                                <div className='text-center'>
                                    <p className="text-muted mb-3">Didn't receive the code?</p>
                                    <button
                                        type='button'
                                        className='btn btn-outline-primary btn-sm me-2'
                                        onClick={resendVerificationCode}
                                        style={{
                                            borderRadius: '20px',
                                            padding: '6px 20px'
                                        }}
                                    >
                                        Resend Code
                                    </button>
                                    <button
                                        type='button'
                                        className='btn btn-outline-secondary btn-sm'
                                        onClick={clearPendingVerification}
                                        style={{
                                            borderRadius: '20px',
                                            padding: '6px 20px'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                // Login/Register Form
                <div
                    className={`content justify-content-center align-items-center d-flex shadow-lg mt-5 ${!isLogin ? 'active' : ''}`}
                    id="content"
                    style={{ position: "relative" }}
                >
                    {/* Register form */}
                    <div className='col-md-6 d-flex justify-content-center'>
                        <div className="w-100 px-3">
                            <form onSubmit={handleSubmit}>
                                <div className='header-text mb-4'>
                                    <h1>Create Account</h1>
                                    {pendingVerification && (
                                        <div className="alert alert-info py-2 mb-3">
                                            <small>You have a pending verification for {userEmail}</small>
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm"
                                                    onClick={goToVerification}
                                                >
                                                    Complete Verification
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className='input-group mb-3'>
                                    <input
                                        type='text'
                                        name='name'
                                        placeholder='Name'
                                        className='form-control form-control-lg bg-limit fs-6'
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className='input-group mb-3'>
                                    <input
                                        type='email'
                                        name='email'
                                        placeholder='Email'
                                        className='form-control form-control-lg bg-limit fs-6'
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className='input-group mb-3'>
                                    <input
                                        type='tel'
                                        name='phone'
                                        placeholder='Contact No.'
                                        className='form-control form-control-lg bg-limit fs-6'
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className='input-group mb-3'>
                                    <input
                                        type='text'
                                        name='address'
                                        placeholder='Address'
                                        className='form-control form-control-lg bg-limit fs-6'
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className='input-group mb-3'>
                                    <input
                                        type='password'
                                        name='password'
                                        placeholder='Password'
                                        className='form-control form-control-lg bg-limit fs-6'
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                
                                <div className='input-group mb-3 justify-content-center'>
                                    <button
                                        type='submit'
                                        className='btn btn-primary btn-lg w-100 fw-semibold'
                                        disabled={loading}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        ) : null}
                                        {loading ? 'Processing...' : 'REGISTER'}
                                    </button>
                                </div>
                                
                                {pendingVerification && (
                                    <div className='text-center mt-3'>
                                        <button
                                            type='button'
                                            className='btn btn-outline-secondary btn-sm'
                                            onClick={startNewRegistration}
                                        >
                                            Register with different email
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Login form */}
                    <div className='col-md-6 right-box'>
                        <form onSubmit={handleSubmit}>
                            <div className='header-text mb-4'>
                                <h1>Sign In</h1>
                            </div>
                            <div className='input-group mb-3'>
                                <input
                                    type='email'
                                    name='email'
                                    placeholder='Email'
                                    className='form-control form-control-lg bg-limit fs-6'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className='input-group mb-3'>
                                <input
                                    type='password'
                                    name='password'
                                    placeholder='Password'
                                    className='form-control form-control-lg bg-limit fs-6'
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className='input-group mb-5 d-flex justify-content-between'>
                                <div className='form-check'>
                                    <input type='checkbox' className='form-check-input' />
                                    <label htmlFor='formcheck' className='form-check-label text-secondary'>
                                        <small>Remember me</small>
                                    </label>
                                </div>
                                <div className='forgot'>
                                    <small><a href='#'>Forgot password?</a></small>
                                </div>
                            </div>
                            <div className='input-group mb-3 justify-content-center'>
                                <button
                                    type='submit'
                                    className='btn btn-primary btn-lg w-50 fw-semibold'
                                    disabled={loading}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px'
                                    }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    ) : null}
                                    {loading ? 'Processing...' : 'LOGIN'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Switch panel */}
                    <div className='switch-content'>
                        <div className='switch'>
                            <div className='switch-panel switch-left'>
                                <h1>Hello, Again</h1>
                                <p>We are happy to see you back</p>
                                <button
                                    className='btn btn-outline-light'
                                    onClick={SwitchContent}
                                    style={{
                                        borderRadius: '20px',
                                        padding: '8px 24px'
                                    }}
                                >
                                    LOGIN
                                </button>
                            </div>
                            <div className='switch-panel switch-right'>
                                <h1>Welcome To</h1>
                                <h1>হাতবদল</h1>
                                <p>Join Our Unique Platform, Explore a New Experience</p>
                                <button
                                    className='btn btn-outline-light'
                                    onClick={SwitchContent}
                                    style={{
                                        borderRadius: '20px',
                                        padding: '8px 24px'
                                    }}
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoginRegister;