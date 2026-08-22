import { api } from '../lib/api';

export function useHddMutations() {
  async function createMain(data) {
    const { data: created } = await api.post('/api/hdd/main', data);
    return created;
  }

  async function updateMain(id, data) {
    const { data: updated } = await api.put(`/api/hdd/main/${id}`, data);
    return updated;
  }

  async function createDetail(mainRecordId, data) {
    const { data: created } = await api.post('/api/hdd/detail', { mainRecordId, ...data });
    return created;
  }

  async function updateDetail(id, data) {
    const { data: updated } = await api.put(`/api/hdd/detail/${id}`, data);
    return updated;
  }

  return { createMain, updateMain, createDetail, updateDetail };
}
