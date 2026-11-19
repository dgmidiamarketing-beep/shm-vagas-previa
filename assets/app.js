/* SHM Brasil · página de cadastro. Só comportamento; dados em config.js. */
(function () {
  'use strict';

  var C = window.LP_CONFIG || {};
  var VAGAS = C.VAGAS || [];
  var ABERTAS = VAGAS.filter(function (v) { return v.status === 'aberta'; });
  var POR_SLUG = {};
  VAGAS.forEach(function (v) { POR_SLUG[v.slug] = v; });
  var CHAVE = 'shm_lp_cadastro';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function mostra(el, sim) { if (el) el.hidden = !sim; }
  // "Formação em Terapia Ocupacional" -> "formação em Terapia Ocupacional" no meio da frase; sigla (RQE, CRP) fica.
  function noMeioDaFrase(t) { return /^[A-ZÀ-Ý][a-zà-ÿ]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t; }
  function salvar(dados) { try { sessionStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) {} }
  function ler() { try { return JSON.parse(sessionStorage.getItem(CHAVE) || 'null'); } catch (e) { return null; } }

  if (document.body.getAttribute('data-pagina') === 'obrigado') { paginaObrigado(); return; }

  /* ---------------- Qual vaga ----------------
     Página da vaga (pasta própria, gerada a partir desta): <body data-pagina-vaga="slug" data-raiz="../">.
     Página geral: ?vaga= destaca o card (o topo não muda). */
  var RAIZ = document.body.getAttribute('data-raiz') || '';
  var slugPagina = (document.body.getAttribute('data-pagina-vaga') || '').trim().toLowerCase();
  var paginaVaga = !!slugPagina;
  var params = new URLSearchParams(location.search);
  var slugURL = slugPagina || (params.get('vaga') || '').trim().toLowerCase();
  var vagaURL = POR_SLUG[slugURL] && POR_SLUG[slugURL].status === 'aberta' ? POR_SLUG[slugURL] : null;
  var vagaEncerrada = !!(POR_SLUG[slugURL] && POR_SLUG[slugURL].status === 'encerrada');

  var RASTREIO = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'gclid', 'fbclid'].forEach(function (k) {
    RASTREIO[k] = params.get(k) || '';
  });

  // O topo é sempre geral. ?vaga= só destaca o card da vaga (primeiro da lista) e rola até a lista;
  // o título da aba leva a vaga.
  mostra($('[data-encerrada]'), vagaEncerrada);
  if (vagaURL && !paginaVaga) document.title = 'Vaga para ' + vagaURL.titulo + ' ' + vagaURL.local + ' | SHM Brasil';

  // C04 sai nas vagas de psicólogo(a) e terapeuta ocupacional
  if (vagaURL && vagaURL.regra.prof !== 'medico') mostra($('[data-c04]'), false);
  // C05 só com o sim da SHM
  mostra($('[data-c05]'), !!C.MOSTRAR_DEPOIMENTOS);
  mostra($('[data-pend]'), !!C.SHOW_PENDENCIAS);
  // Fundo alterna entre as seções visíveis (seção que sai não deixa duas iguais coladas)
  $$('main > .secao').filter(function (el) { return !el.hidden; }).forEach(function (el, i) {
    el.classList.toggle('secao--suave', i % 2 === 0);
  });
  // Formulário em demonstração
  mostra($('[data-demo]'), C.FORM_MODE !== 'endpoint');
  // CNPJ no rodapé
  if (C.MOSTRAR_CNPJ && C.CNPJ) { var cn = $('[data-cnpj]'); cn.textContent = 'CNPJ ' + C.CNPJ; mostra(cn, true); }

  /* ---------------- C02 · Cards (logo abaixo do topo) ---------------- */
  var SVG_PIN = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var SVG_REQ = '<span class="pilula__ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 4h6v3H9z"/><path d="M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="m9 13 2 2 4-4"/></svg></span>';
  var SVG_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>';
  var lista = $('[data-vagas]');
  // a vaga do endereço vem primeiro; as outras mantêm a ordem do config (a página da vaga não tem lista)
  var ORDEM = !lista ? [] : vagaURL ? [vagaURL].concat(ABERTAS.filter(function (v) { return v !== vagaURL; })) : ABERTAS;
  ORDEM.forEach(function (v) {
    var li = document.createElement('li');
    li.className = 'vaga';
    li.setAttribute('data-card', v.slug);
    li.innerHTML =
      '<p class="vaga__selo">' + SVG_OK + 'Vaga selecionada</p>' +
      '<div class="vaga__corpo">' +
        '<h3 class="vaga__titulo"></h3>' +
        '<p class="vaga__local">' + SVG_PIN + '<span></span></p>' +
        '<div class="vaga__req">' + SVG_REQ + '<p><span class="vaga__req-rot">Requisito</span><span class="vaga__req-txt"></span></p></div>' +
        '<a class="btn btn--pri" href="#cadastro">Quero me candidatar</a>' +
      '</div>';
    $('.vaga__titulo', li).textContent = v.titulo;
    $('.vaga__local span', li).textContent = v.cidade;
    $('.vaga__req-txt', li).textContent = v.requisito;
    $('a', li).setAttribute('data-vaga', v.slug);
    $('a', li).setAttribute('aria-label', 'Quero me candidatar: ' + v.titulo + ', ' + v.cidade);
    lista.appendChild(li);
  });
  function destacaCard(slug) {
    $$('[data-card]').forEach(function (c) { c.classList.toggle('vaga--sel', c.getAttribute('data-card') === slug); });
  }

  /* ---------------- M01 · Formulário ---------------- */
  var form = $('[data-form]');
  var selVaga = $('[data-select-vaga]');
  ABERTAS.forEach(function (v) {
    var o = document.createElement('option');
    o.value = v.slug; o.textContent = v.titulo + ' · ' + v.cidade;
    selVaga.appendChild(o);
  });
  var oOutra = document.createElement('option');
  oOutra.value = 'outra'; oOutra.textContent = 'Outra vaga';
  selVaga.appendChild(oOutra);

  var NOMES = { 1: 'A vaga', 2: 'O requisito', 3: 'Onde você está', 4: 'Seu contato' };
  var ROTULO_PROF = { medico: 'Médico(a)', psicologo: 'Psicólogo(a)', to: 'Terapeuta ocupacional', outra: 'Outra profissão da saúde' };
  var etapa = 1;

  function val(nome) {
    var el = form.elements[nome];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && el[0] && el[0].type === 'radio')) {
      var m = $$('input[name="' + nome + '"]', form).filter(function (i) { return i.checked; })[0];
      return m ? m.value : '';
    }
    if (el.type === 'checkbox') return el.checked ? el.value : '';
    return (el.value || '').trim();
  }
  function marcar(nome, valor) {
    $$('input[name="' + nome + '"]', form).forEach(function (i) { i.checked = (i.value === valor); });
  }
  function vagaSel() { return POR_SLUG[selVaga.value] || null; }
  function sequencia() { return val('profissao') === 'outra' ? [1, 3, 4] : [1, 2, 3, 4]; }

  function atualizaVaga(preencherProf) {
    var v = vagaSel();
    var ficha = $('[data-ficha]');
    if (v) {
      $('[data-ficha-titulo]').textContent = v.titulo;
      $('[data-ficha-cidade]').textContent = v.cidade;
      $('[data-ficha-requisito]').textContent = v.requisito;
      $('[data-pede-txt]').textContent = v.requisito;
      if (preencherProf) marcar('profissao', v.regra.prof);
    }
    mostra(ficha, !!v);
    mostra($('[data-pede]'), !!v);
    destacaCard(v ? v.slug : '');
    atualizaGrupos();
    atualizaProgresso();
  }

  function atualizaGrupos() {
    var p = val('profissao');
    $$('[data-grupo]', form).forEach(function (g) { mostra(g, g.getAttribute('data-grupo') === p); });
    atualizaAvisoRequisito();
  }

  function respostasCompletas(p) {
    if (p === 'medico') return !!(val('rqe') && val('residencia') && val('pos'));
    if (p === 'psicologo') return !!(val('crp') && val('libras'));
    if (p === 'to') return !!val('formado');
    return false;
  }

  // requisito_atendido: 'sim' | 'não' | 'n/a' (Outra vaga ou sem vaga)
  function avaliaRequisito() {
    var v = vagaSel();
    if (!v) return 'n/a';
    var r = v.regra, p = val('profissao');
    if (p !== r.prof) return 'não';
    var ok = false;
    if (r.prof === 'medico') {
      ok = r.aceita.some(function (k) { return k === 'rqe' ? val('rqe') === 'Sim' : val(k) === 'Concluída'; });
    } else if (r.prof === 'psicologo') {
      ok = val('crp') === 'Sim' && val('libras') === 'Sim';
    } else if (r.prof === 'to') {
      ok = val('formado') === 'Sim';
    }
    return ok ? 'sim' : 'não';
  }

  function atualizaAvisoRequisito() {
    var v = vagaSel(), p = val('profissao');
    var mostrar = !!v && respostasCompletas(p) && avaliaRequisito() === 'não';
    if (v) $('[data-aviso-txt]').textContent = noMeioDaFrase(v.requisito);
    mostra($('[data-aviso-requisito]'), mostrar);
  }

  function atualizaProgresso() {
    var seq = sequencia();
    var pos = seq.indexOf(etapa) + 1;
    $('[data-etapa-rotulo]').textContent = 'Etapa ' + pos + ' de ' + seq.length + ' · ' + NOMES[etapa];
    $('[data-etapa-barra]').style.width = (pos / seq.length * 100) + '%';
  }

  function irPara(n, focar) {
    etapa = n;
    $$('.etapa', form).forEach(function (f) {
      var on = +f.getAttribute('data-etapa') === n;
      f.hidden = !on;
      f.classList.remove('entra');
      if (on) { void f.offsetWidth; f.classList.add('entra'); }
    });
    atualizaProgresso();
    if (focar) {
      var topo = form.getBoundingClientRect().top;
      if (topo < 70 || topo > window.innerHeight * 0.6) {
        window.scrollTo({ top: window.scrollY + topo - 84, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      }
      var primeiro = $('.etapa:not([hidden]) input, .etapa:not([hidden]) select', form);
      if (primeiro) { try { primeiro.focus({ preventScroll: true }); } catch (e) { primeiro.focus(); } }
    }
  }

  /* Erros */
  function campoDe(el) { return el.closest('.campo'); }
  function erro(campo, msg) {
    if (!campo) return;
    campo.classList.add('tem-erro');
    var p = $('.campo__erro', campo);
    if (p) { p.textContent = msg; p.hidden = false; }
  }
  function limpa(campo) {
    if (!campo) return;
    campo.classList.remove('tem-erro');
    var p = $('.campo__erro', campo);
    if (p) { p.hidden = true; p.textContent = ''; }
  }

  function digitos(s) { return (s || '').replace(/\D/g, ''); }
  function whatsValido(s) {
    var d = digitos(s);
    if (d.length !== 10 && d.length !== 11) return false;
    var ddd = +d.slice(0, 2);
    if (ddd < 11 || ddd > 99) return false;
    if (d.length === 11 && d.charAt(2) !== '9') return false;
    return true;
  }
  function emailValido(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }

  function valida(n) {
    var falhas = [];
    function exige(nome, el) {
      if (!val(nome)) { erro(campoDe(el), 'Preencha este campo.'); falhas.push(el); }
    }
    var fs = $('.etapa[data-etapa="' + n + '"]', form);
    $$('.campo', fs).forEach(limpa);
    if (n === 1) {
      exige('vaga', selVaga);
      exige('profissao', $('input[name="profissao"]', form));
      exige('especialidade', $('#f-esp'));
    } else if (n === 2) {
      var p = val('profissao');
      var nomes = p === 'medico' ? ['rqe', 'residencia', 'pos'] : p === 'psicologo' ? ['crp', 'libras'] : p === 'to' ? ['formado'] : [];
      nomes.forEach(function (nm) { exige(nm, $('input[name="' + nm + '"]', form)); });
    } else if (n === 3) {
      exige('cidade', $('#f-cidade'));
      exige('uf', $('#f-uf'));
    } else if (n === 4) {
      exige('nome', $('#f-nome'));
      var w = $('#f-whats');
      if (!val('whatsapp')) { erro(campoDe(w), 'Preencha este campo.'); falhas.push(w); }
      else if (!whatsValido(val('whatsapp'))) { erro(campoDe(w), 'Confira o número com DDD. Exemplo: (12) 99999-9999.'); falhas.push(w); }
      var em = $('#f-email');
      if (val('email') && !emailValido(val('email'))) { erro(campoDe(em), 'Confira o e-mail.'); falhas.push(em); }
      var au = $('input[name="autorizacao"]', form);
      if (!au.checked) { erro(campoDe(au), 'Pra enviar, marque a autorização.'); falhas.push(au); }
    }
    if (falhas.length) { try { falhas[0].focus({ preventScroll: false }); } catch (e) { falhas[0].focus(); } }
    return !falhas.length;
  }

  /* Eventos do formulário */
  selVaga.addEventListener('change', function () { limpa(campoDe(selVaga)); atualizaVaga(true); });
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'profissao') { atualizaGrupos(); atualizaProgresso(); }
    if (['rqe', 'residencia', 'pos', 'crp', 'libras', 'formado'].indexOf(t.name) > -1) atualizaAvisoRequisito();
    // texto limpa no 'input'; aqui só rádio, caixa e lista (o 'change' do blur apagaria o erro recém-mostrado)
    if (t.closest('.campo') && t !== selVaga && /radio|checkbox|select/.test(t.type)) limpa(t.closest('.campo'));
  });
  form.addEventListener('input', function (e) { if (e.target.closest('.campo')) limpa(e.target.closest('.campo')); });

  var w = $('#f-whats');
  w.addEventListener('input', function () {
    var d = digitos(w.value).slice(0, 11), f = d;
    if (d.length > 2) f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) f = '(' + d.slice(0, 2) + ') ' + (d.length === 11 ? d.slice(2, 7) + '-' + d.slice(7) : d.slice(2, 6) + '-' + d.slice(6));
    w.value = f;
  });

  $$('[data-avancar]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      if (!valida(etapa)) return;
      var seq = sequencia();
      irPara(seq[seq.indexOf(etapa) + 1], true);
    });
  });
  $$('[data-voltar]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var seq = sequencia();
      irPara(seq[Math.max(0, seq.indexOf(etapa) - 1)], true);
    });
  });
  // Enter num campo de texto avança em vez de enviar
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' && etapa !== 4) {
      e.preventDefault();
      var b = $('.etapa:not([hidden]) [data-avancar]', form);
      if (b) b.click();
    }
  });

  /* Envio: ponto de integração do formulário. */
  function montaPayload() {
    var v = vagaSel(), p = val('profissao');
    var agora = new Date();
    var dataHora;
    try { dataHora = agora.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }); } catch (e) { dataHora = agora.toISOString(); }
    return {
      // colunas da aba "LP" (compatível com a aba Leads da planilha)
      vaga: v ? v.titulo + ' · ' + v.cidade : 'Outra vaga',
      profissao: ROTULO_PROF[p] || '',
      especialidade: val('especialidade'),
      rqe_crp: p === 'medico' ? val('rqe') : p === 'psicologo' ? val('crp') : p === 'to' ? 'Formado(a): ' + val('formado') : '',
      residencia_libras: p === 'medico' ? val('residencia') : p === 'psicologo' ? val('libras') : '',
      pos: p === 'medico' ? val('pos') : '',
      cidade: val('cidade'),
      uf: val('uf'),
      nome: val('nome'),
      whatsapp: val('whatsapp'),
      email: val('email'),
      melhor_horario: val('horario'),
      requisito_atendido: avaliaRequisito(),
      origem: 'LP',
      // campos ocultos
      vaga_slug: v ? v.slug : 'outra',
      utm_source: RASTREIO.utm_source, utm_medium: RASTREIO.utm_medium, utm_campaign: RASTREIO.utm_campaign,
      utm_term: RASTREIO.utm_term, gclid: RASTREIO.gclid, fbclid: RASTREIO.fbclid,
      data_hora: dataHora
    };
  }

  function enviarCadastro(payload) {
    if (C.FORM_MODE === 'endpoint' && C.FORM_ENDPOINT) {
      // text/plain evita o preflight de CORS (Apps Script, webhooks).
      return fetch(C.FORM_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
    }
    // Demonstração: não envia nem grava nada.
    return new Promise(function (ok) { setTimeout(ok, 700); });
  }

  var btEnviar = $('[data-enviar]', form);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (etapa !== 4) { var b = $('.etapa:not([hidden]) [data-avancar]', form); if (b) b.click(); return; }
    if (!valida(4)) return;
    mostra($('[data-falha]'), false);
    btEnviar.disabled = true; btEnviar.textContent = 'Enviando…';
    var payload = montaPayload();
    enviarCadastro(payload).then(function () {
      var v = vagaSel();
      salvar({
        nome: payload.nome.split(/\s+/)[0] || '',
        atendido: payload.requisito_atendido,
        titulo: v ? v.titulo : '', local: v ? v.local : '', requisito: v ? v.requisito : '',
        demo: C.FORM_MODE !== 'endpoint'
      });
      location.href = RAIZ + (C.THANK_YOU_URL || 'obrigado.html');
    }).catch(function () {
      btEnviar.disabled = false; btEnviar.textContent = 'Enviar cadastro';
      mostra($('[data-falha]'), true);
    });
  });

  /* Botões que marcam a vaga */
  $$('a[data-vaga]').forEach(function (a) {
    a.addEventListener('click', function () {
      selVaga.value = a.getAttribute('data-vaga');
      limpa(campoDe(selVaga));
      atualizaVaga(true);
      irPara(1, false);
    });
  });
  $$('[data-outra-vaga]').forEach(function (outra) {
    outra.addEventListener('click', function () {
      // "Não achou a sua vaga?": vai sem vaga marcada ("Outra vaga"), mesmo quem chegou por ?vaga=
      if (etapa === 1) { selVaga.value = 'outra'; atualizaVaga(false); }
    });
  });

  // Estado inicial
  if (vagaURL) selVaga.value = vagaURL.slug;
  atualizaVaga(!!vagaURL);
  irPara(1, false);

  // Chegou por ?vaga= (aberta ou encerrada): rola até a lista, com o card da vaga em primeiro.
  if (!paginaVaga && (vagaURL || vagaEncerrada) && !location.hash && $('#vagas')) {
    var rolarLista = function () {
      var y = $('#vagas').getBoundingClientRect().top + window.scrollY - $('.topo').offsetHeight;
      window.scrollTo({ top: Math.max(0, y), behavior: 'instant' });
    };
    if (document.readyState === 'complete') setTimeout(rolarLista, 60);
    else window.addEventListener('load', function () { setTimeout(rolarLista, 60); });
  }

  /* CTA fixo no celular: aparece depois do hero, some com o formulário na tela */
  var cta = $('[data-cta-fixo]');
  if (cta && 'IntersectionObserver' in window) {
    var vis = { hero: true, vagas: false, cadastro: false, final: false };
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { vis[en.target.getAttribute('data-obs')] = en.isIntersecting; });
      var on = !vis.hero && !vis.vagas && !vis.cadastro && !vis.final;
      cta.classList.toggle('on', on);
      cta.setAttribute('aria-hidden', on ? 'false' : 'true');
      $('a', cta).tabIndex = on ? 0 : -1;
    }, { threshold: 0 });
    [['hero', $('.hero')], ['vagas', $('#vagas')], ['cadastro', $('#cadastro')], ['final', $('.final')]].forEach(function (par) {
      if (!par[1]) return;
      par[1].setAttribute('data-obs', par[0]);
      io.observe(par[1]);
    });
  }

  /* ---------------- O01 · Obrigado ---------------- */
  function paginaObrigado() {
    var d = ler() || {};
    var naoAtendido = d.atendido === 'não';
    var nome = d.nome ? ', ' + d.nome : '';
    $('[data-ob-titulo]').textContent = 'Cadastro recebido' + nome;
    mostra($('[data-ob-sim]'), !naoAtendido);
    mostra($('[data-ob-nao]'), naoAtendido);
    if (naoAtendido) $('[data-ob-req]').textContent = noMeioDaFrase(d.requisito || '');
    var txt = d.titulo ? 'Olá! Acabei de me cadastrar na vaga de ' + d.titulo + ' ' + d.local + '.' : 'Olá! Acabei de me cadastrar.';
    var a = $('[data-ob-whats]');
    if (a) a.href = 'https://wa.me/' + (C.WHATSAPP_NUMERO || '551239369627') + '?text=' + encodeURIComponent(txt);
    mostra($('[data-demo]'), d.demo !== false && C.FORM_MODE !== 'endpoint');
    if (C.MOSTRAR_CNPJ && C.CNPJ) { var cn = $('[data-cnpj]'); if (cn) { cn.textContent = 'CNPJ ' + C.CNPJ; mostra(cn, true); } }
  }
})();
