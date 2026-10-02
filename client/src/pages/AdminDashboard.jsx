import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminDashboard({ navigateTo }) {
  const { user, logout, extendSession, secondsRemaining, showInactivityWarning } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Leads CRM Search & Filter States
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

  // Data States
  const [content, setContent] = useState({});
  const [stats, setStats] = useState([]);
  const [services, setServices] = useState([]);
  const [caseStudies, setCaseStudies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [leads, setLeads] = useState([]);

  // Forms & Modal states
  const [newService, setNewService] = useState({ title: '', badge: 'Core', desc: '', features: '', order: 1 });
  const [newCaseStudy, setNewCaseStudy] = useState({ clientName: '', niche: '', startingPoint: '', strategy: '', reach: '', leads: '', growth: '', order: 1 });
  const [newTestimonial, setNewTestimonial] = useState({ authorName: '', niche: '', quote: '', stars: 5, avatarEmoji: '✨', order: 1 });
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', order: 1 });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  // Format idle countdown
  const formatTime = (totalSec) => {
    if (totalSec === undefined || totalSec === null) return '15:00';
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Export Leads to CSV
  const exportLeadsToCsv = () => {
    if (!leads.length) return alert('No leads to export.');
    const headers = ['Date', 'Prospect Name', 'WhatsApp', 'Instagram', 'Coaching Domain', 'Goal', 'Status', 'Message'];
    const rows = leads.map(l => [
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp || '').replace(/"/g, '""')}"`,
      `"${(l.instagram || '').replace(/"/g, '""')}"`,
      `"${(l.niche || '').replace(/"/g, '""')}"`,
      `"${(l.goal || '').replace(/"/g, '""')}"`,
      `"${(l.status || '').replace(/"/g, '""')}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phonixe_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📥 Leads exported to CSV successfully!');
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesStatus = leadStatusFilter === 'all' || lead.status === leadStatusFilter;
    const term = leadSearch.toLowerCase().trim();
    if (!term) return matchesStatus;
    const matchesTerm = (
      (lead.name && lead.name.toLowerCase().includes(term)) ||
      (lead.whatsapp && lead.whatsapp.toLowerCase().includes(term)) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(term)) ||
      (lead.niche && lead.niche.toLowerCase().includes(term)) ||
      (lead.goal && lead.goal.toLowerCase().includes(term)) ||
      (lead.message && lead.message.toLowerCase().includes(term))
    );
    return matchesStatus && matchesTerm;
  });

  // Load everything
  const loadDashboardData = async () => {
    try {
      const [bundle, leadList] = await Promise.all([
        api.getLandingContent(),
        api.getLeads().catch(() => [])
      ]);
      setContent(bundle.content || {});
      setStats(bundle.stats || []);
      setServices(bundle.services || []);
      setCaseStudies(bundle.caseStudies || []);
      setTestimonials(bundle.testimonials || []);
      setFaqs(bundle.faqs || []);
      setLeads(leadList || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const triggerToast = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(''), 3500);
  };

  // 1. Content Save
  const handleSaveContent = async (e) => {
    e.preventDefault();
    try {
      await api.updateContent(content);
      triggerToast('✅ Site content & branding settings updated!');
    } catch (err) {
      alert('Error updating content: ' + err.message);
    }
  };

  // 2. Leads Status Change
  const handleLeadStatus = async (id, newStatus) => {
    try {
      await api.updateLeadStatus(id, newStatus);
      setLeads(leads.map(l => l._id === id ? { ...l, status: newStatus } : l));
      triggerToast('✅ Lead status updated to ' + newStatus);
    } catch (err) {
      alert('Error updating lead: ' + err.message);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      await api.deleteLead(id);
      setLeads(leads.filter(l => l._id !== id));
      triggerToast('Lead removed');
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Service Add/Delete
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createService(newService);
      setServices([...services, created]);
      setNewService({ title: '', badge: 'Core', desc: '', features: '', order: services.length + 1 });
      triggerToast('✅ New service added to landing page!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.deleteService(id);
      setServices(services.filter(s => s._id !== id));
      triggerToast('Service deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Case Study Add/Delete
  const handleAddCaseStudy = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createCaseStudy(newCaseStudy);
      setCaseStudies([...caseStudies, created]);
      setNewCaseStudy({ clientName: '', niche: '', startingPoint: '', strategy: '', reach: '', leads: '', growth: '', order: caseStudies.length + 1 });
      triggerToast('✅ Case study added to landing page!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCaseStudy = async (id) => {
    if (!window.confirm('Delete this case study?')) return;
    try {
      await api.deleteCaseStudy(id);
      setCaseStudies(caseStudies.filter(c => c._id !== id));
      triggerToast('Case study deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Testimonial Add/Delete
  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createTestimonial(newTestimonial);
      setTestimonials([...testimonials, created]);
      setNewTestimonial({ authorName: '', niche: '', quote: '', stars: 5, avatarEmoji: '✨', order: testimonials.length + 1 });
      triggerToast('✅ Testimonial added to landing page!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      setTestimonials(testimonials.filter(t => t._id !== id));
      triggerToast('Testimonial deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. FAQ Add/Delete
  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createFaq(newFaq);
      setFaqs([...faqs, created]);
      setNewFaq({ question: '', answer: '', order: faqs.length + 1 });
      triggerToast('✅ FAQ item added to landing page!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ item?')) return;
    try {
      await api.deleteFaq(id);
      setFaqs(faqs.filter(f => f._id !== id));
      triggerToast('FAQ deleted');
    } catch (err) {
      alert(err.message);
    }
  };

  // 7. Stats Update
  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      await api.updateStats(stats);
      triggerToast('✅ Social proof statistics saved!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 8. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await api.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: '', newPassword: '' });
      triggerToast('✅ Admin password changed successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-light)' }}>
        Loading Phonixe CMS Engine...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); navigateTo('landing'); }}
            style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', cursor: 'pointer' }}
            title="Go to Phonixe Media Home Page"
          >
            <img 
              src="/assets/logo-horizontal.png" 
              alt="Phonixe Logo" 
              style={{ maxHeight: '38px', width: 'auto', objectFit: 'contain', cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s' }} 
            />
          </a>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span>📊</span> Overview
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <span>📥</span> Inbound Leads
            {newLeadsCount > 0 && (
              <span style={{ marginLeft: 'auto', background: '#3B82F6', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                {newLeadsCount}
              </span>
            )}
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <span>✍️</span> Content & Branding
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <span>🛠️</span> Services Manager
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'case-studies' ? 'active' : ''}`}
            onClick={() => setActiveTab('case-studies')}
          >
            <span>📈</span> Case Studies
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'testimonials' ? 'active' : ''}`}
            onClick={() => setActiveTab('testimonials')}
          >
            <span>💬</span> Testimonials
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <span>❓</span> FAQ Manager
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <span>🔢</span> Stats & Counters
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <span>🔐</span> Security
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button 
            className="btn btn-outline-glass btn-small w-full"
            onClick={() => navigateTo('landing')}
          >
            View Live Landing Page &rarr;
          </button>
          <button 
            style={{ color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, padding: '8px' }}
            onClick={() => { logout(); navigateTo('admin-login'); }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        {saveSuccess && (
          <div style={{ background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#86EFAC', padding: '12px 18px', borderRadius: '8px', marginBottom: '24px', fontWeight: 600 }}>
            {saveSuccess}
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Agency Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome back, {user?.name || 'Phonixe Admin'}. Here is your live agency performance snapshot.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className={`session-badge ${secondsRemaining <= 120 ? 'warning' : ''}`} title="Admin session automatically locks after 15m of user inactivity">
                  <span>{secondsRemaining <= 120 ? '⚠️' : '🟢'}</span>
                  <span>Session: <strong>{formatTime(secondsRemaining)}</strong></span>
                </div>
                <button className="btn btn-gold btn-small" onClick={() => setActiveTab('leads')}>
                  View Inquiries ({leads.length})
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
              <div className="admin-card-box">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Inbound Leads</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>{leads.length}</div>
                <span style={{ color: '#60A5FA', fontSize: '0.8rem' }}>{newLeadsCount} New inquiries pending</span>
              </div>

              <div className="admin-card-box">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Services Offered</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--gold-light)', margin: '8px 0' }}>{services.length}</div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Customized for coaches</span>
              </div>

              <div className="admin-card-box">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Published Case Studies</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '8px 0' }}>{caseStudies.length}</div>
                <span style={{ color: 'var(--gold-bright)', fontSize: '0.8rem' }}>Tarot, Vastu, Relationship</span>
              </div>

              <div className="admin-card-box">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>WhatsApp Contact</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#25D366', margin: '14px 0', whiteSpace: 'nowrap' }}>{content.whatsappNumber || '+91 8799690069'}</div>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Active for 1-click calls</span>
              </div>
            </div>

            <div className="admin-card-box" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>Recent Inbound Leads</h3>
                {leads.length > 0 && (
                  <button className="btn btn-outline-glass btn-small" onClick={() => setActiveTab('leads')}>
                    View All Inquiries ({leads.length}) &rarr;
                  </button>
                )}
              </div>
              {leads.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>No strategy call inquiries yet. Test the booking modal on the live landing page!</p>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table table-overview">
                    <thead>
                      <tr>
                        <th style={{ width: '220px' }}>Prospect Name</th>
                        <th style={{ width: '180px' }}>WhatsApp</th>
                        <th style={{ width: '180px' }}>Niche / Domain</th>
                        <th style={{ width: '130px' }}>Status</th>
                        <th style={{ width: '140px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map(l => (
                        <tr key={l._id}>
                          <td>
                            <strong style={{ color: '#FFF' }}>{l.name}</strong><br/>
                            <small style={{ color: 'var(--text-dim)' }}>{l.instagram || 'No handle provided'}</small>
                          </td>
                          <td>
                            <a 
                              href={`https://wa.me/${l.whatsapp.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: '#25D366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <span>💬</span> <span>{l.whatsapp}</span>
                            </a>
                          </td>
                          <td>
                            <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>{l.niche}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${l.status}`}>{l.status}</span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-gold btn-small" onClick={() => setActiveTab('leads')} style={{ padding: '6px 14px' }}>
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEADS CRM */}
        {activeTab === 'leads' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Inbound Strategy Inquiries ({leads.length})</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All discovery calls and audit requests submitted through the landing page.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-outline-glass btn-small"
                  onClick={exportLeadsToCsv}
                >
                  📥 Export to CSV
                </button>
                <div className={`session-badge ${secondsRemaining <= 120 ? 'warning' : ''}`} title="Admin session automatically locks after 15m idle">
                  <span>{secondsRemaining <= 120 ? '⚠️' : '🟢'}</span>
                  <span>Session: <strong>{formatTime(secondsRemaining)}</strong></span>
                </div>
              </div>
            </div>

            {/* Toolbar with Search, Filter & Scroll tip */}
            <div className="admin-crm-toolbar">
              <div className="admin-crm-controls">
                <input 
                  type="text"
                  className="admin-search-input"
                  placeholder="🔍 Search name, phone, domain, notes..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                />
                <select 
                  className="admin-filter-select"
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="new">New ({leads.filter(l => l.status === 'new').length})</option>
                  <option value="contacted">Contacted ({leads.filter(l => l.status === 'contacted').length})</option>
                  <option value="qualified">Qualified ({leads.filter(l => l.status === 'qualified').length})</option>
                  <option value="closed">Closed ({leads.filter(l => l.status === 'closed').length})</option>
                </select>
                {(leadSearch || leadStatusFilter !== 'all') && (
                  <button 
                    type="button" 
                    className="btn btn-outline-glass btn-small"
                    onClick={() => { setLeadSearch(''); setLeadStatusFilter('all'); }}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Clear Filters
                  </button>
                )}
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Showing {filteredLeads.length} of {leads.length} lead{leads.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="scroll-hint-pill">
                <span>↔️</span>
                <span>Scroll table horizontally for full prospect information & actions</span>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="admin-card-box text-center">
                <p style={{ color: 'var(--text-muted)' }}>No leads in the database yet. Submit an inquiry from the landing page to test!</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="admin-card-box text-center">
                <p style={{ color: 'var(--text-muted)' }}>No inquiries match your current search/filter.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-date">Date</th>
                      <th className="col-name">Prospect Name</th>
                      <th className="col-wa">WhatsApp</th>
                      <th className="col-ig">Instagram</th>
                      <th className="col-domain">Coaching Domain</th>
                      <th className="col-goal">Goal</th>
                      <th className="col-status">Status</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => {
                      const cleanWa = lead.whatsapp.replace(/[^0-9]/g, '');
                      const prefilledChat = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hi ${lead.name}, thank you for requesting a Strategy Audit with Phonixe Media! Let's discuss your coaching brand growth.`)}`;
                      const cleanIg = (lead.instagram || '').replace(/^@/, '').trim();
                      return (
                        <tr key={lead._id}>
                          <td className="col-date" style={{ fontSize: '0.82rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                          <td className="col-name">
                            <strong style={{ color: '#FFF', fontSize: '0.94rem' }}>{lead.name}</strong>
                            {lead.message && (
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>"{lead.message}"</p>
                            )}
                          </td>
                          <td className="col-wa">
                            <a 
                              href={prefilledChat} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ color: '#25D366', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                            >
                              <span>💬</span> <span>{lead.whatsapp}</span>
                            </a>
                          </td>
                          <td className="col-ig">
                            {cleanIg ? (
                              <a 
                                href={`https://instagram.com/${cleanIg}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ color: 'var(--gold-light)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                              >
                                <span>📸</span> @{cleanIg}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--text-dim)' }}>—</span>
                            )}
                          </td>
                          <td className="col-domain">
                            <span style={{ color: 'var(--gold-bright)', fontWeight: 600, background: 'rgba(229, 169, 60, 0.1)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(229, 169, 60, 0.25)', fontSize: '0.82rem', display: 'inline-block' }}>
                              {lead.niche}
                            </span>
                          </td>
                          <td className="col-goal" style={{ fontSize: '0.84rem', color: '#DDE2EB', lineHeight: 1.45 }}>
                            {lead.goal}
                          </td>
                          <td className="col-status">
                            <select 
                              value={lead.status} 
                              onChange={(e) => handleLeadStatus(lead._id, e.target.value)}
                              className="admin-filter-select"
                              style={{ padding: '5px 10px', fontSize: '0.8rem', width: '100%' }}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="qualified">Qualified</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="col-actions">
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <a 
                                href={prefilledChat} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-gold btn-small" 
                                style={{ fontSize: '0.78rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
                              >
                                WhatsApp
                              </a>
                              <button 
                                onClick={() => handleDeleteLead(lead._id)} 
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }} 
                                title="Delete inquiry record"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CONTENT & BRANDING CMS */}
        {activeTab === 'content' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Content & Branding CMS</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Edit headlines, copy, and contact links on the live landing page.</p>
              </div>
            </div>

            <form onSubmit={handleSaveContent}>
              <div className="admin-card-box">
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '18px' }}>Hero Section Copy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Hero Headline Prefix</label>
                    <input 
                      type="text" 
                      value={content.heroHeadlinePrefix || ''}
                      onChange={(e) => setContent({ ...content, heroHeadlinePrefix: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hero Headline Highlight (Gold Gradient)</label>
                    <input 
                      type="text" 
                      value={content.heroHeadlineHighlight || ''}
                      onChange={(e) => setContent({ ...content, heroHeadlineHighlight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label>Hero Subheadline</label>
                  <textarea 
                    rows={3} 
                    value={content.heroSubheadline || ''}
                    onChange={(e) => setContent({ ...content, heroSubheadline: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '14px' }}>
                  <div className="form-group">
                    <label>Primary CTA Text</label>
                    <input 
                      type="text" 
                      value={content.primaryCtaText || ''}
                      onChange={(e) => setContent({ ...content, primaryCtaText: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Secondary CTA Text</label>
                    <input 
                      type="text" 
                      value={content.secondaryCtaText || ''}
                      onChange={(e) => setContent({ ...content, secondaryCtaText: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Trust Bar Text</label>
                    <input 
                      type="text" 
                      value={content.trustLine || ''}
                      onChange={(e) => setContent({ ...content, trustLine: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-card-box">
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '18px' }}>Agency Contact & Social Channels</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Official WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={content.whatsappNumber || ''}
                      onChange={(e) => setContent({ ...content, whatsappNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input 
                      type="email" 
                      value={content.email || ''}
                      onChange={(e) => setContent({ ...content, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram Handle</label>
                    <input 
                      type="text" 
                      value={content.instagramHandle || ''}
                      onChange={(e) => setContent({ ...content, instagramHandle: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input 
                      type="url" 
                      value={content.instagramUrl || ''}
                      onChange={(e) => setContent({ ...content, instagramUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-card-box">
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '18px' }}>Section Headlines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Problem Section Headline</label>
                    <input 
                      type="text" 
                      value={content.problemHeadline || ''}
                      onChange={(e) => setContent({ ...content, problemHeadline: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Problem Transition Headline</label>
                    <input 
                      type="text" 
                      value={content.problemTransitionText || ''}
                      onChange={(e) => setContent({ ...content, problemTransitionText: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Services Headline</label>
                    <input 
                      type="text" 
                      value={content.servicesHeadline || ''}
                      onChange={(e) => setContent({ ...content, servicesHeadline: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Case Studies Headline</label>
                    <input 
                      type="text" 
                      value={content.resultsHeadline || ''}
                      onChange={(e) => setContent({ ...content, resultsHeadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-gold btn-large">
                💾 Save All Content Changes
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SERVICES CMS */}
        {activeTab === 'services' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Services Manager ({services.length})</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add, customize, or remove services displayed on the landing page.</p>
              </div>
            </div>

            {/* Add Service Form */}
            <div className="admin-card-box">
              <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px' }}>Add New Service</h3>
              <form onSubmit={handleAddService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Service Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Shooting & Direction"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge Tag</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Hands-On"
                      value={newService.badge}
                      onChange={(e) => setNewService({ ...newService, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea 
                    rows={2} 
                    required
                    placeholder="Brief summary of this service..."
                    value={newService.desc}
                    onChange={(e) => setNewService({ ...newService, desc: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Deliverables (1 per line)</label>
                  <textarea 
                    rows={3}
                    placeholder="Shot-by-shot guidance&#10;Lighting composition&#10;Batch recording system"
                    value={newService.features}
                    onChange={(e) => setNewService({ ...newService, features: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-gold btn-small" style={{ alignSelf: 'flex-start' }}>
                  + Add Service to Site
                </button>
              </form>
            </div>

            {/* Services List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {services.map(srv => (
                <div className="admin-card-box" key={srv._id} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => handleDeleteService(srv._id)} 
                    style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444', fontSize: '1.1rem' }}
                    title="Delete service"
                  >
                    🗑️
                  </button>
                  <span className="service-badge" style={{ position: 'static', marginBottom: '8px', display: 'inline-block' }}>
                    {srv.badge}
                  </span>
                  <h4 style={{ fontSize: '1.15rem', color: '#fff', margin: '6px 0' }}>{srv.title}</h4>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px' }}>{srv.desc}</p>
                  <ul style={{ fontSize: '0.78rem', color: '#CAD2DE' }}>
                    {srv.features?.map((f, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>✦ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CASE STUDIES CMS */}
        {activeTab === 'case-studies' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Case Studies & Results ({caseStudies.length})</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage coach success stories and proof metrics.</p>
              </div>
            </div>

            <div className="admin-card-box">
              <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px' }}>Add Case Study</h3>
              <form onSubmit={handleAddCaseStudy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Client Name / Title *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. [Client: Tarot Mentor]"
                      value={newCaseStudy.clientName}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, clientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Niche Tag *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tarot & Intuitive Coach"
                      value={newCaseStudy.niche}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, niche: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Starting Point *</label>
                    <textarea 
                      rows={2} 
                      required
                      placeholder="Where they started before Phonixe..."
                      value={newCaseStudy.startingPoint}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, startingPoint: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phonixe Strategy *</label>
                    <textarea 
                      rows={2} 
                      required
                      placeholder="What strategy was deployed..."
                      value={newCaseStudy.strategy}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, strategy: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Reach Stat *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 180K+ Views"
                      value={newCaseStudy.reach}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, reach: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Leads Stat *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 42+ Inquiries"
                      value={newCaseStudy.leads}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, leads: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Growth Stat *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 3.4x Revenue"
                      value={newCaseStudy.growth}
                      onChange={(e) => setNewCaseStudy({ ...newCaseStudy, growth: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-gold btn-small" style={{ alignSelf: 'flex-start' }}>
                  + Add Case Study
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {caseStudies.map(cs => (
                <div className="admin-card-box" key={cs._id} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => handleDeleteCaseStudy(cs._id)}
                    style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444' }}
                    title="Delete case study"
                  >
                    🗑️
                  </button>
                  <span className="case-niche-tag">{cs.niche}</span>
                  <h4 style={{ fontSize: '1.15rem', color: '#fff', margin: '8px 0' }}>{cs.clientName}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <strong>Starting:</strong> {cs.startingPoint}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gold-light)', marginBottom: '14px' }}>
                    <strong>Strategy:</strong> {cs.strategy}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                    <span>{cs.reach}</span>
                    <span style={{ color: '#25D366' }}>{cs.leads}</span>
                    <span style={{ color: 'var(--gold-bright)' }}>{cs.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TESTIMONIALS CMS */}
        {activeTab === 'testimonials' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Client Testimonials ({testimonials.length})</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add genuine quotes, client names, and coach specializations.</p>
              </div>
            </div>

            <div className="admin-card-box">
              <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px' }}>Add Testimonial</h3>
              <form onSubmit={handleAddTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label>Author / Client Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. [Client Name / Coach]"
                      value={newTestimonial.authorName}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, authorName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Niche</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tarot & Spiritual Reader"
                      value={newTestimonial.niche}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, niche: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Star Rating</label>
                    <select 
                      value={newTestimonial.stars}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, stars: Number(e.target.value) })}
                    >
                      <option value="5">5 Stars (★★★★★)</option>
                      <option value="4">4 Stars (★★★★☆)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Review / Quote *</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="Enter what the client said about Phonixe Media..."
                    value={newTestimonial.quote}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-gold btn-small" style={{ alignSelf: 'flex-start' }}>
                  + Add Testimonial
                </button>
              </form>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {testimonials.map(t => (
                <div className="admin-card-box" key={t._id} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => handleDeleteTestimonial(t._id)}
                    style={{ position: 'absolute', top: '16px', right: '16px', color: '#EF4444' }}
                    title="Delete testimonial"
                  >
                    🗑️
                  </button>
                  <div style={{ color: 'var(--gold-bright)', marginBottom: '8px' }}>{'★'.repeat(t.stars)}</div>
                  <p style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#D6DCE5', marginBottom: '14px' }}>"{t.quote}"</p>
                  <div>
                    <strong style={{ color: '#fff', display: 'block' }}>{t.authorName}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--gold-light)' }}>{t.niche}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: FAQ CMS */}
        {activeTab === 'faqs' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">FAQ Manager ({faqs.length})</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Frequently asked questions displayed in the accordion.</p>
              </div>
            </div>

            <div className="admin-card-box">
              <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px' }}>Add FAQ Item</h3>
              <form onSubmit={handleAddFaq} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Question *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Do you create custom packages for tarot coaches?"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Answer *</label>
                  <textarea 
                    rows={3} 
                    required
                    placeholder="Clear explanation answering the question..."
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-gold btn-small" style={{ alignSelf: 'flex-start' }}>
                  + Add FAQ
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {faqs.map((f, i) => (
                <div className="admin-card-box" key={f._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '8px' }}>{i + 1}. {f.question}</h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>{f.answer}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteFaq(f._id)} 
                    style={{ color: '#EF4444', fontSize: '1.1rem', padding: '4px' }}
                    title="Delete FAQ"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: STATS COUNTERS CMS */}
        {activeTab === 'stats' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Social Proof Statistics</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customize the animated counter numbers on the landing page.</p>
              </div>
            </div>

            <form onSubmit={handleSaveStats}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {stats.map((st, idx) => (
                  <div className="admin-card-box" key={st._id || idx}>
                    <h4 style={{ color: 'var(--gold-light)', marginBottom: '12px' }}>Card #{idx + 1}</h4>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Target Number</label>
                      <input 
                        type="number" 
                        value={st.number}
                        onChange={(e) => {
                          const updated = [...stats];
                          updated[idx].number = Number(e.target.value);
                          setStats(updated);
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Suffix</label>
                      <input 
                        type="text" 
                        value={st.suffix}
                        onChange={(e) => {
                          const updated = [...stats];
                          updated[idx].suffix = e.target.value;
                          setStats(updated);
                        }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label>Label</label>
                      <input 
                        type="text" 
                        value={st.label}
                        onChange={(e) => {
                          const updated = [...stats];
                          updated[idx].label = e.target.value;
                          setStats(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        rows={2}
                        value={st.desc}
                        onChange={(e) => {
                          const updated = [...stats];
                          updated[idx].desc = e.target.value;
                          setStats(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-gold btn-large" style={{ marginTop: '20px' }}>
                💾 Save Statistics
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: SECURITY */}
        {activeTab === 'security' && (
          <div>
            <div className="admin-header-bar">
              <div>
                <h1 className="admin-page-title">Admin Account Security</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage session security, idle protection, and administrator credentials.</p>
              </div>
              <div className={`session-badge ${secondsRemaining <= 120 ? 'warning' : ''}`}>
                <span>{secondsRemaining <= 120 ? '⚠️' : '🟢'}</span>
                <span>Session Auto-Lock: <strong>{formatTime(secondsRemaining)}</strong></span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              {/* Session Protection Box */}
              <div className="admin-card-box">
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛡️</span> Inactivity Auto-Logout Policy
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                  To prevent unauthorized access, your administrator session is monitored in real-time. If no user actions (clicks, typing, scroll, touches) occur for <strong>15 minutes</strong>, you are automatically signed out.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '14px 16px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Session Status:</span>
                    <span style={{ color: '#34D399', fontWeight: 700 }}>🟢 Active & Monitored</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Idle Timeout:</span>
                    <span style={{ color: '#FFF' }}>15 Minutes (900 seconds)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Time Until Auto-Lock:</span>
                    <span style={{ color: 'var(--gold-bright)', fontWeight: 800, fontSize: '0.92rem' }}>{formatTime(secondsRemaining)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    className="btn btn-gold btn-small"
                    onClick={() => { extendSession(); triggerToast('⏱️ Session timer reset to 15:00!'); }}
                  >
                    Reset Inactivity Timer
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-glass btn-small"
                    onClick={() => { logout('manual'); navigateTo('admin-login'); }}
                  >
                    Sign Out Now
                  </button>
                </div>
              </div>

              {/* Password Change Box */}
              <div className="admin-card-box">
                <h3 style={{ color: 'var(--gold-light)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔑</span> Change Password
                </h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Enter current password"
                      value={pwForm.currentPassword}
                      onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password (min 6 chars)</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Enter new password"
                      value={pwForm.newPassword}
                      onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-gold btn-large">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="inactivity-modal-overlay">
          <div className="inactivity-modal">
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⏱️</div>
            <h3 style={{ color: '#FFF', fontSize: '1.4rem', marginBottom: '8px' }}>Session Expiring Soon</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Due to 15 minutes of inactivity, your administrator session will automatically lock in{' '}
              <strong style={{ color: '#FBBF24', fontSize: '1.2rem', display: 'inline-block', padding: '0 4px' }}>
                {secondsRemaining}s
              </strong>{' '}
              to protect agency data and client leads.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-gold btn-large"
                onClick={extendSession}
              >
                Stay Logged In
              </button>
              <button 
                type="button" 
                className="btn btn-outline-glass btn-large"
                onClick={() => { logout('manual'); navigateTo('admin-login'); }}
              >
                Sign Out Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
