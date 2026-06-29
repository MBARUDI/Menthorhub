import { Lesson } from './types';

// Lista de aulas exata conforme fornecido pelo usuário
export const COURSE_LESSONS: Lesson[] = [
  {
    id: '1',
    youtubeId: 'kvN3nBTSOns',
    title: 'Aula 01: Planejamento Estratégico na Prática',
    duration: 'Vídeo'
  },
  {
    id: '2',
    youtubeId: '34JRtyY1XLg',
    title: 'Aula 02: Conceitos Fundamentais de Gestão Financeira',
    duration: 'Vídeo'
  },
  {
    id: '3',
    youtubeId: 'xFyFRW_lIis',
    title: 'Aula 03: Os 5 Pilares da Gestão Empresarial',
    duration: 'Vídeo'
  },
  {
    id: '4',
    youtubeId: 'fBJ-4G28fM0',
    title: 'Aula 04: Gestão e Mapeamento de Processos',
    duration: 'Vídeo'
  },
  {
    id: '5',
    youtubeId: 'STnpThc5PQs',
    title: 'Aula 05: Liderança e Gestão de Equipes',
    duration: 'Vídeo'
  },
  {
    id: '6',
    youtubeId: 'I9vxn6yp9xs',
    title: 'Aula 06: Controle de Fluxo de Caixa',
    duration: 'Vídeo'
  },
  {
    id: '7',
    youtubeId: 'Uc7gHvrgUvY',
    title: 'Aula 07: Gestão do Capital de Giro',
    duration: 'Vídeo'
  },
  {
    id: '8',
    youtubeId: '4PbNwbieo7Y',
    title: 'Aula 08: Precificação Estratégica de Serviços',
    duration: 'Vídeo'
  },
  {
    id: '9',
    youtubeId: 'qb5LtSlDDrg',
    title: 'Aula 09: Marketing Digital para Negócios Locais',
    duration: 'Vídeo'
  },
  {
    id: '10',
    youtubeId: 'HCanaNpKmQg',
    title: 'Aula 10: Estratégias de Vendas B2B',
    duration: 'Vídeo'
  },
  {
    id: '11',
    youtubeId: 'TTRAInvXNLQ',
    title: 'Aula 11: Atendimento e Experiência do Cliente',
    duration: 'Vídeo'
  },
  {
    id: '12',
    youtubeId: '2m-vjviZkxA',
    title: 'Aula 12: Inovação e Diferenciação no Mercado',
    duration: 'Vídeo'
  },
  {
    id: '13',
    youtubeId: 'poIV1q40yu4',
    title: 'Aula 13: Empreendedorismo e Mindset de Crescimento',
    duration: 'Vídeo'
  },
  {
    id: '14',
    youtubeId: '2lOPa2CdaSs',
    title: 'Aula 14: Como Montar um Plano de Negócios Eficiente',
    duration: 'Vídeo'
  },
  {
    id: '15',
    youtubeId: 'jB4otr_XTL4',
    title: 'Aula 15: Análise SWOT Pessoal e Profissional',
    duration: 'Vídeo'
  },
  {
    id: '16',
    youtubeId: 'A0sL248FAog',
    title: 'Aula 16: Técnicas Avançadas de Negociação',
    duration: 'Vídeo'
  },
  {
    id: '17',
    youtubeId: 'hvzM1onmrBU',
    title: 'Aula 17: Produtividade e Gestão do Tempo',
    duration: 'Vídeo'
  },
  {
    id: '18',
    youtubeId: 'vX-aGm8HN9w',
    title: 'Aula 18: Inteligência Emocional no Trabalho',
    duration: 'Vídeo'
  },
  {
    id: '19',
    youtubeId: 'uHc_V4d3uMY',
    title: 'Aula 19: Comunicação Assertiva e Feedback',
    duration: 'Vídeo'
  },
  {
    id: '20',
    youtubeId: 'A0sL248FAog',
    title: 'Aula 20: Revisão de Estratégias de Negociação',
    duration: 'Vídeo'
  },
  {
    id: '21',
    youtubeId: 'qJYe-5AxvGg',
    title: 'Aula 21: Hábitos de Alta Performance',
    duration: 'Vídeo'
  }
];

export const INITIAL_SYSTEM_INSTRUCTION = `
Você é um especialista sênior em gestão empresarial e desenvolvimento profissional.
Sua tarefa é analisar o título da aula fornecida e gerar conteúdo educacional.

REGRAS RÍGIDAS:
1. Gere um resumo do tópico que tenha ESTRITAMENTE no máximo 5 linhas. Seja direto e impactante.
2. Liste exatamente 3 pontos-chave (bullet points) práticos.
3. Use tom profissional, encorajador e educativo (Português Brasil).
4. Retorne apenas JSON válido.
`;