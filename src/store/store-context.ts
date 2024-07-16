import {createContext} from '@lit/context';
import {ReferenceModelStore} from './signal-store.ts';


export const StoreContext = createContext<ReferenceModelStore>(Symbol('reference-model-store'));