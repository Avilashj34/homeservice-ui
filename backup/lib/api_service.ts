import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './constants';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Add interceptor to inject Auth headers
        this.axiosInstance.interceptors.request.use(
            (config) => {
                // Get auth from localStorage
                if (typeof window !== "undefined") {
                    const stored = localStorage.getItem("admin_user"); // AUTH_KEY from auth.ts
                    if (stored) {
                        try {
                            const parsed = JSON.parse(stored);
                            const user = parsed.user;
                            if (user) {
                                config.headers['X-User-ID'] = user.id;
                                config.headers['X-User-Role'] = user.role;
                            }
                        } catch (e) {
                            // ignore
                        }
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => response,
            (error: any) => {
                console.error("API Error:", error);
                return Promise.reject(error);
            }
        );
    }

    // Generic Request method (optional to expose, but useful)
    async request<T>(config: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.request(config);
        return response.data;
    }

    async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
        return response.data;
    }
}

export const apiService = new ApiService();
