
import { Situation } from './types';

export const SITUATIONS: Situation[] = [
  {
    id: 'ansioso',
    title: 'Ansioso e impaciente',
    references: 'Salmo 13; 37.3-5; Mateus 6.25-34; Romanos 5.3-5; Filipenses 4.6-7; Tiago 5.7-11; 1Pedro 5.6-7',
    category: 'Conforto'
  },
  {
    id: 'dinheiro',
    title: 'Preocupado com dinheiro',
    references: 'Eclesiastes 5.10; Mateus 6.19-21; 1Timóteo 6.6-10; Hebreus 13.5-6',
    category: 'Orientação'
  },
  {
    id: 'medo',
    title: 'Com medo',
    references: 'Salmo 4.8; Isaías 41.13; Lucas 8.22-25; João 14.27; 16.33; Romanos 8.1, 31-39',
    category: 'Conforto'
  },
  {
    id: 'testemunhar',
    title: 'Com medo de testemunhar sua fé em Jesus',
    references: 'Isaías 55.10-11; Jeremias 1.4-9; Mateus 5.11-12; 10.16-20; Romanos 10.8-15',
    category: 'Orientação'
  },
  {
    id: 'solitario',
    title: 'Se sentindo solitário',
    references: 'Salmo 10.12-14; 25.16-18; 68.4-6; 146; Mateus 28.20; João 14.18-19; 1Pedro 5.7',
    category: 'Conforto'
  },
  {
    id: 'angustiado',
    title: 'Angustiado e sofrendo',
    references: 'Mateus 5.4; Romanos 8.31-39; 2Coríntios 1.3-6; 4.16-18; 12.7-10; Tiago 1.2-4; Apocalipse 2.10',
    category: 'Conforto'
  },
  {
    id: 'doente',
    title: 'Doente',
    references: 'Salmo 41.1-3; 68.19-20; 103.1-5; 146; Isaías 54.10; Romanos 5.1-5; Tiago 5.14-15; 1Pedro 5.10-11',
    category: 'Conforto'
  },
  {
    id: 'doenca-terminal',
    title: 'Enfrentando uma situação de doença terminal',
    references: 'Salmo 23; Romanos 8.18-30; 2Coríntios 5.1-10',
    category: 'Conforto'
  },
  {
    id: 'morte',
    title: 'Sofrendo por causa da morte de alguém',
    references: 'João 11.25-26; 1Coríntios 15.50-58; 1Tessalonicenses 4.13-18',
    category: 'Conforto'
  },
  {
    id: 'desgraca',
    title: 'Passando por uma situação de desgraça total',
    references: 'Jó 1.13-22; Isaías 55.8-9; Romanos 8.28',
    category: 'Conforto'
  },
  {
    id: 'viagem',
    title: 'De saída para uma viagem',
    references: 'Salmo 46.1-3; 91.1-6, 14-16; 121',
    category: 'Orientação'
  },
  {
    id: 'tentacao',
    title: 'Enfrentando uma tentação',
    references: 'Romanos 12.1-2; 1Coríntios 10.12-13; Hebreus 2.17-18; 4.14-16; Tiago 1.12-15; 4.7',
    category: 'Orientação'
  },
  {
    id: 'sem-desejo-culto',
    title: 'Sem desejo de participar dos cultos',
    references: 'Salmo 26.8; 84; 133.1; Efésios 3.16-17; Hebreus 10.23-25',
    category: 'Crescimento'
  },
  {
    id: 'orientacao',
    title: 'Precisando de orientação',
    references: 'Salmo 16; 25.4-10; 32.8; 119.105; Isaías 30.21',
    category: 'Orientação'
  },
  {
    id: 'decisoes',
    title: 'Tomando decisões',
    references: 'Provérbios 3.5-6; 16.3; 1Coríntios 10.31; Gálatas 6.10; Tiago 1.5-8',
    category: 'Orientação'
  },
  {
    id: 'raiva',
    title: 'Com raiva',
    references: 'Mateus 5.44-48; Romanos 12.17-21; 1Coríntios 13; Colossenses 3.12-17; Tiago 1.19-20',
    category: 'Crescimento'
  },
  {
    id: 'inveja',
    title: 'Com inveja',
    references: 'Salmo 49.16-20; Tiago 3.13-18',
    category: 'Crescimento'
  },
  {
    id: 'culpado',
    title: 'Se sentindo culpado',
    references: 'Salmo 32; 51; 130; Isaías 1.18; Lucas 15; João 6.37; 1João 1.8-2.2',
    category: 'Conforto'
  },
  {
    id: 'abandonado',
    title: 'Pensando que Deus abandonou você',
    references: 'Salmo 22.1-11; 139.1-12; Isaías 49.14-16; Filipenses 4.10-13; Hebreus 10.19-25',
    category: 'Conforto'
  },
  {
    id: 'cansado',
    title: 'Cansado e desanimado',
    references: 'Salmo 34.15-22; Isaías 40.25-31; Mateus 11.28-30; Hebreus 12.1-3',
    category: 'Conforto'
  },
  {
    id: 'caminho-ceu',
    title: 'Procurando o caminho para o céu',
    references: 'João 3.16; 14.5-6; Romanos 6.20-23; 10.9-13; Efésios 2.8-9',
    category: 'Orientação'
  },
  {
    id: 'orar',
    title: 'Querendo saber como orar',
    references: 'Mateus 6.5-15; 7.7-11; Marcos 14.36; João 15.7; Filipenses 4.6-7; 1Tessalonicenses 5.17; 1João 5.14-15',
    category: 'Oração'
  },
  {
    id: 'agradecido',
    title: 'Agradecido pelas bênçãos de Deus',
    references: 'Salmo 98; 100; 103; 1Tessalonicenses 5.16-18',
    category: 'Oração'
  }
];
