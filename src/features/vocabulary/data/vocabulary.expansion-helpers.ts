import { MissionDifficulty } from '@/core/learning';
import { VocabularyDiscipline, VocabularyEntry } from '../types/vocabulary.types';
import { expansionCategories } from './expansion-categories';
import { meaningMap } from './expansion-data/meanings';
import { examples, resolveExample } from './expansion-data/examples';
import { resolveCollocations } from './expansion-data/collocations';

type PartOfSpeech = VocabularyEntry['partOfSpeech'];

export interface VocabularyContentRow {
  word: string;
  partOfSpeech: PartOfSpeech;
  CEFR: VocabularyEntry['CEFR'];
  discipline: VocabularyDiscipline;
  meaning: string;
  definition: string;
  example: string;
  synonyms: string[];
  collocations: string[];
  difficulty: MissionDifficulty;
  tags: string[];
}

export const row = (
  word: string,
  partOfSpeech: PartOfSpeech,
  CEFR: VocabularyEntry['CEFR'],
  discipline: VocabularyDiscipline,
  meaning: string,
  definition: string,
  example: string,
  synonyms: string[],
  collocations: string[],
  difficulty: MissionDifficulty,
  tags: string[]
): VocabularyContentRow => ({
  word,
  partOfSpeech,
  CEFR,
  discipline,
  meaning,
  definition,
  example,
  synonyms,
  collocations,
  difficulty,
  tags,
});

const getMeaning = (term: string, discipline: string): string => {
  return meaningMap[discipline]?.[term] || term;
};

const getDefinition = (
  term: string,
  discipline: string,
  context: string
): string => {
  const definitions: Record<string, string> = {
    'Electrical Engineering': `${term}, elektrik dağıtımında ve güvenlikte kritik bir bileşen veya kavramdır. ${context} alanında yaygın olarak kullanılır.`,
    'Mechanical Engineering': `${term}, mekanik sistem tasarımında ve işletmesinde temel bir unsurdur. Sistem verimliliği ve güvenilirliği üzerinde doğrudan etkisi vardır.`,
    'Civil Engineering': `${term}, yapısal bütünlük ve inşaat kalitesi açısından temel bir kavramdır. İnşaat mühendisliğinde yapısal uyumluluk için kritiktir.`,
    Architecture: `${term}, yapılmış mekanların işlevsel ve estetik kalitesine katkıda bulunur. Mimari koordinasyon ve tasarım niyeti için gereklidir.`,
    Construction: `${term}, inşaat sahalarında günlük olarak kullanılan pratik bir kavramdır. İnşaat kalitesi, güvenliği ve programı üzerinde etkisi vardır.`,
    Commissioning: `${term}, sistem hazırlığını doğrulamak için devreye alma sırasında test edilir ve belgelenir. Teslim öncesi doğrulanmalıdır.`,
    'QA/QC': `${term}, muayene ve doğrulama sırasında kullanılan bir kalite kontrol kavramdır. Proje şartnamelerine ve standartlarına uygunluğu sağlamaya yardımcı olur.`,
    HSE: `${term}, saha güvenliği için kritik olan bir sağlık, güvenlik ve çevre kavramdır. Kazaları önlemeye ve düzenleyici uyuma yardımcı olur.`,
    'Project Management': `${term}, planlama ve takip için kullanılan bir proje kontrol kavramıdır. Proje programı, maliyeti ve paydaş iletişimi üzerinde etkisi vardır.`,
  };
  return (
    definitions[discipline] ||
    `${term}, ${context} alanında profesyonel bir mühendislik kavramıdır.`
  );
};

const getExample = (term: string, discipline: string): string => {
  const pool = examples[discipline] || [
    `The ${term} was verified during the quality review.`,
  ];
  let hash = 0;
  const str = term + discipline;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const template = pool[Math.abs(hash) % pool.length];
  return resolveExample(template, term);
};

const getCollocations = (term: string, discipline: string): string[] => {
  const base = [`review ${term}`, `${term} status`, `${term} requirement`];
  return resolveCollocations(base, term, discipline);
};

export function buildExpansionRows(): VocabularyContentRow[] {
  return expansionCategories.flatMap((category) =>
    category.terms.map((term) =>
      row(
        term,
        term.includes(' ') ? 'phrase' : 'noun',
        category.CEFR,
        category.discipline,
        getMeaning(term, category.discipline),
        getDefinition(term, category.discipline, category.context),
        getExample(term, category.discipline),
        [],
        getCollocations(term, category.discipline),
        category.difficulty,
        category.tags
      )
    )
  );
}

export function dedupeRowsByWord(
  contentRows: VocabularyContentRow[]
): VocabularyContentRow[] {
  const seen = new Set<string>();
  return contentRows.filter((item) => {
    const key = item.word.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildEntries(
  rawData: VocabularyContentRow[]
): VocabularyEntry[] {
  const beginnerRows = rawData.filter((r) => r.difficulty === 'Beginner');
  const contentRows = rawData.filter((r) => r.difficulty !== 'Beginner');

  const beginnerRowsByWord = new Map(
    beginnerRows.map((item) => [item.word.toLowerCase(), item])
  );
  const leveledExistingRows = [...contentRows, ...buildExpansionRows()].map(
    (item) => beginnerRowsByWord.get(item.word.toLowerCase()) ?? item
  );
  const expanded = dedupeRowsByWord([...leveledExistingRows, ...beginnerRows]);

  return expanded.map((item, index) => ({
    id: `vocab_pro_${(index + 1).toString().padStart(3, '0')}`,
    ...item,
  }));
}
