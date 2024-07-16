import ReferenceModelContext from "./store/reference-model-context.ts";

// Define the custom element if it hasn't been defined yet
if (!customElements.get('reference-model-context')) {
    customElements.define('reference-model-context', ReferenceModelContext);
}
