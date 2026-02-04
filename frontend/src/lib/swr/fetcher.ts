import apiClient from '@/services/apiClient'
import publicApiClient from '@/services/publicApiClient'

export const apiFetcher = async (url: string) => {
  const res = await apiClient.get(url)
  return res.data
}

export const publicFetcher = async (url: string) => {
  const res = await publicApiClient.get(url)
  return res.data
}
