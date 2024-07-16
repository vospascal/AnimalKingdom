import {LitElement, html, nothing, css} from 'lit';
import {property} from 'lit/decorators.js';
import {ScopedRegistryHost} from "@lit-labs/scoped-registry-mixin";
import DetailView from "../detail/Detail.view.ts";
import GroupModel from "./Group.model.ts";
import {SignalWatcher} from "@lit-labs/preact-signals";
import {repeat} from "lit/directives/repeat.js";
import {map} from "lit/directives/map.js";


export class GroupView extends ScopedRegistryHost(SignalWatcher(LitElement)) {
// export class GroupView extends ScopedRegistryHost(LitElement) {
    private rerenderCount = 0;
    static elementDefinitions = {
        'view-detail': DetailView,
        'view-group': GroupView,
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

        .group {
            padding-left: 1rem;
        }

        .counter {
            text-decoration: underline;
        }

        .counter span {
            color: #fff;
            border-radius: 0.5rem;
            background: #27a547;
            display: inline-block;
            padding: 0 0.5rem;
        }
    `;

    @property({type: Object}) accessor group: GroupModel | null = null;

    // private unsubscribe: (() => void) | null = null;

    // connectedCallback() {
    //     super.connectedCallback();
    //     if (this.group) {
    //         this.unsubscribe = this.group.subscribe(() => this.requestUpdate());
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
        if (!this.group) return nothing
        return html`
            <small class="counter">Group rerender:<span>${this.rerenderCount}</span></small>
            ${this.renderButton()}

            <div class="group">
                <ul>
                    <li>
                        name: ${this.group.name}
                    </li>
                    <li>
                        id: ${this.group.id}
                    </li>
                </ul>
                ${this.renderGroup()}
            </div>
        `;
    }

    renderGroup() {
        if (!this.group?.items) return nothing
        return html`
            <ul>
                ${this.renderRepeatList()}
            </ul>
            <button @click=${this.addItem}>add detail</button>
        `
    }

    renderButton() {
        if (this.group?.parent?.type === "RECORD" || this.group?.parent?.type === "GROUP") {
            return html`
                <button @click=${this.handleDelete}>delete group</button>`
        }
        return nothing
    }

    handleDelete() {
        if (this.group?.parent?.type === "RECORD" || this.group?.parent?.type === "GROUP") {
            this.group?.parent.removeItem(this.group)
        }
    }

    addItem() {
        this.group.addItem();
    }


    renderMap() {
        return html`
            ${this.group?.items.map(item => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'GROUP':
                            return html`
                                <li>
                                    <view-group .group=${item}></view-group>
                                </li>`
                        case 'DETAIL':
                            return html`
                                <li>
                                    <view-detail .detail=${item}></view-detail>
                                </li>`
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }

    renderRepeatList() {
        return html`
            ${repeat(this.group.items, (item) => item.path, (item, index) => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'GROUP':
                            return html`
                                <li>
                                    <view-group .group=${item}></view-group>
                                </li>`
                        case 'DETAIL':
                            return html`
                                <li>
                                    <view-detail .detail=${item}></view-detail>
                                </li>`
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }

    renderMapList() {
        return html`
            ${map(this.group.items, (item, index) => {
                if ('type' in item) {
                    switch (item.type) {
                        case 'GROUP':
                            return html`
                                <li>
                                    <view-group .group=${item}></view-group>
                                </li>`
                        case 'DETAIL':
                            return html`
                                <li>
                                    <view-detail .detail=${item}></view-detail>
                                </li>`
                        default:
                            return nothing;
                    }
                }
            })}
        `
    }
}

export default GroupView