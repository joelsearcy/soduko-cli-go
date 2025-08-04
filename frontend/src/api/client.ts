import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  GenerateBoardRequest,
  GenerateBoardResponse,
  ValidateBoardRequest,
  ValidateBoardResponse,
  HintRequest,
  HintResponse,
  ApiError,
} from '../types';

class SudokuApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'Unknown error',
          status: error.response?.status,
        };
        console.error('API Error:', apiError);
        return Promise.reject(apiError);
      }
    );
  }

  async generateBoard(request: GenerateBoardRequest): Promise<GenerateBoardResponse> {
    const response = await this.client.get(`/api/board/new`, {
      params: { difficulty: request.difficulty },
    });
    return response.data;
  }

  async validateBoard(request: ValidateBoardRequest): Promise<ValidateBoardResponse> {
    const response = await this.client.post('/api/board/validate', request);
    return response.data;
  }

  async getHint(request: HintRequest): Promise<HintResponse> {
    const response = await this.client.get('/api/board/hint', {
      params: {
        board: JSON.stringify(request.board),
        row: request.row,
        col: request.col,
      },
    });
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new SudokuApiClient();

// Export the class for testing
export { SudokuApiClient };
