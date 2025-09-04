const API_BASE = "https://api.frankfurter.dev/v1";
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];
const els = {
  form: $("#converter"),
  amount: $("#amount"),
  from: $("#from"),
  to: $("#to"),
  swap: $("#swap"),
  convertBtn: $("#convertBtn"),
  summary: $("#summary"),
  rateInfo: $("#rateInfo"),
  history: $("#history"),
  historyList: $("#historyList"),
  optionTemplate: $("#optionTemplate"),
};
let currencies = {};
let settingsKey = "convmoedas:v1";
let debounceTimer = null;
const loadSettings = () => JSON.parse(localStorage.getItem(settingsKey) || "{}");
const saveSettings = (obj) => localStorage.setItem(settingsKey, JSON.stringify(obj));
function formatMoney(value, currency, locale="pt-BR"){
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}
function addToHistory(entry){
  const max = 6;
  const settings = loadSettings();
  const list = settings.history || [];
  list.unshift(entry);
  if (list.length > max) list.pop();
  settings.history = list;
  saveSettings(settings);
  renderHistory();
}
function renderHistory(){
  const { history = [] } = loadSettings();
  els.history.hidden = history.length === 0;
  els.historyList.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.amount} ${h.from} → ${h.converted} ${h.to} (taxa: ${h.rate.toFixed(6)})`;
    els.historyList.appendChild(li);
  });
}
async function fetchCurrencies(){
  const cacheKey = "convmoedas:currencies";
  const cache = JSON.parse(localStorage.getItem(cacheKey) || "{}");
  const freshEnough = cache.ts && (Date.now() - cache.ts) < 24*60*60*1000;
  if (freshEnough && cache.data){
    return cache.data;
  }
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error("Falha ao buscar moedas");
  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  return data;
}
async function fetchRate(from, to){
  if (from === to) return 1;
  const url = `${API_BASE}/latest?base=${encodeURIComponent(from)}&symbols=${encodeURIComponent(to)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao buscar taxa");
  const data = await res.json();
  return data.rates[to];
}
function populateSelects(){
  const codes = Object.keys(currencies).sort();
  [els.from, els.to].forEach(select => {
    select.innerHTML = "";
    codes.forEach(code => {
      const opt = els.optionTemplate.content.firstElementChild.cloneNode(true);
      opt.value = code;
      opt.textContent = `${code} — ${currencies[code]}`;
      select.appendChild(opt);
    });
  });
}
function setDefaults(){
  const saved = loadSettings();
  els.amount.value = saved.amount ?? "100";
  els.from.value = saved.from ?? "BRL";
  els.to.value = saved.to ?? "USD";
}
function attachEvents(){
  els.swap.addEventListener("click", () => {
    const a = els.from.value;
    els.from.value = els.to.value;
    els.to.value = a;
    convertNow();
  });
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    convertNow();
  });
  els.amount.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convertNow, 300);
  });
  [els.from, els.to].forEach(sel => sel.addEventListener("change", convertNow));
}
async function convertNow(){
  const amount = parseFloat(els.amount.value.replace(",", ".")) || 0;
  const from = els.from.value;
  const to = els.to.value;
  els.convertBtn.disabled = true;
  els.convertBtn.textContent = "Convertendo...";
  try {
    const rate = await fetchRate(from, to);
    const converted = amount * rate;
    els.summary.innerHTML = `
      <div class="big">
        ${formatMoney(amount, from)} = <strong>${formatMoney(converted, to)}</strong>
      </div>
    `;
    els.rateInfo.textContent = `Taxa: 1 ${from} = ${rate.toFixed(6)} ${to}`;
    saveSettings({ ...loadSettings(), from, to, amount: els.amount.value });
    addToHistory({ amount: formatMoney(amount, from), converted: converted.toFixed(2), from, to, rate });
  } catch (err) {
    console.error(err);
    els.summary.textContent = "Não foi possível converter agora. Verifique sua conexão e tente novamente.";
    els.rateInfo.textContent = "";
  } finally {
    els.convertBtn.disabled = false;
    els.convertBtn.textContent = "Converter";
  }
}
(async function init(){
  try{
    currencies = await fetchCurrencies();
    populateSelects();
    setDefaults();
    renderHistory();
    attachEvents();
    convertNow();
  }catch(err){
    console.error(err);
    alert("Erro ao iniciar o app. Recarregue a página.");
  }
})();s