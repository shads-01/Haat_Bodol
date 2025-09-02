import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
    const [isLogin, setIsLogin] = useState(true);
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Save token to localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect to donations page
                navigate('/donations');
            } else {
                setError(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setError('Network error. Please check your connection and try again.');
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const SwitchContent = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className="body">
            <div className={`content justify-content-center align-items-center d-flex shadow-lg ${!isLogin ? 'active' : ''}`} id='content'>
                {/* Error message */}
                {error && (
                    <div className="alert alert-danger position-absolute top-0 start-50 translate-middle-x mt-3" role="alert">
                        {error}
                    </div>
                )}

                {/* Register form */}
                <div className='col-md-6 d-flex justify-content-center'>
                    <div className="w-100 px-3">
                        <form onSubmit={handleSubmit}>
                            <div className='header-text mb-4'>
                                <h1>Create Account</h1>
                            </div>
                            <div className='input-group mb-3'>
                                <input
                                    type='text'
                                    name='name'
                                    placeholder='Name'
                                    className='form-control form-control-lg bg-limit fs-6'
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLogin}
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
                                    required={!isLogin}
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
                                    required={!isLogin}
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
                                    className='lr-btn border-white text-white w-100 fs-6'
                                    disabled={loading}
                                >
                                    {loading ? 'Processing...' : 'REGISTER'}
                                </button>
                            </div>
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
                                className='lr-btn border-white text-white w-50 fs-6'
                                disabled={loading}
                            >
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
                                className='hidden lr-btn border-white text-white w-50 fs-6'
                                onClick={SwitchContent}
                            >
                                LOGIN
                            </button>
                        </div>
                        <div className='switch-panel switch-right'>
                            <h1>Welcome To</h1>
                            <h1>হাতবদল</h1>
                            <p>Join Our Unique Platform, Explore a New Experience</p>
                            <button
                                className='hidden lr-btn border-white text-white w-50 fs-6'
                                onClick={SwitchContent}
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginRegister;