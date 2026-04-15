import { create } from 'zustand';
import api from '../api';

const usePostStore = create((set, get) => ({
  // ─── State ─────────────────────────────────────────────────────────────
  posts: [],
  selectedPost: null,
  loading: false,
  error: null,
  filters: { status: '', search: '' },
  pagination: { page: 1, limit: 50, total: 0 },
  statusCounts: {},

  // ─── Actions ───────────────────────────────────────────────────────────

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value } }));
    get().fetchPosts();
  },

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', pagination.page);
      params.set('limit', pagination.limit);

      const res = await api.get(`/posts?${params.toString()}`);
      set({
        posts: res.data.data,
        pagination: res.data.pagination || pagination,
        statusCounts: res.data.statusCounts || {},
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  selectPost: async (postId) => {
    if (!postId) { set({ selectedPost: null }); return; }
    try {
      const res = await api.get(`/posts/${postId}`);
      set({ selectedPost: res.data.data });
    } catch (err) {
      console.error('Error selecting post:', err);
    }
  },

  clearSelection: () => set({ selectedPost: null }),

  approvePost: async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/approve`);
      set({ selectedPost: res.data.data });
      get().fetchPosts();
    } catch (err) {
      console.error('Approve error:', err);
      throw err;
    }
  },

  rejectPost: async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/reject`);
      set({ selectedPost: res.data.data });
      get().fetchPosts();
    } catch (err) {
      console.error('Reject error:', err);
      throw err;
    }
  },

  redoPost: async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/redo`);
      set({ selectedPost: res.data.data });
      get().fetchPosts();
    } catch (err) {
      console.error('Redo error:', err);
      throw err;
    }
  },

  addComment: async (postId, text, selection) => {
    try {
      const res = await api.post(`/posts/${postId}/comment`, { text, selection });
      set({ selectedPost: res.data.data });
    } catch (err) {
      console.error('Comment error:', err);
      throw err;
    }
  },

  markPublished: async (postId, url) => {
    try {
      const res = await api.post(`/posts/${postId}/mark-published`, { url });
      set({ selectedPost: res.data.data });
      get().fetchPosts();
    } catch (err) {
      console.error('Publish error:', err);
      throw err;
    }
  },

  deletePost: async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      set({ selectedPost: null });
      get().fetchPosts();
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  },
}));

export default usePostStore;
