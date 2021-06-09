
let tk = {
    // verbs
    CREATE: 'CREATE',
    SET: 'SET',
    CONNECT: 'CONNECT',
    DISCONNECT: 'DISCONNECT',
    // keywords
    OF: 'OF',
    TO: 'TO',
    FROM: 'FROM',
    AS: 'AS',
    ON: 'ON',
    OVER: 'OVER',
    AFTER: 'AFTER',
    // other
    IDENT: 'IDENT',
    // literals
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    // other
    EOF: 'EOF',
};

let verbs = {
    'create': tk.CREATE,
    'set': tk.SET,
    'connect': tk.CONNECT,
    'disconnect': tk.DISCONNECT,
};

let keywords = {
    'of': tk.OF,
    'to': tk.TO,
    'from': tk.FROM,
    'as': tk.AS,
    'on': tk.ON,
    'over': tk.OVER,
    'after': tk.AFTER,
};

function isAlpha(char) {
    return ('a' <= char && char <= 'z')
        || ('A' <= char && char <= 'Z')
        || (char === '_');
}

function isDigit(char) {
    return '0' <= char && char <= '9';
}

function isAlnum(char) {
    return isAlpha(char) || isDigit(char);
}

function scan(source) {
    let tokens = [];
    let start = 0;
    let current = 0;

    function isAtEnd() {
        return current >= source.length
    }

    function peek() {
        if (isAtEnd()) {
            return '\0';
        }
        return source[current];
    }

    function peekNext() {
        if (current + 1 >= source.length) {
            return '\0';
        }
        return source[current + 1];
    }

    function match(expected) {
        if (isAtEnd() || source[current] != expected) {
            return false;
        }
        current++;
        return true;
    }

    function addToken(type, literal = null) {
        let text = source.substring(start, current);
        tokens.push({ type, text, literal });
    }

    function advance() {
        return source[current++];
    }

    // token parsers

    function ident() {
        while (isAlnum(peek())) {
            advance();
        }
        let text = source.substring(start, current);
        let verb = verbs[text];
        if (verb) {
            addToken(verb);
            return;
        }
        let keyword = keywords[text];
        if (keyword) {
            addToken(keyword);
            return;
        }
        addToken(tk.IDENT);
    }

    function string(strTerm) {
        while (peek() != strTerm && !isAtEnd()) {
            advance();
        }
        if (isAtEnd()) {
            // error!
            return;
        }

        advance();
        let value = source.substring(start + 1, current - 1);
        addToken(tk.STRING, value);
    }

    function number() {
        while (isDigit(peek())) {
            advance();
        }

        if (peek() === '.' && isDigit(peekNext())) {
            advance();

            while (isDigit(peek())) {
                advance();
            }
        }

        addToken(tk.NUMBER, Number(source.substring(start, current)));
    }

    // do it

    function scanToken() {
        let c = advance();
        switch (c) {
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\'':
            case '"':
                string(c);
                break;
            default:
                if (isDigit(c)) {
                    number();
                } else if (isAlpha(c)) {
                    ident();
                } else {
                    // error
                }
        }
    }

    while (!isAtEnd()) {
        start = current;
        scanToken();
    }

    tokens.push({
        type: tk.EOF,
        text: 'end of input',
    });
    return tokens;
}

export {
    scan as default,
    tk,
};