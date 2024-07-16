import { Signal, signal } from "@preact/signals-core";
import DetailModel from '../detail/Detail.model.ts';
import SubscriptionService from "../services/SubscriptionService";

class GroupModel {
    #type: Signal<string> = signal('GROUP');
    #id: Signal<string> = signal('');
    #path: Signal<string> = signal('');
    #name: Signal<string> = signal('');
    #items: Signal<Array<DetailModel | GroupModel>> = signal([]);
    #parent: Signal<GroupModel | null> = signal(null);
    private subscriptionService = new SubscriptionService(); // Instantiate SubscriptionService

    constructor(id: string, name: string, items: Array<DetailModel | GroupModel>, parent: GroupModel | null, path: string) {
        this.#id.value = id;
        this.#path.value = path;
        this.#name.value = name;
        this.#items.value = items;
        this.#parent.value = parent;
        this.#items.value.forEach((item) => item.setParent(this));
        this.#setupNestedSubscriptions();
    }

    static fromItem(item: {
        type: string,
        path: string
        id: string,
        name: string,
        items: any[],
    }, parent: GroupModel | null = null): GroupModel {
        if (item.type !== 'GROUP') {
            throw new Error(`Invalid type for GroupModel: ${item.type}`);
        }
        const parsedItems = GroupModel.parseItems(item.items, parent);
        return new GroupModel(item.id, item.name, parsedItems, parent, item.path);
    }

    static parseItems(items: any[], parent: GroupModel | null = null): Array<DetailModel | GroupModel> {
        return (items || []).map((item) => {
            switch (item.type) {
                case 'GROUP':
                    return GroupModel.fromItem(item, parent);
                case 'DETAIL':
                    return DetailModel.fromItem(item, parent);
                default:
                    throw new Error(`Unsupported item type: ${item.type}, item: ${JSON.stringify(item)}`);
            }
        });
    }

    setParent(parent: GroupModel) {
        this.#parent.value = parent;
    }

    addItem() {
        const newDetail = new DetailModel('some_detail', 'some detail', [], this);
        this.#items.value = [...this.#items.value, newDetail];
        this.#setupNestedSubscriptions();
    }


    removeItem(item: DetailModel | GroupModel) {
        this.#items.value = this.#items.value.filter(entry => entry !== item);
        this.subscriptionService.clearSubscriptions();
        this.#setupNestedSubscriptions();
    }

    updateName(newName: string) {
        this.#name.value = newName;
    }

    subscribe(callback: (detail: GroupModel) => void): () => void {
        const callWithThisContext = () => callback(this);
        const unsubscribe = this.subscriptionService.manageSubscriptions(
            [this.#id, this.#name, this.#items],
            callWithThisContext
        );

        this.#setupNestedSubscriptions(callWithThisContext);

        return () => {
            unsubscribe();
            this.subscriptionService.clearSubscriptions();
        };
    }

    #setupNestedSubscriptions(callback = () => this.#triggerUpdate()) {
        this.subscriptionService.setupNestedSubscriptions(this.#items.value, callback);
    }

    #triggerUpdate() {
        this.#items.value = [...this.#items.value]; // Trigger signal update
    }


    get type(): string {
        return this.#type.value;
    }

    get id(): string {
        return this.#id.value;
    }

    get name(): string {
        return this.#name.value;
    }

    get items(): Array<DetailModel | GroupModel> {
        return this.#items.value;
    }

    get parent(): GroupModel | null {
        return this.#parent.value;
    }

    get path() {
        return this.#path.value;
    }

    toJSON() {
        const array = this.#items.value.map((item) => item.toJSON()).filter(Boolean);
        if (array.length > 0) {
            return {
                type: this.#type.value,
                path: this.#path.value,
                id: this.#id.value,
                name: this.#name.value,
                items: array,
            };
        }
    }

    getValueTuple() {
        return this.#items.value.flatMap((item) => item.getValueTuple()).filter(Boolean);
    }
}

export default GroupModel;
