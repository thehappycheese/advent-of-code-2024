import { Option } from "./Option.ts";

export type Terminal = string | number;

export type ParseResult = {
    value: Terminal | ParseResult | ParseResult[];
    processed_value?: Terminal | Terminal[];
    length: number;
};

export const ParseResult = {
    get: (r: ParseResult) => r.processed_value ?? r.value,
};

export type Parser = (input: string, offset: number) => Option<ParseResult>;

export const lit: (token: string) => Parser = (token) => (input, offset) => {
    if (input.slice(offset, offset + token.length) == token) {
        return Option.Some({ value: token, length: token.length });
    }
    return Option.None();
};

export const digit: Parser = (input, offset) => {
    const digit = input.charCodeAt(offset);
    if (digit >= 47 && digit <= 57) {
        return Option.Some({ value: input[offset], length: 1 });
    }
    return Option.None();
};

export const sequence: (parsers: Parser[]) => Parser =
    (parsers) => (input, offset) => {
        let extra_offset = 0;
        const results: ParseResult[] = [];
        for (const parser of parsers) {
            const result = parser(input, offset + extra_offset);
            if (Option.is_some(result)) {
                extra_offset += result.value.length;
                results.push(result.value);
            } else {
                return Option.None();
            }
        }
        return Option.Some({ value: results, length: extra_offset });
    };

export const repeat: (parser: Parser, min: number, max: number) => Parser =
    (parser, min, max) => (input, offset) => {
        let extra_offset = 0;
        const results: ParseResult[] = [];
        for (let i = 0; i < max; i++) {
            const result = parser(input, offset + extra_offset);
            if (Option.is_some(result)) {
                extra_offset += result.value.length;
                results.push(result.value);
            } else {
                if (i < min || i > max) {
                    return Option.None();
                } else {
                    break;
                }
            }
        }
        return Option.Some({ value: results, length: extra_offset });
    };

export const collect: (parser: Parser) => Parser =
    (parser) => (input, offset) =>
        Option.map(
            parser(input, offset),
            (res) => ({
                ...res,
                processed_value: (ParseResult.get(res) as any[]).map((item) =>
                    item.value
                ),
            }),
        );

export const join: (separator: string) => (parser: Parser) => Parser =
    (separator) => (parser) => (input, offset) =>
        Option.map(
            parser(input, offset),
            (res) => ({
                ...res,
                processed_value: (ParseResult.get(res) as string[]).join(separator),
            }),
        );

export const parse_float: (parser: Parser) => Parser =
    (parser) => (input, offset) =>
        Option.map(
            parser(input, offset),
            (res) => ({
                ...res,
                processed_value: parseFloat(ParseResult.get(res) as string),
            }),
        );

export const pick: (indices: number[]) => (parser: Parser) => Parser =
    (indices) => (parser) => (input, offset) =>
        Option.map(
            parser(input, offset),
            (res) => ({
                ...res,
                processed_value: indices.map((i) => (ParseResult.get(res) as any[])[i]),
            }),
        );

export const reduce: (
    reducer: Parameters<typeof Array.prototype.reduce<ParseResult>>[0],
) => (parser: Parser) => Parser = (reducer) => (parser) => (input, offset) =>
    Option.map(
        parser(input, offset),
        (res) => ({
            ...res,
            processed_value: (ParseResult.get(res) as any[]).reduce(reducer),
        }),
    );

export const reduce_init: (
    reducer: Parameters<typeof Array.prototype.reduce<ParseResult>>[0],
    initial: any,
) => (parser: Parser) => Parser =
    (reducer, initial) => (parser) => (input, offset) =>
        Option.map(
            parser(input, offset),
            (res) => ({
                ...res,
                processed_value: (ParseResult.get(res) as any[]).reduce(
                    reducer,
                    initial,
                ),
            }),
        );

export const find_all: (parser: Parser) => Parser =
    (parser) => (input, offset) => {
        const results: ParseResult[] = [];
        for (let i = offset; i < input.length; i++) {
            const result = parser(input, i);
            if (Option.is_some(result)) {
                i += result.value.length - 1;
                results.push(result.value);
            }
        }
        return Option.Some({ value: results, length: NaN });
    };

export const alternation: (parsers: Parser[]) => Parser = parsers => (input, offset) => {
    for (const parser of parsers) {
        let r = parser(input, offset);
        if (Option.is_some(r)) {
            return r
        }
    }
    return Option.None()
}
