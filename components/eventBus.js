class EventBus {
    #EB;
    constructor() {
        this.#EB = new Vue();
    }

    $$on(listeners, target) {
        let events = {};
        for(let type in listeners){
            let listener = events[type] = listeners[type].bind(target || this);
            this.$on(type, listener);
        }
        return events;
    }
    $$off(listeners) {
        for(let type in listeners){
            this.$off(type, listeners[type]);
        }
    }

    $on(type, listener) {
        this.#EB.$on(type, listener);
    }
    $once(type, listener) {
        this.#EB.$once(type, listener);
    }
    $off(type, listener) {
        this.#EB.$off(type, listener);
    }
    $emit(type, data) {
        this.#EB.$emit(type, data);
    }
}

export const eventBus = new EventBus();
