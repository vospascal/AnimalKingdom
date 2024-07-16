import {LitElement, html, nothing, css} from 'lit';
import {property} from "lit/decorators.js";
import TextModel from "./Text.model.ts";
import {SignalWatcher} from "@lit-labs/preact-signals";



export class TextView extends SignalWatcher(LitElement) {
    private rerenderCount = 0;
    @property({type: Object}) accessor item: TextModel | null = null;

    static styles = css`
        :host {
            padding: 0.5rem 0 0.5rem 1rem;
            background-color: rgba(75, 125, 150, 0.05);
            border: 1px solid rgba(75, 125, 150, 0.25);
            display: block;

        }
        ul {padding: 0;margin: 0;}

        li {list-style-type: none;}

        .counter {
            text-decoration: underline;
        }
        .counter span { 
            color: #fff;
            border-radius: 0.5rem;
            background: #fa6d28;
            display: inline-block;
            padding: 0 0.5rem;
        }
    `;

    // private unsubscribe: (() => void) | null = null;

    // connectedCallback() {
    //     super.connectedCallback();
    //     if (this.item) {
    //         this.unsubscribe = this.item.subscribe(() => this.requestUpdate());
    //     }
    // }

    // disconnectedCallback() {
    //     super.disconnectedCallback();
    //     if (this.unsubscribe) {
    //         this.unsubscribe();
    //     }
    // }

    updated() {
        this.rerenderCount++;
    }

    render() {
        return html`
            <small class="counter">Text rerender:<span>${this.rerenderCount}</span></small>
            <button @click=${this.handleRemoveItem}>delete text</button>
            <div>
                ${this.item.value} !
                <input type="text" value="${this.item.value}" @change=${this.handleChange}/>
            </div>
        `;
    }

    handleChange(event: Event) {
        this.item?.updateValue(event.target.value)
    }

    handleRemoveItem(){
        this.item?.parent.removeItem(this.item)
    }
}

export default TextView