// ====== SOUND ENGINE (NO FILES, PURE JS) ======
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency = 600, duration = 120, type = "sine", volume = 0.2) {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    setTimeout(() => {
        osc.stop();
    }, duration);
}

function playClick() {
    playBeep(750, 80, "square", 0.15);
}

function playSuccess() {
    playBeep(520, 120, "triangle", 0.18);
    setTimeout(() => playBeep(780, 120, "triangle", 0.18), 110);
}

function playError() {
    playBeep(220, 160, "sawtooth", 0.22);
}

// ====== ELEMENTS ======
const themeSelect = document.getElementById("theme");
const methodSelect = document.getElementById("method");
const methodDescription = document.getElementById("methodDescription");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const swapBtn = document.getElementById("swapBtn");
const speakBtn = document.getElementById("speakBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const mainCard = document.getElementById("mainCard");

// Admin panel
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");
const accentColorInput = document.getElementById("accentColor");
const primaryBtnColorInput = document.getElementById("primaryBtnColor");
const secondaryBtnColorInput = document.getElementById("secondaryBtnColor");
const radiusRange = document.getElementById("radiusRange");
const fontSizeRange = document.getElementById("fontSizeRange");
const shadowRange = document.getElementById("shadowRange");
const scaleRange = document.getElementById("scaleRange");
const glassToggle = document.getElementById("glassToggle");
const compactModeCheckbox = document.getElementById("compactMode");
const layoutEditToggle = document.getElementById("layoutEditToggle");

// History
const historyList = document.getElementById("historyList");
const history = [];
const HISTORY_LIMIT = 15;

// ====== METHOD DESCRIPTIONS ======
const METHOD_DESCRIPTIONS = {
    base64: "Base64 – safe-looking text, good for hiding messages in plain sight.",
    url: "URL Encode – makes text safe to put inside URLs.",
    hex: "Hex – shows each character as hexadecimal numbers.",
    binary: "Binary – 0s and 1s, the raw machine style.",
    rot13: "ROT13 – simple letter rotation, same function encodes and decodes.",
    caesar: "Caesar – classic shift by 3 letters cipher.",
    morse: "Morse – dots and dashes, use / for spaces when decoding.",
    reverse: "Reverse – flips the text backwards.",
    atbash: "Atbash – maps A↔Z, B↔Y, C↔X, etc."
};

function updateMethodDescription() {
    const method = methodSelect.value;
    methodDescription.textContent = METHOD_DESCRIPTIONS[method] || "";
}

// ====== THEME HANDLING ======
themeSelect.addEventListener("change", () => {
    playClick();
    document.body.classList.remove("light", "dark", "neon", "sunset", "rainbow");
    document.body.classList.add(themeSelect.value);
});

// ====== LOADING OVERLAY ======
function showLoading(ms = 400) {
    loadingOverlay.classList.add("active");
    return new Promise(resolve => {
        setTimeout(() => {
            loadingOverlay.classList.remove("active");
            resolve();
        }, ms);
    });
}

// ====== ENCODING / DECODING HELPERS ======

// Base64
function encodeBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
}

function decodeBase64(text) {
    return decodeURIComponent(escape(atob(text)));
}

// URL
function encodeURL(text) {
    return encodeURIComponent(text);
}

function decodeURL(text) {
    return decodeURIComponent(text);
}

// Hex
function encodeHex(text) {
    return Array.from(text)
        .map(c => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(" ");
}

function decodeHex(text) {
    return text.trim().split(/\s+/)
        .map(h => String.fromCharCode(parseInt(h, 16)))
        .join("");
}

// Binary
function encodeBinary(text) {
    return text.split("")
        .map(c => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" ");
}

function decodeBinary(text) {
    return text.trim().split(/\s+/)
        .map(b => String.fromCharCode(parseInt(b, 2)))
        .join("");
}

// ROT13
function rot13Char(c) {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + 13) % 26) + 65);
    }
    if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + 13) % 26) + 97);
    }
    return c;
}

function encodeRot13(text) {
    return text.split("").map(rot13Char).join("");
}

function decodeRot13(text) {
    return encodeRot13(text); // symmetric
}

// Caesar (shift 3)
function caesarShiftChar(c, shift) {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
    }
    if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
    }
    return c;
}

function encodeCaesar(text) {
    return text.split("").map(c => caesarShiftChar(c, 3)).join("");
}

function decodeCaesar(text) {
    return text.split("").map(c => caesarShiftChar(c, -3)).join("");
}

// Morse
const MORSE_MAP = {
    "A": ".-",    "B": "-...",  "C": "-.-.",  "D": "-..",
    "E": ".",     "F": "..-.",  "G": "--.",   "H": "....",
    "I": "..",    "J": ".---",  "K": "-.-",   "L": ".-..",
    "M": "--",    "N": "-.",    "O": "---",   "P": ".--.",
    "Q": "--.-",  "R": ".-.",   "S": "...",   "T": "-",
    "U": "..-",   "V": "...-",  "W": ".--",   "X": "-..-",
    "Y": "-.--",  "Z": "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--",
    "4": "....-", "5": ".....", "6": "-....", "7": "--...",
    "8": "---..", "9": "----.",
    " ": "/"
};

const REVERSE_MORSE_MAP = Object.fromEntries(
    Object.entries(MORSE_MAP).map(([k, v]) => [v, k])
);

function encodeMorse(text) {
    return text.toUpperCase().split("")
        .map(ch => MORSE_MAP[ch] || "")
        .filter(Boolean)
        .join(" ");
}

function decodeMorse(text) {
    return text.trim().split(/\s+/)
        .map(code => REVERSE_MORSE_MAP[code] || "")
        .join("")
        .replace(/\//g, " ");
}

// Reverse
function encodeReverse(text) {
    return text.split("").reverse().join("");
}

function decodeReverse(text) {
    return encodeReverse(text);
}

// Atbash
function atbashChar(c) {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(65 + (25 - (code - 65)));
    }
    if (code >= 97 && code <= 122) {
        return String.fromCharCode(97 + (25 - (code - 97)));
    }
    return c;
}

function encodeAtbash(text) {
    return text.split("").map(atbashChar).join("");
}

function decodeAtbash(text) {
    return encodeAtbash(text);
}

// ====== MAIN ENCODE / DECODE ======
function encode(method, input) {
    switch (method) {
        case "base64": return encodeBase64(input);
        case "url": return encodeURL(input);
        case "hex": return encodeHex(input);
        case "binary": return encodeBinary(input);
        case "rot13": return encodeRot13(input);
        case "caesar": return encodeCaesar(input);
        case "morse": return encodeMorse(input);
        case "reverse": return encodeReverse(input);
        case "atbash": return encodeAtbash(input);
        default: return input;
    }
}

function decode(method, input) {
    switch (method) {
        case "base64": return decodeBase64(input);
        case "url": return decodeURL(input);
        case "hex": return decodeHex(input);
        case "binary": return decodeBinary(input);
        case "rot13": return decodeRot13(input);
        case "caesar": return decodeCaesar(input);
        case "morse": return decodeMorse(input);
        case "reverse": return decodeReverse(input);
        case "atbash": return decodeAtbash(input);
        default: return input;
    }
}

// ====== HISTORY ======
function addToHistory(direction, method, input, output) {
    const time = new Date();
    history.unshift({
        direction,
        method,
        input,
        output,
        time: time.toLocaleTimeString()
    });
    if (history.length > HISTORY_LIMIT) {
        history.pop();
    }
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "history-item";
        div.dataset.index = index;

        const line1 = document.createElement("div");
        line1.className = "history-line";
        const tag = document.createElement("span");
        tag.className = "history-tag";
        tag.textContent = item.direction === "encode" ? "ENC" : "DEC";
        const methodSpan = document.createElement("span");
        methodSpan.className = "history-method";
        methodSpan.textContent = `${item.method.toUpperCase()} • ${item.time}`;
        line1.appendChild(tag);
        line1.appendChild(methodSpan);

        const preview = document.createElement("div");
        preview.className = "history-preview";
        preview.textContent = item.output || item.input;

        div.appendChild(line1);
        div.appendChild(preview);

        div.addEventListener("click", () => {
            playClick();
            inputText.value = item.input;
            outputText.value = item.output;
            methodSelect.value = item.method;
            updateMethodDescription();
        });

        historyList.appendChild(div);
    });
}

// ====== BUTTON HANDLERS ======
async function handleEncode() {
    const input = inputText.value;
    const method = methodSelect.value;
    if (!input.trim()) {
        playError();
        return;
    }
    playClick();
    await showLoading(450);
    try {
        const result = encode(method, input);
        outputText.value = result;
        addToHistory("encode", method, input, result);
        playSuccess();
    } catch (e) {
        outputText.value = "Error encoding: " + e.message;
        playError();
    }
}

async function handleDecode() {
    const input = inputText.value;
    const method = methodSelect.value;
    if (!input.trim()) {
        playError();
        return;
    }
    playClick();
    await showLoading(450);
    try {
        const result = decode(method, input);
        outputText.value = result;
        addToHistory("decode", method, input, result);
        playSuccess();
    } catch (e) {
        outputText.value = "Error decoding: " + e.message;
        playError();
    }
}

function handleSwap() {
    playClick();
    const temp = inputText.value;
    inputText.value = outputText.value;
    outputText.value = temp;
}

// Text-to-speech for output
function handleSpeak() {
    const text = outputText.value.trim();
    if (!text) {
        playError();
        return;
    }
    playClick();
    if (!("speechSynthesis" in window)) {
        alert("Text-to-speech is not supported in this browser.");
        return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    window.speechSynthesis.speak(utter);
}

// Attach events
encodeBtn.addEventListener("click", handleEncode);
decodeBtn.addEventListener("click", handleDecode);
swapBtn.addEventListener("click", handleSwap);
speakBtn.addEventListener("click", handleSpeak);

// Enter key + Ctrl for quick encode
inputText.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        handleEncode();
    }
});

// Update description on change
methodSelect.addEventListener("change", () => {
    playClick();
    updateMethodDescription();
});

// ====== ADMIN PANEL SECRET (F2 + CODE) ======
const SECRET_CODE = "rick_dev22856355";

window.addEventListener("keydown", (e) => {
    if (e.key === "F2") {
        e.preventDefault();
        const code = prompt("Enter developer access code:");
        if (code === SECRET_CODE) {
            playSuccess();
            openAdminPanel();
        } else if (code !== null) {
            playError();
            alert("Invalid code.");
        }
    }
});

function openAdminPanel() {
    adminPanel.classList.add("visible");
}

function closeAdminPanelFn() {
    adminPanel.classList.remove("visible");
}

closeAdmin.addEventListener("click", () => {
    playClick();
    closeAdminPanelFn();
});

// ====== LAYOUT EDITOR CONTROLS ======

// Accent color
accentColorInput.addEventListener("input", () => {
    const color = accentColorInput.value;
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--btn-primary-bg", color);
    playClick();
});

// Button colors
primaryBtnColorInput.addEventListener("input", () => {
    const color = primaryBtnColorInput.value;
    document.documentElement.style.setProperty("--btn-primary-bg", color);
    playClick();
});

secondaryBtnColorInput.addEventListener("input", () => {
    const color = secondaryBtnColorInput.value;
    document.documentElement.style.setProperty("--btn-secondary-bg", color);
    playClick();
});

// Radius
radiusRange.addEventListener("input", () => {
    const value = radiusRange.value + "px";
    document.documentElement.style.setProperty("--card-radius", value);
    playClick();
});

// Font size
fontSizeRange.addEventListener("input", () => {
    const value = fontSizeRange.value + "px";
    document.documentElement.style.setProperty("--base-font-size", value);
    playClick();
});

// Shadow
shadowRange.addEventListener("input", () => {
    const value = shadowRange.value + "px";
    document.documentElement.style.setProperty("--shadow-blur", value);
    playClick();
});

// Scale main card
scaleRange.addEventListener("input", () => {
    const value = scaleRange.value / 100;
    mainCard.style.transform = `scale(${value})`;
    playClick();
});

// Glass effect
glassToggle.addEventListener("change", () => {
    if (glassToggle.checked) {
        document.body.classList.add("glass-on");
    } else {
        document.body.classList.remove("glass-on");
    }
    playClick();
});

// Compact mode
compactModeCheckbox.addEventListener("change", () => {
    if (compactModeCheckbox.checked) {
        document.body.classList.add("compact");
    } else {
        document.body.classList.remove("compact");
    }
    playClick();
});

// ====== LAYOUT EDIT MODE (DRAG ELEMENTS) ======
let layoutEditEnabled = false;
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function enableLayoutEdit() {
    layoutEditEnabled = true;
    document.body.classList.add("layout-edit");

    const editables = document.querySelectorAll("[data-editable='true']");
    const cardRect = mainCard.getBoundingClientRect();

    editables.forEach(el => {
        const rect = el.getBoundingClientRect();
        const left = rect.left - cardRect.left;
        const top = rect.top - cardRect.top;

        el.style.position = "absolute";
        el.style.left = left + "px";
        el.style.top = top + "px";
    });

    mainCard.style.height = cardRect.height + "px";

    mainCard.addEventListener("mousedown", startDragElement);
    window.addEventListener("mousemove", onDragElement);
    window.addEventListener("mouseup", stopDragElement);
}

function disableLayoutEdit() {
    // Easiest reset: reload page to restore original layout
    window.location.reload();
}

function startDragElement(e) {
    if (!layoutEditEnabled) return;
    const target = e.target.closest("[data-editable='true']");
    if (!target) return;
    dragTarget = target;
    const rect = dragTarget.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
}

function onDragElement(e) {
    if (!layoutEditEnabled || !dragTarget) return;
    const cardRect = mainCard.getBoundingClientRect();
    const x = e.clientX - cardRect.left - dragOffsetX;
    const y = e.clientY - cardRect.top - dragOffsetY;
    dragTarget.style.left = x + "px";
    dragTarget.style.top = y + "px";
}

function stopDragElement() {
    dragTarget = null;
}

layoutEditToggle.addEventListener("change", () => {
    if (layoutEditToggle.checked) {
        enableLayoutEdit();
    } else {
        disableLayoutEdit();
    }
    playClick();
});

// ====== INITIAL SETUP ======
(function init() {
    document.body.classList.add("glass-on");
    updateMethodDescription();
})();
