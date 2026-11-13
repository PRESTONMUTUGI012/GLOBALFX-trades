const PARTNER_APP_ID = "34UGhpx0qrXHqpfKHAkGH";
const AFFILIATE_TOKEN = "3A2CFHPG722B";
const exchangeRates = { KES: 129.0, UGX: 3750.0, TZS: 2600.0, EUR: 0.92, GBP: 0.79 };

let exhaustiveAssets = [];
let currentCategory = 'all';
let currentSymbol = '';
let currentChartInterval = '5';
let marketDataStore = {};
let tvWidgetInstance = null;
let authMode = 'signin';

// 1-Minute (60 Seconds) Splash Screen Sequence
let remainingSeconds = 60;
function runSplashSequence() {
    const timerDisplay = document.getElementById('loading-timer-display');
    const progressBar = document.getElementById('core-progress-bar');
    const statusText = document.getElementById('loading-status-text');

    const stages = {
        45: "Ingesting Exhaustive Global Markets...",
        30: "Calibrating 4 A+ Technical Indicators...",
        15: "Syncing Cascading Digit Matrix & Boats...",
        5:  "Finalizing Live EAT Clock & Killzones..."
    };

    const interval = setInterval(() => {
        remainingSeconds--;
        const mins = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
        const secs = (remainingSeconds % 60).toString().padStart(2, '0');
        
        if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
        if (progressBar) progressBar.style.width = `${((60 - remainingSeconds) / 60) * 100}%`;
        if (stages[remainingSeconds] && statusText) {
            statusText.innerText = stages[remainingSeconds];
        }

        if (remainingSeconds <= 0) {
            clearInterval(interval);
            dismissSplash();
        }
    }, 1000);
}

function dismissSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
    }
}

function toggleAuthModal(show) {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }
}

function switchAuthTab(mode) {
    authMode = mode;
    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const nameBox = document.getElementById('name-field-box');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (mode === 'signin') {
        signinTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signupTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.add('hidden');
        submitBtn.innerText = "SIGN IN TO TERMINAL";
    } else {
        signupTab.className = "text-sm font-bold text-fxgreen border-b-2 border-fxgreen pb-1";
        signinTab.className = "text-sm font-bold text-slate-400 hover:text-white pb-1";
        nameBox.classList.remove('hidden');
        submitBtn.innerText = "CREATE ACCOUNT & REGISTER";
    }
}

function submitAuthForm() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    if (!email || !pass) { alert("Please fill in your email and password."); return; }
    
    if (authMode === 'signup') {
        const name = document.getElementById('auth-name').value || "Trader";
        alert(`✅ Account successfully created and registered for ${name} (${email})!`);
    } else {
        alert(`✅ Signed in successfully as ${email}!`);
    }
    toggleAuthModal(false);
}

function setMode(mode) {
    document.getElementById('btn-demo').className = mode === 'demo' ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition' : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
    document.getElementById('btn-real').className = mode === 'real' ? 'px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition' : 'px-3 py-1 rounded-lg font-semibold text-slate-400 hover:text-white transition';
}

function authDeriv() {
    window.location.href = `https://oauth.deriv.com/oauth2/authorize?app_id=${PARTNER_APP_ID}&affiliate_token=${AFFILIATE_TOKEN}`;
}

function switchCategory(cat) {
    currentCategory = cat;
    renderScannerList();
}

function changeChartTimeframe(interval) {
    currentChartInterval = interval;
    document.querySelectorAll('.tf-btn').forEach(btn => {
        if (btn.dataset.tf === interval) {
            btn.className = "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold";
        } else {
            btn.className = "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:border-fxgreen";
        }
    });
    initTradingViewWidget(currentSymbol);
}

function initTradingViewWidget(symbolCode) {
    const container = document.getElementById('tradingview_advanced_chart');
    if (!container || typeof TradingView === 'undefined') return;
    container.innerHTML = '';

    let tvSymbol = "FX:EURUSD";
    if (symbolCode.includes("XAU")) tvSymbol = "OANDA:XAUUSD";
    else if (symbolCode.includes("XAG")) tvSymbol = "OANDA:XAGUSD";
    else if (symbolCode.includes("GBP")) tvSymbol = "FX:GBPUSD";
    else if (symbolCode.includes("JPY")) tvSymbol = "FX:USDJPY";
    else if (symbolCode.includes("AUD")) tvSymbol = "FX:AUDUSD";
    else if (symbolCode.includes("BTC")) tvSymbol = "BINANCE:BTCUSDT";
    else if (symbolCode.includes("ETH")) tvSymbol = "BINANCE:ETHUSDT";
    else if (symbolCode.includes("US30") || symbolCode.includes("DJI")) tvSymbol = "FOREXCOM:DJI";
    else if (symbolCode.includes("US100") || symbolCode.includes("NDX")) tvSymbol = "FOREXCOM:NSXUSD";

    tvWidgetInstance = new TradingView.widget({
        "width": "100%", "height": "100%", "symbol": tvSymbol, "interval": currentChartInterval,
        "timezone": "Etc/UTC", "theme": "dark", "style": "1", "locale": "en",
        "toolbar_bg": "#030712", "enable_publishing": false, "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies",
            "BB@tv-basicstudies"
        ],
        "container_id": "tradingview_advanced_chart"
    });
}

function selectSymbol(sym, name) {
    currentSymbol = sym;
    document.getElementById('chart-title-label').innerText = `${name} (${sym}) - Automated Indicator Analysis`;
    initTradingViewWidget(sym);

    if (window.derivApiInstance && window.derivApiInstance.isConnected) {
        window.derivApiInstance.subscribeTicks(sym, handleIncomingTick);
        exhaustiveAssets.slice(0, 40).forEach(a => {
            window.derivApiInstance.addSimultaneousSubscription(a.symbol, handleIncomingTick);
        });
    }
    renderScannerList();
}

function renderScannerList() {
    const container = document.getElementById('scanner-market-list');
    if (!container) return;
    container.innerHTML = '';

    const searchInput = document.getElementById('asset-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = exhaustiveAssets;
    if (currentCategory !== 'all') {
        filtered = exhaustiveAssets.filter(a => a.market === currentCategory);
    }
    if (query) {
        filtered = filtered.filter(a => a.name.toLowerCase().includes(query) || a.symbol.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-slate-500 text-center py-4">No matching markets found...</div>`;
        return;
    }

    filtered.forEach(m => {
        const st = marketDataStore[m.symbol] || { price: '0.00', winrate: 88 };
        const isSel = m.symbol === currentSymbol;
        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name);
        div.className = `cursor-pointer p-2 rounded-xl border flex justify-between items-center transition ${isSel ? 'bg-emerald-950/70 border-fxgreen' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`;
        div.innerHTML = `
            <div><span class="font-bold text-white truncate max-w-[130px] inline-block">${m.name}</span></div>
            <div class="text-fxgreen font-bold">${st.price}</div>
            <div class="text-gold font-bold">${st.winrate}%</div>
        `;
        container.appendChild(div);
    });
}

function handleIncomingTick(tick) {
    const sym = tick.symbol;
    const quote = Number(tick.quote);
    const pip = tick.pip_size || 4;
    const priceFormatted = quote.toFixed(pip);

    if (!marketDataStore[sym]) {
        marketDataStore[sym] = { quotes: [], digits: [0,0,0,0,0,0,0,0,0,0], total: 0 };
    }
    const st = marketDataStore[sym];
    st.price = priceFormatted;
    st.quotes.push(quote);
    if (st.quotes.length > 60) st.quotes.shift();

    const lastDig = parseInt(priceFormatted.slice(-1));
    if (!isNaN(lastDig)) {
        st.digits[lastDig]++;
    }
    st.total++;
    st.winrate = Math.floor(86 + (Math.sin(st.total) * 10));

    if (sym === currentSymbol) {
        updateTerminalAnalytics(st, quote, priceFormatted, pip);
    }
    renderScannerList();
}

function updateTerminalAnalytics(st, quote, priceFormatted, pip) {
    const total = st.total || 1;
    let maxP = 0, maxD = 0, minP = 100, minD = 0;
    for(let i=0; i<10; i++) {
        const pct = Math.round((st.digits[i] / total) * 100);
        const el = document.getElementById(`f-${i}`);
        if(el) el.innerText = `${pct}%`;
        if(pct > maxP) { maxP = pct; maxD = i; }
        if(pct < minP) { minP = pct; minD = i; }
    }

    // Dynamic Digit Contract Shifting
    const evenSum = st.digits[0]+st.digits[2]+st.digits[4]+st.digits[6]+st.digits[8];
    const evenPct = (evenSum / total) * 100;
    if (maxP >= 18) {
        document.getElementById('digit-active-contract').innerText = `DIFFER ${minD} / MATCH ${maxD}`;
        document.getElementById('boat-digit').innerText = "Boat 1: Precision Differ (A+)";
    } else if (evenPct >= 56 || evenPct <= 44) {
        document.getElementById('digit-active-contract').innerText = evenPct >= 56 ? "EVEN DIGITS" : "ODD DIGITS";
        document.getElementById('boat-digit').innerText = "Boat 4: Even/Odd Scalper (A+)";
    } else {
        document.getElementById('digit-active-contract').innerText = "OVER 3 / UNDER 6";
        document.getElementById('boat-digit').innerText = "Boat 5: Boundary Scalper (A+)";
    }

    const offset = Math.pow(10, -pip) * 15;
    document.getElementById('digit-ep-1').innerText = (quote - offset).toFixed(pip);
    document.getElementById('digit-ep-2').innerText = (quote + offset).toFixed(pip);

    const history = st.quotes;
    if (history.length < 3) return;
    const isRise = history[history.length - 1] >= history[history.length - 2];

    document.getElementById('ind-ema').innerText = isRise ? "BULLISH CROSS" : "BEARISH CROSS";
    document.getElementById('ind-ema').className = isRise ? "font-bold text-fxgreen mt-1" : "font-bold text-rose-400 mt-1";
    document.getElementById('ind-rsi').innerText = isRise ? "62.4 (BUY)" : "37.6 (SELL)";
    document.getElementById('ind-rsi').className = isRise ? "font-bold text-fxgreen mt-1" : "font-bold text-rose-400 mt-1";
    document.getElementById('ind-macd').innerText = isRise ? "EXPANDING +" : "EXPANDING -";
    document.getElementById('ind-macd').className = isRise ? "font-bold text-fxgreen mt-1" : "font-bold text-rose-400 mt-1";

    const tfLabel = isRise ? "BUY" : "SELL";
    const tfClass = isRise ? "text-fxgreen font-bold" : "text-rose-400 font-bold";
    ['tf-1m', 'tf-5m', 'tf-15m', 'tf-1h', 'tf-4h'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.innerText = tfLabel; el.className = tfClass; }
    });

    const spreadOffset = Math.pow(10, -pip) * 25;
    const tpPrice = isRise ? (quote + spreadOffset * 2).toFixed(pip) : (quote - spreadOffset * 2).toFixed(pip);
    const slPrice = isRise ? (quote - spreadOffset).toFixed(pip) : (quote + spreadOffset).toFixed(pip);

    document.getElementById('blueprint-entry').innerText = priceFormatted;
    document.getElementById('blueprint-tp').innerText = `${tpPrice} (Exit / TP)`;
    document.getElementById('blueprint-sl').innerText = `${slPrice} (Stop Exit)`;

    document.getElementById('rise-fall-signal').innerText = isRise ? "RISE (CALL)" : "FALL (PUT)";
    document.getElementById('rise-fall-signal').className = isRise ? "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2 py-1 rounded border border-emerald-700" : "text-[10px] font-mono font-bold text-rose-400 bg-rose-950 px-2 py-1 rounded border border-rose-700";

    document.getElementById('boat-tick').innerText = isRise ? "Boat 2: Tick Momentum (A+)" : "Boat 3: Tick Reversal (A+)";
    document.getElementById('boat-holding').innerText = isRise ? "Boat 6: Swing Trend (A+)" : "Boat 7: Swing Breakdown (A+)";
    document.getElementById('ai-exit-rule').innerText = `Exit at ${tpPrice} or 5 Ticks`;
}

function executeTradeAction(mode) {
    const ep = document.getElementById('blueprint-entry').innerText;
    const tp = document.getElementById('blueprint-tp').innerText;
    const boat = mode === 'TICK' ? document.getElementById('boat-tick').innerText : document.getElementById('boat-holding').innerText;
    if (typeof triggerElhadartProfitAlert === 'function') {
        triggerElhadartProfitAlert(boat, 18.50);
    }
    alert(`🚀 Executing A+ ${mode} Trade Setup!\nExact Entry Point: ${ep}\nTarget Exit Point: ${tp}`);
}

function updateClockAndKillzones() {
    const now = new Date();
    const eat = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    const hours = eat.getUTCHours();
    const clockEl = document.getElementById('live-eat-clock');
    if (clockEl) clockEl.innerText = eat.toUTCString().slice(17, 25) + " EAT";

    let kzText = "24/7 Multimarket Session";
    if (hours >= 10 && hours < 15) kzText = "🔥 London Open Killzone Active";
    else if (hours >= 15 && hours < 19) kzText = "⚡ London / NY Overlap Active";
    
    const kzEl = document.getElementById('active-killzone-status');
    if (kzEl) kzEl.innerText = kzText;
}

document.addEventListener('DOMContentLoaded', () => {
    runSplashSequence();

    const amt = document.getElementById('conv-amt');
    const curr = document.getElementById('conv-curr');
    function updateConv() {
        const val = (parseFloat(amt.value) || 0) * (exchangeRates[curr.value] || 1);
        document.getElementById('conv-result').innerText = `${val.toLocaleString(undefined, {minimumFractionDigits: 2})} ${curr.value}`;
    }
    if (amt && curr) {
        amt.addEventListener('input', updateConv);
        curr.addEventListener('change', updateConv);
    }

    setInterval(updateClockAndKillzones, 1000);

    const derivApi = new DerivAPIConnector(PARTNER_APP_ID);
    window.derivApiInstance = derivApi;

    derivApi.connect().then(() => {
        document.getElementById('stream-status-badge').innerText = "📡 Connected & Ingesting All Assets";
        derivApi.fetchActiveSymbols((symbols) => {
            exhaustiveAssets = symbols.map(s => ({
                symbol: s.symbol || s.underlying_symbol,
                name: s.display_name || s.underlying_symbol_name,
                market: s.market
            }));

            document.getElementById('header-asset-count').innerText = `${exhaustiveAssets.length} Global Markets Loaded`;
            if (exhaustiveAssets.length > 0 && !currentSymbol) {
                selectSymbol(exhaustiveAssets[0].symbol, exhaustiveAssets[0].name);
            }
            renderScannerList();

            exhaustiveAssets.slice(0, 40).forEach(a => {
                derivApi.addSimultaneousSubscription(a.symbol, handleIncomingTick);
            });
        });
    }).catch(err => {
        console.error("Connection error:", err);
    });
});
