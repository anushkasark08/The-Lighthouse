/** @jest-environment jsdom */
import api from '../api';

describe('Axios Interceptors Tests', () => {
  beforeEach(() => {
    // Clear localStorage mock
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('should attach Authorization header when token is present in localStorage', async () => {
    localStorage.setItem('token', 'mocked_jwt_token');

    // Run the request interceptor directly
    const mockConfig = { headers: {} };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const resultConfig = requestInterceptor(mockConfig);

    expect(resultConfig.headers['Authorization']).toBe('Bearer mocked_jwt_token');
  });

  test('should not attach Authorization header if token is missing', async () => {
    const mockConfig = { headers: {} };
    const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
    const resultConfig = requestInterceptor(mockConfig);

    expect(resultConfig.headers['Authorization']).toBeUndefined();
  });

  test('should handle expired JWT (401 error) by clearing token and dispatching auth-expired event', async () => {
    localStorage.setItem('token', 'expired_token');
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

    const errorResponse = {
      response: {
        status: 401
      }
    };

    // Run the response interceptor rejection handler directly
    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    await expect(responseInterceptorError(errorResponse)).rejects.toEqual(errorResponse);

    expect(localStorage.getItem('token')).toBeNull();
    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('auth-expired');
  });

  test('should forward other response errors unchanged', async () => {
    const errorResponse = {
      response: {
        status: 500
      }
    };

    const responseInterceptorError = api.interceptors.response.handlers[0].rejected;

    await expect(responseInterceptorError(errorResponse)).rejects.toEqual(errorResponse);
  });
});
