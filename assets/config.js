/*
  Configuração da página de cadastro (SHM Brasil).
  Trocar vaga = editar a lista VAGAS abaixo e rodar  node build/gerar-vagas.js  (na pasta do projeto):
  cada vaga aberta ganha a própria página em /<slug>/ (topo da vaga e formulário com a vaga marcada).
  A página geral (/) e o ?vaga= continuam funcionando. Não mexe em layout.

  status:
    'aberta'    página própria em /<slug>/; na geral aparece nos cards e no formulário, e ?vaga= põe o card dela em primeiro, destacado, e já marca a vaga (o topo da geral é sempre geral)
    'pendente'  fica fora; /<slug>/ e ?vaga= levam pra página geral normal, sem aviso
    'encerrada' fica fora; /<slug>/ e ?vaga= levam pra página geral com o aviso de vaga encerrada em cima da lista
  local: o trecho que vem depois do título no topo da página da vaga, no título da aba e no texto pronto
         do WhatsApp do obrigado (exceções: telemedicina, teleconsulta e Zona Sul).
  regra: como se calcula requisito_atendido.
    { prof: 'medico', aceita: ['rqe','residencia','pos'] }  basta um (residência/pós só "Concluída")
    { prof: 'psicologo' }  CRP = Sim e Libras = Sim
    { prof: 'to' }         Formado(a) = Sim
*/
window.LP_CONFIG = {
  // 'demo' = não envia nada (só leva ao obrigado). 'endpoint' = POST JSON em FORM_ENDPOINT.
  // Ligar a destino real só depois de aprovado (ver a documentação da integração do formulário).
  FORM_MODE: 'demo',
  FORM_ENDPOINT: '',
  THANK_YOU_URL: 'obrigado.html',

  // Prévia: mostra os avisos de demonstração e de "aguarda a SHM". Desligar antes de publicar.
  SHOW_PENDENCIAS: true,

  // Depoimentos do site: true só com o sim da SHM; sem o sim, false.
  MOSTRAR_DEPOIMENTOS: true,

  // CNPJ no rodapé, só se a SHM disser sim.
  MOSTRAR_CNPJ: false,
  CNPJ: '37.041.841/0001-57',

  WHATSAPP_NUMERO: '551239369627',

  VAGAS: [
    { slug: 'psiquiatra-telemedicina', titulo: 'Psiquiatra', cidade: 'Telemedicina', local: 'em telemedicina',
      requisito: 'RQE ou residência em Psiquiatria', regra: { prof: 'medico', aceita: ['rqe', 'residencia'] }, status: 'aberta' },
    { slug: 'pediatra-jacarei', titulo: 'Pediatra', cidade: 'Jacareí (SP)', local: 'em Jacareí (SP)',
      requisito: 'RQE, residência ou pós-graduação em Pediatria', regra: { prof: 'medico', aceita: ['rqe', 'residencia', 'pos'] }, status: 'aberta' },
    { slug: 'go-zona-sul-sp', titulo: 'Ginecologista e obstetra', cidade: 'Zona Sul de São Paulo', local: 'na Zona Sul de São Paulo',
      requisito: 'RQE ou residência em Ginecologia e Obstetrícia', regra: { prof: 'medico', aceita: ['rqe', 'residencia'] }, status: 'pendente' },
    { slug: 'go-cacapava', titulo: 'Ginecologista e obstetra', cidade: 'Caçapava (SP)', local: 'em Caçapava (SP)',
      requisito: 'RQE em Ginecologia e Obstetrícia', regra: { prof: 'medico', aceita: ['rqe'] }, status: 'pendente' },
    { slug: 'go-aruja', titulo: 'Ginecologista e obstetra', cidade: 'Arujá (SP)', local: 'em Arujá (SP)',
      requisito: 'RQE ou residência em Ginecologia e Obstetrícia', regra: { prof: 'medico', aceita: ['rqe', 'residencia'] }, status: 'pendente' },
    { slug: 'ortopedista-barueri', titulo: 'Ortopedista', cidade: 'Barueri (SP)', local: 'em Barueri (SP)',
      requisito: 'RQE em Ortopedia', regra: { prof: 'medico', aceita: ['rqe'] }, status: 'aberta' },
    { slug: 'cirurgiao-geral-cacapava', titulo: 'Cirurgião(ã) geral', cidade: 'Caçapava (SP)', local: 'em Caçapava (SP)',
      requisito: 'RQE em Cirurgia Geral', regra: { prof: 'medico', aceita: ['rqe'] }, status: 'aberta' },
    { slug: 'neuropediatra-pinda', titulo: 'Neuropediatra', cidade: 'Pindamonhangaba e Santo Antônio do Pinhal (SP)', local: 'em Pindamonhangaba e Santo Antônio do Pinhal (SP)',
      requisito: 'RQE, residência ou pós-graduação em Neuropediatria', regra: { prof: 'medico', aceita: ['rqe', 'residencia', 'pos'] }, status: 'aberta' },
    { slug: 'endocrinologista-jacarei', titulo: 'Endocrinologista', cidade: 'Jacareí (SP)', local: 'em Jacareí (SP)',
      requisito: 'RQE, residência ou pós-graduação em Endocrinologia', regra: { prof: 'medico', aceita: ['rqe', 'residencia', 'pos'] }, status: 'aberta' },
    { slug: 'psiquiatra-lagoinha', titulo: 'Psiquiatra', cidade: 'Lagoinha (SP)', local: 'em Lagoinha (SP)',
      requisito: 'RQE em Psiquiatria', regra: { prof: 'medico', aceita: ['rqe'] }, status: 'aberta' },
    { slug: 'anestesiologista-ribeirao-preto', titulo: 'Anestesiologista', cidade: 'Ribeirão Preto (SP)', local: 'em Ribeirão Preto (SP)',
      requisito: 'RQE em Anestesiologia', regra: { prof: 'medico', aceita: ['rqe'] }, status: 'pendente' },
    { slug: 'psicologo-libras', titulo: 'Psicólogo(a) em Libras', cidade: 'Teleconsulta', local: 'por teleconsulta',
      requisito: 'CRP ativo e certificação em Libras', regra: { prof: 'psicologo' }, status: 'aberta' },
    { slug: 'terapeuta-ocupacional-pinda', titulo: 'Terapeuta ocupacional', cidade: 'Pindamonhangaba (SP)', local: 'em Pindamonhangaba (SP)',
      requisito: 'Formação em Terapia Ocupacional', regra: { prof: 'to' }, status: 'aberta' }
  ]
};
