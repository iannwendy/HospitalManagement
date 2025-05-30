import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../assets/home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <Navbar />
      
      <header className="header text-white p-4">
        <div className="container">
          <div className="d-flex align-items-center">
            <div style={{ width: '50px', height: '50px', marginRight: '15px', color: 'white' }}>
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M13.8333 7.3C13.8333 7.01997 13.8333 6.87996 13.7788 6.773C13.7309 6.67892 13.6544 6.60243 13.5603 6.5545C13.4534 6.5 13.3134 6.5 13.0333 6.5H10.9667C10.6866 6.5 10.5466 6.5 10.4397 6.5545C10.3456 6.60243 10.2691 6.67892 10.2212 6.773C10.1667 6.87996 10.1667 7.01997 10.1667 7.3V9.36667C10.1667 9.64669 10.1667 9.78671 10.1122 9.89366C10.0642 9.98774 9.98774 10.0642 9.89366 10.1122C9.78671 10.1667 9.64669 10.1667 9.36667 10.1667H7.3C7.01997 10.1667 6.87996 10.1667 6.773 10.2212C6.67892 10.2691 6.60243 10.3456 6.5545 10.4397C6.5 10.5466 6.5 10.6866 6.5 10.9667V13.0333C6.5 13.3134 6.5 13.4534 6.5545 13.5603C6.60243 13.6544 6.67892 13.7309 6.773 13.7788C6.87996 13.8333 7.01997 13.8333 7.3 13.8333H9.36667C9.64669 13.8333 9.78671 13.8333 9.89366 13.8878C9.98774 13.9358 10.0642 14.0123 10.1122 14.1063C10.1667 14.2133 10.1667 14.3533 10.1667 14.6333V16.7C10.1667 16.98 10.1667 17.12 10.2212 17.227C10.2691 17.3211 10.3456 17.3976 10.4397 17.4455C10.5466 17.5 10.6866 17.5 10.9667 17.5H13.0333C13.3134 17.5 13.4534 17.5 13.5603 17.4455C13.6544 17.3976 13.7309 17.3211 13.7788 17.227C13.8333 17.12 13.8333 16.98 13.8333 16.7V14.6333C13.8333 14.3533 13.8333 14.2133 13.8878 14.1063C13.9358 14.0123 14.0123 13.9358 14.1063 13.8878C14.2133 13.8333 14.3533 13.8333 14.6333 13.8333H16.7C16.98 13.8333 17.12 13.8333 17.227 13.7788C17.3211 13.7309 17.3976 13.6544 17.4455 13.5603C17.5 13.4534 17.5 13.3134 17.5 13.0333V10.9667C17.5 10.6866 17.5 10.5466 17.4455 10.4397C17.3976 10.3456 17.3211 10.2691 17.227 10.2212C17.12 10.1667 16.98 10.1667 16.7 10.1667H14.6333C14.3533 10.1667 14.2133 10.1667 14.1063 10.1122C14.0123 10.0642 13.9358 9.98774 13.8878 9.89366C13.8333 9.78671 13.8333 9.64669 13.8333 9.36667V7.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 className="display-4 mb-0 font-weight-bold">Hospital Management System</h1>
          </div>
          <p className="lead">Providing quality healthcare services</p>
        </div>
      </header>

      <section className="hospital-info py-5">
        <div className="container">
          <div className="welcome-section">
            <h2>Welcome to Our Hospital</h2>
            <p>
              Our hospital is dedicated to providing the highest quality healthcare services
              to our patients. With state-of-the-art facilities and a team of experienced
              healthcare professionals, we strive to deliver exceptional care to every patient.
            </p>
            <p>
              Our mission is to improve the health and wellbeing of our community through
              compassionate care, innovative treatments, and a patient-centered approach.
            </p>
          </div>
        </div>
      </section>

      <section className="portal-links py-5">
        <div className="container">
          <div className="text-center mb-4">
            <div style={{ width: '60px', height: '60px', margin: '0 auto', marginBottom: '15px' }}>
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="#3a7ca5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 className="portal-title">User Portals</h2>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 portal-card">
                <div className="card-body text-center d-flex flex-column">
                  <div style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '10px', color: '#3a7ca5' }}>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 21V19C22 17.1362 20.7252 15.5701 19 15.126M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7C18 8.67869 16.9659 10.1159 15.5 10.7092M17 21C17 19.1362 17 18.2044 16.6955 17.4693C16.2895 16.4892 15.5108 15.7105 14.5307 15.3045C13.7956 15 12.8638 15 11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="card-title">Patient Portal</h3>
                  <p className="card-text flex-grow-1">Access your medical records, schedule appointments, and communicate with your healthcare providers.</p>
                  <div className="mt-auto">
                    <Link to="/patient/login" className="btn btn-primary">Login/Register</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 portal-card">
                <div className="card-body text-center d-flex flex-column">
                  <div style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '10px', color: '#3a7ca5' }}>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15.5H7.5C6.10444 15.5 5.40665 15.5 4.83886 15.6722C3.56045 16.06 2.56004 17.0605 2.17224 18.3389C2 18.9067 2 19.6044 2 21M16 18L18 20L22 16M14.5 7.5C14.5 9.98528 12.4853 12 10 12C7.51472 12 5.5 9.98528 5.5 7.5C5.5 5.01472 7.51472 3 10 3C12.4853 3 14.5 5.01472 14.5 7.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="card-title">Doctor Portal</h3>
                  <p className="card-text flex-grow-1">Manage patient appointments, access patient records, and collaborate with other healthcare professionals.</p>
                  <div className="mt-auto">
                    <Link to="/doctor/login" className="btn btn-primary">Login</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 portal-card">
                <div className="card-body text-center d-flex flex-column">
                  <div style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '10px', color: '#3a7ca5' }}>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M13.8333 7.3C13.8333 7.01997 13.8333 6.87996 13.7788 6.773C13.7309 6.67892 13.6544 6.60243 13.5603 6.5545C13.4534 6.5 13.3134 6.5 13.0333 6.5H10.9667C10.6866 6.5 10.5466 6.5 10.4397 6.5545C10.3456 6.60243 10.2691 6.67892 10.2212 6.773C10.1667 6.87996 10.1667 7.01997 10.1667 7.3V9.36667C10.1667 9.64669 10.1667 9.78671 10.1122 9.89366C10.0642 9.98774 9.98774 10.0642 9.89366 10.1122C9.78671 10.1667 9.64669 10.1667 9.36667 10.1667H7.3C7.01997 10.1667 6.87996 10.1667 6.773 10.2212C6.67892 10.2691 6.60243 10.3456 6.5545 10.4397C6.5 10.5466 6.5 10.6866 6.5 10.9667V13.0333C6.5 13.3134 6.5 13.4534 6.5545 13.5603C6.60243 13.6544 6.67892 13.7309 6.773 13.7788C6.87996 13.8333 7.01997 13.8333 7.3 13.8333H9.36667C9.64669 13.8333 9.78671 13.8333 9.89366 13.8878C9.98774 13.9358 10.0642 14.0123 10.1122 14.1063C10.1667 14.2133 10.1667 14.3533 10.1667 14.6333V16.7C10.1667 16.98 10.1667 17.12 10.2212 17.227C10.2691 17.3211 10.3456 17.3976 10.4397 17.4455C10.5466 17.5 10.6866 17.5 10.9667 17.5H13.0333C13.3134 17.5 13.4534 17.5 13.5603 17.4455C13.6544 17.3976 13.7309 17.3211 13.7788 17.227C13.8333 17.12 13.8333 16.98 13.8333 16.7V14.6333C13.8333 14.3533 13.8333 14.2133 13.8878 14.1063C13.9358 14.0123 14.0123 13.9358 14.1063 13.8878C14.2133 13.8333 14.3533 13.8333 14.6333 13.8333H16.7C16.98 13.8333 17.12 13.8333 17.227 13.7788C17.3211 13.7309 17.3976 13.6544 17.4455 13.5603C17.5 13.4534 17.5 13.3134 17.5 13.0333V10.9667C17.5 10.6866 17.5 10.5466 17.4455 10.4397C17.3976 10.3456 17.3211 10.2691 17.227 10.2212C17.12 10.1667 16.98 10.1667 16.7 10.1667H14.6333C14.3533 10.1667 14.2133 10.1667 14.1063 10.1122C14.0123 10.0642 13.9358 9.98774 13.8878 9.89366C13.8333 9.78671 13.8333 9.64669 13.8333 9.36667V7.3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="card-title">Nurse Portal</h3>
                  <p className="card-text flex-grow-1">Access patient care plans, document care, and communicate with the healthcare team.</p>
                  <div className="mt-auto">
                    <Link to="/nurse/login" className="btn btn-primary">Login</Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="card h-100 portal-card">
                <div className="card-body text-center d-flex flex-column">
                  <div style={{ width: '40px', height: '40px', margin: '0 auto', marginBottom: '10px', color: '#3a7ca5' }}>
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 15H8C6.13623 15 5.20435 15 4.46927 15.3045C3.48915 15.7105 2.71046 16.4892 2.30448 17.4693C2 18.2044 2 19.1362 2 21M15.5 3.29076C16.9659 3.88415 18 5.32131 18 7M11.9999 21.5L14.025 21.095C14.2015 21.0597 14.2898 21.042 14.3721 21.0097C14.4452 20.9811 14.5147 20.9439 14.579 20.899C14.6516 20.8484 14.7152 20.7848 14.8426 20.6574L21.5 14C22.0524 13.4477 22.0523 12.5523 21.5 12C20.9477 11.4477 20.0523 11.4477 19.5 12L12.8425 18.6575C12.7152 18.7848 12.6516 18.8484 12.601 18.921C12.5561 18.9853 12.5189 19.0548 12.4902 19.1278C12.458 19.2102 12.4403 19.2984 12.405 19.475L11.9999 21.5ZM13.5 7C13.5 9.20914 11.7091 11 9.5 11C7.29086 11 5.5 9.20914 5.5 7C5.5 4.79086 7.29086 3 9.5 3C11.7091 3 13.5 4.79086 13.5 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="card-title">Admin Portal</h3>
                  <p className="card-text flex-grow-1">Manage hospital operations, staff, and resources.</p>
                  <div className="mt-auto">
                    <Link to="/admin/login" className="btn btn-primary">Login</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer bg-dark text-white py-4">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <h4>Contact Us</h4>
              <p>19 Nguyen Huu Tho Street<br />Tan Phong Ward, District 7<br />Ho Chi Minh City, Vietnam</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: info@tdtu.edu.vn</p>
            </div>
            <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
              <h4>Quick Links</h4>
              <ul className="list-unstyled">
                <li><Link to="/patient/login" className="text-white">Patient Login</Link></li>
                <li><Link to="/doctor/login" className="text-white">Doctor Login</Link></li>
                <li><Link to="/nurse/login" className="text-white">Nurse Login</Link></li>
                <li><Link to="/admin/login" className="text-white">Admin Login</Link></li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-12">
              <h4>Follow Us</h4>
              <p>Stay connected with us on social media</p>
              <div className="social-links">
                <a href="https://www.facebook.com/tonducthanguniversity" target="_blank" rel="noopener noreferrer" className="text-white me-3">Facebook</a>
                <a href="https://twitter.com/tonducthanguniv" target="_blank" rel="noopener noreferrer" className="text-white me-3">Twitter</a>
                <a href="https://www.instagram.com/tdtu.edu.vn" target="_blank" rel="noopener noreferrer" className="text-white me-3">Instagram</a>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col text-center">
              <p>&copy; {new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 