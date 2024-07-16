import {LitElement, html} from 'lit';
import {ContextProvider} from '@lit/context';
import {ReferenceModelStore, createUniqueStore, storeMap} from './signal-store.ts';
import {StoreContext} from './store-context.ts';


export class ReferenceModelSignalsContextProvider extends LitElement {
    storeKey: symbol;
    store: ReferenceModelStore;
    provider: ContextProvider<typeof StoreContext>;

    constructor() {
        super();
        this.storeKey = createUniqueStore();
        console.log('Retrieving store with key:', this.storeKey);
        const retrievedStore = storeMap.get(this.storeKey);
        console.log('Retrieved store:', retrievedStore);
        if (!retrievedStore) {
            throw new Error('Store is not defined');
        }
        this.store = retrievedStore;
        this.provider = new ContextProvider(this, {
            context: StoreContext,
            initialValue: this.store
        });
    }

    willUpdate() {
        // https://lit.dev/docs/data/context/#contextprovider
        // important to trigger the update cycle
        this.provider.setValue(this.provider.value, /*force=*/true);
    }

    protected render() {
        return html`<slot></slot>`;
    }
}

export default ReferenceModelSignalsContextProvider