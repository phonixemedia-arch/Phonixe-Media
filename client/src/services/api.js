/**
 * Phonixe Media - API Client Service
 */

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  // Auto-connect to deployed backend server when running on main Vercel frontend
  if (typeof window !== 'undefined' && window.location.hostname.includes('phonixe-media.vercel.app')) {
    return 'https://phonixe-media-3uts.vercel.app/api';
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

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

// Safe Response Parser (prevents "Unexpected end of JSON input" on HTML/empty responses)
const parseResponse = async (res) => {
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (err) {
    // Non-JSON response (e.g., HTML from Vercel router)
  }

  if (!res.ok) {
    if (res.status === 404 || res.status === 405 || !json) {
      throw new Error(
        'Backend server not reachable. Please deploy your backend server or configure VITE_API_URL in project settings.'
      );
    }
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  if (!json) {
    throw new Error('Server returned an empty or invalid response.');
  }

  return json;
};

export const api = {
  // --- Public Endpoints ---
  async getLandingContent() {
    const res = await fetch(`${BASE_URL}/content`);
    const data = await parseResponse(res);
    return data.data;
  },

  async submitLead(leadData) {
    const res = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(leadData)
    });
    return await parseResponse(res);
  },

  // --- Auth Endpoints ---
  async login(username, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ username, password })
    });
    return await parseResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(true)
    });
    const data = await parseResponse(res);
    return data.user;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await parseResponse(res);
  },

  // --- Content CMS ---
  async updateContent(contentData) {
    const res = await fetch(`${BASE_URL}/content`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(contentData)
    });
    return await parseResponse(res);
  },

  // --- Services CMS ---
  async getServices() {
    const res = await fetch(`${BASE_URL}/services`);
    const data = await parseResponse(res);
    return data.data;
  },

  async createService(serviceData) {
    const res = await fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(serviceData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async updateService(id, serviceData) {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(serviceData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async deleteService(id) {
    const res = await fetch(`${BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return await parseResponse(res);
  },

  // --- Case Studies CMS ---
  async createCaseStudy(csData) {
    const res = await fetch(`${BASE_URL}/case-studies`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(csData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async updateCaseStudy(id, csData) {
    const res = await fetch(`${BASE_URL}/case-studies/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(csData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async deleteCaseStudy(id) {
    const res = await fetch(`${BASE_URL}/case-studies/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return await parseResponse(res);
  },

  // --- Testimonials CMS ---
  async createTestimonial(tData) {
    const res = await fetch(`${BASE_URL}/testimonials`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(tData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async updateTestimonial(id, tData) {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(tData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async deleteTestimonial(id) {
    const res = await fetch(`${BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return await parseResponse(res);
  },

  // --- FAQs CMS ---
  async createFaq(faqData) {
    const res = await fetch(`${BASE_URL}/faqs`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(faqData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async updateFaq(id, faqData) {
    const res = await fetch(`${BASE_URL}/faqs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(faqData)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async deleteFaq(id) {
    const res = await fetch(`${BASE_URL}/faqs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return await parseResponse(res);
  },

  // --- Stats CMS ---
  async updateStats(statsArray) {
    const res = await fetch(`${BASE_URL}/stats`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ stats: statsArray })
    });
    const data = await parseResponse(res);
    return data.data;
  },

  // --- Leads Management CRM ---
  async getLeads() {
    const res = await fetch(`${BASE_URL}/leads`, {
      headers: getHeaders(true)
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async updateLeadStatus(id, status) {
    const res = await fetch(`${BASE_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await parseResponse(res);
    return data.data;
  },

  async deleteLead(id) {
    const res = await fetch(`${BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    return await parseResponse(res);
  }
};
