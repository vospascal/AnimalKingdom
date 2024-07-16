import { signal } from "@preact/signals-core";
import GroupModel from '../group/Group.model.ts';
import DetailModel from '../detail/Detail.model.ts';
import SubscriptionService from "../services/SubscriptionService";

class RecordModel {
    #type = signal('RECORD');
    #name = signal('');
    #path = signal('/');
    #description = signal('');
    #content = signal([]);
    #parent = signal(null);
    private subscriptionService = new SubscriptionService(); // Instantiate SubscriptionService

    constructor(name: string, description: string,  content: any[]) {
        this.#name.value = name;
        this.#description.value = description;
        this.#content.value = content || [];
        this.#content.value.forEach((item) => item.setParent(this));
        this.#setupNestedSubscriptions();
    }

    static parseItem(item: any, parent: any = null) {
        switch (item.type) {
            case 'GROUP':
                return GroupModel.fromItem(item, parent);
            case 'DETAIL':
                return DetailModel.fromItem(item, parent);
            default:
                throw new Error(`Unsupported item type: ${item.type}`);
        }
    }

    static parseRecord(jsonInput: any) {
        const {name, description, content} = jsonInput.structure;
        const parsedContent = content.map((item: any) => RecordModel.parseItem(item));
        return new RecordModel(name, description, parsedContent);
    }

    updateName(newName: string) {
        this.#name.value = newName;
    }

    addItem() {
        const newGroup = new GroupModel('some_group', 'some group', [], this);
        this.#content.value = [...this.#content.value, newGroup];
        this.#setupNestedSubscriptions();
    }

    removeItem(item: any) {
        this.#content.value = this.#content.value.filter(entry => entry !== item);
        this.subscriptionService.clearSubscriptions();
        this.#setupNestedSubscriptions();
    }

    setParent(parent: any) {
        this.#parent.value = parent;
    }

    subscribe(callback: (detail: RecordModel) => void): () => void {
        const callWithThisContext = () => callback(this);
        const unsubscribe = this.subscriptionService.manageSubscriptions(
            [this.#type, this.#name, this.#description, this.#content],
            callWithThisContext
        );

        this.#setupNestedSubscriptions(callWithThisContext);

        return () => {
            unsubscribe();
            this.subscriptionService.clearSubscriptions();
        };
    }

    #setupNestedSubscriptions(callback = () => this.#triggerUpdate()) {
        this.subscriptionService.setupNestedSubscriptions(this.#content.value, callback);
    }

    #triggerUpdate() {
        this.#content.value = [...this.#content.value]; // Trigger signal update
    }

    get type() {
        return this.#type.value;
    }

    get name() {
        return this.#name.value;
    }

    get description() {
        return this.#description.value;
    }

    get content() {
        return this.#content.value;
    }

    get parent() {
        return this.#parent.value;
    }

    get path() {
        return this.#path.value;
    }

    toJSON() {
        return {
            type: this.#type.value,
            name: this.#name.value,
            path: this.#path.value,
            description: this.#description.value,
            content: this.#content.value.map((item) => item.toJSON()).filter(Boolean),
        };
    }

    getValueTuple() {
        return this.#content.value.flatMap((item) => item.getValueTuple()).filter(Boolean);
    }
}

export default RecordModel;
