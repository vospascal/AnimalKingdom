import {ReactiveController, ReactiveControllerHost} from 'lit';
import {ContextProvider} from '@lit/context';
import {ReferenceModelStore, createUniqueStore, storeMap} from './signal-store.ts';
import {StoreContext} from './store-context.ts';

export class ReverenceModelProviderController implements ReactiveController {
    host: ReactiveControllerHost;
    storeKey: symbol;
    store: ReferenceModelStore;
    provider: ContextProvider<typeof StoreContext>;

    constructor(host: ReactiveControllerHost) {
        (this.host = host).addController(this);
        this.storeKey = createUniqueStore();
        console.log('Retrieving store with key:', this.storeKey);
        const retrievedStore = storeMap.get(this.storeKey);
        console.log('Retrieved store:', retrievedStore);
        if (!retrievedStore) {
            throw new Error('Store is not defined');
        }
        this.store = retrievedStore;
        this.provider = new ContextProvider(host as any, {
            context: StoreContext,
            initialValue: this.store,
        });
    }

    hostConnected() {
        // Any logic to run when the host is connected
    }

    hostDisconnected() {
        // Any cleanup logic to run when the host is disconnected
    }

    updateProvider() {
        this.provider.setValue(this.provider.value, /*force=*/ true);
    }
}
