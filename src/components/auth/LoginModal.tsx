import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    module_access: 'music' as 'music' | 'publishing'
  });

  const { mockLogin, register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      const success = await mockLogin(formData.email);
      if (success) {
        onClose();
      }
    } else {
      const success = await register({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        module_access: formData.module_access
      });
      
      if (success) {
        onClose();
      }
    }
  };

  const quickLoginButtons = [
    { email: 'admin@hardban.com', label: 'Login as Admin', role: 'Admin' },
    { email: 'musician@hardban.com', label: 'Login as Musician', role: 'Musician' },
    { email: 'writer@hardban.com', label: 'Login as Writer', role: 'Writer' }
  ];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '32px',
        width: '100%',
        maxWidth: '480px',
        margin: '20px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1e293b',
            textAlign: 'center',
            margin: '0 0 8px 0' 
          }}>
            {isLogin ? 'Welcome Back' : 'Join HardbanRecords'}
          </h2>
          <p style={{ 
            color: '#64748b', 
            textAlign: 'center', 
            margin: 0,
            fontSize: '16px'
          }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Quick Login Buttons */}
        {isLogin && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#64748b', 
              marginBottom: '12px',
              textAlign: 'center' 
            }}>
              Quick Login (Demo)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {quickLoginButtons.map((btn) => (
                <button
                  key={btn.email}
                  onClick={() => mockLogin(btn.email).then(success => success && onClose())}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'transparent',
                    color: '#334155',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {btn.label} ({btn.role})
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af' 
              }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#9ca3af' 
                  }} />
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      borderRadius: '12px',
                      border: '2px solid #e5e7eb',
                      fontSize: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)'
                    }}
                    placeholder="Choose username"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Module Access
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="music"
                      checked={formData.module_access === 'music'}
                      onChange={(e) => setFormData({ ...formData, module_access: e.target.value as 'music' | 'publishing' })}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>🎵 Music</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value="publishing"
                      checked={formData.module_access === 'publishing'}
                      onChange={(e) => setFormData({ ...formData, module_access: e.target.value as 'music' | 'publishing' })}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>📚 Publishing</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '8px' 
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af' 
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};