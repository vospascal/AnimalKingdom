import {signal, type Signal} from '@preact/signals-core';
import RecordModel from '../record/Record.model.ts';

export type ReferenceModelType = RecordModel | null;

export interface ReferenceModelStore {
    referenceModel: Signal<ReferenceModelType>;
    storedData: Signal<any>;
    loading: Signal<boolean>;

    loadData(url: string): void;

    buildReferenceModel(): void;

    subscribeToReferenceModel(callback: () => void): void;

    unsubscribeFromReferenceModel(): void;
}

export const createSignalStore = (referenceModel: ReferenceModelType): ReferenceModelStore => {
    let unsubscribeFn: () => void = () => {
    };
    let resolveReferenceModelReady: (value: ReferenceModelType) => void;

    const referenceModelReady = new Promise<ReferenceModelType>((resolve) => {
        resolveReferenceModelReady = resolve;
    });


    const store: ReferenceModelStore = {
        referenceModel: signal(referenceModel),
        storedData: signal(null),
        loading: signal(false),
        async loadData(url: string) {
            store.loading.value = true;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }
                const data = await response.json();
                store.storedData.value = data;
                store.buildReferenceModel();
            } catch (error) {
                console.error('Error loading data:', error);
                store.storedData.value = null; // Reset stored data on error
            } finally {
                store.loading.value = false;
            }
        },
        buildReferenceModel() {
            if (store.storedData.value) {
                try {
                    const parsedModel = RecordModel.parseRecord(store.storedData.value);
                    store.referenceModel.value = parsedModel;
                    resolveReferenceModelReady(parsedModel);
                } catch (error) {
                    console.error('Error parsing reference model:', error);
                    store.referenceModel.value = null; // Reset reference model on error
                }
            }
        },
        subscribeToReferenceModel(callback) {
            // Subscribing to reference model
            referenceModelReady.then((referenceModel) => {
                if (referenceModel) {
                    unsubscribeFn = referenceModel.subscribe(callback);
                }
                // Reference model is not set yet. wait a bit
            }).catch((error) => {
                console.error('Error waiting for reference model:', error);
            });
        },
        unsubscribeFromReferenceModel() {
            console.log('Unsubscribing from reference model');
            unsubscribeFn();
        },
    };

    return store;
};


export const storeMap = new Map<symbol, ReferenceModelStore>();

export const createUniqueStore = (): symbol => {
    console.log('Creating unique store');
    const uniqueKey = Symbol('store');
    const uniqueStore = createSignalStore(null);
    storeMap.set(uniqueKey, uniqueStore);
    console.log('Store created:', uniqueStore);
    console.log('Store map:', storeMap);
    return uniqueKey;
};
