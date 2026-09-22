/**
 * Phonixe Media - API Client Service
 */

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

const getHeaders = (isAuth = false) => {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (isAuth) {
    const token = localStorage.getItem('phonixe_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // --- Public Endpoints ---
  async getLandingContent() {
    const res = await fetch(`${BASE_URL}/content`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch content');
    return data.data;
  },

  async submitLead(leadData) {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(leadData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit lead');
    return data;
  },

  // --- Auth Endpoints ---
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Auth check failed');
    return data.user;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    return data;
  },

  // --- Content CMS ---
  async updateContent(contentData) {
    const res = await fetch(`${BASE_URL}/content`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(contentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update content');
    return data;
  },

  // --- Services CMS ---
  async getServices() {
    const res = await fetch(`${BASE_URL}/services`);
    const data = await res.json();
    return data.data;
  },

  async createService(serviceData) {
    const res = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(serviceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create service');
    return data.data;
  },

  async updateService(id, serviceData) {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(serviceData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update service');
    return data.data;
  },

  async deleteService(id) {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete service');
    return data;
  },

  // --- Case Studies CMS ---
  async createCaseStudy(csData) {
    const res = await fetch(`${BASE_URL}/case-studies`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(csData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create case study');
    return data.data;
  },

  async updateCaseStudy(id, csData) {
    const res = await fetch(`${BASE_URL}/case-studies/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(csData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update case study');
    return data.data;
  },

  async deleteCaseStudy(id) {
    const res = await fetch(`${BASE_URL}/case-studies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete case study');
    return data;
  },

  // --- Testimonials CMS ---
  async createTestimonial(tData) {
    const res = await fetch(`${BASE_URL}/testimonials`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(tData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create testimonial');
    return data.data;
  },

  async updateTestimonial(id, tData) {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(tData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update testimonial');
    return data.data;
  },

  async deleteTestimonial(id) {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete testimonial');
    return data;
  },

  // --- FAQs CMS ---
  async createFaq(faqData) {
    const res = await fetch(`${BASE_URL}/faqs`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(faqData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create FAQ');
    return data.data;
  },

  async updateFaq(id, faqData) {
    const res = await fetch(`${BASE_URL}/faqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(faqData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update FAQ');
    return data.data;
  },

  async deleteFaq(id) {
    const res = await fetch(`${BASE_URL}/faqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete FAQ');
    return data;
  },

  // --- Stats CMS ---
  async updateStats(statsArray) {
    const res = await fetch(`${BASE_URL}/stats`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ stats: statsArray })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update stats');
    return data.data;
  },

  // --- Leads Management CRM ---
  async getLeads() {
    const res = await fetch(`${BASE_URL}/leads`, {
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch leads');
    return data.data;
  },

  async updateLeadStatus(id, status) {
    const res = await fetch(`${BASE_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update lead status');
    return data.data;
  },

  async deleteLead(id) {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete lead');
    return data;
  }
};
