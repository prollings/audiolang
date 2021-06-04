let audioCtx = new window.AudioContext;

// helpers

function success() {
    return { success: true };
}

function failure(msg) {
    return { success: false, msg };
}

function objectFailure(name) {
    return failure(`no object named '${name}'`);
}

function attrFailure(attr, object) {
    return failure(`no attribute '${attr}' on object named '${object}'`);
}

function connectorFailure(conn, object) {
    return failure(`no connector '${conn}' on object named '${object}'`)
}

function mismatchFailure(type) {
    return failure(`connectors are both ${type}s`);
}

class Input {
    constructor(con) {
        this.con = con;
    }
}

class Output {
    constructor(con) {
        this.con = con;
    }
}

// audio objects

class Sink {
    gainNode = audioCtx.createGain();
    connectors = {
        input: new Input(this.gainNode),
    };

    constructor() {
        this.gainNode.connect(audioCtx.destination);
    }
}

class Osc {
    node = audioCtx.createOscillator();
    connectors = {
        output: new Output(this.node),
        frequency: new Input(this.node.frequency),
    };
    setters = {
        frequency: (value) => {
            this.node.frequency.setValueAtTime(value, audioCtx.currentTime);
        },
        type: (value) => {
            this.node.type = value;
        }
    }

    constructor() {
        this.node.start();
    }
}

class Biquad {
    node = audioCtx.createBiquadFilter();
    connectors = {
        input: new Input(this.node),
        output: new Output(this.node),
        frequency: new Input(this.node.frequency),
        q: new Input(this.node.Q),
        gain: new Input(this.node.gain),
    };
    setters = {
        type: (type) => this.node.type = type,
        frequency: (value) => {
            this.node.frequency.setValueAtTime(value, audioCtx.currentTime);
        },
        q: (value) => this.node.Q.setValueAtTime(value, audioCtx.currentTime),
        gain: (value) => this.node.gain.setValueAtTime(value, audioCtx.currentTime),
    };
}

class Gain {
    node = audioCtx.createGain();
    connectors = {
        input: new Input(this.node),
        output: new Output(this.node),
    };
    setters = {
        gain: (value) => this.node.gain.setValueAtTime(value, audioCtx.currentTime),
    };
}

let types = {
    osc: () => new Osc(),
    gain: () => new Gain(),
    biquad: () => new Biquad(),
};

let objects = {
    sink: new Sink(),
};

function create(type, name) {
    let ctor = types[type];
    if (typeof ctor === 'function') {
        objects[name] = ctor();
        return success();
    } else {
        return failure(`no such type: '${type}'`);
    }
}

function set(param, value) {
    let obj = objects[param.object];
    if (!obj) {
        return objectFailure(param.object);
    }
    let setter = obj.setters[param.attr];
    if (!setter) {
        return attrFailure(param.attr, param.object);
    }
    setter(value);
    return success();
}

function confirmConnector(param) {
    let obj = objects[param.object];
    if (!obj) {
        return objectFailure(param.object);
    }

    let con = obj.connectors[param.attr];
    if (!con) {
        return connectorFailure(param.attr, param.object);
    }

    return { success: true, con };
}

function connect(paramA, paramB) {
    let conA = confirmConnector(paramA);
    if (!conA.success) {
        return conA.msg;
    }
    conA = conA.con;

    let conB = confirmConnector(paramB);
    if (!conB.success) {
        return conB.msg;
    }
    conB = conB.con;

    // make sure they're not both the same type (Input | Output)
    if (conA.constructor === conB.constructor) {
        mismatchFailure(conA.constructor.name);
    }

    if (conA instanceof Output) {
        conA.con.connect(conB.con);
    } else {
        conB.con.connect(conA.con);
    }

}

function disconnect(paramA, paramB) {
    let conA = confirmConnector(paramA);
    if (!conA.success) {
        return conA.msg;
    }
    conA = conA.con;

    let conB = confirmConnector(paramB);
    if (!conB.success) {
        return conB.msg;
    }
    conB = conB.con;

    // make sure they're not both the same type (Input | Output)
    if (conA.constructor === conB.constructor) {
        mismatchFailure(conA.constructor.name);
    }

    if (conA instanceof Output) {
        conA.con.disconnect(conB.con);
    } else {
        conB.con.disconnect(conA.con);
    }
}

export {
    create,
    set,
    connect,
    disconnect,
};