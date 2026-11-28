import { useState, type CSSProperties } from 'react'
import type { Section } from '../components/Navbar'

type Language = 'es' | 'en' | 'pt'
type FontScale = 'normal' | 'large' | 'xlarge'
type ContrastMode = 'standard' | 'sepia' | 'high-contrast'

interface QuestionLocalized {
  prompt: string
  options: string[]
  correctIndex: number
  feedback: string
  hint: string
}

interface GlossaryItem {
  term: string
  meaning: string
}

interface ReadingLocalized {
  category: string
  title: string
  paragraphs: string[]
  glossary: GlossaryItem[]
  questions: QuestionLocalized[]
  credits: {
    author: string
    adaptation: string
    translator: string
    source: string
    copyrightNotice: string
  }
}

interface ReadingWork {
  id: string
  translations: Record<Language, ReadingLocalized>
}

const UI_LABELS: Record<
  Language,
  {
    eyebrow: string
    mainTitle: string
    subtitle: string
    questionPill: (current: number, total: number) => string
    readingSelectorLabel: string
    languageLabel: string
    fontSizeLabel: string
    contrastLabel: string
    fontOptions: Record<FontScale, string>
    contrastOptions: Record<ContrastMode, string>
    glossaryTitle: string
    comprehensionEyebrow: string
    optionsAriaLabel: string
    retryMessage: (hint: string) => string
    secondFailMessage: (feedback: string) => string
    retryButton: string
    nextButton: string
    finishButton: string
    checkButton: string
    completedEyebrow: string
    completedTitle: string
    completedSummary: (correct: number, total: number) => string
    readAgainButton: string
    goPracticeButton: string
    creditsTitle: string
    authorLabel: string
    adaptationLabel: string
    translatorLabel: string
    sourceLabel: string
  }
> = {
  es: {
    eyebrow: 'COMPRENSIÓN LECTORA MULTILINGÜE',
    mainTitle: 'Leer también es descubrir.',
    subtitle: 'Alterna idiomas, ajusta la vista a tu comodidad y comprende literatura paso a paso.',
    questionPill: (current, total) => `Pregunta ${current} de ${total}`,
    readingSelectorLabel: 'Lectura:',
    languageLabel: 'Idioma',
    fontSizeLabel: 'Letra',
    contrastLabel: 'Contraste',
    fontOptions: { normal: 'A-', large: 'A', xlarge: 'A+' },
    contrastOptions: { standard: 'Estándar', sepia: 'Sepia', 'high-contrast': 'Alto contraste' },
    glossaryTitle: 'Glosario literario',
    comprehensionEyebrow: 'COMPRENDE Y RESPONDE',
    optionsAriaLabel: 'Opciones de respuesta',
    retryMessage: (hint) => `No es esa opción. Revisa el texto e inténtalo de nuevo: ${hint}`,
    secondFailMessage: (feedback) => `Se agotaron los intentos en esta pregunta. ${feedback}`,
    retryButton: 'Intentar de nuevo',
    nextButton: 'Siguiente pregunta',
    finishButton: 'Ver resultado',
    checkButton: 'Comprobar respuesta',
    completedEyebrow: 'LECTURA COMPLETADA',
    completedTitle: '¡Terminaste esta historia!',
    completedSummary: (correct, total) =>
      `Respondiste correctamente ${correct} de ${total} preguntas. Puedes cambiar de idioma o explorar otra lectura.`,
    readAgainButton: 'Leer de nuevo',
    goPracticeButton: 'Ir a práctica',
    creditsTitle: 'Ficha de créditos y derechos de autor',
    authorLabel: 'Autoría original:',
    adaptationLabel: 'Adaptación pedagógica:',
    translatorLabel: 'Traducción y revisión:',
    sourceLabel: 'Colección:',
  },
  en: {
    eyebrow: 'MULTILINGUAL READING COMPREHENSION',
    mainTitle: 'Reading is also discovering.',
    subtitle: 'Switch languages, customize visual comfort, and explore literature step by step.',
    questionPill: (current, total) => `Question ${current} of ${total}`,
    readingSelectorLabel: 'Story:',
    languageLabel: 'Language',
    fontSizeLabel: 'Text size',
    contrastLabel: 'Contrast',
    fontOptions: { normal: 'A-', large: 'A', xlarge: 'A+' },
    contrastOptions: { standard: 'Standard', sepia: 'Sepia', 'high-contrast': 'High contrast' },
    glossaryTitle: 'Literary glossary',
    comprehensionEyebrow: 'READ AND RESPOND',
    optionsAriaLabel: 'Answer choices',
    retryMessage: (hint) => `Not quite. Check the passage and try again: ${hint}`,
    secondFailMessage: (feedback) => `No attempts left for this question. ${feedback}`,
    retryButton: 'Try again',
    nextButton: 'Next question',
    finishButton: 'See results',
    checkButton: 'Check answer',
    completedEyebrow: 'READING COMPLETED',
    completedTitle: 'You finished this story!',
    completedSummary: (correct, total) =>
      `You answered ${correct} out of ${total} questions correctly. You can switch languages or explore another text.`,
    readAgainButton: 'Read again',
    goPracticeButton: 'Go to practice',
    creditsTitle: 'Credits & Copyright Notice',
    authorLabel: 'Original author:',
    adaptationLabel: 'Pedagogical adaptation:',
    translatorLabel: 'Translation & review:',
    sourceLabel: 'Collection:',
  },
  pt: {
    eyebrow: 'COMPREENSÃO LEITORA MULTILÍNGUE',
    mainTitle: 'Ler também é descobrir.',
    subtitle: 'Alterne idiomas, ajuste o conforto visual e compreenda literatura passo a passo.',
    questionPill: (current, total) => `Pergunta ${current} de ${total}`,
    readingSelectorLabel: 'Leitura:',
    languageLabel: 'Idioma',
    fontSizeLabel: 'Fonte',
    contrastLabel: 'Contraste',
    fontOptions: { normal: 'A-', large: 'A', xlarge: 'A+' },
    contrastOptions: { standard: 'Padrão', sepia: 'Sépia', 'high-contrast': 'Alto contraste' },
    glossaryTitle: 'Glossário literário',
    comprehensionEyebrow: 'COMPREENDA E RESPONDA',
    optionsAriaLabel: 'Opções de resposta',
    retryMessage: (hint) => `Não é essa opção. Releia o texto e tente novamente: ${hint}`,
    secondFailMessage: (feedback) => `Tentativas esgotadas nesta pergunta. ${feedback}`,
    retryButton: 'Tentar novamente',
    nextButton: 'Próxima pergunta',
    finishButton: 'Ver resultado',
    checkButton: 'Verificar resposta',
    completedEyebrow: 'LEITURA CONCLUÍDA',
    completedTitle: 'Você concluiu esta história!',
    completedSummary: (correct, total) =>
      `Você acertou ${correct} de ${total} perguntas. Você pode mudar o idioma ou explorar outra leitura.`,
    readAgainButton: 'Ler novamente',
    goPracticeButton: 'Ir para prática',
    creditsTitle: 'Ficha de créditos e direitos autorais',
    authorLabel: 'Autoria original:',
    adaptationLabel: 'Adaptação pedagógica:',
    translatorLabel: 'Tradução e revisão:',
    sourceLabel: 'Coleção:',
  },
}

const READINGS: ReadingWork[] = [
  {
    id: 'huerto-biblioteca',
    translations: {
      es: {
        category: 'NARRATIVA COMUNITARIA',
        title: 'El huerto de la biblioteca',
        paragraphs: [
          'El sábado por la mañana, Luna encontró un terreno vacío junto a la biblioteca. Don Luis, el bibliotecario, le contó que antes allí había un pequeño huerto. Luna invitó a sus vecinos a recuperarlo.',
          'Primero quitaron las piedras y aflojaron la tierra. Don Luis llevó semillas de frijol y calabaza. Les explicó que algunas semillas germinaban más rápido si las dejaban en agua durante la noche. Los niños hicieron letreros para recordar dónde habían sembrado cada una.',
          'Durante las semanas siguientes, varias familias se turnaron para regar las plantas. Cuando llegó el momento de cosechar, encontraron frijoles, calabazas y algunas flores. Luna propuso compartir todo con quienes habían ayudado. Desde entonces, el huerto se convirtió en un lugar para aprender y trabajar en equipo.',
        ],
        glossary: [
          { term: 'Germinar', meaning: 'Comenzar a crecer y desarrollarse una semilla hasta brotar.' },
          { term: 'Cosechar', meaning: 'Recoger los frutos, semillas o verduras cuando ya maduraron.' },
        ],
        questions: [
          {
            prompt: '¿Cuál es la idea principal del texto?',
            options: [
              'Luna aprende a cuidar un huerto con ayuda de su comunidad.',
              'Luna quería comprar todas las plantas del mercado.',
              'La lluvia impidió que crecieran las semillas.',
            ],
            correctIndex: 0,
            feedback: 'El texto cuenta cómo Luna y sus vecinos preparan, cuidan y comparten lo que crece en el huerto.',
            hint: 'Piensa en lo que ocurre desde el comienzo hasta el final de la historia.',
          },
          {
            prompt: '¿Por qué Don Luis recomendó poner las semillas en agua antes de sembrarlas?',
            options: [
              'Para que germinaran más rápido.',
              'Para que cambiaran de color.',
              'Para medir cuánta lluvia caería.',
            ],
            correctIndex: 0,
            feedback: 'Don Luis explicó que así algunas semillas comenzarían a germinar más rápido.',
            hint: 'Busca la explicación que Don Luis dio cuando entregó las semillas.',
          },
          {
            prompt: '¿Qué se puede inferir cuando los vecinos comparten la cosecha?',
            options: [
              'Que colaborar ayuda a que todos disfruten el resultado.',
              'Que Luna hizo todo el trabajo sin ayuda.',
              'Que las verduras solo sirven para venderlas.',
            ],
            correctIndex: 0,
            feedback: 'Aunque cada persona ayudó de una manera distinta, compartieron lo que cosecharon.',
            hint: 'Relaciona el trabajo de los vecinos con lo que hicieron al final.',
          },
        ],
        credits: {
          author: 'Valeria Mendoza Ríos (Relato original para educación básica)',
          adaptation: 'Equipo Pedagógico AULA AI — Módulo de Lectura y Accesibilidad',
          translator: 'Traducción multilingüe ES/EN/PT por Laboratorio Lingüístico AULA AI',
          source: 'Antología Escolar "Historias de Barrio y Ciencia", Vol. I (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Valeria Mendoza Ríos. Obra licenciada bajo Creative Commons CC BY-NC-SA 4.0 para uso educativo gratuito en aulas.',
        },
      },
      en: {
        category: 'COMMUNITY NARRATIVE',
        title: 'The Library Garden',
        paragraphs: [
          'On Saturday morning, Luna found an empty lot next to the library. Don Luis, the librarian, told her there used to be a small garden there. Luna invited her neighbors to bring it back to life.',
          'First, they cleared away the stones and loosened the soil. Don Luis brought bean and squash seeds. He explained that some seeds sprout faster if soaked in water overnight. The children made wooden signs to remember where each seed had been planted.',
          'Over the next few weeks, several families took turns watering the plants. When harvest time arrived, they found beans, squash, and bright flowers. Luna suggested sharing everything with everyone who had helped. Since then, the garden has become a place to learn and work together.',
        ],
        glossary: [
          { term: 'Sprout (Germinar)', meaning: 'When a seed begins to grow and send out new shoots.' },
          { term: 'Harvest (Cosechar)', meaning: 'To gather ripe crops, fruits, or vegetables from the garden.' },
        ],
        questions: [
          {
            prompt: 'What is the main idea of the passage?',
            options: [
              'Luna learns to care for a garden with the help of her community.',
              'Luna wanted to buy every plant at the local market.',
              'Heavy rain prevented any of the seeds from growing.',
            ],
            correctIndex: 0,
            feedback: 'The story shows how Luna and her neighbors prepare, tend, and share the garden harvest.',
            hint: 'Think about what happens from the beginning to the end of the story.',
          },
          {
            prompt: 'Why did Don Luis suggest soaking the seeds in water before planting?',
            options: [
              'So they would sprout faster.',
              'So they would change color.',
              'To measure how much rain would fall.',
            ],
            correctIndex: 0,
            feedback: 'Don Luis explained that soaking helps some seeds begin sprouting faster.',
            hint: 'Look at the explanation Don Luis gave when he handed out the seeds.',
          },
          {
            prompt: 'What can we infer when the neighbors share the harvest?',
            options: [
              'Working together allows everyone to enjoy the results.',
              'Luna did all the gardening work completely alone.',
              'Vegetables are only grown to be sold at a store.',
            ],
            correctIndex: 0,
            feedback: 'Even though each neighbor helped in a different way, they shared what they grew together.',
            hint: 'Connect the neighbors’ teamwork with what they did at the end.',
          },
        ],
        credits: {
          author: 'Valeria Mendoza Ríos (Original story for K-12 education)',
          adaptation: 'AULA AI Pedagogical Team — Reading & Accessibility Module',
          translator: 'ES/EN/PT Multilingual Edition by AULA AI Language Lab',
          source: 'School Anthology "Neighborhood & Science Stories", Vol. I (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Valeria Mendoza Ríos. Licensed under Creative Commons CC BY-NC-SA 4.0 for non-commercial classroom use.',
        },
      },
      pt: {
        category: 'NARRATIVA COMUNITÁRIA',
        title: 'A Horta da Biblioteca',
        paragraphs: [
          'No sábado de manhã, Luna encontrou um terreno vazio ao lado da biblioteca. Seu Luís, o bibliotecário, contou que antes havia uma pequena horta ali. Luna convidou seus vizinhos para recuperá-la.',
          'Primeiro tiraram as pedras e afofaram a terra. Seu Luís trouxe sementes de feijão e abóbora. Ele explicou que algumas sementes germinam mais rápido se ficarem de molho na água durante a noite. As crianças fizeram plaquinhas para lembrar onde haviam plantado cada uma.',
          'Nas semanas seguintes, várias famílias se revezaram para regar as plantas. Quando chegou a hora de colher, encontraram feijões, abóboras e algumas flores. Luna propôs dividir tudo com quem havia ajudado. Desde então, a horta tornou-se um espaço para aprender e trabalhar em equipe.',
        ],
        glossary: [
          { term: 'Germinar', meaning: 'Começar a brotar e se desenvolver a partir de uma semente.' },
          { term: 'Colher (Cosechar)', meaning: 'Recolher os frutos, grãos ou legumes quando estão maduros.' },
        ],
        questions: [
          {
            prompt: 'Qual é a ideia principal do texto?',
            options: [
              'Luna aprende a cuidar de uma horta com a ajuda de sua comunidade.',
              'Luna queria comprar todas as plantas do mercado.',
              'A chuva impediu que as sementes crescessem.',
            ],
            correctIndex: 0,
            feedback: 'O texto mostra como Luna e seus vizinhos preparam, cuidam e compartilham o que cresce na horta.',
            hint: 'Pense no que acontece do início ao fim da história.',
          },
          {
            prompt: 'Por que Seu Luís recomendou deixar as sementes na água antes de plantar?',
            options: [
              'Para que germinassem mais rápido.',
              'Para que mudassem de cor.',
              'Para medir quanta chuva cairia.',
            ],
            correctIndex: 0,
            feedback: 'Seu Luís explicou que assim algumas sementes começariam a germinar mais rápido.',
            hint: 'Procure a explicação que Seu Luís deu ao entregar as sementes.',
          },
          {
            prompt: 'O que se pode inferir quando os vizinhos compartilham a colheita?',
            options: [
              'Que colaborar ajuda todos a aproveitarem o resultado.',
              'Que Luna fez todo o trabalho sozinha.',
              'Que os legumes só servem para venda.',
            ],
            correctIndex: 0,
            feedback: 'Embora cada pessoa tenha ajudado de um jeito diferente, todos compartilharam o que colheram.',
            hint: 'Relacione o trabalho dos vizinhos com o que fizeram no final.',
          },
        ],
        credits: {
          author: 'Valeria Mendoza Ríos (Conto original para educação básica)',
          adaptation: 'Equipe Pedagógica AULA AI — Módulo de Leitura e Acessibilidade',
          translator: 'Tradução multilíngue ES/EN/PT pelo Laboratório Linguístico AULA AI',
          source: 'Antologia Escolar "Histórias de Bairro e Ciência", Vol. I (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Valeria Mendoza Ríos. Obra licenciada sob Creative Commons CC BY-NC-SA 4.0 para uso educacional gratuito.',
        },
      },
    },
  },
  {
    id: 'faro-niebla',
    translations: {
      es: {
        category: 'LITERATURA Y CIENCIA',
        title: 'El cuaderno del farero',
        paragraphs: [
          'En la costa de Veracruz, Mateo ayudaba a su abuelo a limpiar las lentes del antiguo faro. Cada noche anotaban en un cuaderno la hora en que bajaba la niebla y la distancia a la que se distinguía el destello sobre el mar.',
          'Una tarde de noviembre, la niebla cubrió el puerto antes del anochecer. Gracias a los registros del cuaderno, Mateo notó que el viento del norte dispersaba la bruma si encendían la lámpara auxiliar quince minutos antes.',
          'Los barcos pesqueros regresaron guiados por esa luz constante. Al día siguiente, los capitanes agradecieron la precisión de aquellas notas que unían la observación paciente con el cuidado de la costa.',
        ],
        glossary: [
          { term: 'Bruma', meaning: 'Niebla ligera que se forma sobre el mar y reduce la visibilidad.' },
          { term: 'Destello', meaning: 'Resplandor breve e intenso emitido por una fuente de luz.' },
        ],
        questions: [
          {
            prompt: '¿Para qué servía el cuaderno que llevaban Mateo y su abuelo?',
            options: [
              'Para registrar el comportamiento de la niebla y el alcance de la luz del faro.',
              'Para dibujar mapas de islas lejanas.',
              'Para anotar los precios del pescado en el puerto.',
            ],
            correctIndex: 0,
            feedback: 'El cuaderno guardaba observaciones precisas sobre la niebla y la visibilidad del destello.',
            hint: 'Revisa el primer párrafo para ver qué escribían cada noche.',
          },
          {
            prompt: '¿Qué permitió que los barcos regresaran seguros durante la tarde de noviembre?',
            options: [
              'Encender la lámpara auxiliar antes, basándose en los registros previos.',
              'Que la niebla desapareció por completo al mediodía.',
              'Que los barcos navegaron sin necesidad de luces.',
            ],
            correctIndex: 0,
            feedback: 'Los datos anotados previamente ayudaron a anticipar el efecto del viento del norte.',
            hint: 'Observa qué decisión tomó Mateo al revisar los registros del cuaderno.',
          },
        ],
        credits: {
          author: 'Carlos Alberto Domínguez (Cuento breve inspirado en faros del Golfo de México)',
          adaptation: 'Equipo Pedagógico AULA AI — Módulo de Lectura y Accesibilidad',
          translator: 'Traducción multilingüe ES/EN/PT por Laboratorio Lingüístico AULA AI',
          source: 'Cuadernos de Lectura Científica y Literaria, Serie Costa (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Carlos Alberto Domínguez. Distribución educativa autorizada bajo licencia CC BY-NC-SA 4.0.',
        },
      },
      en: {
        category: 'LITERATURE & SCIENCE',
        title: 'The Lighthouse Keeper’s Notebook',
        paragraphs: [
          'On the coast of Veracruz, Mateo helped his grandfather polish the lenses of the old lighthouse. Every night they recorded in a notebook the exact hour the fog rolled in and how far the beam could be seen across the sea.',
          'One November afternoon, thick fog blanketed the harbor before dusk. Thanks to the notebook logs, Mateo noticed that the north wind scattered the mist if they lit the auxiliary lamp fifteen minutes earlier.',
          'The fishing boats returned safely, guided by that steady beam. The next morning, the captains thanked them for the precision of notes that combined patient observation with care for the coast.',
        ],
        glossary: [
          { term: 'Mist (Bruma)', meaning: 'Light fog over the sea that limits how far sailors can see.' },
          { term: 'Beam (Destello)', meaning: 'A bright ray or flash of light projected from a lighthouse.' },
        ],
        questions: [
          {
            prompt: 'What was the purpose of the notebook kept by Mateo and his grandfather?',
            options: [
              'To log fog patterns and how far the lighthouse beam was visible.',
              'To draw treasure maps of distant islands.',
              'To track fish prices at the harbor market.',
            ],
            correctIndex: 0,
            feedback: 'The notebook preserved careful observations about fog timing and beam visibility.',
            hint: 'Check the first paragraph to see what they wrote down every night.',
          },
          {
            prompt: 'What helped the boats return safely on that November afternoon?',
            options: [
              'Lighting the auxiliary lamp early based on their previous logs.',
              'The fog vanishing completely at noon.',
              'Sailing without needing any harbor lights.',
            ],
            correctIndex: 0,
            feedback: 'Past records helped Mateo anticipate how the north wind interacted with the fog.',
            hint: 'Look at what Mateo did after checking the notebook records.',
          },
        ],
        credits: {
          author: 'Carlos Alberto Domínguez (Short story inspired by Gulf of Mexico lighthouses)',
          adaptation: 'AULA AI Pedagogical Team — Reading & Accessibility Module',
          translator: 'ES/EN/PT Multilingual Edition by AULA AI Language Lab',
          source: 'Scientific & Literary Reading Notebooks, Coast Series (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Carlos Alberto Domínguez. Educational distribution authorized under CC BY-NC-SA 4.0.',
        },
      },
      pt: {
        category: 'LITERATURA E CIÊNCIA',
        title: 'O Caderno do Faroleiro',
        paragraphs: [
          'Na costa de Veracruz, Mateo ajudava seu avô a limpar as lentes do antigo farol. Todas as noites anotavam em um caderno a hora em que a neblina descia e a distância em que o feixe de luz era visto sobre o mar.',
          'Numa tarde de novembro, a neblina cobriu o porto antes do anoitecer. Graças aos registros do caderno, Mateo percebeu que o vento norte dispersava a bruma se acendessem a lâmpada auxiliar quinze minutos antes.',
          'Os barcos pesqueiros retornaram guiados por aquela luz constante. No dia seguinte, os capitães agradeceram a precisão das anotações que uniam a observação paciente ao cuidado com a costa.',
        ],
        glossary: [
          { term: 'Bruma', meaning: 'Neblina leve formada sobre o mar que reduz a visibilidade.' },
          { term: 'Feixe (Destello)', meaning: 'Clarão intenso emitido pela lente de um farol.' },
        ],
        questions: [
          {
            prompt: 'Para que servia o caderno mantido por Mateo e seu avô?',
            options: [
              'Para registrar o comportamento da neblina e o alcance da luz do farol.',
              'Para desenhar mapas de ilhas distantes.',
              'Para anotar os preços dos peixes no porto.',
            ],
            correctIndex: 0,
            feedback: 'O caderno guardava observações detalhadas sobre a neblina e a visibilidade do farol.',
            hint: 'Releia o primeiro parágrafo para ver o que eles anotavam todas as noites.',
          },
          {
            prompt: 'O que permitiu que os barcos voltassem em segurança naquela tarde de novembro?',
            options: [
              'Acender a lâmpada auxiliar mais cedo com base nos registros anteriores.',
              'A neblina desaparecer totalmente ao meio-dia.',
              'Navegar sem precisar de nenhuma luz.',
            ],
            correctIndex: 0,
            feedback: 'Os registros anteriores ajudaram a antecipar o efeito do vento norte sobre a bruma.',
            hint: 'Observe a atitude de Mateo ao consultar o caderno.',
          },
        ],
        credits: {
          author: 'Carlos Alberto Domínguez (Conto inspirado nos faróis do Golfo do México)',
          adaptation: 'Equipe Pedagógica AULA AI — Módulo de Leitura e Acessibilidade',
          translator: 'Tradução multilíngue ES/EN/PT pelo Laboratório Linguístico AULA AI',
          source: 'Cadernos de Leitura Científica e Literária, Série Costa (2026)',
          copyrightNotice:
            '© 2026 AULA AI / Carlos Alberto Domínguez. Distribuição educacional autorizada sob licença CC BY-NC-SA 4.0.',
        },
      },
    },
  },
]

const FONT_SIZE_MAP: Record<FontScale, { fontSize: string; titleSize: string; lineHeight: string }> = {
  normal: { fontSize: '1rem', titleSize: '1.5rem', lineHeight: '1.7' },
  large: { fontSize: '1.25rem', titleSize: '1.75rem', lineHeight: '1.8' },
  xlarge: { fontSize: '1.5rem', titleSize: '2rem', lineHeight: '1.9' },
}

const CONTRAST_THEMES: Record<
  ContrastMode,
  {
    card: CSSProperties
    icon: CSSProperties
    eyebrowColor?: string
    titleColor?: string
    bodyColor?: string
    glossaryBox: CSSProperties
    accentColor?: string
    footer: CSSProperties
  }
> = {
  standard: {
    card: {},
    icon: {},
    glossaryBox: {},
    footer: {
      borderTop: '1px solid rgba(148, 163, 184, 0.3)',
    },
  },
  sepia: {
    card: {
      backgroundImage: 'none',
      backgroundColor: '#f5ecd8',
      color: '#2b2114',
      borderColor: '#c9b386',
      boxShadow: '0 12px 30px rgba(43, 33, 20, 0.14)',
    },
    icon: {
      backgroundImage: 'none',
      backgroundColor: '#e6d5b3',
      color: '#2b2114',
      borderColor: '#bfa675',
    },
    eyebrowColor: '#6b5335',
    titleColor: '#1f160c',
    bodyColor: '#2b2114',
    glossaryBox: {
      backgroundImage: 'none',
      backgroundColor: '#eadbc0',
      color: '#2b2114',
      borderColor: '#c9b386',
    },
    accentColor: '#7c4a12',
    footer: {
      color: '#3d2f1d',
      borderTop: '1px solid #c9b386',
    },
  },
  'high-contrast': {
    card: {
      backgroundImage: 'none',
      backgroundColor: '#05070c',
      color: '#ffffff',
      borderColor: '#facc15',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
    },
    icon: {
      backgroundImage: 'none',
      backgroundColor: '#facc15',
      color: '#05070c',
      borderColor: '#facc15',
    },
    eyebrowColor: '#facc15',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    glossaryBox: {
      backgroundImage: 'none',
      backgroundColor: '#111827',
      color: '#ffffff',
      borderColor: '#facc15',
    },
    accentColor: '#facc15',
    footer: {
      color: '#f3f4f6',
      borderTop: '1px solid #facc15',
    },
  },
}

export default function StudentReading({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const [readingIndex, setReadingIndex] = useState(0)
  const [language, setLanguage] = useState<Language>('es')
  const [fontScale, setFontScale] = useState<FontScale>('normal')
  const [contrast, setContrast] = useState<ContrastMode>('standard')

  const [index, setIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correct, setCorrect] = useState(0)

  const t = UI_LABELS[language]
  const currentWork = READINGS[readingIndex]
  const localized = currentWork.translations[language]
  const questions = localized.questions
  const question = questions[index]

  const isCorrect = checked && selectedIndex === question?.correctIndex
  const maxAttempts = question ? Math.max(1, Math.min(2, question.options.length - 1)) : 2
  const outOfAttempts = checked && !isCorrect && attempts >= maxAttempts
  const shouldRevealCorrect = isCorrect || outOfAttempts
  const themePalette = CONTRAST_THEMES[contrast]

  const selectReading = (nextReadingIdx: number) => {
    setReadingIndex(nextReadingIdx)
    setIndex(0)
    setSelectedIndex(null)
    setChecked(false)
    setAttempts(0)
    setCorrect(0)
  }

  const checkAnswer = () => {
    if (selectedIndex === null || checked || !question) return
    setAttempts((prev) => prev + 1)
    setChecked(true)
    if (selectedIndex === question.correctIndex) {
      setCorrect((count) => count + 1)
    }
  }

  const nextQuestion = () => {
    setIndex((current) => current + 1)
    setSelectedIndex(null)
    setChecked(false)
    setAttempts(0)
  }

  const restart = () => {
    setIndex(0)
    setSelectedIndex(null)
    setChecked(false)
    setAttempts(0)
    setCorrect(0)
  }

  const readerSurfaceStyle: CSSProperties = {
    ...themePalette.card,
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
  }

  return (
    <section className="student-page reading-page" aria-labelledby="reading-title">
      <div className="student-page-heading">
        <div>
          <span className="eyebrow muted-eyebrow">{t.eyebrow}</span>
          <h1 id="reading-title">{t.mainTitle}</h1>
          <p>{t.subtitle}</p>
        </div>
        {index < questions.length && (
          <span className="session-data-pill">
            <span className="live-dot" /> {t.questionPill(index + 1, questions.length)}
          </span>
        )}
      </div>

      {/* Barra superior: Selector de Lectura, Idioma (ES/EN/PT) y Accesibilidad (Letra y Contraste) */}
      <div
        className="glass-panel"
        role="region"
        aria-label="Controles de idioma y accesibilidad de lectura"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Selector de obra literaria */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>{t.readingSelectorLabel}</span>
          {READINGS.map((work, idx) => (
            <button
              key={work.id}
              type="button"
              onClick={() => selectReading(idx)}
              className={`button ${readingIndex === idx ? 'button-primary' : 'button-secondary'}`}
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
            >
              {work.translations[language].title}
            </button>
          ))}
        </div>

        {/* Selector multilingüe: Español, Inglés y Portugués */}
        <div
          role="group"
          aria-label={t.languageLabel}
          style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>{t.languageLabel}:</span>
          {(
            [
              { code: 'es', label: 'ES · Español' },
              { code: 'en', label: 'EN · English' },
              { code: 'pt', label: 'PT · Português' },
            ] as const
          ).map((lang) => (
            <button
              key={lang.code}
              type="button"
              aria-pressed={language === lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`button ${language === lang.code ? 'button-primary' : 'button-secondary'}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Barra de accesibilidad: Tamaño de tipografía y Contraste */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div role="group" aria-label={t.fontSizeLabel} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>{t.fontSizeLabel}:</span>
            {(['normal', 'large', 'xlarge'] as const).map((scale) => (
              <button
                key={scale}
                type="button"
                aria-pressed={fontScale === scale}
                onClick={() => setFontScale(scale)}
                className={`button ${fontScale === scale ? 'button-primary' : 'button-secondary'}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', minWidth: '2.1rem' }}
              >
                {t.fontOptions[scale]}
              </button>
            ))}
          </div>

          <div role="group" aria-label={t.contrastLabel} style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, opacity: 0.85 }}>{t.contrastLabel}:</span>
            {(['standard', 'sepia', 'high-contrast'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={contrast === mode}
                onClick={() => setContrast(mode)}
                className={`button ${contrast === mode ? 'button-primary' : 'button-secondary'}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
              >
                {t.contrastOptions[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {index < questions.length ? (
        <div className="reading-layout">
          <article className="reading-passage glass-panel" style={readerSurfaceStyle}>
            <div className="reading-passage-head">
              <span className="reading-book-icon" aria-hidden="true" style={themePalette.icon}>
                Aa
              </span>
              <div>
                <span
                  className="eyebrow muted-eyebrow"
                  style={themePalette.eyebrowColor ? { color: themePalette.eyebrowColor } : undefined}
                >
                  {localized.category}
                </span>
                <h2
                  style={{
                    color: themePalette.titleColor,
                    fontSize: FONT_SIZE_MAP[fontScale].titleSize,
                  }}
                >
                  {localized.title}
                </h2>
              </div>
            </div>

            <div className="reading-text">
              {localized.paragraphs.map((paragraph, paragraphIndex) => (
                <p
                  key={paragraphIndex}
                  style={{
                    color: themePalette.bodyColor,
                    marginBottom: '1rem',
                    fontSize: FONT_SIZE_MAP[fontScale].fontSize,
                    lineHeight: FONT_SIZE_MAP[fontScale].lineHeight,
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Glosario bilingüe/contextual */}
            <div className="reading-vocabulary" style={themePalette.glossaryBox}>
              <span
                className="vocabulary-mark"
                style={themePalette.accentColor ? { color: themePalette.accentColor } : undefined}
              >
                ✧
              </span>
              <div style={{ fontSize: '0.92rem', color: themePalette.bodyColor }}>
                <strong style={themePalette.accentColor ? { color: themePalette.accentColor } : undefined}>
                  {t.glossaryTitle}
                </strong>
                <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0, color: themePalette.bodyColor }}>
                  {localized.glossary.map((item) => (
                    <li key={item.term} style={{ marginBottom: '0.2rem', color: themePalette.bodyColor }}>
                      <strong style={themePalette.accentColor ? { color: themePalette.accentColor } : undefined}>
                        {item.term}:
                      </strong>{' '}
                      {item.meaning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ficha de créditos, autoría y aviso de derechos de autor */}
            <footer
              aria-label={t.creditsTitle}
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.9rem',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                ...themePalette.footer,
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: themePalette.accentColor ?? 'inherit',
                }}
              >
                {t.creditsTitle}
              </p>
              <p style={{ margin: '0.15rem 0', color: 'inherit' }}>
                <strong style={{ color: 'inherit' }}>{t.authorLabel}</strong> {localized.credits.author}
              </p>
              <p style={{ margin: '0.15rem 0', color: 'inherit' }}>
                <strong style={{ color: 'inherit' }}>{t.adaptationLabel}</strong> {localized.credits.adaptation}
              </p>
              <p style={{ margin: '0.15rem 0', color: 'inherit' }}>
                <strong style={{ color: 'inherit' }}>{t.translatorLabel}</strong> {localized.credits.translator}
              </p>
              <p style={{ margin: '0.15rem 0', color: 'inherit' }}>
                <strong style={{ color: 'inherit' }}>{t.sourceLabel}</strong> {localized.credits.source}
              </p>
              <p style={{ marginTop: '0.4rem', fontStyle: 'italic', color: 'inherit' }}>
                {localized.credits.copyrightNotice}
              </p>
            </footer>
          </article>

          <article className="reading-question-card glass-panel" aria-labelledby="reading-question">
            <div className="reading-question-head">
              <span className="eyebrow">
                <span className="eyebrow-dot" /> {t.comprehensionEyebrow}
              </span>
              <span className="reading-question-count">
                {String(index + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
              </span>
            </div>

            <div className="reading-progress-track" aria-hidden="true">
              <span style={{ width: `${Math.round(((index + 1) / questions.length) * 100)}%` }} />
            </div>

            <h2 id="reading-question" style={{ fontSize: FONT_SIZE_MAP[fontScale].titleSize }}>
              {question.prompt}
            </h2>

            <div className="reading-options" role="group" aria-label={t.optionsAriaLabel}>
              {question.options.map((option, optionIndex) => {
                const isWrongSelection = checked && !isCorrect && selectedIndex === optionIndex
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    className={`answer-option ${selectedIndex === optionIndex ? 'is-selected' : ''} ${
                      shouldRevealCorrect && optionIndex === question.correctIndex ? 'reading-correct-option' : ''
                    }`}
                    style={
                      isWrongSelection
                        ? { borderColor: '#f87171', backgroundColor: 'rgba(248, 113, 113, 0.12)' }
                        : undefined
                    }
                    aria-pressed={selectedIndex === optionIndex}
                    onClick={() => {
                      if (!checked) setSelectedIndex(optionIndex)
                    }}
                    disabled={checked}
                  >
                    <span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span>
                    <span className="answer-value">{option}</span>
                    <span className="answer-radio" aria-hidden="true">
                      {selectedIndex === optionIndex && <span />}
                    </span>
                  </button>
                )
              })}
            </div>

            {checked && (
              <div
                className={`practice-feedback ${isCorrect ? 'feedback-success' : 'feedback-retry'}`}
                role="status"
              >
                <span aria-hidden="true">{isCorrect ? '✓' : '↗'}</span>
                {isCorrect
                  ? question.feedback
                  : outOfAttempts
                    ? t.secondFailMessage(question.feedback)
                    : t.retryMessage(question.hint)}
              </div>
            )}

            <div className="reading-actions">
              {checked && !shouldRevealCorrect ? (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setChecked(false)
                    setSelectedIndex(null)
                  }}
                >
                  {t.retryButton} <span aria-hidden="true">↻</span>
                </button>
              ) : checked ? (
                <button className="button button-primary" type="button" onClick={nextQuestion}>
                  {index === questions.length - 1 ? t.finishButton : t.nextButton}{' '}
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={checkAnswer}
                  disabled={selectedIndex === null}
                >
                  {t.checkButton} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </article>
        </div>
      ) : (
        <article className="reading-finish glass-panel">
          <span className="reading-finish-icon" aria-hidden="true">
            ✦
          </span>
          <span className="eyebrow muted-eyebrow">{t.completedEyebrow}</span>
          <h2>{t.completedTitle}</h2>
          <p>{t.completedSummary(correct, questions.length)}</p>
          <div className="reading-finish-actions">
            <button className="button button-secondary" type="button" onClick={restart}>
              {t.readAgainButton} <span aria-hidden="true">↻</span>
            </button>
            <button className="button button-primary" type="button" onClick={() => onNavigate('practica')}>
              {t.goPracticeButton} <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>
      )}
    </section>
  )
}