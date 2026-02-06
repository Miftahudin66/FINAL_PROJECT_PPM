import NetInfo from '@react-native-community/netinfo';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db as firestore } from './Firebase';
import * as Database from './Database';
import { SyncQueueItem } from '../types';

export const startSyncService = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected && state.isInternetReachable) {
            console.log("Online - Starting Sync...");
            processSyncQueue();
        }
    });
    return unsubscribe;
};

const processSyncQueue = async () => {
    const queue = Database.getSyncQueue();

    for (const item of queue) {
        try {
            const data = JSON.parse(item.data);

            if (item.table === 'items') {
                if (item.action === 'CREATE') {
                    await setDoc(doc(firestore, 'items', data.id), data);
                } else if (item.action === 'UPDATE') {
                    await updateDoc(doc(firestore, 'items', data.id), data);
                }
            } else if (item.table === 'rentals') {
                if (item.action === 'CREATE') {
                    await setDoc(doc(firestore, 'rentals', data.id), data);
                }
            }

            // If successful, remove from queue
            Database.clearSyncQueueItem(item.id);
        } catch (error) {
            console.error("Sync failed for item:", item.id, error);
        }
    }
};
