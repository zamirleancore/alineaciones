import "./style.css";

const STORAGE_KEY = "alineaciones-v1";
const FORMATIONS = {
  "4-3-3": [
    { id: "gk", role: "POR", x: 50, y: 90 },
    { id: "lb", role: "LI", x: 14, y: 72 },
    { id: "lcb", role: "DFC", x: 35, y: 74 },
    { id: "rcb", role: "DFC", x: 65, y: 74 },
    { id: "rb", role: "LD", x: 86, y: 72 },
    { id: "lcm", role: "MC", x: 28, y: 50 },
    { id: "cm", role: "MC", x: 50, y: 52 },
    { id: "rcm", role: "MC", x: 72, y: 50 },
    { id: "lw", role: "EI", x: 16, y: 26 },
    { id: "st", role: "DC", x: 50, y: 20 },
    { id: "rw", role: "ED", x: 84, y: 26 },
  ],
  "4-4-2": [
    { id: "gk", role: "POR", x: 50, y: 90 },
    { id: "lb", role: "LI", x: 14, y: 72 },
    { id: "lcb", role: "DFC", x: 35, y: 74 },
    { id: "rcb", role: "DFC", x: 65, y: 74 },
    { id: "rb", role: "LD", x: 86, y: 72 },
    { id: "lm", role: "MI", x: 16, y: 48 },
    { id: "lcm", role: "MC", x: 38, y: 50 },
    { id: "rcm", role: "MC", x: 62, y: 50 },
    { id: "rm", role: "MD", x: 84, y: 48 },
    { id: "lst", role: "DC", x: 36, y: 22 },
    { id: "rst", role: "DC", x: 64, y: 22 },
  ],
  "4-2-3-1": [
    { id: "gk", role: "POR", x: 50, y: 90 },
    { id: "lb", role: "LI", x: 14, y: 72 },
    { id: "lcb", role: "DFC", x: 35, y: 74 },
    { id: "rcb", role: "DFC", x: 65, y: 74 },
    { id: "rb", role: "LD", x: 86, y: 72 },
    { id: "lcdm", role: "MCD", x: 36, y: 58 },
    { id: "rcdm", role: "MCD", x: 64, y: 58 },
    { id: "lam", role: "EI", x: 18, y: 36 },
    { id: "cam", role: "MCO", x: 50, y: 34 },
    { id: "ram", role: "ED", x: 82, y: 36 },
    { id: "st", role: "DC", x: 50, y: 18 },
  ],
  "3-5-2": [
    { id: "gk", role: "POR", x: 50, y: 90 },
    { id: "lcb", role: "DFC", x: 26, y: 74 },
    { id: "cb", role: "DFC", x: 50, y: 76 },
    { id: "rcb", role: "DFC", x: 74, y: 74 },
    { id: "lwb", role: "CI", x: 12, y: 50 },
    { id: "lcm", role: "MC", x: 34, y: 52 },
    { id: "cm", role: "MC", x: 50, y: 48 },
    { id: "rcm", role: "MC", x: 66, y: 52 },
    { id: "rwb", role: "CD", x: 88, y: 50 },
    { id: "lst", role: "DC", x: 36, y: 22 },
    { id: "rst", role: "DC", x: 64, y: 22 },
  ],
  "5-3-2": [
    { id: "gk", role: "POR", x: 50, y: 90 },
    { id: "lwb", role: "LI", x: 10, y: 68 },
    { id: "lcb", role: "DFC", x: 30, y: 74 },
    { id: "cb", role: "DFC", x: 50, y: 76 },
    { id: "rcb", role: "DFC", x: 70, y: 74 },
    { id: "rwb", role: "LD", x: 90, y: 68 },
    { id: "lcm", role: "MC", x: 30, y: 48 },
    { id: "cm", role: "MC", x: 50, y: 50 },
    { id: "rcm", role: "MC", x: 70, y: 48 },
    { id: "lst", role: "DC", x: 36, y: 22 },
    { id: "rst", role: "DC", x: 64, y: 22 },
  ],
};

const uid = () => crypto.randomUUID();

function defaultState() {
  const teamId = uid();
  return {
    tab: "cancha",
    pickerSlot: null,
    confirm: null,
    toast: "",
    players: [],
    teams: [{ id: teamId, name: "Equipo A", formation: "4-3-3", slots: {} }],
    activeTeamId: teamId,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return defaultState();
    return { ...defaultState(), ...saved, pickerSlot: null, confirm: null, toast: "" };
  } catch {
    return defaultState();
  }
}

let state = loadState();

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      tab: state.tab,
      players: state.players,
      teams: state.teams,
      activeTeamId: state.activeTeamId,
    })
  );
}

let didPrune = false;
for (const item of state.teams) {
  const valid = new Set((FORMATIONS[item.formation] || FORMATIONS["4-3-3"]).map((slot) => slot.id));
  const nextSlots = Object.fromEntries(
    Object.entries(item.slots || {}).filter(([slotId]) => valid.has(slotId))
  );
  if (Object.keys(nextSlots).length !== Object.keys(item.slots || {}).length) didPrune = true;
  item.slots = nextSlots;
}
if (didPrune) save();

function team() {
  return state.teams.find((item) => item.id === state.activeTeamId) || state.teams[0];
}

function playerById(id) {
  return state.players.find((player) => player.id === id);
}

function formationSlots() {
  return FORMATIONS[team()?.formation] || FORMATIONS["4-3-3"];
}

function slotById(slotId) {
  return formationSlots().find((slot) => slot.id === slotId);
}

function slotIdOfPlayer(playerId) {
  return Object.keys(team().slots).find((key) => team().slots[key] === playerId) || null;
}

function usedPlayerIds() {
  const valid = new Set(formationSlots().map((slot) => slot.id));
  return new Set(
    Object.entries(team().slots)
      .filter(([slotId, playerId]) => playerId && valid.has(slotId))
      .map(([, playerId]) => playerId)
  );
}

function nextNumber() {
  const used = new Set(state.players.map((player) => player.number));
  for (let n = 1; n <= 99; n += 1) {
    if (!used.has(n)) return n;
  }
  return 99;
}

function showToast(message) {
  state.toast = message;
  render();
  setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      render();
    }
  }, 1800);
}

function closeOverlays() {
  state.pickerSlot = null;
  state.confirm = null;
}

function setTab(tab) {
  state.tab = tab;
  closeOverlays();
  save();
  render();
}

function askConfirm({ title, message, confirmLabel = "Confirmar", action }) {
  state.confirm = { title, message, confirmLabel, action };
  render();
}

function addPlayer(name, number) {
  const clean = name.trim();
  if (!clean) return;
  state.players.push({
    id: uid(),
    name: clean,
    number: Number(number) || nextNumber(),
  });
  save();
  render();
}

function removePlayer(id) {
  state.players = state.players.filter((player) => player.id !== id);
  state.teams = state.teams.map((item) => {
    const slots = Object.fromEntries(
      Object.entries(item.slots).filter(([, playerId]) => playerId !== id)
    );
    return { ...item, slots };
  });
  save();
  render();
}

function assign(slotId, playerId) {
  const current = team();
  const slots = { ...current.slots };
  if (!playerId) {
    delete slots[slotId];
  } else {
    const previousSlot = Object.keys(slots).find((key) => slots[key] === playerId);
    const occupant = slots[slotId];
    if (previousSlot && occupant && previousSlot !== slotId) {
      slots[previousSlot] = occupant;
      slots[slotId] = playerId;
    } else {
      if (previousSlot) delete slots[previousSlot];
      slots[slotId] = playerId;
    }
  }
  current.slots = slots;
  closeOverlays();
  save();
  render();
}

function setFormation(formation) {
  const current = team();
  const validIds = new Set((FORMATIONS[formation] || []).map((slot) => slot.id));
  current.formation = formation;
  current.slots = Object.fromEntries(
    Object.entries(current.slots).filter(([slotId]) => validIds.has(slotId))
  );
  closeOverlays();
  save();
  render();
}

function clearLineup() {
  team().slots = {};
  closeOverlays();
  save();
  render();
}

function addTeam() {
  const index = state.teams.length + 1;
  const id = uid();
  state.teams.push({ id, name: `Equipo ${index}`, formation: "4-3-3", slots: {} });
  state.activeTeamId = id;
  save();
  render();
}

function renameTeam(id, name) {
  const item = state.teams.find((teamItem) => teamItem.id === id);
  if (!item) return;
  item.name = name.trim() || item.name;
  save();
  render();
}

function deleteTeam(id) {
  if (state.teams.length === 1) {
    showToast("Deja al menos un equipo");
    return;
  }
  state.teams = state.teams.filter((item) => item.id !== id);
  if (state.activeTeamId === id) state.activeTeamId = state.teams[0].id;
  save();
  render();
}

function lineupText() {
  const current = team();
  const slots = formationSlots();
  const used = usedPlayerIds();
  const lines = slots.map((slot) => {
    const player = playerById(current.slots[slot.id]);
    return `${slot.role}: ${player ? `${player.number} ${player.name}` : "—"}`;
  });
  const bench = state.players.filter((player) => !used.has(player.id));
  return [
    `${current.name} · ${current.formation}`,
    ...lines,
    bench.length ? `Suplentes: ${bench.map((player) => player.name).join(", ")}` : "Sin suplentes",
  ].join("\n");
}

async function shareLineup() {
  const text = lineupText();
  if (navigator.share) {
    try {
      await navigator.share({ title: team().name, text });
      return;
    } catch {
      /* user cancelled or share failed */
    }
  }
  await navigator.clipboard.writeText(text);
  showToast("Alineación copiada");
}

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") el.className = value;
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === false || value == null) {
      /* skip */
    } else if (value === true) {
      el.setAttribute(key, "");
    } else {
      el.setAttribute(key, String(value));
    }
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

function plantelView() {
  const form = h("form", { class: "row" },
    h("input", { name: "name", placeholder: "Nombre del jugador", autocomplete: "off", maxlength: "24" }),
    h("input", { name: "number", type: "number", min: "1", max: "99", placeholder: "Nº", style: "max-width:72px" }),
    h("button", { class: "btn", type: "submit" }, "Agregar")
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    addPlayer(String(data.get("name") || ""), data.get("number"));
    form.reset();
    form.querySelector("input")?.focus();
  });

  const list = state.players.length
    ? h("div", { class: "player-list" },
        ...state.players.map((player) =>
          h("div", { class: "player" },
            h("div", { class: "num" }, player.number),
            h("strong", {}, player.name),
            h("button", {
              class: "icon-btn",
              onClick: () => askConfirm({
                title: `¿Eliminar a ${player.name}?`,
                message: "Se quita del plantel y de todas las alineaciones.",
                confirmLabel: "Eliminar",
                action: () => removePlayer(player.id),
              }),
              "aria-label": "Eliminar",
            }, "✕")
          )
        )
      )
    : h("p", { class: "empty" }, "Todavía no hay jugadores. Agrega nombres para armar el once.");

  return h("section", {},
    h("div", { class: "card" }, form, h("p", { class: "hint" }, "Los jugadores se guardan en este celular.")),
    list
  );
}

function canchaView() {
  const current = team();
  const slots = formationSlots();
  const used = usedPlayerIds();
  const bench = state.players.filter((player) => !used.has(player.id));

  return h("section", {},
    h("div", { class: "formations" },
      ...Object.keys(FORMATIONS).map((name) =>
        h("button", {
          class: `chip${current.formation === name ? " active" : ""}`,
          onClick: () => setFormation(name),
        }, name)
      )
    ),
    h("div", { class: "pitch-wrap" },
      h("div", { class: "pitch-lines" },
        h("div", { class: "box top" }),
        h("div", { class: "box bottom" })
      ),
      ...slots.map((slot) => {
        const player = playerById(current.slots[slot.id]);
        return h("button", {
          class: `slot ${player ? "filled" : "empty"}`,
          style: `left:${slot.x}%;top:${slot.y}%`,
          onClick: () => {
            state.pickerSlot = slot.id;
            render();
          },
        },
          h("div", { class: "avatar" }, player ? player.number : "+"),
          h("span", { class: "name" }, player ? player.name : slot.role)
        );
      })
    ),
    h("div", { class: "actions" },
      h("button", { class: "btn ghost", onClick: shareLineup }, "Compartir"),
      h("button", {
        class: "btn ghost",
        onClick: () => askConfirm({
          title: "¿Limpiar el once?",
          message: "Los jugadores vuelven a la banca.",
          confirmLabel: "Limpiar",
          action: clearLineup,
        }),
      }, "Limpiar once")
    ),
    h("div", { class: "bench" },
      h("h3", {}, "Banca"),
      bench.length
        ? h("div", { class: "pills" }, ...bench.map((player) => h("span", { class: "pill" }, `${player.number} ${player.name}`)))
        : h("p", { class: "hint" }, state.players.length ? "Todos están en cancha." : "Agrega jugadores en la pestaña Plantel.")
    )
  );
}

function equiposView() {
  const form = h("div", { class: "row", style: "margin-bottom:12px" },
    h("button", { class: "btn", onClick: addTeam }, "Nuevo equipo")
  );

  return h("section", {},
    form,
    ...state.teams.map((item) => {
      const nameInput = h("input", { value: item.name });
      nameInput.addEventListener("change", () => renameTeam(item.id, nameInput.value));
      return h("div", { class: "card team-item" },
        h("button", {
          class: item.id === state.activeTeamId ? "btn" : "btn ghost",
          onClick: () => {
            state.activeTeamId = item.id;
            save();
            setTab("cancha");
          },
        }, "Usar"),
        nameInput,
        h("button", {
          class: "btn danger",
          onClick: () => {
            if (state.teams.length === 1) {
              showToast("Deja al menos un equipo");
              return;
            }
            askConfirm({
              title: `¿Borrar ${item.name}?`,
              message: "Se pierde esa alineación. El plantel no se borra.",
              confirmLabel: "Borrar",
              action: () => deleteTeam(item.id),
            });
          },
        }, "Borrar")
      );
    })
  );
}

function picker() {
  if (!state.pickerSlot) return null;
  const slot = slotById(state.pickerSlot);
  const currentId = team().slots[state.pickerSlot];
  const onPitch = [];
  const bench = [];
  for (const player of state.players) {
    const placed = slotIdOfPlayer(player.id);
    if (placed) onPitch.push({ player, placed });
    else bench.push(player);
  }

  const choice = (player, hint) => {
    const isCurrent = player.id === currentId;
    return h("button", {
      class: `choice${isCurrent ? " current" : ""}`,
      onClick: () => assign(state.pickerSlot, player.id),
    },
      h("span", {}, player.name),
      h("span", { class: "choice-meta" }, `${hint} · ${player.number}`)
    );
  };

  return h("div", { class: "sheet", onClick: (event) => {
      if (event.target.classList.contains("sheet")) {
        closeOverlays();
        render();
      }
    } },
    h("div", { class: "sheet-card" },
      h("h2", {}, slot ? `Elegir para ${slot.role}` : "Elegir jugador"),
      currentId && h("button", { class: "choice", onClick: () => assign(state.pickerSlot, null) }, "Quitar de la posición"),
      state.players.length === 0
        ? h("p", { class: "empty" }, "No hay jugadores. Agrégalos en Plantel.")
        : [
            onPitch.length ? h("h3", { class: "section-title" }, "En cancha · toca para mover o intercambiar") : null,
            ...onPitch.map(({ player, placed }) =>
              choice(player, player.id === currentId ? "Aquí" : (slotById(placed)?.role || "Cancha"))
            ),
            bench.length ? h("h3", { class: "section-title" }, "Banca") : null,
            ...bench.map((player) => choice(player, "Banca")),
          ],
      h("button", {
        class: "btn ghost",
        style: "width:100%;margin-top:8px",
        onClick: () => { closeOverlays(); render(); },
      }, "Cerrar")
    )
  );
}

function confirmDialog() {
  if (!state.confirm) return null;
  const { title, message, confirmLabel } = state.confirm;
  return h("div", { class: "sheet", onClick: (event) => {
      if (event.target.classList.contains("sheet")) {
        closeOverlays();
        render();
      }
    } },
    h("div", { class: "sheet-card" },
      h("h2", {}, title),
      message && h("p", { class: "hint" }, message),
      h("div", { class: "actions" },
        h("button", { class: "btn ghost", onClick: () => { closeOverlays(); render(); } }, "Cancelar"),
        h("button", {
          class: "btn danger",
          onClick: () => {
            const action = state.confirm?.action;
            closeOverlays();
            if (action) action();
            else render();
          },
        }, confirmLabel || "Confirmar")
      )
    )
  );
}

function render() {
  const root = document.querySelector("#app");
  const current = team();
  const views = { plantel: plantelView, cancha: canchaView, equipos: equiposView };
  root.replaceChildren(
    h("header", { class: "topbar" },
      h("div", { class: "brand" },
        h("h1", {}, "Alineaciones"),
        h("span", {}, "Arma tu once y compártelo")
      ),
      h("select", {
        class: "team-select",
        onChange: (event) => {
          state.activeTeamId = event.target.value;
          save();
          render();
        },
      }, ...state.teams.map((item) => {
        const option = h("option", { value: item.id }, item.name);
        if (item.id === current.id) option.selected = true;
        return option;
      }))
    ),
    h("nav", { class: "tabs" },
      ["plantel", "cancha", "equipos"].map((tab) =>
        h("button", {
          class: `tab${state.tab === tab ? " active" : ""}`,
          onClick: () => setTab(tab),
        }, tab[0].toUpperCase() + tab.slice(1))
      )
    ),
    h("main", { class: "view" }, views[state.tab]()),
    picker(),
    confirmDialog(),
    state.toast && h("div", { class: "toast" }, state.toast)
  );
}

render();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
