import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

// --- 1. The Complete CSS Stylesheet as a String ---
const styles = `
  /* --- Global Resets and Variables --- */
  :root {
    --bg-dark: #05050c;
    --text-light: #ffffff;
    --text-gray: #b3b3b3;
    --primary-blue: #2563eb;
    --neon-blue: #22d3ee;
    --neon-green: #34d399;
    --neon-purple: #a855f7;
    --font-family: 'Inter', sans-serif;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: var(--font-family);
    background-color: var(--bg-dark);
    color: var(--text-light);
    /* IMPORTANT: Replace these URLs with actual assets for the final look */
    background-image: 
        radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
        url('https://www.transparenttextures.com/patterns/stardust.png');
    background-size: cover, cover, auto;
    background-attachment: fixed;
    overflow-x: hidden;
  }

  a {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  /* --- Typography --- */
  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
  }

  h2.section-title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
  }

  p {
    font-size: 1.1rem;
    color: var(--text-gray);
    line-height: 1.6;
  }

  .blue-text {
    color: var(--neon-blue);
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }

  /* --- Buttons --- */
  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary {
    background-color: var(--primary-blue);
    color: white;
  }

  .btn-primary:hover {
    background-color: #1d4ed8;
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.5);
  }

  .btn-gradient {
    background: linear-gradient(90deg, var(--primary-blue), var(--neon-blue));
    color: white;
    border: none;
  }

  .btn-gradient:hover {
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.6);
    transform: translateY(-2px);
  }

  .btn-outline {
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: var(--text-light);
  }

  .btn-outline:hover {
    border-color: var(--neon-blue);
    background: rgba(34, 211, 238, 0.1);
  }

  /* --- Navbar --- */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 5%;
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 10;
  }

  .logo {
    font-weight: 700;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 25px;
  }

  .login-link {
    font-weight: 600;
    font-size: 0.95rem;
    color: white;
    padding: 12px 28px;
    background: transparent;
    border: 2px solid rgba(34, 211, 238, 0.5);
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .login-link:hover {
    background: rgba(34, 211, 238, 0.15);
    border-color: var(--neon-blue);
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.4);
    transform: translateY(-2px);
  }

  /* --- Hero Section --- */
  .hero-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 90vh;
    padding: 100px 5% 50px;
    gap: 40px;
  }

  .hero-content {
    max-width: 550px;
    margin-left: auto;
  }

  .hero-buttons {
    margin-top: 2.5rem;
    display: flex;
    gap: 15px;
  }

  .hero-visual {
    position: relative;
    max-width: 1200px;
    margin-right: auto;
    order: -1;
  }

  .glowing-image {
    width: 100%;
    height: auto;
    mix-blend-mode: screen;
    filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.4));
    animation: subtlePulse 4s infinite alternate;
  }

  @keyframes subtlePulse {
    0% { filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.3)); }
    100% { filter: drop-shadow(0 0 25px rgba(52, 211, 153, 0.5)); }
  }

  /* --- Features Section & Glass Cards --- */
  .features-section {
    padding: 50px 5% 100px;
  }

  .cards-container {
    display: flex;
    gap: 25px;
    justify-content: center;
    align-items: stretch;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 16px;
    flex: 1;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }

  .glass-card:hover {
    transform: translateY(-5px);
  }

  .card-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }

  .card-text h3 {
    font-size: 1.3rem;
    margin-bottom: 10px;
  }

  .card-text p {
    font-size: 0.95rem;
  }

  /* --- Card Color Variants --- */
  .card-purple {
    border-color: rgba(168, 85, 247, 0.3);
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
  }
  .card-purple .card-icon { color: var(--neon-purple); }
  .card-purple:hover { box-shadow: 0 0 30px rgba(168, 85, 247, 0.2) inset; }

  .card-green {
    border-color: rgba(52, 211, 153, 0.5);
    background: linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%);
  }
  .card-green .card-icon { color: var(--neon-green); }
  .card-green:hover { box-shadow: 0 0 40px rgba(52, 211, 153, 0.25) inset; }

  .bg-icon {
    position: absolute;
    right: -20px;
    bottom: -20px;
    font-size: 8rem;
    opacity: 0.1;
    color: var(--neon-green);
    transform: rotate(-15deg);
  }

  .card-blue {
    border-color: rgba(37, 99, 235, 0.3);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%);
  }
  .card-blue .card-icon { color: var(--primary-blue); }
  .card-blue:hover { box-shadow: 0 0 30px rgba(37, 99, 235, 0.2) inset; }

  /* --- Basic Responsiveness --- */
  @media (max-width: 1024px) {
    h1 { font-size: 2.8rem; }
    .hero-section {
        flex-direction: column;
        text-align: center;
        padding-top: 120px;
        gap: 50px;
    }
    .hero-buttons {
        justify-content: center;
    }
    .hero-visual {
        margin-left: 0;
        width: 100%;
    }
    .cards-container {
        flex-wrap: wrap;
    }
    .glass-card {
        min-width: 280px;
    }
  }
`;


// --- 2. Sub-Components ---

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <Logo className="w-auto h-14" />
      </div>
      <div className="nav-links">
        <Link to="/login" className="login-link">Login</Link>
        <Link to="/signup" className="btn btn-gradient">Get Started →</Link>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  // Placeholder for the complex visualization. Replace with your actual asset.
  const visualizationPlaceholder = "/image.png";

  return (
    <header className="hero-section">
      <div className="hero-content">
        <h1>Digital Infrastructure for <span className="blue-text">Early-Stage Founders</span></h1>
        <p>Manage execution, validate ideas, collaborate with your team, and gain actionable insights — all in one unified platform.</p>
        
        <div className="hero-buttons">
          <Link to="/signup" className="btn btn-gradient">
            Start Your Journey <i className="fas fa-arrow-right"></i>
          </Link>
          <a href="#features" className="btn btn-outline">Learn More</a>
        </div>
      </div>

      <div className="hero-visual">
        <img src={visualizationPlaceholder} alt="Udaan Platform Visualization" className="glowing-image" />
        <div className="glow-effect"></div>
      </div>
    </header>
  );
};

const FeatureCard = ({ iconClass, title, description, colorVariantClass, hasBackgroundIcon }) => {
  return (
    <div className={`glass-card ${colorVariantClass}`}>
      <div className="card-icon">
        <i className={iconClass}></i>
      </div>
      <div className="card-text">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {hasBackgroundIcon && <i className="fas fa-sync-alt bg-icon"></i>}
    </div>
  );
};

const FeaturesSection = () => {
  const featuresData = [
    {
      id: 1,
      iconClass: "fas fa-tasks",
      title: "Execution OS",
      description: "Track tasks, milestones, and workflows with clarity.",
      colorVariantClass: "card-purple",
      hasBackgroundIcon: false
    },
    {
      id: 2,
      iconClass: "fas fa-lightbulb",
      title: "Idea Validation",
      description: "Test assumptions early with structured feedback.",
      colorVariantClass: "card-green",
      hasBackgroundIcon: true
    },
    {
      id: 3,
      iconClass: "fas fa-users",
      title: "Team Collaboration",
      description: "Collaborate in real-time across your entire team.",
      colorVariantClass: "card-blue",
      hasBackgroundIcon: false
    },
    {
      id: 4,
      iconClass: "fas fa-chart-line",
      title: "Analytics Dashboard",
      description: "Data-driven insights and metrics for smarter decisions.",
      colorVariantClass: "card-purple",
      hasBackgroundIcon: false
    },
    {
      id: 5,
      iconClass: "fas fa-wallet",
      title: "Budget Management",
      description: "Track finances, expenses, and burn rate efficiently.",
      colorVariantClass: "card-green",
      hasBackgroundIcon: false
    },
    {
      id: 6,
      iconClass: "fas fa-rocket",
      title: "Investor Readiness",
      description: "Auto-generate pitch materials and track growth metrics.",
      colorVariantClass: "card-blue",
      hasBackgroundIcon: true
    }
  ];

  return (
    <section className="features-section" id="features">
      <h2 className="section-title">How Udaan Helps</h2>
      <div className="cards-container">
        {featuresData.map(feature => (
          <FeatureCard 
            key={feature.id}
            {...feature}
          />
        ))}
      </div>
    </section>
  );
};


// --- 3. Main App Component ---

function LandingPage() {
  return (
    <>
      {/* Injecting the CSS styles defined at the top */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className="app-container">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
      </div>
    </>
  );
}

export default LandingPage;
