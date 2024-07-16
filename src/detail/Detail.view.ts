import {LitElement, html, nothing, css} from 'lit';
import {property} from 'lit/decorators.js';
import {ScopedRegistryHost} from "@lit-labs/scoped-registry-mixin";
import BooleanView from "../boolean/Boolean.view.ts";
import TextView from "../text/Text.view.ts";
import DetailModel from "./Detail.model.ts";
import RecordModel from "../record/Record.model.ts";
import GroupModel from "../group/Group.model.ts";
import {SignalWatcher} from "@lit-labs/preact-signals";
import {repeat} from "lit/directives/repeat.js";
import {map} from "lit/directives/map.js";


export class DetailView extends ScopedRegistryHost(SignalWatcher(LitElement)) {
    private rerenderCount = 0;
    static elementDefinitions = {
        'view-boolean': BooleanView,
        'view-text': TextView
    }

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

        .detail {
            padding-left: 1rem;
        }

        .counter {
            text-decoration: underline;
        }

        .counter span {
            color: #fff;
            border-radius: 0.5rem;
            background: #3b65cd;
            display: inline-block;
            padding: 0 0.5rem;
        }
    `;

    @property({type: Object}) accessor detail: DetailModel | null = null;

    // private unsubscribe: (() => void) | null = null;

    // connectedCallback() {
    //     super.connectedCallback();
    //     if (this.detail) {
    //         this.unsubscribe = this.detail.subscribe(() => this.requestUpdate());
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
        if (!this.detail) return nothing
        return html`
            <small class="counter">Detail rerender:<span>${this.rerenderCount}</span></small>
            ${this.renderButton()}
            <div class="detail">
                <ul>
                    <li>
                        name: ${this.detail.name}
                    </li>
                    <li>
                        id: ${this.detail.id}
                    </li>
                    <li>
                        ${this.renderDetails()}
                    </li>
                </ul>
                <div>
                    update own and parent name:
                    <input type="text" @change="${this.handleChange}">
                </div>
                <button @click=${this.handleAddBoolean}>add Boolean</button>
                <button @click=${this.handleAddText}>add Text</button>
            </div>
        `;
    }

    handleAddBoolean() {
        this.detail.addBoolean()
    }

    handleAddText() {
        this.detail.addText()
    }

    handleChange(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        if (this.detail) {
            this.detail.updateName(input.value);
            const parent = this.detail.parent;
            if (parent && 'type' in parent) {
                const newName = input.value + '!!!';
                switch (parent.type) {
                    case "DETAIL":
                        (parent as unknown as DetailModel).updateName("detail " + newName);
                        break;
                    case "GROUP":
                        (parent as unknown as GroupModel).updateName("group " + newName);
                        break;
                    case "RECORD":
                        (parent as unknown as RecordModel).updateName("record " + newName);
                        break;
                }
            }
        }
    }

    renderDetails() {
        if (!this.detail?.items) return nothing;
        return html`
            <ul>
                ${this.renderRepeatList()}
            </ul>
        `;
    }

    renderButton() {
        if (this.detail?.parent?.type === "RECORD" || this.detail?.parent?.type === "GROUP") {
            return html`
                <button @click=${this.handleDelete}>delete detail</button>`
        }
        return nothing
    }

    handleDelete() {
        if (this.detail?.parent?.type === "RECORD" || this.detail?.parent?.type === "GROUP") {
            this.detail.parent.removeItem(this.detail);
        }
    }


    renderMap() {
        return html`
            ${this.detail.items.map(item => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'TEXT':
                            return html`
                                <li>
                                    <view-text .item=${item}></view-text>
                                </li>`;
                        case 'BOOLEAN':
                            return html`
                                <li>
                                    <view-boolean .item=${item}></view-boolean>
                                </li>`;
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }

    renderRepeatList() {
        return html`
            ${repeat(this.detail.items, (item) => item.path, (item, index) => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'TEXT':
                            return html`
                                <li>
                                    <view-text .item=${item}></view-text>
                                </li>`;
                        case 'BOOLEAN':
                            return html`
                                <li>
                                    <view-boolean .item=${item}></view-boolean>
                                </li>`;
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }

    renderMapList() {
        return html`
            ${map(this.detail.items, (item, index) => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'TEXT':
                            return html`
                                <li>
                                    <view-text .item=${item}></view-text>
                                </li>`;
                        case 'BOOLEAN':
                            return html`
                                <li>
                                    <view-boolean .item=${item}></view-boolean>
                                </li>`;
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }

}

export default DetailView