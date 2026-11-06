import React, { useState } from 'react';
import {
  FitcoreLogo,
  UsersIcon,
  CalendarIcon,
  DollarIcon,
  ShieldIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingIcon,
  CheckIcon,
  LockIcon,
  ActivityIcon
} from './Icons';
import RegisterGymModal from './modals/RegisterGymModal';

export default function LandingPage({ onOpenLogin, onRegisterSuccess }) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactSubmitted(false), 5000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* SaaS Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '14px 24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Brand Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <FitcoreLogo size={32} />
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.4px', color: 'var(--primary-navy)', lineHeight: 1 }}>
                FITCORE
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.2px' }}>
                Gym Management Platform
              </div>
            </div>
          </div>

          {/* Navigation Links (NO Pricing) */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link-btn">Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-link-btn">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link-btn">How It Works</button>
            <button onClick={() => scrollToSection('about-us')} className="nav-link-btn">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link-btn">Contact</button>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenLogin}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '8px 18px' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '72px 24px 64px',
        maxWidth: '1240px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'var(--accent-teal-subtle)',
              border: '1px solid rgba(15, 118, 110, 0.2)',
              color: 'var(--accent-teal)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <BuildingIcon size={14} /> Multi-Tenant Gym Architecture
            </div>

            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.8px',
              marginBottom: '18px',
              color: 'var(--primary-navy)'
            }}>
              Everything Your Gym Needs. All in One Place.
            </h1>

            <p style={{
              fontSize: '1.0625rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              FITCORE helps gym owners manage members, memberships, payments and everyday gym operations through one simple and organized platform.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="btn btn-primary btn-lg"
              >
                Get Started
                <ArrowRightIcon size={16} />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="btn btn-secondary btn-lg"
              >
                Explore Features
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={16} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Independent Gym Workspaces
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={16} style={{ color: 'var(--accent-teal)' }} />
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Dedicated Client Portal
                </span>
              </div>
            </div>
          </div>

          {/* Genuine Product Architectural Visual (No Fake Metrics) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            boxShadow: 'var(--shadow-md)'
          }}>
            {/* Window header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              marginBottom: '18px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E2E8F0' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E2E8F0' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#E2E8F0' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary-navy)', marginLeft: '6px' }}>
                  FITCORE Management Console
                </span>
              </div>
              <span className="badge badge-success">Platform Active</span>
            </div>

            {/* Architecture Preview Modules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <UsersIcon size={16} style={{ color: 'var(--accent-teal)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Client Management
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Member Profiles & Accounts
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Provision credentials & track status
                </div>
              </div>

              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CalendarIcon size={16} style={{ color: 'var(--primary-navy)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Membership Plans
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Automated Duration & Expiry
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Monthly, quarterly, yearly plans
                </div>
              </div>

              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <DollarIcon size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Payment Balances
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Ledger & Reconciliation
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Paid, partial, unpaid & credit tracking
                </div>
              </div>

              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldIcon size={16} style={{ color: 'var(--secondary-slate)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Tenant Security
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Strict Gym Scoping
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Isolated data & role-based JWT auth
                </div>
              </div>
            </div>

            {/* Workflow preview bar */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Operational Scope:</span>
              <span style={{ color: 'var(--primary-navy)', fontWeight: 600 }}>Multi-Tenant Facility Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '72px 24px',
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Implemented Capabilities
            </span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--primary-navy)',
              marginTop: '6px',
              marginBottom: '12px'
            }}>
              Designed Specifically For Gym Operations
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              FITCORE provides the essential operational tools gym owners need to manage memberships, clients, and payments effectively.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {[
              {
                icon: <UsersIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Client Management',
                desc: 'Add, update, search, and manage gym members. Provide initial login credentials directly to clients for self-service portal access.'
              },
              {
                icon: <CalendarIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Membership Management',
                desc: 'Configure Monthly, Quarterly, and Yearly plans. Assign plans to members, calculate expiry dates automatically, and manage renewals seamlessly.'
              },
              {
                icon: <DollarIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Payment Tracking',
                desc: 'Record payments and installment receipts. The system computes remaining balances, overpayment credits, and payment statuses accurately.'
              },
              {
                icon: <ActivityIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Admin Dashboard',
                desc: 'Get an aggregated view of total clients, active memberships, upcoming renewals, expired passes, and collected revenue calculated from your live records.'
              },
              {
                icon: <LockIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Client Dashboard',
                desc: 'Dedicated read-only portal where members log in to review their membership status, start and expiry dates, payment balance, and update their password.'
              },
              {
                icon: <CheckCircleIcon size={22} style={{ color: 'var(--accent-teal)' }} />,
                title: 'Membership Status Tracking',
                desc: 'Automated lifecycle tracking categorized into Upcoming, Active, Expired, and Cancelled states based on plan dates.'
              }
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How FITCORE Works Section */}
      <section id="how-it-works" style={{
        padding: '72px 24px',
        maxWidth: '1240px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-teal)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Clear Workflow
          </span>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--primary-navy)',
            marginTop: '6px',
            marginBottom: '12px'
          }}>
            How FITCORE Works
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Four simple steps from gym registration to daily member management.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px'
        }}>
          {[
            {
              step: '1',
              title: 'Gym Owner Registers',
              desc: 'The gym owner registers their gym facility with their owner credentials to establish an isolated tenant workspace.'
            },
            {
              step: '2',
              title: 'Admin Access Granted',
              desc: 'The gym owner accesses their private Admin Dashboard to configure membership plans and review gym operations.'
            },
            {
              step: '3',
              title: 'Manage Client Accounts',
              desc: 'Admin registers clients and assigns membership plans. Login credentials are created to provide to the member offline.'
            },
            {
              step: '4',
              title: 'Client Self-Service',
              desc: 'Clients log in to the Client Dashboard to view their personal membership pass, expiry dates, payment status, and manage their password.'
            }
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-navy)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* About FITCORE Section */}
      <section id="about-us" style={{
        padding: '72px 24px',
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--accent-teal)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              About FITCORE
            </span>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--primary-navy)',
              marginTop: '6px',
              marginBottom: '18px'
            }}>
              Software Built for Gym Operations
            </h2>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '16px'
            }}>
              FITCORE was designed to solve the everyday challenges gym owners face: tracking client memberships, managing payments, computing expiration dates, and avoiding manual errors.
            </p>
            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '24px'
            }}>
              Each gym operates with independent member rosters, custom plans, and financial ledgers. Both gym administrators and members have dedicated dashboards designed for simplicity and speed.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Role-Based Access</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Admin & Client roles with JWT validation</div>
              </div>
              <div style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>Data Integrity</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transactional database consistency</div>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            textAlign: 'center'
          }}>
            <FitcoreLogo size={48} style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
              Get Started with FITCORE
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px' }}>
              Register your gym today and begin managing your members and memberships in one organized dashboard.
            </p>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="btn btn-primary btn-lg"
            >
              Register Your Gym
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '72px 24px',
        maxWidth: '720px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-teal)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Contact Us
          </span>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--primary-navy)',
            marginTop: '6px',
            marginBottom: '8px'
          }}>
            Questions About FITCORE?
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Send us a message and our team will get back to you shortly.
          </p>
        </div>

        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {contactSubmitted && (
            <div className="alert alert-success">
              <CheckCircleIcon size={18} />
              <span>Thank you! Your message has been received. We will respond promptly.</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                className="form-input"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Work Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                placeholder="e.g. owner@yourgym.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your gym facility and any questions you have..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Send Inquiry
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'var(--primary-navy)',
        borderTop: '1px solid var(--secondary-slate)',
        padding: '36px 24px',
        color: '#FFFFFF'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FitcoreLogo size={28} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.3px', color: '#FFFFFF' }}>
                FITCORE
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Commercial Gym Management SaaS
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', fontSize: '0.8125rem' }}>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="nav-link-btn" style={{ color: '#94A3B8' }}>Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-link-btn" style={{ color: '#94A3B8' }}>Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link-btn" style={{ color: '#94A3B8' }}>How It Works</button>
            <button onClick={() => scrollToSection('about-us')} className="nav-link-btn" style={{ color: '#94A3B8' }}>About Us</button>
            <button onClick={() => scrollToSection('contact')} className="nav-link-btn" style={{ color: '#94A3B8' }}>Contact</button>
            <button onClick={onOpenLogin} className="nav-link-btn" style={{ color: '#5EEAD4' }}>Sign In</button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8', width: '100%', textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            © {new Date().getFullYear()} FITCORE. All rights reserved. Professional gym management platform.
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      <RegisterGymModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(authData) => {
          setShowRegisterModal(false);
          if (onRegisterSuccess) onRegisterSuccess(authData);
        }}
      />
    </div>
  );
}
