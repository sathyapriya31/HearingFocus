/**
 * detectionStore.ts
 *
 * Persist detection events locally using AsyncStorage.
 * Max 200 records kept (newest first).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Detection} from '../types/detection';

const STORAGE_KEY = '@hearing_trigger:detections';
const MAX_RECORDS = 200;

type StoreListener = () => void;
const listeners: StoreListener[] = [];

export function addStoreListener(listener: StoreListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (e) {
      console.error('[DetectionStore] Error in listener callback:', e);
    }
  });
}

export async function saveDetection(entry: Detection): Promise<void> {
  const existing = await getDetections();
  const updated = [entry, ...existing].slice(0, MAX_RECORDS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners();
}

export async function getDetections(): Promise<Detection[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function clearDetections(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
  notifyListeners();
}

export async function updateDetectionTranscript(id: string, transcript: string, confirmed: boolean): Promise<void> {
  const items = await getDetections();
  const updated = items.map(d =>
    d.id === id ? {...d, transcript, confirmed} : d,
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyListeners();
}
