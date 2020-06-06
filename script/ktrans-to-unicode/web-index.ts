
import {processKtrans} from './process-ktrans-text';
import {processUnicode} from './process-unicode-text';
import Timer = NodeJS.Timer;

const isKtransEl = document.querySelector('#is-ktrans') as HTMLInputElement;
const inEl = document.querySelector('#in') as HTMLTextAreaElement;
const outEl = document.querySelector('#out') as HTMLTextAreaElement;
const delayEl = document.querySelector('#delay') as HTMLInputElement;
let prev = '';

function inputChange() {
    const text = inEl.value;
    if(text === prev)
        return;
    const isKtrans = isKtransEl.checked;
    outEl.value = isKtrans ? processKtrans(text) : processUnicode(text);
    if(prev && text.startsWith(prev))
        outEl.scrollTop = outEl.scrollHeight;
    prev = text;
}

function debounce(func: Function, delay: number) {
    let timeoutID: Timer;

    return function(...args: any[]) {
        if (timeoutID) clearTimeout(timeoutID);
        timeoutID = setTimeout(() => func(...args), delay);
    }
}

inEl.onkeyup = debounce(inputChange, 800);

delayEl.onchange = () => {
    let val = parseInt(delayEl.value);
    if(!isNaN(val) && val >= 0)
        inEl.onkeyup = debounce(inputChange, val);
};
