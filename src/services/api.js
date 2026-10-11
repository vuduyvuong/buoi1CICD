const API_BASE = process.env.REACT_APP_API_URL || '/api';

export function apiRequest(path, options) {
  const config = Object.assign({ credentials: 'same-origin', headers: {} }, options || {});
  if (config.body && typeof config.body !== 'string') {
    config.headers = Object.assign({}, config.headers, { 'Content-Type': 'application/json' });
    config.body = JSON.stringify(config.body);
  }
  return fetch(`${API_BASE}${path}`, config).then((response) => {
    if (response.status === 204) return null;
    return response.json().catch(() => ({})).then((data) => {
      if (!response.ok) throw new Error(data.error || 'Không thể kết nối máy chủ.');
      return data;
    });
  }).catch((error) => {
    if (error && error.message) throw error;
    throw new Error('Không thể kết nối máy chủ. Vui lòng kiểm tra backend.');
  });
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  delete: (path) => apiRequest(path, { method: 'DELETE' })
};
