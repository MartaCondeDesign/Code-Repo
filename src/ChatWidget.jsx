import { useEffect, useMemo, useRef, useState } from "react";

const STOP = new Set([
  "donde", "dónde", "where", "estan", "están", "está", "esta", "hay", "tiene",
  "repo", "el", "la", "los", "las", "de", "me", "que", "en", "del", "a", "para",
  "por", "con", "al", "un", "una", "y", "o", "se", "lo", "como", "cómo", "puedo",
  "buscar", "quien", "quién", "cual", "cuál", "es", "son", "tus", "sus", "mis",
]);

function collect(data) {
  const N = data.nodes || [];
  const byTag = (...ts) => N.filter((n) => ts.includes(n.tag));
  const unique = (list) => {
    const seen = new Set();
    return list.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  };
  const clean = (list) => list.filter((n) => !["rule", "skill", "doc", "audit"].includes(n.tag));
  return {
    comps: byTag("component", "code", "asset").filter((n) => !/stor/i.test(n.title + " " + n.sub)),
    toks: byTag("token"),
    stories: unique(byTag("story").concat(clean(N.filter((n) => /stor|storybook/i.test(n.title + " " + n.sub))))),
    docs: byTag("rule", "skill", "doc"),
    scripts: byTag("tool", "audit"),
    skills: byTag("skill"),
    icons: clean(N.filter((n) => /icon/i.test(n.title + " " + n.sub))),
    config: byTag("config"),
  };
}

function describe(data, es) {
  const c = collect(data);
  const parts = [
    [c.comps.length, es ? "componentes" : "components"],
    [c.toks.length, "tokens"],
    [c.stories.length, "stories"],
    [c.docs.length, es ? "docs/reglas" : "docs/rules"],
    [c.scripts.length, es ? "scripts/tooling" : "scripts/tooling"],
    [c.config.length, "config"],
  ].filter(([n]) => n > 0);
  if (!parts.length) return es ? "nada detectable" : "nothing detectable";
  return parts.map(([n, name]) => `${n} ${name}`).join(", ");
}

function folderList(list) {
  return [...new Set(list.map((n) => n.sub).filter(Boolean))].join(", ");
}

function targets(list, cap = 10) {
  return list.slice(0, cap).map((n) => n.id);
}

function ask(question, data, lang) {
  const es = lang === "es";
  const q = question.toLowerCase();
  const c = collect(data);

  if (/hola|hello|\bhi\b|hey/.test(q)) {
    return {
      targets: [],
      text: es
        ? "¡Hola! Pregúntame dónde está cada parte del sistema: componentes, tokens, stories, docs, scripts…"
        : "Hi! Ask me where each part of the system lives: components, tokens, stories, docs, scripts…",
    };
  }
  if (/ayuda|help|qu[eé] puedes|what can/.test(q)) {
    return {
      targets: [],
      text: es
        ? "Puedes preguntarme cosas como: «¿dónde están los componentes?», «¿este repo tiene tokens?» o «¿dónde está el theme?»."
        : "Try asking: «where are the components?», «does this repo have tokens?» or «where is the theme?».",
    };
  }

  if (/component/.test(q)) {
    if (!c.comps.length) {
      return {
        targets: [],
        text: es
          ? `No he detectado componentes de design system en este repo. Lo que tiene es: ${describe(data, true)}.`
          : `No design system components detected in this repo. What it has is: ${describe(data, false)}.`,
      };
    }
    return {
      targets: targets(c.comps),
      text: es
        ? `Los componentes (${c.comps.length}) están en: ${folderList(c.comps)}. Toca un botón para ir directo.`
        : `Components (${c.comps.length}) live in: ${folderList(c.comps)}. Tap a button to go straight there.`,
    };
  }
  if (/token|variable/.test(q)) {
    if (!c.toks.length) {
      return {
        targets: [],
        text: es
          ? `Este repo no tiene tokens definidos. Lo que tiene es: ${describe(data, true)}.`
          : `This repo has no tokens defined. What it has is: ${describe(data, false)}.`,
      };
    }
    return {
      targets: targets(c.toks),
      text: es
        ? `Los tokens (${c.toks.length}) están en: ${folderList(c.toks)}. Toca un botón para ir directo.`
        : `Tokens (${c.toks.length}) live in: ${folderList(c.toks)}. Tap a button to go straight there.`,
    };
  }
  if (/icon/.test(q)) {
    if (!c.icons.length) {
      return {
        targets: [],
        text: es
          ? "No he detectado una página o set de iconos separado en este repo."
          : "I didn't detect a separate icons page or set in this repo.",
      };
    }
    return {
      targets: targets(c.icons),
      text: es ? `Los iconos están en: ${folderList(c.icons)}.` : `Icons live in: ${folderList(c.icons)}.`,
    };
  }
  if (/stor|storybook/.test(q)) {
    if (!c.stories.length) {
      return {
        targets: [],
        text: es ? "No hay stories de Storybook en este repo." : "There are no Storybook stories in this repo.",
      };
    }
    return {
      targets: targets(c.stories),
      text: es
        ? `Las stories (${c.stories.length}) están en: ${folderList(c.stories)}. Toca un botón para ir directo.`
        : `Stories (${c.stories.length}) live in: ${folderList(c.stories)}. Tap a button to go straight there.`,
    };
  }
  if (/doc|documentaci|readme/.test(q)) {
    if (!c.docs.length) {
      return { targets: [], text: es ? "No hay docs detectados." : "No docs detected." };
    }
    return {
      targets: targets(c.docs),
      text: es
        ? `Docs y reglas (${c.docs.length}) están en: ${folderList(c.docs)}. Toca un botón para ir directo.`
        : `Docs & rules (${c.docs.length}) live in: ${folderList(c.docs)}. Tap a button to go straight there.`,
    };
  }
  if (/script|automaci|tooling/.test(q)) {
    if (!c.scripts.length) {
      return {
        targets: [],
        text: es ? "No hay scripts de automatización detectados." : "No automation scripts detected.",
      };
    }
    return {
      targets: targets(c.scripts),
      text: es
        ? `Los scripts (${c.scripts.length}) están en: ${folderList(c.scripts)}. Toca un botón para ir directo.`
        : `Scripts (${c.scripts.length}) live in: ${folderList(c.scripts)}. Tap a button to go straight there.`,
    };
  }
  if (/skill/.test(q)) {
    if (!c.skills.length) {
      return { targets: [], text: es ? "No hay skills de Claude en este repo." : "No Claude skills in this repo." };
    }
    return {
      targets: targets(c.skills),
      text: es ? `Los skills están en: ${folderList(c.skills)}.` : `Skills live in: ${folderList(c.skills)}.`,
    };
  }
  if (/cuant|how many|n[uú]mero/.test(q)) {
    return {
      targets: [],
      text: es ? `Este repo tiene: ${describe(data, true)}.` : `This repo has: ${describe(data, false)}.`,
    };
  }

  const words = q
    .toLowerCase()
    .split(/[^a-z0-9áéíóúñü.]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  for (const w of words) {
    const hit = (data.nodes || []).find((n) => n.title.toLowerCase().includes(w));
    if (hit) {
      return {
        targets: [hit.id],
        text: es ? `"${hit.title}" está en ${hit.sub}.` : `"${hit.title}" lives in ${hit.sub}.`,
      };
    }
  }
  return {
    targets: [],
    text: es
      ? `No lo tengo claro. Este repo contiene: ${describe(data, true)}. Pregúntame por componentes, tokens, stories, docs, scripts o skills.`
      : `Not sure. This repo contains: ${describe(data, false)}. Ask about components, tokens, stories, docs, scripts or skills.`,
  };
}

function Msg({ role, text, targets, onSelect, titleById, lang }) {
  return (
    <div className={"chat-msg " + role}>
      {text}
      {role === "bot" && targets.length > 0 && (
        <div className="chat-targets">
          {targets.map((id) => (
            <button key={id} className="chat-target" onClick={() => onSelect(id)}>
              <span>{titleById[id] || (lang === "es" ? "Ver tarjeta" : "See card")}</span>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatWidget({ data, lang, onSelectNode }) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const bodyRef = useRef(null);
  const lastRepo = useRef(null);

  const titleById = useMemo(() => {
    const m = {};
    for (const n of data.nodes || []) m[n.id] = n.title;
    return m;
  }, [data]);

  useEffect(() => {
    const name = data && data.repoName;
    if (name !== lastRepo.current) {
      lastRepo.current = name;
      setMessages(
        name
          ? [
              {
                role: "bot",
                targets: [],
                text:
                  lang === "es"
                    ? `Analicé ${name}. Pregúntame dónde está cada parte: componentes, tokens, stories, docs, scripts…`
                    : `I analyzed ${name}. Ask me where each part lives: components, tokens, stories, docs, scripts…`,
              },
            ]
          : []
      );
    }
  }, [data, lang]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const reply = ask(q, data, lang);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: q, targets: [] },
      { ...reply, role: "bot" },
    ]);
    setInput("");
  };

  const selectTarget = (id) => {
    setOpen(false);
    onSelectNode(id);
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <span>DS Map · chat</span>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              ×
            </button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.length === 0 && (
              <Msg
                role="bot"
                targets={[]}
                lang={lang}
                titleById={titleById}
                onSelect={selectTarget}
                text={
                  lang === "es"
                    ? "Pregúntame dónde está cada parte del sistema (componentes, tokens, stories, docs, scripts)."
                    : "Ask me where each part of the system lives (components, tokens, stories, docs, scripts)."
                }
              />
            )}
            {messages.map((m, i) => (
              <Msg key={i} role={m.role} text={m.text} targets={m.targets} onSelect={selectTarget} titleById={titleById} lang={lang} />
            ))}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              value={input}
              placeholder={lang === "es" ? "¿Dónde están los componentes?" : "Where are the components?"}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              spellCheck={false}
            />
            <button className="chat-send" onClick={send}>
              ↵
            </button>
          </div>
        </div>
      )}
      {!open && (
        <button className="chat-toggle" onClick={() => setOpen(true)} aria-label="Abrir chat">
          ?
        </button>
      )}
    </div>
  );
}
