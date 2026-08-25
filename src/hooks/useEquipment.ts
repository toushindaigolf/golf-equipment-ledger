import { useEffect, useMemo, useRef, useState } from 'react';
import { selectEquipmentRepository } from '../repositories/equipmentRepositorySelector';
import type { EquipmentInput, GolfEquipment } from '../types/equipment';

type UseEquipmentOptions = { userId?: string; authLoading: boolean };

const errorMessage = (caught: unknown) => caught instanceof Error
  ? caught.message
  : '用品データの処理に失敗しました。もう一度お試しください。';

export function useEquipment({ userId, authLoading }: UseEquipmentOptions) {
  const repository = useMemo(() => selectEquipmentRepository(userId), [userId]);
  const modeKey = repository.source === 'cloud' ? `cloud:${userId}` : 'local';
  const currentMode = useRef(modeKey);
  const displayedMode = useRef(modeKey);
  const requestId = useRef(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [items, setItems] = useState<GolfEquipment[]>([]);
  const [loading, setLoading] = useState(authLoading);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  currentMode.current = modeKey;

  useEffect(() => {
    if (displayedMode.current !== modeKey) {
      displayedMode.current = modeKey;
      setItems([]);
    }

    if (authLoading) {
      setLoading(true);
      setSaving(false);
      setReady(false);
      return;
    }

    const activeRequest = ++requestId.current;
    setLoading(true);
    setSaving(false);
    setReady(false);
    setError('');

    void repository.getAll()
      .then(nextItems => {
        if (requestId.current !== activeRequest) return;
        setItems(nextItems);
        setReady(true);
      })
      .catch(caught => {
        if (requestId.current === activeRequest) setError(errorMessage(caught));
      })
      .finally(() => {
        if (requestId.current === activeRequest) setLoading(false);
      });
  }, [authLoading, modeKey, reloadCount, repository]);

  const canMutate = () => {
    if (ready && !loading && !saving) return true;
    setError('用品データの読み込みが完了していません。「再読み込み」をお試しください。');
    return false;
  };

  const create = async (input: EquipmentInput) => {
    if (!canMutate()) return false;
    const operationMode = currentMode.current;
    setSaving(true);
    setError('');
    try {
      const created = await repository.create(input);
      if (currentMode.current === operationMode) setItems(current => [created, ...current]);
      return true;
    } catch (caught) {
      if (currentMode.current === operationMode) setError(errorMessage(caught));
      return false;
    } finally {
      if (currentMode.current === operationMode) setSaving(false);
    }
  };

  const update = async (id: string, input: EquipmentInput) => {
    if (!canMutate()) return false;
    const operationMode = currentMode.current;
    setSaving(true);
    setError('');
    try {
      const updated = await repository.update(id, input);
      if (currentMode.current === operationMode) setItems(current => current.map(item => item.id === id ? updated : item));
      return true;
    } catch (caught) {
      if (currentMode.current === operationMode) setError(errorMessage(caught));
      return false;
    } finally {
      if (currentMode.current === operationMode) setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!canMutate()) return false;
    const operationMode = currentMode.current;
    setSaving(true);
    setError('');
    try {
      await repository.remove(id);
      if (currentMode.current === operationMode) setItems(current => current.filter(item => item.id !== id));
      return true;
    } catch (caught) {
      if (currentMode.current === operationMode) setError(errorMessage(caught));
      return false;
    } finally {
      if (currentMode.current === operationMode) setSaving(false);
    }
  };

  const restore = async (data: GolfEquipment[]) => {
    if (!repository.restore) {
      setError('ログイン中のJSON復元は、データ移行機能を実装するPhaseまで利用できません。端末内データは変更されていません。');
      return false;
    }
    if (!canMutate()) return false;
    setSaving(true);
    setError('');
    try {
      const restored = await repository.restore(data);
      setItems(restored);
      return true;
    } catch (caught) {
      setError(errorMessage(caught));
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    items,
    source: repository.source,
    loading,
    saving,
    ready,
    error,
    create,
    update,
    remove,
    restore,
    reload: () => setReloadCount(current => current + 1),
  };
}
