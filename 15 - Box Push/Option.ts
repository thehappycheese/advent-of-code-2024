enum OptionType {
    Some,
    None,
}
export type Option<T = unknown> = { type: OptionType.Some; value: T } | {
    type: OptionType.None;
};
const None: <T = unknown>() => Option<T> = () => ({
    type: OptionType.None,
});
const Some: <T>(value: T) => Option<T> = (value) => ({
    type: OptionType.Some,
    value,
});
export const Option = {
    None:None,
    Some:Some,
    map: <T, U>(opt: Option<T>, transform: (opt: T) => U) => {
        if (opt.type == OptionType.Some) {
            return Some(transform(opt.value));
        }
        return opt;
    },
    is_some: (o: Option) => o.type === OptionType.Some,
    unwrap: (o: Option) => {
        if(o.type===OptionType.None){
            throw new Error("Option None() Could not be unwrapped!");
        }else{
            return o.value
        }
    },
    collect: <T,>(items:Iterable<Option<T>>):Option<T[]> =>{
        const result:T[] = [];
        for(const item of items){
            if(item.type===OptionType.Some){
                result.push(item.value);
            }else{
                return None()
            }
        }
        return Some(result);
    },
    flatMap: <T,Q>(items:Iterable<Q>, map:(item:Q)=>Option<T[]>):Option<T[]> =>{
        const result: T[] = [];
        for (const item of items) {
            const mapped = map(item);
            if (mapped.type === OptionType.Some) {
                result.push(...mapped.value);
            } else {
                return None();
            }
        }
        return Some(result);
    }
};