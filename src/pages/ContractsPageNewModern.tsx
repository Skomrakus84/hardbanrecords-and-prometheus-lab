import React, { useState } from 'react';
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Edit3,
  Eye,
  Plus,
  Building2,
  Briefcase,
  Music,
  BookOpen,
  Star,
  Target,
  Award,
  Handshake
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  type: 'artist' | 'publishing' | 'distribution' | 'licensing';
  counterparty: string;
  status: 'active' | 'pending' | 'expired' | 'draft';
  value: string;
  startDate: string;
  endDate: string;
  completionRate: number;
  priority: 'high' | 'medium' | 'low';
}

interface ContractStats {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  change: string;
  color: string;
  bgGradient: string;
}

const ContractsPageNewModern: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const stats: ContractStats[] = [
    {
      icon: FileText,
      title: 'Active Contracts',
      value: '127',
      change: '+15%',
      color: '#1DB954',
      bgGradient: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)'
    },
    {
      icon: DollarSign,
      title: 'Total Value',
      value: '$2.4M',
      change: '+23%',
      color: '#FA243C',
      bgGradient: 'linear-gradient(135deg, #FA243C 0%, #ff4757 100%)'
    },
    {
      icon: Clock,
      title: 'Pending Review',
      value: '8',
      change: '-12%',
      color: '#FF9900',
      bgGradient: 'linear-gradient(135deg, #FF9900 0%, #ffa502 100%)'
    },
    {
      icon: CheckCircle2,
      title: 'Completed',
      value: '89%',
      change: '+5%',
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #10B981 0%, #34d399 100%)'
    }
  ];

  const contracts: Contract[] = [
    {
      id: 'CON-001',
      title: 'Music Distribution Agreement',
      type: 'distribution',
      counterparty: 'DJ Phoenix',
      status: 'active',
      value: '$45,000',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      completionRate: 85,
      priority: 'high'
    },
    {
      id: 'CON-002',
      title: 'Publishing Rights Deal',
      type: 'publishing',
      counterparty: 'Sarah Connor Books',
      status: 'pending',
      value: '$28,500',
      startDate: '2024-02-01',
      endDate: '2026-02-01',
      completionRate: 45,
      priority: 'medium'
    },
    {
      id: 'CON-003',
      title: 'Artist Development Contract',
      type: 'artist',
      counterparty: 'Luna Rivers',
      status: 'active',
      value: '$120,000',
      startDate: '2024-01-01',
      endDate: '2027-01-01',
      completionRate: 92,
      priority: 'high'
    },
    {
      id: 'CON-004',
      title: 'Licensing Agreement - Gaming',
      type: 'licensing',
      counterparty: 'Epic Games Studio',
      status: 'active',
      value: '$75,000',
      startDate: '2024-03-15',
      endDate: '2025-03-15',
      completionRate: 67,
      priority: 'medium'
    },
    {
      id: 'CON-005',
      title: 'Distribution Partnership',
      type: 'distribution',
      counterparty: 'The Neon Collective',
      status: 'expired',
      value: '$32,000',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      completionRate: 100,
      priority: 'low'
    },
    {
      id: 'CON-006',
      title: 'Book Publishing Agreement',
      type: 'publishing',
      counterparty: 'Marcus Wright',
      status: 'draft',
      value: '$18,500',
      startDate: '2024-04-01',
      endDate: '2025-04-01',
      completionRate: 0,
      priority: 'medium'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'expired': return '#EF4444';
      case 'draft': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'artist': return User;
      case 'publishing': return BookOpen;
      case 'distribution': return Building2;
      case 'licensing': return Award;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'artist': return '#FA243C';
      case 'publishing': return '#FF9900';
      case 'distribution': return '#764BA2';
      case 'licensing': return '#1DB954';
      default: return '#6B7280';
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.counterparty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesType = filterType === 'all' || contract.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundImage: 'url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=900&fit=crop")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    padding: '40px',
    position: 'relative' as const
  };

  const overlayStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
    zIndex: 1
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const headerStyle = {
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: '#ffffff'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '40px'
  };

  const controlsStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap' as const
  };

  const contractsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '24px'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    color: '#ffffff'
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>

      <div style={contentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '800',
            margin: '0 0 16px 0',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 20px rgba(255, 255, 255, 0.3)'
          }}>
            Contract Management
          </h1>
          <p style={{
            fontSize: '1.2rem',
            margin: 0,
            opacity: 0.9,
            fontWeight: '300'
          }}>
            Manage all your business agreements and partnerships
          </p>
        </div>

        {/* Stats Grid */}
        <div style={statsGridStyle}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: stat.bgGradient,
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                backdropFilter: 'blur(10px)'
              }}></div>
              <div style={{position: 'relative', zIndex: 2}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                  <stat.icon size={32} style={{color: '#ffffff'}} />
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {stat.change}
                  </div>
                </div>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  margin: '0 0 8px 0',
                  color: '#ffffff'
                }}>
                  {stat.value}
                </h3>
                <p style={{
                  fontSize: '1rem',
                  margin: 0,
                  color: '#ffffff',
                  opacity: 0.9,
                  fontWeight: '500'
                }}>
                  {stat.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={controlsStyle}>
          <div style={{position: 'relative', flex: '1', minWidth: '200px'}}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffffff',
              opacity: 0.7
            }} />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 12px 12px 40px',
                color: '#ffffff',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '1rem',
              minWidth: '150px',
              outline: 'none'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '1rem',
              minWidth: '150px',
              outline: 'none'
            }}
          >
            <option value="all">All Types</option>
            <option value="artist">Artist</option>
            <option value="publishing">Publishing</option>
            <option value="distribution">Distribution</option>
            <option value="licensing">Licensing</option>
          </select>

          <button
            style={{
              background: 'linear-gradient(135deg, #1DB954 0%, #1ed760 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Plus size={20} />
            New Contract
          </button>
        </div>

        {/* Contracts Grid */}
        <div style={contractsGridStyle}>
          {filteredContracts.map((contract, index) => {
            const TypeIcon = getTypeIcon(contract.type);
            return (
              <div
                key={contract.id}
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 35px 60px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.1)';
                }}
              >
                {/* Header */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{
                      background: `${getTypeColor(contract.type)}20`,
                      borderRadius: '12px',
                      padding: '10px'
                    }}>
                      <TypeIcon size={20} style={{color: getTypeColor(contract.type)}} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        margin: '0 0 4px 0',
                        color: '#ffffff'
                      }}>
                        {contract.title}
                      </h3>
                      <p style={{
                        fontSize: '0.9rem',
                        margin: 0,
                        color: '#ffffff',
                        opacity: 0.7
                      }}>
                        {contract.id}
                      </p>
                    </div>
                  </div>
                  <div style={{
                    background: `${getStatusColor(contract.status)}20`,
                    color: getStatusColor(contract.status),
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {contract.status}
                  </div>
                </div>

                {/* Contract Details */}
                <div style={{marginBottom: '20px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <Building2 size={16} style={{color: '#ffffff', opacity: 0.7}} />
                    <span style={{color: '#ffffff', fontSize: '1rem', fontWeight: '500'}}>
                      {contract.counterparty}
                    </span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                    <DollarSign size={16} style={{color: '#10B981'}} />
                    <span style={{color: '#10B981', fontSize: '1.1rem', fontWeight: '600'}}>
                      {contract.value}
                    </span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <Calendar size={16} style={{color: '#ffffff', opacity: 0.7}} />
                    <span style={{color: '#ffffff', opacity: 0.8, fontSize: '0.9rem'}}>
                      {contract.startDate} - {contract.endDate}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{marginBottom: '20px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span style={{color: '#ffffff', fontSize: '0.9rem', opacity: 0.8}}>
                      Progress
                    </span>
                    <span style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>
                      {contract.completionRate}%
                    </span>
                  </div>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    height: '6px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: contract.completionRate > 80 ? '#10B981' : contract.completionRate > 50 ? '#F59E0B' : '#EF4444',
                      height: '100%',
                      width: `${contract.completionRate}%`,
                      borderRadius: '8px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{display: 'flex', gap: '12px'}}>
                  <button style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flex: 1,
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flex: 1,
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContractsPageNewModern;
