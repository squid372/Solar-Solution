// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e4;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e4) => {
  const o5 = 1 === t4.length ? t4[0] : e4.reduce((e5, s4, o6) => e5 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o6 + 1], t4[0]);
  return new n(o5, t4, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e4 = "";
  for (const s4 of t5.cssRules) e4 += s4.cssText;
  return r(e4);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e4, set: r5 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r5?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e4 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e4) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e4 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t4);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t5 = i5.getPropertyOptions(e4), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e4;
      const r5 = h3.fromAttribute(s4, t5.type);
      this[e4] = r5 ?? this._$Ej?.get(e4) ?? r5, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e4 = false, h3) {
    if (void 0 !== t4) {
      const r5 = this.constructor;
      if (false === e4 && (h3 = this[t4]), i5 ??= r5.getPropertyOptions(t4), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r5._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r5) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r5 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r5) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e4 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e4 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e4) {
    let r5;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r5 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r5.nodeType) {
        if (r5.hasAttributes()) for (const t5 of r5.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r5.getAttribute(t5).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r5.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r5.removeAttribute(t5));
        if (y2.test(r5.tagName)) {
          const t5 = r5.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r5.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r5.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r5.append(t5[i6], c3());
          }
        }
      } else if (8 === r5.nodeType) if (r5.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r5.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t4), h3._$AT(t4, s4, e4)), void 0 !== e4 ? (s4._$Co ??= [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r5 = s4[0];
    for (; void 0 !== r5; ) {
      if (o5 === r5.index) {
        let i6;
        2 === r5.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r5.type ? i6 = new r5.ctor(h3, r5.name, r5.strings, this, t4) : 6 === r5.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r5 = s4[++n4];
      }
      o5 !== r5?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e4 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t5 = new R(e4, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t4) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o5 = !a2(t4) || t4 !== this._$AH && t4 !== E, o5 && (this._$AH = t4);
    else {
      const e5 = t4;
      let n4, r5;
      for (t4 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r5 = M(this, e5[s4 + n4], i5, n4), r5 === E && (r5 = this._$AH[n4]), o5 ||= !a2(r5) || r5 !== this._$AH[n4], r5 === A ? t4 = A : t4 !== A && (t4 += (r5 ?? "") + h3[n4 + 1]), this._$AH[n4] = r5;
    }
    o5 && !e4 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e4, h3) {
    super(t4, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t4, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r5 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r5, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// src/helpers/globals.ts
var globalData = {
  hass: null,
  // Neon glow / comet-trail flow effects (opt-in via the `glow` card config).
  // Set once per render by the card so the shared flow helpers can self-gate
  // without threading the flag through every call site.
  glow: false,
  glowIntensity: 2,
  // When the user prefers reduced motion, the flow helpers drop the extra
  // SMIL-animated elements (comet trails, moving hot-core) that CSS media
  // queries can't pause.
  reducedMotion: false,
  // Battery state-of-charge ring (a glow feature). On by default; can be
  // disabled via the `soc_ring` config without turning off the rest of glow.
  socRing: true
};

// src/helpers/render-glow-defs.ts
var renderGlowDefs = (enabled, intensity = 2) => {
  if (!enabled) {
    return w``;
  }
  const k2 = Number.isFinite(intensity) && intensity > 0 ? intensity : 2;
  const dotBlur = Math.min(1.4 + k2 * 0.9, 6).toFixed(2);
  const nodeBlur = Math.min(1 + k2 * 0.8, 5).toFixed(2);
  return w`
		<defs>
			<filter id="ss-glow-dot" x="-150%" y="-150%" width="400%" height="400%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${dotBlur}" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="b" />
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
			<filter id="ss-glow-node" x="-80%" y="-80%" width="260%" height="260%">
				<feGaussianBlur in="SourceGraphic" stdDeviation="${nodeBlur}" result="b" />
				<feMerge>
					<feMergeNode in="b" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>
	`;
};

// src/const.ts
var unitOfEnergyConversionRules = {
  ["Wh" /* WATT_HOUR */]: [
    { threshold: 1e6, divisor: 1e6, targetUnit: "MWh" /* MEGA_WATT_HOUR */ },
    {
      threshold: 1e3,
      divisor: 1e3,
      targetUnit: "kWh" /* KILO_WATT_HOUR */,
      decimal: 1
    }
  ],
  ["kWh" /* KILO_WATT_HOUR */]: [
    {
      threshold: 1e3,
      divisor: 1e3,
      targetUnit: "MWh" /* MEGA_WATT_HOUR */,
      decimal: 2
    }
  ],
  ["MWh" /* MEGA_WATT_HOUR */]: [],
  ["GJ" /* GIGA_JOULE */]: [
    { threshold: 1e3, divisor: 1e3, targetUnit: "MJ" /* MEGA_JOULE */ }
  ],
  ["MJ" /* MEGA_JOULE */]: [],
  ["W" /* WATT */]: [
    { threshold: 1e6, divisor: 1e6, targetUnit: "MW" /* MEGA_WATT */ },
    {
      threshold: 1e3,
      divisor: 1e3,
      targetUnit: "kW" /* KILO_WATT */
    }
  ],
  ["kW" /* KILO_WATT */]: [
    {
      threshold: 1e3,
      divisor: 1e3,
      targetUnit: "MW" /* MEGA_WATT */
    }
  ],
  ["MW" /* MEGA_WATT */]: [],
  ["BTU/h" /* BTU_PER_HOUR */]: []
};

// node_modules/custom-card-helpers/dist/index.m.js
var t3;
var r4;
!function(e4) {
  e4.language = "language", e4.system = "system", e4.comma_decimal = "comma_decimal", e4.decimal_comma = "decimal_comma", e4.space_comma = "space_comma", e4.none = "none";
}(t3 || (t3 = {})), function(e4) {
  e4.language = "language", e4.system = "system", e4.am_pm = "12", e4.twenty_four = "24";
}(r4 || (r4 = {}));
var ne = function(e4, t4, r5, n4) {
  n4 = n4 || {}, r5 = null == r5 ? {} : r5;
  var i5 = new Event(t4, { bubbles: void 0 === n4.bubbles || n4.bubbles, cancelable: Boolean(n4.cancelable), composed: void 0 === n4.composed || n4.composed });
  return i5.detail = r5, e4.dispatchEvent(i5), i5;
};
var de = function(e4, t4, r5) {
  void 0 === r5 && (r5 = false), r5 ? history.replaceState(null, "", t4) : history.pushState(null, "", t4), ne(window, "location-changed", { replace: r5 });
};

// src/helpers/utils.ts
var Utils = class _Utils {
  static toNum(val, decimals = -1, invert = false) {
    let numberValue = Number(val);
    if (Number.isNaN(numberValue)) {
      return 0;
    }
    if (decimals >= 0) {
      numberValue = parseFloat(numberValue.toFixed(decimals));
    }
    if (invert) {
      numberValue *= -1;
    }
    return numberValue;
  }
  static invertKeyPoints(keyPoints) {
    return keyPoints.split(";").reverse().join(";");
  }
  static formatNumberLocale(value, decimals) {
    const fractionDigits = Number.isNaN(decimals) ? 2 : decimals;
    const hass = globalData.hass;
    const nf = hass?.locale?.number_format;
    const langFromHass = hass?.selectedLanguage || hass?.locale?.language || hass?.language;
    let locale = void 0;
    let useGrouping = true;
    switch (nf) {
      case "auto":
      case "language":
        locale = langFromHass;
        break;
      case "system":
        locale = void 0;
        break;
      case "comma_decimal":
        locale = "en-US";
        break;
      case "decimal_comma":
        locale = "de-DE";
        break;
      case "space_comma":
        locale = "fr-FR";
        break;
      case "none":
        locale = langFromHass;
        useGrouping = false;
        break;
      default:
        locale = void 0;
    }
    return value.toLocaleString(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping
    });
  }
  static convertValue(value, decimal = 2) {
    decimal = Number.isNaN(decimal) ? 2 : decimal;
    if (Math.abs(value) >= 1e6) {
      const scaled = value / 1e6;
      return `${_Utils.formatNumberLocale(scaled, decimal)} MW`;
    } else if (Math.abs(value) >= 1e3) {
      const scaled = value / 1e3;
      return `${_Utils.formatNumberLocale(scaled, decimal)} kW`;
    } else {
      const rounded = Math.round(value);
      return `${rounded.toLocaleString(void 0)} W`;
    }
  }
  static convertValueNew(value, unit = "", decimal = 2) {
    decimal = isNaN(decimal) ? 2 : decimal;
    const numberValue = Number(value);
    if (isNaN(numberValue)) return 0;
    const rules = unitOfEnergyConversionRules[unit];
    if (!rules)
      return `${_Utils.formatNumberLocale(numberValue, decimal)} ${unit}`;
    if (unit === "Wh" /* WATT_HOUR */ && Math.abs(numberValue) < 1e3) {
      const rounded = Math.round(numberValue);
      return `${rounded.toLocaleString(void 0)} ${unit}`;
    }
    if (unit === "W" /* WATT */ && Math.abs(numberValue) < 1e3) {
      const rounded = Math.round(numberValue);
      return `${rounded.toLocaleString(void 0)} ${unit}`;
    }
    if (unit === "kW" /* KILO_WATT */ && Math.abs(numberValue) < 1) {
      const watts = Math.round(numberValue * 1e3);
      return `${watts.toLocaleString(void 0)} W`;
    }
    if (unit === "MW" /* MEGA_WATT */ && Math.abs(numberValue) < 1) {
      const kw = numberValue * 1e3;
      return `${_Utils.formatNumberLocale(kw, decimal)} kW`;
    }
    for (const rule of rules) {
      if (Math.abs(numberValue) >= rule.threshold) {
        const divided = numberValue / rule.divisor;
        const dec = rule.decimal || decimal;
        const convertedValue = _Utils.formatNumberLocale(divided, dec);
        return `${convertedValue} ${rule.targetUnit}`;
      }
    }
    return `${_Utils.formatNumberLocale(numberValue, decimal)} ${unit}`;
  }
  static {
    this.isPopupOpen = false;
  }
  static handlePopup(event, entityId) {
    if (!entityId) {
      return;
    }
    event.preventDefault();
    this._handleClick(event, { action: "more-info" }, entityId);
  }
  static handleNavigation(event, navigationPath) {
    if (!navigationPath) {
      return;
    }
    event.preventDefault();
    this._handleClick(
      event,
      { action: "navigate", navigation_path: navigationPath },
      null
    );
  }
  static _handleClick(event, actionConfig, entityId) {
    if (!event || !entityId && !actionConfig.navigation_path) {
      return;
    }
    event.stopPropagation();
    switch (actionConfig.action) {
      case "more-info":
        this._dispatchMoreInfoEvent(event, entityId);
        break;
      case "navigate":
        this._handleNavigationEvent(event, actionConfig.navigation_path);
        break;
      default:
        console.warn(`Action '${actionConfig.action}' is not supported.`);
    }
  }
  static _dispatchMoreInfoEvent(event, entityId) {
    if (_Utils.isPopupOpen) {
      return;
    }
    _Utils.isPopupOpen = true;
    const moreInfoEvent = new CustomEvent("hass-more-info", {
      composed: true,
      detail: { entityId }
    });
    history.pushState({ popupOpen: true }, "", window.location.href);
    event.target.dispatchEvent(moreInfoEvent);
    const closePopup = () => {
      if (_Utils.isPopupOpen) {
        _Utils.isPopupOpen = false;
        window.removeEventListener("popstate", closePopup);
      }
    };
    window.addEventListener("popstate", closePopup, { once: true });
  }
  static toHexColor(color) {
    if (!color) {
      return "grey";
    }
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)) {
      return color.toUpperCase();
    }
    const match = color.match(
      /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
    );
    if (match) {
      const [r5, g2, b3] = match.slice(1, 4).map(Number);
      return `#${(1 << 24 | r5 << 16 | g2 << 8 | b3).toString(16).slice(1).toUpperCase()}`;
    }
    return color;
  }
  static _handleNavigationEvent(event, navigationPath) {
    if (navigationPath) {
      de(event.target, navigationPath);
    } else {
      console.warn("Navigation path is not provided.");
    }
  }
};

// src/components/shared/pv/render-pv-flow.ts
function renderPVFlow(id, path, color, lineWidth, powerWatts, duration, invertFlow, minLineWidth, className = "", keyPoints = "0;1") {
  const lineId = `${id}-line`;
  const finalKeyPoints = invertFlow === true ? Utils.invertKeyPoints(keyPoints) : keyPoints;
  const showDot = powerWatts > 0;
  const dur = Number.isFinite(duration) && duration > 0 ? duration : 1;
  const glow = globalData.glow;
  const lineClass = `${className}${glow ? " ss-flow-line" : ""}`.trim();
  const dotClass = `${className}${glow ? " ss-flow-dot" : ""}`.trim();
  const dotRadius = Math.min(2 + lineWidth + Math.max(minLineWidth - 2, 0), 8);
  const lite2 = globalData.glowIntensity <= 1;
  const extras = showDot && glow && !lite2 && !globalData.reducedMotion;
  const trail = extras ? [
    { r: dotRadius * 0.75, o: 0.45, lag: 0.06 },
    { r: dotRadius * 0.5, o: 0.22, lag: 0.12 }
  ] : [];
  const pulseClass = invertFlow ? "ss-flow-pulse ss-flow-pulse--rev" : "ss-flow-pulse";
  const lineOverlays = showDot && glow ? w`
				<use href="#${lineId}" xlink:href="#${lineId}" class="ss-flow-core" />
				${extras ? w`<use href="#${lineId}" xlink:href="#${lineId}" class="${pulseClass}" />` : w``}` : w``;
  return w`
		<svg
			id="${id}-flow"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			overflow="visible"
		>
			<path
				id="${lineId}"
				d="${path}"
				fill="none"
				stroke="${color}"
				stroke-width="${lineWidth}"
				stroke-miterlimit="10"
				pointer-events="stroke"
				class="${lineClass}"
				style="${glow ? `color:${color}` : ""}"
				pathLength="${glow ? "1000" : ""}"
			/>
			${lineOverlays}
			${trail.map(
    (t4) => w`<circle
						r="${t4.r}"
						fill="${color}"
						opacity="${t4.o}"
						class="${dotClass}"
					>
						<animateMotion
							dur="${dur}s"
							begin="${(dur * t4.lag).toFixed(3)}s"
							repeatCount="indefinite"
							keyPoints="${finalKeyPoints}"
							keyTimes="0;1"
							calcMode="linear"
							rotate="auto"
						>
							<mpath href="#${lineId}" xlink:href="#${lineId}" />
						</animateMotion>
					</circle>`
  )}
			${showDot ? w`<circle
						id="${id}-dot"
						r="${dotRadius}"
						fill="${color}"
						class="${dotClass}"
					>
						<animateMotion
							dur="${dur}s"
							repeatCount="indefinite"
							keyPoints="${finalKeyPoints}"
							keyTimes="0;1"
							calcMode="linear"
							rotate="auto"
						>
							<mpath href="#${lineId}" xlink:href="#${lineId}" />
						</animateMotion>
					</circle>
					${extras ? w`<circle r="${Math.max(dotRadius * 0.42, 1)}" fill="#ffffff" class="ss-dot-core">
							<animateMotion dur="${dur}s" repeatCount="indefinite"
								keyPoints="${finalKeyPoints}" keyTimes="0;1" calcMode="linear">
								<mpath href="#${lineId}" xlink:href="#${lineId}" />
							</animateMotion>
						</circle>` : w``}` : w``}
		</svg>
	`;
}

// src/helpers/render-circle.ts
var renderCircle = (id, radius, fill, duration, keyPoints, mpathHref, invertFlow = false) => {
  if (fill === "transparent") {
    return w``;
  }
  const finalKeyPoints = invertFlow ? Utils.invertKeyPoints(keyPoints) : keyPoints;
  const motion = w`
        <animateMotion dur="${duration}s" repeatCount="indefinite"
            keyPoints="${finalKeyPoints}"
            keyTimes="0;1" calcMode="linear">
            <mpath href="${mpathHref}"/>
        </animateMotion>`;
  if (!globalData.glow) {
    return w`
        <circle id="${id}" cx="0" cy="0" r="${radius}" fill="${fill}">
            ${motion}
        </circle>
    `;
  }
  const lite2 = globalData.glowIntensity <= 1;
  const extras = !lite2 && !globalData.reducedMotion;
  const coreOverlay = w`<use href="${mpathHref}" xlink:href="${mpathHref}" class="ss-flow-core" />`;
  const pulseClass = invertFlow ? "ss-flow-pulse ss-flow-pulse--rev" : "ss-flow-pulse";
  const pulseOverlay = extras ? w`<use href="${mpathHref}" xlink:href="${mpathHref}" class="${pulseClass}" />` : w``;
  const streamClass = invertFlow ? "ss-flow-stream ss-flow-stream--rev" : "ss-flow-stream";
  const streamOverlay = extras ? w`<use href="${mpathHref}" xlink:href="${mpathHref}" class="${streamClass}" />` : w``;
  const trail = extras ? [
    { r: radius * 0.75, o: 0.45, lag: 0.06 },
    { r: radius * 0.5, o: 0.22, lag: 0.12 }
  ] : [];
  return w`
        ${coreOverlay}
        ${streamOverlay}
        ${pulseOverlay}
        ${trail.map(
    (t4) => w`
        <circle cx="0" cy="0" r="${t4.r}" fill="${fill}" opacity="${t4.o}" class="ss-flow-dot">
            <animateMotion dur="${duration}s" begin="${(duration * t4.lag).toFixed(3)}s"
                repeatCount="indefinite" keyPoints="${finalKeyPoints}"
                keyTimes="0;1" calcMode="linear">
                <mpath href="${mpathHref}"/>
            </animateMotion>
        </circle>`
  )}
        <circle id="${id}" cx="0" cy="0" r="${radius}" fill="${fill}" class="ss-flow-dot">
            ${motion}
        </circle>
        ${extras ? w`<circle cx="0" cy="0" r="${Math.max(radius * 0.42, 1)}" fill="#ffffff" class="ss-dot-core">
            <animateMotion dur="${duration}s" repeatCount="indefinite"
                keyPoints="${finalKeyPoints}" keyTimes="0;1" calcMode="linear">
                <mpath href="${mpathHref}"/>
            </animateMotion>
        </circle>` : w``}
    `;
};

// src/helpers/render-path.ts
var renderPath = (id, d3, display, color, lineWidth) => {
  const glow = globalData.glow;
  const glowClass = glow ? "ss-flow-line" : "";
  return w`
        <path id="${id}" d="${d3}" fill="none" display="${display ? "" : "none"}"
            stroke="${color}" stroke-width="${lineWidth}"
            stroke-miterlimit="10" pointer-events="stroke" class="${glowClass}"
            style="${glow ? `color:${color}` : ""}"
            pathLength="${glow ? "1000" : ""}"/>
    `;
};

// src/helpers/render-soc-ring.ts
function renderSocRing(cx, cy, r5, soc, color, show = true, charging = false) {
  if (!globalData.glow || !globalData.socRing || !show) {
    return w``;
  }
  const pct = Math.max(0, Math.min(100, Number.isFinite(soc) ? soc : 0));
  const sweep = charging ? w`<circle class="ss-soc-sweep" cx="${cx}" cy="${cy}" r="${r5}" fill="none"
				stroke="${color}" stroke-width="2.5" stroke-linecap="round"
				pathLength="100" stroke-dasharray="10 90"
				style="transform-origin:${cx}px ${cy}px" />` : w``;
  return w`
		<g class="ss-soc-ring${charging ? " ss-soc-ring--charging" : ""}"
			transform="rotate(-90 ${cx} ${cy})" pointer-events="none"
			style="color:${color}">
			<circle cx="${cx}" cy="${cy}" r="${r5}" fill="none"
				stroke="${color}" stroke-opacity="0.16" stroke-width="2.5" />
			<circle class="ss-soc-arc" cx="${cx}" cy="${cy}" r="${r5}" fill="none"
				stroke="${color}" stroke-width="2.5" stroke-linecap="round"
				pathLength="100" stroke-dasharray="${pct} 100" />
			${sweep}
		</g>
	`;
}

// src/style.ts
var styles = i`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 5px;
  }

  .card {
    border-radius: var(--ha-card-border-radius, 10px);
    box-shadow: var(
      --ha-card-box-shadow,
      0px 0px 0px 1px rgba(0, 0, 0, 0.12),
      0px 0px 0px 0px rgba(0, 0, 0, 0.12),
      0px 0px 0px 0px rgba(0, 0, 0, 0.12)
    );
    background: var(--ha-card-background, var(--card-background-color, white));
    border-width: var(--ha-card-border-width);
    padding: 0px;
  }

  text {
    text-anchor: middle;
    dominant-baseline: middle;
  }

  .left-align {
    text-anchor: start;
  }
  .right-align {
    text-anchor: end;
  }
  .st1 {
    fill: #ff9b30;
  }
  .st2 {
    fill: #f3b3ca;
  }
  .st3 {
    font-size: 9px;
  }
  .st4 {
    font-size: 14px;
  }
  .st5 {
    fill: #969696;
  }
  .st6 {
    fill: #5fb6ad;
  }
  .st7 {
    fill: #5490c2;
  }
  .st8 {
    font-weight: 500;
  }
  .st9 {
    fill: #959595;
  }
  .st10 {
    font-size: 16px;
  }
  .st11 {
    fill: transparent;
  }
  .st12 {
    display: none;
  }
  .st13 {
    font-size: 22px;
  }
  .st14 {
    font-size: 12px;
  }
  .remaining-energy {
    font-size: 9px;
  }

  /* ===== Neon glow flow effects (opt-in via the \`glow\` config) ===== */
  /* The filters referenced here are injected as <defs> inside the card SVG
	   when glow is enabled, so they resolve within this shadow root. */
  /* Region-free glow: drop-shadow uses the element's own colour (set inline as
     CSS color) and never collapses on horizontal/vertical lines the way an
     objectBoundingBox SVG filter does. */
  .ss-glow .ss-flow-line {
    filter: drop-shadow(0 0 2px currentColor) drop-shadow(0 0 5px currentColor);
  }

  .ss-glow .ss-flow-dot {
    filter: url(#ss-glow-dot);
    will-change: transform, filter;
  }

  /* Hot-core / pulse tint, themeable via the ss-theme-* class. */
  .ss-glow {
    --ss-hot: #ffffff;
  }
  .ss-glow.ss-theme-ice {
    --ss-hot: #abe9ff;
  }
  .ss-glow.ss-theme-fire {
    --ss-hot: #ffd08a;
  }
  .ss-glow.ss-theme-aurora {
    --ss-hot: #b6ffd9;
  }
  .ss-glow.ss-theme-mono {
    --ss-hot: #ffffff;
  }
  /* Mono actually desaturates the glowing elements (grayscale before the
	   colour-preserving glow filter). */
  .ss-glow.ss-theme-mono .ss-flow-line {
    filter: grayscale(1) drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #fff);
  }
  .ss-glow.ss-theme-mono .ss-flow-dot {
    filter: grayscale(1) url(#ss-glow-dot);
  }
  .ss-glow.ss-theme-mono .ss-flow-stream {
    filter: grayscale(1) drop-shadow(0 0 3px #fff);
  }
  .ss-glow.ss-theme-mono .ss-soc-ring {
    filter: grayscale(1) drop-shadow(0 0 3px #fff);
  }
  .ss-glow.ss-theme-mono svg#sun {
    filter: grayscale(1) url(#ss-glow-node);
  }
  .ss-glow.ss-theme-mono.card::before {
    filter: blur(30px) grayscale(1);
  }

  /* Hot core down the centre of each active flow line (a <use> clone
	   of the path). CSS beats the path's own stroke attribute. */
  .ss-glow .ss-flow-core {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.55;
    stroke-width: 1.2;
    stroke-linecap: round;
    pointer-events: none;
    /* No filter here: a bounding-box filter would collapse on horizontal /
       vertical core lines and hide them. The plain bright stroke is enough —
       the underlying ss-flow-line already supplies the glow. */
  }

  /* Hot core inside the comet head. */
  .ss-glow .ss-dot-core {
    fill: var(--ss-hot, #ffffff);
    fill-opacity: 0.92;
    pointer-events: none;
    filter: drop-shadow(0 0 2px var(--ss-hot, #fff));
  }

  /* Luminous pulse wave sweeping along the line (a second <use> clone).
	   pathLength is normalised to 1000 on the source path. Speed comes from
	   --ss-pulse-dur, which the card lowers as system activity rises. */
  .ss-glow .ss-flow-pulse {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.85;
    stroke-width: 2.6;
    stroke-linecap: round;
    pointer-events: none;
    stroke-dasharray: 34 1000;
    stroke-dashoffset: 1000;
    filter: drop-shadow(0 0 3px var(--ss-hot, #fff))
      drop-shadow(0 0 6px var(--ss-hot, #fff));
    animation: ss-pulse-move var(--ss-pulse-dur, 2.6s) linear infinite;
    will-change: stroke-dashoffset;
  }

  .ss-glow .ss-flow-pulse--rev {
    animation-name: ss-pulse-move-rev;
  }

  /* Continuously flowing energy: a repeating dash that scrolls along the whole
	   pipe non-stop, so active lines feel like liquid is running through them.
	   The dash period (9 + 27 = 36 in the normalised pathLength of 1000) is what
	   the keyframe shifts by, giving a seamless infinite loop. Speed rises with
	   system activity via --ss-stream-dur. */
  .ss-glow .ss-flow-stream {
    fill: none;
    stroke: var(--ss-hot, #ffffff);
    stroke-opacity: 0.5;
    stroke-width: 1.5;
    stroke-linecap: round;
    pointer-events: none;
    stroke-dasharray: 9 27;
    filter: drop-shadow(0 0 3px var(--ss-hot, #fff));
    animation: ss-stream-move var(--ss-stream-dur, 1.1s) linear infinite;
    will-change: stroke-dashoffset;
  }

  .ss-glow .ss-flow-stream--rev {
    animation-name: ss-stream-move-rev;
  }

  @keyframes ss-stream-move {
    from {
      stroke-dashoffset: 36;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes ss-stream-move-rev {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 36;
    }
  }

  @keyframes ss-pulse-move {
    from {
      stroke-dashoffset: 1000;
    }
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes ss-pulse-move-rev {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: 1000;
    }
  }

  @keyframes ss-node-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 1px currentColor);
    }
    50% {
      filter: drop-shadow(0 0 4px currentColor)
        drop-shadow(0 0 8px currentColor);
    }
  }

  /* Breathe a soft halo around the major nodes so they feel "alive".
	   Pulse speed rises with system activity (--ss-activity 0..1). */
  .ss-glow .grid-icon,
  .ss-glow .grid-icon-small,
  .ss-glow .aux-icon,
  .ss-glow .noness-icon,
  .ss-glow .essload1-icon,
  .ss-glow .essload1-icon-full,
  .ss-glow .essload2-icon,
  .ss-glow .nonessload1-icon {
    animation: ss-node-pulse calc(3.4s - var(--ss-activity, 0) * 1.6s)
      ease-in-out infinite;
    will-change: filter;
  }

  /* Solar (sun) node — rendered as <svg id="sun"> with a coloured path;
	   the node filter blooms it in its own colour. */
  .ss-glow svg#sun {
    filter: url(#ss-glow-node);
  }

  /* ===== Battery SOC ring ===== */
  .ss-glow .ss-soc-ring {
    filter: drop-shadow(0 0 3px currentColor);
  }

  .ss-glow .ss-soc-arc {
    animation: ss-soc-pulse 2.6s ease-in-out infinite;
    will-change: stroke-opacity, stroke-width;
  }

  /* Orbiting sweep shown only while charging. */
  .ss-glow .ss-soc-sweep {
    stroke-opacity: 0.95;
    animation: ss-soc-orbit 1.8s linear infinite;
    will-change: transform;
  }

  @keyframes ss-soc-orbit {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ss-soc-pulse {
    0%,
    100% {
      stroke-opacity: 0.85;
      stroke-width: 2.5;
    }
    50% {
      stroke-opacity: 1;
      stroke-width: 3;
    }
  }

  /* ===== Glass card shell + ambient state glow ===== */
  .ss-glow.card {
    position: relative;
    overflow: hidden;
    /* Fallback for webviews without color-mix(): keep the theme background. */
    background: var(
      --ha-card-background,
      var(--card-background-color, #161a23)
    );
    background: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #161a23)) 72%,
      transparent
    );
    -webkit-backdrop-filter: blur(10px) saturate(135%);
    backdrop-filter: blur(10px) saturate(135%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 10px 44px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.07);
  }

  /* Soft ambient aura behind the diagram. The two strongest layers follow
	   the dominant live flow (--ss-ambient-1/-2, set by the card); the third is
	   the battery palette tint. Overall intensity scales with --ss-activity so
	   the aura swells under load. The keyframe only drifts; opacity is reactive. */
  .ss-glow.card::before {
    content: '';
    position: absolute;
    inset: -20%;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(
        46% 56% at 26% 30%,
        var(--ss-ambient-1, var(--ss-c-solar, #ffa500)) 0%,
        transparent 70%
      ),
      radial-gradient(
        44% 54% at 74% 70%,
        var(--ss-ambient-2, var(--ss-c-grid, #5490c2)) 0%,
        transparent 70%
      ),
      radial-gradient(
        40% 50% at 60% 22%,
        var(--ss-c-batt, #ffc0cb) 0%,
        transparent 72%
      );
    opacity: calc(0.08 + var(--ss-activity, 0.15) * 0.26);
    filter: blur(30px);
    animation: ss-ambient 16s ease-in-out infinite alternate;
  }

  .ss-glow.card > * {
    position: relative;
    z-index: 1;
  }

  @keyframes ss-ambient {
    0% {
      transform: translate3d(-2%, -1%, 0) scale(1.02);
    }
    100% {
      transform: translate3d(2%, 2%, 0) scale(1.08);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ss-glow .grid-icon,
    .ss-glow .grid-icon-small,
    .ss-glow .aux-icon,
    .ss-glow .noness-icon,
    .ss-glow .essload1-icon,
    .ss-glow .essload1-icon-full,
    .ss-glow .essload2-icon,
    .ss-glow .nonessload1-icon {
      animation: none;
      filter: drop-shadow(0 0 3px currentColor);
    }
    .ss-glow .ss-flow-pulse,
    .ss-glow .ss-flow-stream,
    .ss-glow .ss-soc-arc,
    .ss-glow .ss-soc-sweep,
    .ss-glow.card::before {
      animation: none;
    }
  }
`;

// demo/glow-demo.ts
var FLOWS = [
  { id: "pv", color: "#ffa500", d: "M 60 40 C 140 40 140 110 220 110", dur: 2 },
  { id: "bat", color: "#ff5fa2", d: "M 60 110 L 220 110", dur: 1.4 },
  {
    id: "grid",
    color: "#3fa9ff",
    d: "M 60 180 C 140 180 140 110 220 110",
    dur: 2.6
  },
  { id: "vert", color: "#5fd0c5", d: "M 270 30 L 270 190", dur: 2.2 }
];
function buildFlows() {
  return w`
		${FLOWS.map((f3) => renderPVFlow(f3.id, f3.d, f3.color, 3, 1e3, f3.dur, false, 1))}
		<!-- a couple of full-card style path+circle flows too -->
		${renderPath("extra-line", "M 220 110 L 260 110", true, "#5fb6ad", 3)}
		${renderCircle("extra-dot", 4, "#5fb6ad", 1.6, "0;1", "#extra-line")}
	`;
}
function panel(title, glow, opts = {}) {
  const {
    theme = "neon",
    activity = 0.7,
    charging = true,
    intensity = 3,
    reducedMotion = false
  } = opts;
  globalData.glow = glow;
  globalData.glowIntensity = intensity;
  globalData.reducedMotion = reducedMotion;
  const flows = buildFlows();
  const nodes = w`
		<circle cx="40" cy="40" r="14" fill="#ffa500" class="grid-icon" style="color:#ffa500"/>
		${renderSocRing(40, 110, 22, 72, "#ff5fa2", true, charging)}
		<circle cx="40" cy="110" r="14" fill="#ff5fa2" class="aux-icon" style="color:#ff5fa2"/>
		<circle cx="40" cy="180" r="14" fill="#3fa9ff" class="noness-icon" style="color:#3fa9ff"/>
		<circle cx="278" cy="110" r="16" fill="#5fb6ad" class="essload1-icon" style="color:#5fb6ad"/>
		${/* second battery ring (discharging) to demo dual-battery */
  ""}
		${renderSocRing(278, 110, 24, 48, "#c08cff", true, false)}
	`;
  const ambientVars = glow ? `--ss-c-solar:#ffa500;--ss-c-batt:#ff5fa2;--ss-c-grid:#3fa9ff;--ss-ambient-1:#ffa500;--ss-ambient-2:#3fa9ff;--ss-activity:${activity};--ss-pulse-dur:${(3.4 - activity * 2).toFixed(2)}s;` : "";
  const cls = glow ? `ss-glow ss-theme-${theme}` : "";
  return b2`
    <figure class="panel">
      <figcaption>${title}</figcaption>
      <div class="container card ${cls}" style="${ambientVars}">
        <svg
          viewBox="0 0 300 220"
          width="380"
          height="280"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          ${renderGlowDefs(glow, 3)} ${nodes} ${flows}
        </svg>
      </div>
    </figure>
  `;
}
var styleEl = document.createElement("style");
styleEl.textContent = `
	${styles.cssText}
	body { margin: 0; background: #0c1018; color: #cfd6e4; font-family: system-ui, sans-serif; }
	.wrap { display: flex; gap: 32px; padding: 32px; flex-wrap: wrap; justify-content: center; }
	.panel { margin: 0; }
	figcaption { text-align: center; margin-bottom: 10px; font-size: 14px; letter-spacing: .5px; opacity: .85; }
	.card { background: #11161f; padding: 8px; }
`;
document.head.appendChild(styleEl);
var root = document.getElementById("app");
var off = panel("Default (glow: false)", false);
var neon = panel("Neon \xB7 high activity \xB7 charging", true, {
  theme: "neon",
  activity: 0.9,
  charging: true
});
var ice = panel("Ice theme \xB7 low activity", true, {
  theme: "ice",
  activity: 0.25,
  charging: false
});
var fire = panel("Fire theme \xB7 charging", true, {
  theme: "fire",
  activity: 0.6,
  charging: true
});
var mono = panel("Mono theme (desaturated)", true, {
  theme: "mono",
  activity: 0.7,
  charging: true
});
var lite = panel("Effects-lite (intensity 1)", true, {
  theme: "neon",
  activity: 0.7,
  charging: true,
  intensity: 1
});
var reduced = panel("Reduced motion", true, {
  theme: "neon",
  activity: 0.7,
  charging: true,
  reducedMotion: true
});
D(
  b2`<div class="wrap">
    ${off}${neon}${ice}${fire}${mono}${lite}${reduced}
  </div>`,
  root
);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
