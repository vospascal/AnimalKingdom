import {LitElement, html, css} from "lit";
import {ScopedRegistryHost} from '@lit-labs/scoped-registry-mixin';

import {ReverenceModelProviderController} from "./reverence-model-provider-controller.ts";
import RecordView from "../record/Record.view.ts";


export class ReferenceModelContext extends ScopedRegistryHost(LitElement) {
    private rerenderCount = 0;
    static elementDefinitions = {
        'view-record': RecordView
    };

    static styles = css`
        .counter {
            text-decoration: underline;
        }

        .counter span {
            color: #fff;
            border-radius: 0.5rem;
            background: #943dc0;
            display: inline-block;
            padding: 0 0.5rem;
        }
    `

    private provider: ReverenceModelProviderController;
    private isDataLoaded: boolean = false;

    constructor() {
        super();
        this.provider = new ReverenceModelProviderController(this);
        console.log(this);
        this.loadData();
    }

    async loadData() {
        await this.provider.store.loadData("/update.json");
        this.isDataLoaded = true;
        this.requestUpdate(); // Trigger an update after data is loaded
    }

    protected updated() {
        this.provider.updateProvider();
        this.rerenderCount++;

    }

    protected render(): unknown {
        console.log(this.provider.store);

        if (!this.isDataLoaded) {
            return html`<p>Loading data...</p>`;
        }

        return html`
            <h1>Signals context reference model!</h1>
            <small class="counter">Context rerender:<span>${this.rerenderCount}</span></small>
            </br></br>  
            <view-record></view-record>
        `;
    }

}

export default ReferenceModelContext