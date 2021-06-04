import scan from './scanner.js';
import parse from './parser.js';
import * as backend from './audio.js';

// document
let input = document.getElementById('input');
let previous = document.getElementById('history');

// main function
input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
        const tmpl = document.getElementById('history-item').content.cloneNode(true);
        let li = tmpl.querySelector('li');
        li.innerText = ev.target.value;
        previous.appendChild(tmpl);

        let tokens = scan(ev.target.value);
        let commandObj = parse(tokens);
        console.log(commandObj);
        if (!commandObj.success) {
            console.log(commandObj);
        }
        consumeCommand(commandObj);

        ev.target.value = '';
    }
});

function consumeCommand(command) {
    switch (command.verb) {
        case 'create':
            create(command);
            break;
        case 'set':
            set(command);
            break;
        case 'connect':
            connect(command);
            break;
        case 'disconnect':
            disconnect(command);
            break;
        default:
            return;
    }
}

function create(command) {
    return backend.create(command.type, command.name);
}

function set(command) {
    return backend.set(command.param, command.literal);
}

function connect(command) {
    return backend.connect(command.paramA, command.paramB);
}

function disconnect(command) {
    return backend.disconnect(command.paramA, command.paramB);
}

// function consumeCommand(command) {
//     let tokens = command.split(' ');
//     if (!(tokens[0] in validators)) {
//         console.log(`${tokens[0]} is not a valid command`);
//         return;
//     }
//     if (!validate(tokens)) {
//         console.log('invalid arguments!');
//         return;
//     }
//     let commandUnit = parse(tokens);
//     execute(commandUnit);
// }

// validating

// let validators = {
//     'create': ['create', ident, 'as', ident],
//     'set': ['set', ident, 'of', ident, 'to', literal],
//     'connect': ['connect', ident, 'of', ident, 'to', ident, 'of', ident],
//     'disconnect': ['disconnect', ident, 'of', ident, 'from', ident, 'of', ident],
// };

// function validate(tokens) {
//     let validator = validators[tokens[0]];
//     let valid = true;
//     for (let i in validator) {
//         let v = validator[i];
//         let t = tokens[i];
//         if (typeof v === 'string') {
//             valid &= (v === t);
//         } else {
//             valid &= v(t);
//         }
//     }
//     return valid;
// }
// function param() {}
// function event() {}
// function ident(id) {
//     const re = /\b\D+\d*/;
//     return re.test(id);
// }

// function literal(lit) {
//     const re = /'\w+'/;
//     return re.test(lit) || !isNaN(Number(lit));
// }

// // parsing

// function parse(tokens) {
//     return parsers[tokens[0]](tokens);
// }

// let parsers = {
//     'create': (tokens) => ({
//         command: 'create',
//         type: tokens[1],
//         name: tokens[3]
//     }),
//     'set': (tokens) => ({
//         command: 'set',
//         property: tokens[1],
//         object: tokens[3],
//         value: tokens[5]
//     }),
//     'connect': (tokens) => ({
//         command: 'connect',
//         conA: tokens[1],
//         objectA: tokens[3],
//         conB: tokens[5],
//         objectB: tokens[7],
//     }),
//     'disconnect': (tokens) => ({
//         command: 'connect',
//         conA: tokens[1],
//         objectA: tokens[3],
//         conB: tokens[5],
//         objectB: tokens[7],
//     }),
// };

// // exec

// function execute(cu) {
//     switch (cu.command) {
//         case 'create': {
//             objects[cu.name] = types[cu.type]();
//             break;
//         }
//         case 'set': {
//             let value = cu.value;
//             if (/'\w+'/.test(cu.value)) {
//                 value = value.replace("'");
//             }
//             objects[cu.object].setters[cu.property](value);
//             break;
//         }
//         case 'connect': {
//             let conA = objects[cu.objectA].connectors[cu.conA];
//             let conB = objects[cu.objectB].connectors[cu.conB];
//             conA.connect(conB);
//             break;
//         }
//         case 'disconnect': {
//             let conA = objects[cu.objectA].connectors[cu.conA];
//             let conB = objects[cu.objectB].connectors[cu.conB];
//             conA.disconnect(conB);
//             break;
//         }
//     }
// }

// let types = {
//     'osc': () => new Osc(),
// };

// class Osc {
//     constructor() {
//         this.node = audioCtx.createOscillator();
//         this.node.start();
//         this.connectors = {
//             output: this.node,
//             frequency: this.node.frequency,
//         };

//         this.setters = {
//             frequency: (value) => {
//                 console.log('set freq');
//                 this.node.frequency.setValueAtTime(value, audioCtx.currentTime);
//             },
//             type: (value) => {
//                 console.log('set type');
//                 this.node.type = value;
//             }
//         }
//     }
// }

// class Sink {
//     constructor() {
//         this.connectors = {
//             input: audioCtx.destination
//         }
//     }
// }

// // state

// let objects = {
//     'sink': new Sink(),
// };
