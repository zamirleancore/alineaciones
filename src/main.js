import "./style.css";

const STORAGE_KEY = "alineaciones-v1";
const MAX_SUBS = 7;
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

const TABS = [
  { id: "plantel", label: "Plantel" },
  { id: "cancha", label: "Cancha" },
  { id: "listas", label: "Listas" },
];

const uid = () => crypto.randomUUID();

function defaultState() {
  const teamId = uid();
  return {
    tab: "cancha",
    pickerSlot: null,
    pickerQuery: "",
    benchPlayerId: null,
    editingPlayerId: null,
    confirm: null,
    toast: "",
    exclusivePlayers: false,
    players: [],
    teams: [{ id: teamId, name: "Titulares", formation: "4-3-3", slots: {}, subs: [] }],
    activeTeamId: teamId,
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return defaultState();
    const next = {
      ...defaultState(),
      ...saved,
      pickerSlot: null,
      pickerQuery: "",
      benchPlayerId: null,
      editingPlayerId: null,
      confirm: null,
      toast: "",
    };
    if (next.tab === "equipos") next.tab = "listas";
    return next;
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
      exclusivePlayers: state.exclusivePlayers,
    })
  );
}

function normalizeTeams() {
  let changed = false;
  const playerIds = new Set(state.players.map((player) => player.id));
  for (const item of state.teams) {
    const valid = new Set((FORMATIONS[item.formation] || FORMATIONS["4-3-3"]).map((slot) => slot.id));
    const nextSlots = Object.fromEntries(
      Object.entries(item.slots || {}).filter(([slotId, playerId]) => valid.has(slotId) && playerIds.has(playerId))
    );
    const starters = new Set(Object.values(nextSlots));
    const nextSubs = (item.subs || []).filter((id) => playerIds.has(id) && !starters.has(id));
    if (JSON.stringify(item.slots) !== JSON.stringify(nextSlots) || JSON.stringify(item.subs || []) !== JSON.stringify(nextSubs)) {
      changed = true;
    }
    item.slots = nextSlots;
    item.subs = nextSubs;
  }
  if (changed) save();
}

normalizeTeams();

function team() {
  return state.teams.find((item) => item.id === state.activeTeamId) || state.teams[0];
}

function playerById(id) {
  return state.players.find((player) => player.id === id);
}

function formationSlots(item = team()) {
  return FORMATIONS[item?.formation] || FORMATIONS["4-3-3"];
}

function slotById(slotId) {
  return formationSlots().find((slot) => slot.id === slotId);
}

function slotIdOfPlayer(playerId, item = team()) {
  return Object.keys(item.slots || {}).find((key) => item.slots[key] === playerId) || null;
}

function usedPlayerIds(item = team()) {
  const valid = new Set(formationSlots(item).map((slot) => slot.id));
  return new Set(
    Object.entries(item.slots || {})
      .filter(([slotId, playerId]) => playerId && valid.has(slotId))
      .map(([, playerId]) => playerId)
  );
}

function otherLineupName(playerId) {
  for (const item of state.teams) {
    if (item.id === team().id) continue;
    if (usedPlayerIds(item).has(playerId)) return item.name;
  }
  return null;
}

function nextNumber() {
  const used = new Set(state.players.map((player) => player.number));
  for (let n = 1; n <= 99; n += 1) {
    if (!used.has(n)) return n;
  }
  return 99;
}

function numberOwner(num, exceptId) {
  return state.players.find((player) => player.number === num && player.id !== exceptId);
}

function parseJersey(value, exceptId) {
  if (value === "" || value == null) return nextNumber();
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 99) {
    showToast("El número debe ser entre 1 y 99");
    return null;
  }
  const owner = numberOwner(num, exceptId);
  if (owner) {
    showToast(`El ${num} ya lo tiene ${owner.name}`);
    return null;
  }
  return num;
}

function showToast(message) {
  state.toast = message;
  const root = document.querySelector("#app");
  document.querySelector(".toast")?.remove();
  if (root) root.append(h("div", { class: "toast" }, message));
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      document.querySelector(".toast")?.remove();
    }
  }, 1800);
}

function closeOverlays() {
  state.pickerSlot = null;
  state.pickerQuery = "";
  state.benchPlayerId = null;
  state.editingPlayerId = null;
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

function matchesQuery(player, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return player.name.toLowerCase().includes(needle) || String(player.number).includes(needle);
}

function addPlayer(name, number) {
  const clean = name.trim();
  if (!clean) {
    showToast("Escribe un nombre");
    return false;
  }
  const jersey = parseJersey(number);
  if (jersey == null) return false;
  state.players.push({ id: uid(), name: clean, number: jersey });
  save();
  render();
  return true;
}

function editPlayer(id, name, number) {
  const player = playerById(id);
  if (!player) return false;
  const clean = name.trim();
  if (!clean) {
    showToast("Escribe un nombre");
    return false;
  }
  const jersey = parseJersey(number, id);
  if (jersey == null) return false;
  player.name = clean;
  player.number = jersey;
  closeOverlays();
  save();
  render();
  return true;
}

function removePlayer(id) {
  state.players = state.players.filter((player) => player.id !== id);
  state.teams = state.teams.map((item) => ({
    ...item,
    slots: Object.fromEntries(Object.entries(item.slots || {}).filter(([, playerId]) => playerId !== id)),
    subs: (item.subs || []).filter((playerId) => playerId !== id),
  }));
  save();
  render();
}

function dropFromSubs(item, playerId) {
  item.subs = (item.subs || []).filter((id) => id !== playerId);
}

function assign(slotId, playerId) {
  const current = team();
  if (playerId && state.exclusivePlayers) {
    const other = otherLineupName(playerId);
    if (other) {
      showToast(`Ya está en ${other}`);
      return;
    }
  }
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
    dropFromSubs(current, playerId);
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

function toggleSub(playerId) {
  const current = team();
  current.subs = current.subs || [];
  if (usedPlayerIds().has(playerId)) return;
  if (current.subs.includes(playerId)) {
    current.subs = current.subs.filter((id) => id !== playerId);
  } else if (current.subs.length >= MAX_SUBS) {
    showToast(`Máximo ${MAX_SUBS} suplentes`);
    return;
  } else {
    current.subs.push(playerId);
  }
  save();
}

function addTeam() {
  const index = state.teams.length + 1;
  const id = uid();
  state.teams.push({
    id,
    name: index === 1 ? "Titulares" : `Alineación ${index}`,
    formation: "4-3-3",
    slots: {},
    subs: [],
  });
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
    showToast("Deja al menos una alineación");
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
  const lines = slots.map((slot) => {
    const player = playerById(current.slots[slot.id]);
    return `${slot.role}: ${player ? `${player.number} ${player.name}` : "—"}`;
  });
  const subs = (current.subs || []).map(playerById).filter(Boolean);
  return [
    `${current.name} · ${current.formation}`,
    "Titulares",
    ...lines,
    subs.length
      ? `Suplentes: ${subs.map((player) => `${player.number} ${player.name}`).join(", ")}`
      : "Sin suplentes convocados",
  ].join("\n");
}

async function shareLineup() {
  const text = lineupText();
  if (navigator.share) {
    try {
      await navigator.share({ title: team().name, text });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("Alineación copiada");
  } catch {
    showToast("No se pudo compartir");
  }
}

function backupPayload() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    exclusivePlayers: state.exclusivePlayers,
    players: state.players,
    teams: state.teams,
    activeTeamId: state.activeTeamId,
  };
}

async function exportBackup() {
  const text = JSON.stringify(backupPayload(), null, 2);
  const file = new File([text], "alineaciones.json", { type: "application/json" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Alineaciones" });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "alineaciones.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Archivo descargado");
}

function applyBackup(data) {
  if (!Array.isArray(data.players) || !Array.isArray(data.teams) || data.teams.length === 0) {
    showToast("El archivo no es válido");
    return;
  }
  state.players = data.players;
  state.teams = data.teams;
  state.activeTeamId = data.activeTeamId || data.teams[0].id;
  state.exclusivePlayers = Boolean(data.exclusivePlayers);
  closeOverlays();
  normalizeTeams();
  save();
  render();
  showToast("Plantel restaurado");
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || ""));
      askConfirm({
        title: "¿Reemplazar todo?",
        message: "Se borra el plantel actual de este celular y se carga el archivo.",
        confirmLabel: "Importar",
        action: () => applyBackup(data),
      });
    } catch {
      showToast("No se pudo leer el archivo");
    }
  };
  reader.readAsText(file);
}

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") el.className = value;
    else if (key === "checked" || key === "value" || key === "selected") el[key] = value;
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

function sheet(title, body) {
  return h("div", {
    class: "sheet",
    onClick: (event) => {
      if (event.target.classList.contains("sheet")) {
        closeOverlays();
        render();
      }
    },
  },
    h("div", { class: "sheet-card" },
      h("h2", {}, title),
      body,
      h("button", {
        class: "btn ghost",
        style: "width:100%;margin-top:8px",
        onClick: () => { closeOverlays(); render(); },
      }, "Cerrar")
    )
  );
}

function plantelView() {
  const form = h("form", { class: "row" },
    h("input", { name: "name", placeholder: "Nombre del jugador", autocomplete: "off", maxlength: "24" }),
    h("input", { name: "number", type: "number", min: "1", max: "99", placeholder: "Nº", inputmode: "numeric", style: "max-width:72px" }),
    h("button", { class: "btn", type: "submit" }, "Agregar")
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    if (addPlayer(String(data.get("name") || ""), data.get("number"))) {
      form.reset();
      form.querySelector("input")?.focus();
    }
  });

  const list = state.players.length
    ? h("div", { class: "player-list" },
        ...state.players.map((player) =>
          h("div", { class: "player" },
            h("button", {
              class: "player-main",
              onClick: () => {
                closeOverlays();
                state.editingPlayerId = player.id;
                render();
              },
            },
              h("div", { class: "num" }, player.number),
              h("strong", {}, player.name)
            ),
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
    h("div", { class: "card" },
      form,
      h("p", { class: "hint" }, "Toca un jugador para editarlo. Los datos se quedan en este celular.")
    ),
    list
  );
}

function canchaView() {
  const current = team();
  const slots = formationSlots();
  const used = usedPlayerIds();
  const bench = state.players.filter((player) => !used.has(player.id));
  const subSet = new Set(current.subs || []);

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
            if (state.benchPlayerId) {
              assign(slot.id, state.benchPlayerId);
              return;
            }
            closeOverlays();
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
          message: "Los titulares vuelven a la banca. Los suplentes convocados se quedan.",
          confirmLabel: "Limpiar",
          action: clearLineup,
        }),
      }, "Limpiar once")
    ),
    h("div", { class: "bench" },
      h("h3", {}, `Banca · ${subSet.size}/${MAX_SUBS} suplentes`),
      bench.length
        ? h("div", { class: "pills" },
            ...bench.map((player) =>
              h("button", {
                class: `pill${subSet.has(player.id) ? " sub" : ""}`,
                onClick: () => {
                  closeOverlays();
                  state.benchPlayerId = player.id;
                  render();
                },
              }, `${player.number} ${player.name}${subSet.has(player.id) ? " · S" : ""}`)
            )
          )
        : h("p", { class: "hint" }, state.players.length ? "Todos están en cancha." : "Agrega jugadores en la pestaña Plantel."),
      bench.length ? h("p", { class: "hint" }, "Toca a alguien de la banca para ponerlo en cancha o marcarlo como suplente.") : null
    )
  );
}

function listasView() {
  const fileInput = h("input", {
    type: "file",
    accept: "application/json",
    style: "display:none",
    onChange: (event) => {
      const file = event.target.files?.[0];
      if (file) importBackup(file);
      event.target.value = "";
    },
  });

  return h("section", {},
    h("div", { class: "card", style: "margin-bottom:12px" },
      h("p", { class: "hint", style: "margin-top:0" },
        "El plantel es el mismo para todas las listas. Crea una para titulares y otra para el alternativo, o dos equipos del partido."
      ),
      h("label", { class: "toggle" },
        h("input", {
          type: "checkbox",
          checked: state.exclusivePlayers,
          onChange: (event) => {
            state.exclusivePlayers = event.target.checked;
            save();
            render();
          },
        }),
        h("span", {}, "Un jugador no puede estar en dos listas")
      )
    ),
    h("div", { class: "row", style: "margin-bottom:12px" },
      h("button", { class: "btn", onClick: addTeam }, "Nueva lista")
    ),
    ...state.teams.map((item) => {
      const nameInput = h("input", { value: item.name, maxlength: "28" });
      nameInput.addEventListener("change", () => renameTeam(item.id, nameInput.value));
      const starters = usedPlayerIds(item).size;
      return h("div", { class: "card team-item" },
        h("button", {
          class: item.id === state.activeTeamId ? "btn" : "btn ghost",
          onClick: () => {
            state.activeTeamId = item.id;
            save();
            setTab("cancha");
          },
        }, "Usar"),
        h("div", { class: "team-meta" },
          nameInput,
          h("span", { class: "hint" }, `${item.formation} · ${starters}/11 · ${(item.subs || []).length} supl.`)
        ),
        h("button", {
          class: "btn danger",
          onClick: () => {
            if (state.teams.length === 1) {
              showToast("Deja al menos una alineación");
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
    }),
    h("div", { class: "actions" },
      h("button", { class: "btn ghost", onClick: exportBackup }, "Exportar"),
      h("button", { class: "btn ghost", onClick: () => fileInput.click() }, "Importar"),
      fileInput
    )
  );
}

function picker() {
  if (!state.pickerSlot) return null;
  const slot = slotById(state.pickerSlot);
  const currentId = team().slots[state.pickerSlot];
  const query = state.pickerQuery;
  const onPitch = [];
  const bench = [];
  const locked = [];
  for (const player of state.players) {
    if (!matchesQuery(player, query)) continue;
    const placed = slotIdOfPlayer(player.id);
    const other = state.exclusivePlayers ? otherLineupName(player.id) : null;
    if (other && !placed) locked.push({ player, other });
    else if (placed) onPitch.push({ player, placed });
    else bench.push(player);
  }

  const choice = (player, hint, blocked) =>
    h("button", {
      class: `choice${player.id === currentId ? " current" : ""}${blocked ? " disabled" : ""}`,
      onClick: () => {
        if (blocked) {
          showToast(`Ya está en ${hint}`);
          return;
        }
        assign(state.pickerSlot, player.id);
      },
    },
      h("span", {}, player.name),
      h("span", { class: "choice-meta" }, `${hint} · ${player.number}`)
    );

  const search = h("input", {
    class: "field",
    name: "picker-search",
    placeholder: "Buscar nombre o número",
    value: query,
    autocomplete: "off",
    onInput: (event) => {
      state.pickerQuery = event.target.value;
      render();
    },
  });

  return sheet(slot ? `Elegir para ${slot.role}` : "Elegir jugador",
    h("div", {},
      search,
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
            locked.length ? h("h3", { class: "section-title" }, "En otra lista") : null,
            ...locked.map(({ player, other }) => choice(player, other, true)),
            !onPitch.length && !bench.length && !locked.length
              ? h("p", { class: "empty" }, "Nadie coincide con esa búsqueda.")
              : null,
          ]
    )
  );
}

function benchSheet() {
  const player = playerById(state.benchPlayerId);
  if (!player) return null;
  const current = team();
  const isSub = (current.subs || []).includes(player.id);
  const other = state.exclusivePlayers ? otherLineupName(player.id) : null;
  return sheet(`${player.number} ${player.name}`,
    h("div", {},
      other && h("p", { class: "hint", style: "margin-top:0" }, `Ya está en ${other}.`),
      ...formationSlots().map((slot) => {
        const occupant = playerById(current.slots[slot.id]);
        return h("button", {
          class: "choice",
          onClick: () => assign(slot.id, player.id),
        },
          h("span", {}, occupant ? `Cambiar por ${occupant.name}` : `Poner de ${slot.role}`),
          h("span", { class: "choice-meta" }, slot.role)
        );
      }),
      h("button", {
        class: `choice${isSub ? " current" : ""}`,
        onClick: () => {
          const before = (team().subs || []).length;
          toggleSub(player.id);
          if ((team().subs || []).length === before && !isSub) return;
          closeOverlays();
          render();
        },
      }, isSub ? "Quitar de suplentes convocados" : `Marcar suplente (${(current.subs || []).length}/${MAX_SUBS})`)
    )
  );
}

function editorSheet() {
  const player = playerById(state.editingPlayerId);
  if (!player) return null;
  const form = h("form", {},
    h("input", { class: "field", name: "edit-name", value: player.name, maxlength: "24", autocomplete: "off" }),
    h("div", { class: "row", style: "margin-top:8px" },
      h("input", { class: "field", name: "edit-number", type: "number", min: "1", max: "99", value: String(player.number), inputmode: "numeric" }),
      h("button", { class: "btn", type: "submit" }, "Guardar")
    )
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    editPlayer(player.id, String(data.get("edit-name") || ""), data.get("edit-number"));
  });
  return sheet("Editar jugador", form);
}

function confirmDialog() {
  if (!state.confirm) return null;
  const { title, message, confirmLabel } = state.confirm;
  return h("div", {
    class: "sheet",
    onClick: (event) => {
      if (event.target.classList.contains("sheet")) {
        closeOverlays();
        render();
      }
    },
  },
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
  const active = document.activeElement;
  const focusName = active?.getAttribute?.("name");
  const selection = typeof active?.selectionStart === "number" ? active.selectionStart : null;
  const views = { plantel: plantelView, cancha: canchaView, listas: listasView };
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
      TABS.map((tab) =>
        h("button", {
          class: `tab${state.tab === tab.id ? " active" : ""}`,
          onClick: () => setTab(tab.id),
        }, tab.label)
      )
    ),
    h("main", { class: "view" }, (views[state.tab] || canchaView)()),
    picker(),
    benchSheet(),
    editorSheet(),
    confirmDialog(),
    state.toast && h("div", { class: "toast" }, state.toast)
  );
  if (focusName) {
    const next = root.querySelector(`[name="${focusName}"]`);
    if (next) {
      next.focus();
      if (selection != null && next.setSelectionRange) {
        try { next.setSelectionRange(selection, selection); } catch { /* not a text field */ }
      }
    }
  }
}

render();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
