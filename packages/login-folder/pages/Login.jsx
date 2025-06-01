import React, { useState } from "react";
import "../styles/main.css";

const Login = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [formType, setFormType] = useState('user'); // 'user' or 'business'
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const handleFlip = (type) => {
    if (type === 'business-signup') {
      setFormType('business');
    } else {
      setFormType(type);
    }
    setIsFlipped(true);
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderPasswordInput = (placeholder, field) => (
    <div className="password-input-container">
      <input
        type={showPassword[field] ? "text" : "password"}
        placeholder={placeholder}
        className="input-field"
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => togglePasswordVisibility(field)}
      >
        {showPassword[field] ? "👁️" : "👁️‍🗨️"}
      </button>
    </div>
  );

  const renderLeftCard = () => (
    <div className={`left-card ${formType === 'business' ? 'flipped' : ''}`}>
      <div className="left-card-front">
        <h2 className="left-heading">WELCOME TO</h2>
        <h2 className="left-heading">GÜLBAHÇE'S #1</h2>
        <h2 className="left-heading">FOOD ORDERING PLATFORM</h2>
        <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
        <button 
          className="btn-orange" 
          onClick={() => {
            if (isFlipped) {
              setIsFlipped(false);
            } else {
              handleFlip('signup');
            }
          }}
        >
          {isFlipped ? 'SIGN IN' : 'SIGN UP'}
        </button>
        <p className="or-text">— or —</p>
        <p className="business-text">Are You A Business?</p>
        <button className="btn-blue" onClick={() => {
          setFormType('business');
          setIsFlipped(false);
        }}>BUSINESS PORTAL</button>
      </div>
      <div className="left-card-back">
        <h2 className="left-heading">WELCOME TO</h2>
        <h2 className="left-heading">BUSINESS PORTAL</h2>
        <h2 className="left-heading">GÜLBAHÇE YEMEK</h2>
        <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
        <button 
          className="btn-blue" 
          onClick={() => {
            if (isFlipped) {
              setIsFlipped(false);
            } else {
              setFormType('business');
              setIsFlipped(true);
            }
          }}
        >
          {isFlipped ? 'SIGN IN' : 'SIGN UP'}
        </button>
        <p className="or-text">— or —</p>
        <p className="business-text">Not A Business?</p>
        <button className="btn-orange" onClick={() => {
          setFormType('user');
          setIsFlipped(false);
        }}>USER PORTAL</button>
      </div>
    </div>
  );

  const renderForm = () => {
    if (formType === 'business' && !isFlipped) {
      return (
        <>
          <h1 className="signin-title">SIGN IN</h1>
          <p className="subtitle">Business</p>
          <input type="text" placeholder="Phone Number" className="input-field" />
          {renderPasswordInput("Password", "password")}
          <button className="btn-blue">SIGN IN</button>
          <a href="#" className="forgot-link">Forgot password?</a>
        </>
      );
    } else if (formType === 'business' && isFlipped) {
      return (
        <>
          <h1 className="signin-title">SIGN UP</h1>
          <input type="text" placeholder="Business Name" className="input-field" />
          <input type="text" placeholder="Phone Number" className="input-field" />
          {renderPasswordInput("Password", "password")}
          {renderPasswordInput("Confirm Password", "confirmPassword")}
          <button className="btn-blue">CREATE BUSINESS ACCOUNT</button>
        </>
      );
    } else if (isFlipped) {
      return (
        <>
          <h1 className="signin-title">SIGN UP</h1>
          <input type="text" placeholder="Full Name" className="input-field" />
          <input type="text" placeholder="Phone Number" className="input-field" />
          {renderPasswordInput("Password", "password")}
          {renderPasswordInput("Confirm Password", "confirmPassword")}
          <button className="btn-orange">CREATE ACCOUNT</button>
        </>
      );
    } else {
      return (
        <>
          <h1 className="signin-title">SIGN IN</h1>
          <p className="subtitle">Gülbahçe Yemek</p>
          <input type="text" placeholder="Phone number" className="input-field" />
          {renderPasswordInput("Password", "password")}
          <button className="btn-orange">SIGN IN</button>
          <a href="#" className="forgot-link">Forgot password?</a>
        </>
      );
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card-container ${formType === 'business' ? 'business-mode' : ''}`}>
        <div className={`left-card ${formType === 'business' ? 'flipped' : ''}`}>
          <div className="left-card-front">
            <h2 className="left-heading">WELCOME TO</h2>
            <h2 className="left-heading">GÜLBAHÇE'S #1</h2>
            <h2 className="left-heading">FOOD ORDERING PLATFORM</h2>
            <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
            <button 
              className="btn-orange" 
              onClick={() => {
                if (isFlipped) {
                  setIsFlipped(false);
                } else {
                  handleFlip('signup');
                }
              }}
            >
              {isFlipped ? 'SIGN IN' : 'SIGN UP'}
            </button>
            <p className="or-text">— or —</p>
            <p className="business-text">Are You A Business?</p>
            <button className="btn-blue" onClick={() => {
              setFormType('business');
              setIsFlipped(false);
            }}>BUSINESS PORTAL</button>
          </div>
          <div className="left-card-back">
            <h2 className="left-heading">WELCOME TO</h2>
            <h2 className="left-heading">BUSINESS PORTAL</h2>
            <h2 className="left-heading">GÜLBAHÇE YEMEK</h2>
            <p className="account-warning">{isFlipped ? 'Already Have An Account?' : 'If You Don\'t Have An Account'}</p>
            <button 
              className="btn-blue" 
              onClick={() => {
                if (isFlipped) {
                  setIsFlipped(false);
                } else {
                  setFormType('business');
                  setIsFlipped(true);
                }
              }}
            >
              {isFlipped ? 'SIGN IN' : 'SIGN UP'}
            </button>
            <p className="or-text">— or —</p>
            <p className="business-text">Not A Business?</p>
            <button className="btn-orange" onClick={() => {
              setFormType('user');
              setIsFlipped(false);
            }}>USER PORTAL</button>
          </div>
        </div>
        <div className={`right-card-container ${isFlipped ? 'flipped' : ''}`}>
          <div className="right-card-front">
            {renderForm()}
          </div>
          <div className="right-card-back">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
