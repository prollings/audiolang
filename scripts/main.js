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
    const run = () => backend.set(command.param, command.literal);
    if (command.event.length) {
        onEvent(command.event, run);
    } else {
        return run();
    }
}

function connect(command) {
    return backend.connect(command.paramA, command.paramB);
}

function disconnect(command) {
    return backend.disconnect(command.paramA, command.paramB);
}

// util

function onEvent(ev, fn) {
    if (ev[1] === 'mouse') {
        let btn = ev[0];
        if (btn !== 'left' || btn !== 'right') {
            // fail
        }
        btn = btn === 'left' ? 0 : 2;
        let dir = ev[2];
        if (dir !== 'up' || dir !== 'down') {
            // fail
        }
        document.addEventListener(`mouse${dir}`, ev => {
            if (ev.button === btn) {
                fn();
            }
        });
    }
}