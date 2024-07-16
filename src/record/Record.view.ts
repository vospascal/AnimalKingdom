import {LitElement, html, css} from 'lit';
import {StoreContext} from '../store/store-context.ts';
import {consume} from '@lit/context';
import {ReferenceModelStore} from '../store/signal-store.ts';
import {ScopedRegistryHost} from '@lit-labs/scoped-registry-mixin';
import GroupView from '../group/Group.view.ts';
import {SignalWatcher} from "@lit-labs/preact-signals";

import {repeat} from 'lit/directives/repeat.js';
import {map} from 'lit/directives/map.js';

export class RecordView extends ScopedRegistryHost(SignalWatcher(LitElement)) {
// export class RecordView extends ScopedRegistryHost(LitElement) {
    private rerenderCount = 0;
    static elementDefinitions = {
        'view-group': GroupView
    };

    static styles = css`
        :host {
            padding: 0.5rem 0 0.5rem 1rem;
            background-color: rgba(75, 125, 150, 0.05);
            border: 1px solid rgba(75, 125, 150, 0.25);
            display: block;
        }

        ul {
            padding: 0;
            margin: 0;
        }

        li {
            list-style-type: none;
        }

        .record {
        }

        .counter {
            text-decoration: underline;
        }

        .counter span {
            color: #fff;
            border-radius: 0.5rem;
            background: #e35050;
            display: inline-block;
            padding: 0 0.5rem;
        }

    `;

    @consume({context: StoreContext, subscribe: true})
    private accessor store!: ReferenceModelStore;

    // connectedCallback() {
    //     super.connectedCallback();
    //     this.store.subscribeToReferenceModel(() => {
    //         console.log('updated')
    //         this.requestUpdate();
    //     });
    // }

    // disconnectedCallback() {
    //     super.disconnectedCallback();
    //     this.store.unsubscribeFromReferenceModel();
    // }

    updated() {
        this.rerenderCount++;
    }

    render() {
        const rm = this.store.referenceModel.value;
        if (!rm) {
            return html`<p>Loading...</p>`;
        }
        return html`
            <small class="counter">Record rerender:<span>${this.rerenderCount}</span></small>
            <div class="record">
                <ul>
                    <li>
                        name: ${rm.name}
                    </li>
                    <li>
                        description: ${rm.description}
                    </li>
                </ul>
                ${this.renderRepeatList()}

                <button @click=${this.addItem}>add group</button>
                <pre>${JSON.stringify(rm.getValueTuple(), null, 2)}</pre>
                <pre>${JSON.stringify(rm.toJSON(), null, 2)}</pre>
            </div>
        `;
    }

    addItem() {
        this.store.referenceModel.value.addItem();
    }

    renderMap() {
        const rm = this.store.referenceModel.value;
        return html`
            ${rm.content.map(group => html`
                <view-group .group=${group}></view-group>
            `)}
        `
    }

    renderRepeatList() {
        const rm = this.store.referenceModel.value;
        return html`
            ${repeat(rm.content, (group) => group.path, (group, index) => html`
                <view-group .group=${group}></view-group>
            `)}
        `
    }

    renderMapList() {
        const rm = this.store.referenceModel.value;
        return html`
            ${map(rm.content, (group, index) => html`
                <view-group .group=${group}></view-group>
            `)}
        `
    }

}

customElements.define('view-record', RecordView);
export default RecordView;
