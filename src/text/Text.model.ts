import {signal} from "@preact/signals-core"

function manageSubscriptions(signals, callback) {
    const unsubscribeFunctions = signals.map(signal => signal.subscribe(callback));
    return () => unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
}

class TextModel {
    #type
    #value
    #parent
    #path

    constructor(value = "", parent = null, path: string) {
        this.#type = signal("TEXT");
        this.#value = signal(value);
        this.#parent = signal(parent);
        this.#path = signal(path);
    }

    //todo add a fromItem

    subscribe(callback: (item: TextModel) => void): () => void {
        const callWithThisContext = () => callback(this);
        const unsubscribe = manageSubscriptions(
            [this.#value, this.#path],
            callWithThisContext
        );

        return () => {
            unsubscribe();
        };
    }


    updateValue(value) {
        this.#value.value = value;
    }

    // Getter for sending to the server
    get value() {
        return this.#value.value;
    }

    // Getter for type
    get type() {
        return this.#type.value;
    }

    get parent() {
        return this.#parent.value;
    }

    get path() {
        return this.#path.value
    }


    // Setter for parent
    setParent(parent) {
        this.#parent.value = parent;
    }

    toJSON() {
        if (this.#value.value) return {
            type: this.#type.value,
            value: this.#value.value,
            path: this.#path.value,
        };
    }

    getValueTuple() {
        if (this.#value.value) return [{
            type: this.#type.value,
            value: this.#value.value,
            path: this.#path.value
        }];
    }
}

export default TextModel
