import { IApi, IProduct, IOrderRequest, IOrderResponse, ApiListResponse, ILarekApi } from '../types';

export type ApiConfig = {
  cdnUrl: string;
}

const DEFAULT_API_CONFIG: ApiConfig = {
  cdnUrl: ''
}

export class LarekApi implements ILarekApi {
	protected _apiClient: IApi;
  protected _cdnUrl: string;

	constructor(api: IApi, config: Partial<ApiConfig>) {
    this._apiClient = api;
    this._cdnUrl = { ...DEFAULT_API_CONFIG, ...config }.cdnUrl;
  }

  /**
   * Получение каталога товаров
   * GET /product - возвращает объект с total и items
   */
  async getProducts(): Promise<IProduct[]> {
    const response = await this._apiClient.get<ApiListResponse<IProduct>>('/product');
    
    return response.items.map(product => ({
      ...product,
      image: this._cdnUrl + product.image // Добавляем CDN_URL к изображениям
    }));
  }

  /**
   * Создание заказа
   * POST /order - принимает данные заказа, возвращает id и total заказа
   */
  async sendOrder(orderData: IOrderRequest): Promise<IOrderResponse> {
    return this._apiClient.post<IOrderResponse>('/order', orderData);
  }
}
