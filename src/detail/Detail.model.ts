import { Signal, signal } from "@preact/signals-core";
import TextModel from '../text/Text.model.ts';
import BooleanModel from '../boolean/Boolean.model.ts';
import GroupModel from "../group/Group.model.ts";
import SubscriptionService from "../services/SubscriptionService";

class DetailModel {
    #type: Signal<string> = signal('DETAIL');
    #id: Signal<string> = signal('');
    #path: Signal<string> = signal('');
    #name: Signal<string> = signal('');
    #items: Signal<Array<TextModel | BooleanModel>> = signal([]);
    #parent: Signal<GroupModel | null> = signal(null);
    private subscriptionService = new SubscriptionService(); // Instantiate SubscriptionService

    constructor(id: string, name: string, items: Array<TextModel | BooleanModel>, parent: GroupModel | null, path:string) {
        this.#id.value = id;
        this.#name.value = name;
        this.#path.value = path;
        this.#items.value = items;
        this.#parent.value = parent;
        this.#items.value.forEach((item) => item.setParent(this));
        this.#setupNestedSubscriptions();
    }

    static fromItem(item: {
        type: string,
        id: string,
        name: string,
        items: any[],
        path: string
    }, parent: GroupModel | null = null): DetailModel {
        if (item.type !== 'DETAIL') {
            throw new Error(`Invalid type for DetailModel: ${item.type}`);
        }
        const parsedItems = DetailModel.parseItems(item.items, parent);
        return new DetailModel(item.id, item.name, parsedItems, parent, item.path);
    }

    static parseItem(item: any, parent: null): TextModel | BooleanModel {
        switch (item.type) {
            case 'TEXT':
                return new TextModel(item.value, parent, item.path);
            case 'BOOLEAN':
                return new BooleanModel(item.value, parent, item.path);
            default:
                throw new Error(`Unsupported item type: ${item.type}, item: ${JSON.stringify(item)}`);
        }
    }

    static parseItems(items: any[], parent: GroupModel | null = null): Array<TextModel | BooleanModel> {
        return (items || []).map((item) => DetailModel.parseItem(item, parent));
    }

    setParent(parent: GroupModel) {
        this.#parent.value = parent;
    }

    updateName(newName: string) {
        this.#name.value = newName;
    }

    subscribe(callback: (detail: DetailModel) => void): () => void {
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

    addBoolean() {
        //todo fix paths
        const newBoolean = new BooleanModel(false, this ,"");
        this.#items.value = [...this.#items.value, newBoolean];
        this.#setupNestedSubscriptions();
    }

    addText() {
        //todo fix paths
        const newText = new TextModel('cool', this ,"");
        this.#items.value = [...this.#items.value, newText];
        this.#setupNestedSubscriptions();
    }

    removeItem(item: TextModel | BooleanModel) {
        this.#items.value = this.#items.value.filter(entry => entry !== item);
        this.subscriptionService.clearSubscriptions();
        this.#setupNestedSubscriptions();
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

    get items(): Array<TextModel | BooleanModel> {
        return this.#items.value;
    }

    get parent(): GroupModel | null {
        return this.#parent.value;
    }

    toJSON() {
        return {
            type: this.#type.value,
            id: this.#id.value,
            path: this.#path.value,
            name: this.#name.value,
            items: this.#items.value.map((item) => item.toJSON()).filter(Boolean),
        };
    }

    getValueTuple() {
        return this.#items.value.flatMap((item) => item.getValueTuple());
    }
}

export default DetailModel;
