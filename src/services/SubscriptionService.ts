import { batch, Signal } from "@preact/signals-core";

class SubscriptionService {
    private unsubscribeMap: Map<any, () => void> = new Map();

    manageSubscriptions(signals: Signal<any>[], callback: () => void): () => void {
        const unsubscribeFunctions = signals.map(signal => signal.subscribe(callback));
        return () => unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    }

    setupNestedSubscriptions(items: any[], callback: () => void): void {
        const currentItems = new Set(items);

        // Unsubscribe removed items
        this.unsubscribeMap.forEach((unsubscribe, item) => {
            if (!currentItems.has(item)) {
                unsubscribe();
                this.unsubscribeMap.delete(item);
            }
        });

        // Batch the subscription updates to prevent multiple re-renders
        batch(() => {
            // Subscribe new items
            items.forEach((item) => {
                if (!this.unsubscribeMap.has(item) && item && typeof item.subscribe === 'function') {
                    const unsubscribe = item.subscribe(callback);
                    this.unsubscribeMap.set(item, unsubscribe);
                }
            });
        });
    }

    clearSubscriptions(): void {
        this.unsubscribeMap.forEach(unsubscribe => unsubscribe());
        this.unsubscribeMap.clear();
    }
}

export default SubscriptionService;
