export function generateGetters(instance) {
    const props = Object.getOwnPropertyNames(instance);
    const propsWithoutGetter = Object.getOwnPropertyNames(instance)
        .filter(name => name.match(/^_[^_]/g))      //find all props that start with ONE underscore
        .map(name => name.substring(1))             //get rid of the underscore
        .filter(name => !props.includes(name));     //get rid of props that already have "public" getters

    const handler = {
        get: (target, key) => {
            if (!propsWithoutGetter.includes(key)) {
                return target[key];
            }
            return target[`_${key}`];
        }
    };
    return new Proxy(instance, handler);
}
