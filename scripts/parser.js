import { tk } from './scanner.js';

// helpers

function failure(msg) {
    return {
        success: false,
        msg
    };
}

let nextIdx = 0;
let localTokens = [];
function next() {
    return localTokens[nextIdx++];
}

function peekNext() {
    return localTokens[nextIdx];
}

function current() {
    return localTokens[nextIdx - 1];
}

// verbs

function create() {
    // $ident as $ident
    let type = ident();
    if (!type.success) return type;

    if (next().type !== tk.AS) {
        return failure('expected "as"');
    }

    let name = ident();
    if (!name.success) return name;

    return {
        success: true,
        verb: 'create',
        type: type.ident,
        name: name.ident
    };
}

function set() {
    // $param to $literal
    let par = param();
    if (!par.success) return par;

    if (next().type !== tk.TO) {
        return failure(`expected 'to' got '${current().text}'`);
    }

    let lit = literal();
    if (!lit.success) return lit;

    let ev;
    let overDur;
    let afterDur;
    while (next().type !== tk.EOF) {
        switch (current().type) {
            case tk.ON:
                ev = identSequence();
                if (!ev.success) {
                    return ev;
                }
                break;
            case tk.OVER:
                overDur = literal();
                if (!overDur.success) {
                    return overDur;
                }
                break;
            case tk.AFTER:
                afterDur = literal();
                if (!afterDur.success) {
                    return afterDur;
                }
                break;
        }
    }

    return {
        success: true,
        verb: 'set',
        param: par,
        literal: lit.value,
        event: ev,
        over: overDur,
        after: afterDur,
    }
}

function connect() {
    let paramA = param();
    if (!paramA.success) return paramA;

    if (next().type !== tk.TO) {
        return failure('expected "to"');
    }

    let paramB = param();
    if (!paramB.success) return paramB;

    return {
        success: true,
        verb: 'connect',
        paramA,
        paramB,
    };
}

function disconnect() {
    let paramA = param();
    if (!paramA.success) return paramA;

    if (next().type !== tk.FROM) {
        return failure('expected "from"');
    }

    let paramB = param();
    if (!paramB.success) return paramB;

    return {
        success: true,
        verb: 'disconnect',
        paramA,
        paramB,
    };
}

// other

function ident() {
    let ident = next()
    if (ident.type !== tk.IDENT) {
        return failure('expected identifier');
    }
    return {
        success: true, ident: ident.text
    };
}

function param() {
    // $ident of $ident
    let attr = ident();
    if (!attr.success) return attr;

    if (next().type !== tk.OF) {
        return failure('expected "of"');
    }

    let object = ident();
    if (!object.success) return object;

    return {
        success: true,
        attr: attr.ident,
        object: object.ident,
    };
}

function literal() {
    // $literal
    let lit = next();
    switch (lit.type) {
        case tk.STRING:
        case tk.NUMBER:
            return {
                success: true,
                value: lit.literal,
            };
        default:
            return failure(`expected number or string got ${current().text}`);
    }
}

function identSequence() {
    let idents = [];
    while (peekNext().type === tk.IDENT) {
        idents.push(next());
    }
    if (idents.length === 0) {
        return failure('expected 1 or more identifiers');
    }
    return {
        success: true,
        idents
    };
}

// meat
function parse(tokens) {
    nextIdx = 0;
    localTokens = tokens;
    let v = next();
    switch (v.type) {
        case tk.CREATE:
            return create();
        case tk.SET:
            return set();
        case tk.CONNECT:
            return connect();
        case tk.DISCONNECT:
            return disconnect();
        default:
            return failure(`expected verb got ${v.text}`);
    }
}

export default parse;