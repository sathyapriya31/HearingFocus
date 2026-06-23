/**
 * useDetectionEvents.ts
 *
 * Subscribes to real-time detection events emitted by audioBridge.
 */
import {useState, useEffect} from 'react';
import {getDetections, addStoreListener} from '../services/detectionStore';
import {Detection} from '../types/detection';

export function useDetectionEvents(limit = 50) {
  const [detections, setDetections] = useState<Detection[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadDetections = async () => {
      try {
        const data = await getDetections();
        if (isMounted) {
          setDetections(data.slice(0, limit));
        }
      } catch (err) {
        console.error('[useDetectionEvents] Error fetching detections:', err);
      }
    };

    loadDetections();

    const unsubscribe = addStoreListener(() => {
      loadDetections();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [limit]);

  return detections;
}
