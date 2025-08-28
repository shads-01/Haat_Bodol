import { click } from '@testing-library/user-event/dist/click';
import React from 'react'
import { useNavigate } from 'react-router-dom';
function LoginRegister(){
    function SwitchContent(){
        const content = document.getElementById('content');
        const registerBtn = document.getElementById('register');
        const loginBtn = document.getElementById('login');

        registerBtn.addEventListener('click', () =>{
            content.classList.add("active")
        });
        loginBtn.addEventListener('click', () =>{
            content.classList.remove("active")
        });
    }
    const navigate = useNavigate();
    function handleNavigation(e) {
        e.preventDefault();
        navigate('/donations');
    }

    return(
        <div className="body">
        <div className='content justify-content-center align-items-center d-flex shadow-lg' id='content'>
           {/*register form */}
           <div className='col-md-6 d-flex justify-content-center'>
            <div className="w-100 px-3">
                
            <form>
                <div className='header-text mb-4'>
                    <h1>Create Account</h1>
                </div>
                <div className='input-group mb-3'>
                    <input type='text' placeholder='Name' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                 
                <div className='input-group mb-3'>
                    <input type='email' placeholder='Email' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                <div className='input-group mb-3'>
                    <input type='phone' placeholder='Contact No.' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                 
                <div className='input-group mb-3'>
                    <input type='address' placeholder='Address' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                <div className='input-group mb-3'>
                    <input type='password' placeholder='Password' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                 
                <div className='input-group mb-3 justify-content-center'>
                    <button className='lr-btn border-white text-white w-100 fs-6' onClick={handleNavigation}>Register</button>
                </div>
                
            </form>
            </div>
           </div>

           {/*Login form */}
           <div className='col-md-6 right-box'>
            <form>
                <div className='header-text mb-4'>
                    <h1>Sign In</h1>
               
                </div>
                <div className='input-group mb-3'>
                    <input type='email' placeholder='Email' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                 
                <div className='input-group mb-3'>
                    <input type='password' placeholder='Password' className='form-control form-control-lg bg-limit fs-6'></input>
                </div>
                 <div className='input-group mb-5 d-flex justify-content-between'>
                    <div className='form-check'>
                        <input type='checkbox' className='form-check-input'/>
                        <label htmlFor='formcheck' className='form-check-label text-secondary'><small>Remember me</small></label>
                        
                    </div>
                    <div className='forgot'>
                        <small><a href='#'>Forgot password?</a></small>
                    </div>
                 </div>
                <div className='input-group mb-3 justify-content-center'>
                    <button className='lr-btn border-white text-white w-50 fs-6' onClick={handleNavigation}>Login</button>
                </div>
                
            </form>
           </div>
             {/*... switch panel..*/}
             <div className='switch-content'>
                <div className='switch'>
                    <div className='switch-panel switch-left'>
                        <h1>Hello, Again</h1>
                        <p>We are happy to see you back</p>
                        <button className='hidden lr-btn border-white text-white w-50 fs-6' id='login' onClick={SwitchContent}>Login</button>
                    </div>
                     <div className='switch-panel switch-right'>
                        <h1>Welcome To</h1>
                        <h1>হাতবদল</h1>
                        <p>Join Our Unique Platform, Explore a New Experience</p>
                        <button className='hidden lr-btn  border-white text-white w-50 fs-6' id='register' onClick={SwitchContent}>Register</button>
                    </div>
                </div>
             </div>


        </div>
        </div>
    )

}
export default LoginRegister