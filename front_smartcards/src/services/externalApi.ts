/**
 * External API Service - Random User API Integration
 * Обслуживает запросы к Random User API
 * Включает обработку ошибок и повторные попытки
 */

import axios from "axios";

const API_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Создаёт экземпляр axios с таймаутом
 */
function createAxiosInstance(timeout: number = API_TIMEOUT) {
  return axios.create({
    timeout,
    validateStatus: (status) => status < 500,
  });
}

/**
 * Retry logic с экспоненциальной задержкой
 */
async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return retryRequest(fn, retries - 1);
  }
}

/**
 * Получить случайных пользователей из Random User API
 *
 * @param count - количество пользователей (по умолчанию 4)
 * @returns массив объектов пользователей с именем, фото и локацией
 */
export async function getRandomUsers(count: number = 4): Promise<any[]> {
  const client = createAxiosInstance();

  return retryRequest(async () => {
    const response = await client.get("https://randomuser.me/api/", {
      params: {
        results: count,
        nat: "RU", // Russian nationality for Russian names
      },
    });

    if (response.status !== 200) {
      throw new Error("Failed to fetch random users");
    }

    return response.data.results;
  });
}

/**
 * Проверить доступность Random User API
 */
export async function healthCheckRandomUserAPI(): Promise<boolean> {
  try {
    const client = createAxiosInstance(3000); // 3s timeout
    const response = await client.get("https://randomuser.me/api/", {
      params: { results: 1 },
    });
    return response.status === 200;
  } catch {
    return false;
  }
}
