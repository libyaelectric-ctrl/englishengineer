import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

import { CEFR_LEVELS } from '@/features/level-system';
import { VocabularyMenuService, VocabularyRepository } from '@/features/vocabulary';

import VocabularyPage from './VocabularyPage';

// Keep tests independent of the (large) translation corpus bundle.
vi.mock('@/features/vocabulary/services/translation/vocabulary-translation.hook', () => ({
  useTermMeaningResolver: () => (_term: string, source: { turkishMeaning?: string }) =>
    source.turkishMeaning ?? _term,
}));

describe('VocabularyPage menu', () => {
  beforeAll(async () => {
    VocabularyRepository.clearCache();
    await Promise.all(CEFR_LEVELS.map((level) => VocabularyRepository.getVocabularyByLevel(level)));
  });

  beforeEach(() => {
    localStorage.clear();
    VocabularyMenuService.reset();
  });

  const renderLoadedPage = async () => {
    render(
      <MemoryRouter>
        <VocabularyPage />
      </MemoryRouter>
    );
    await screen.findAllByText('height');
  };

  const startWordSet = async () => {
    await waitFor(() =>
      expect(screen.getAllByTestId('vocabulary-word-card').length).toBeGreaterThan(0)
    );
  };

  const openSearchModal = async () => {
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await screen.findByLabelText('Search vocabulary');
  };

  it('opens on New tab with cards visible', async () => {
    await renderLoadedPage();
    expect(screen.getByRole('tab', { name: 'vocabulary.tabNew' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await startWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    expect(within(firstCard).getByRole('heading', { name: 'height' })).toBeInTheDocument();
    expect(within(firstCard).getByText('A1')).toBeInTheDocument();
  }, 10_000);

  it('moves a new word to Learned with 1 click', async () => {
    await renderLoadedPage();
    await startWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(within(firstCard).getByRole('button', { name: /I Know This|Biliyorum/i }));
    expect(Object.values(VocabularyMenuService.getState().progress)[0]?.status).toBe('Learned');
  }, 10_000);

  it('moves a new word directly to Learned and shows in Learned tab', async () => {
    await renderLoadedPage();
    await startWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(within(firstCard).getByRole('button', { name: /I Know This|Biliyorum/i }));
    expect(Object.values(VocabularyMenuService.getState().progress)[0]).toMatchObject({
      status: 'Learned',
      correctReviews: 0,
    });
    fireEvent.click(screen.getByRole('tab', { name: 'vocabulary.tabLearned' }));
    expect(screen.getAllByText('height').length).toBeGreaterThan(0);
  }, 10_000);

  it('allows quiz to be started without word requirements', async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByRole('tab', { name: 'vocabulary.tabLearned' }));

    expect(screen.getByRole('button', { name: 'vocabulary.startQuiz' })).toBeEnabled();
  }, 10_000);

  it('moves quiz answers through the learned pools in one completed quiz', async () => {
    // selectRandomQuizItems() uses Math.random() to pick which terms appear
    // in the quiz. Left unseeded, this test picks a different "Question 1"
    // term on every run, which was intermittently flaky in CI depending on
    // which term got picked. Fix the sequence for a deterministic outcome.
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
    try {
      const terms = await VocabularyRepository.getVocabularyByLevel('A1');
      terms.slice(0, 100).forEach((term) => VocabularyMenuService.startLearning(term.id));
      render(
        <MemoryRouter>
          <VocabularyPage />
        </MemoryRouter>
      );
      await waitFor(() =>
        expect(screen.getAllByTestId('vocabulary-word-card').length).toBeGreaterThan(0)
      );
      fireEvent.click(screen.getByRole('tab', { name: 'vocabulary.tabLearned' }));

      fireEvent.click(screen.getByRole('button', { name: 'vocabulary.startQuiz' }));
      const firstInput = await screen.findByLabelText(/vocabulary\.question 1 \/ 10/);
      const question = firstInput.parentElement;
      const termLabel = question?.querySelector('p')?.textContent;
      const selectedTerm = terms.find((term) => term.term === termLabel);
      expect(selectedTerm).toBeDefined();

      fireEvent.change(firstInput, {
        target: { value: selectedTerm?.turkishMeaning },
      });
      fireEvent.click(screen.getByRole('button', { name: 'vocabulary.finishQuiz' }));

      await screen.findByText('vocabulary.quizComplete');
      const statuses = Object.values(VocabularyMenuService.getState().progress);
      expect(statuses.filter((word) => word.status === 'Mastered')).toHaveLength(1);
      expect(statuses.filter((word) => word.status === 'Struggling')).toHaveLength(0);
      expect(statuses.filter((word) => word.status === 'Learned')).toHaveLength(99);
    } finally {
      randomSpy.mockRestore();
    }
  }, 30_000);

  it('searches vocabulary via modal and finds results', async () => {
    await renderLoadedPage();
    await openSearchModal();
    const input = screen.getByLabelText('Search vocabulary');

    fireEvent.change(input, { target: { value: `y\u00fckseklik` } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText(/results found/i)).toBeInTheDocument();
  }, 30_000);

  it('adds an unknown term only to My Vocabulary', async () => {
    await renderLoadedPage();
    await openSearchModal();
    const input = screen.getByLabelText('Search vocabulary');
    fireEvent.change(input, {
      target: { value: 'fluxuator' },
    });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(
      await screen.findByRole('button', { name: /add to my vocabulary/i }, { timeout: 25_000 })
    );
    const addForm = screen.getByRole('form', {
      name: 'Add to My Vocabulary',
    });
    fireEvent.change(within(addForm).getByLabelText('Turkish meaning'), {
      target: { value: `ak\u0131 d\u00fczenleyici` },
    });
    fireEvent.change(within(addForm).getByLabelText('Example'), {
      target: { value: 'Check the fluxuator before startup.' },
    });
    fireEvent.change(within(addForm).getByLabelText('Domain'), {
      target: { value: 'commissioning' },
    });
    fireEvent.click(within(addForm).getByRole('button', { name: /save to my vocabulary/i }));

    expect(VocabularyMenuService.getState().myVocabulary).toHaveLength(1);
    expect(VocabularyMenuService.getState().myVocabulary[0].term).toBe('fluxuator');
  }, 60_000);

  it('honors the ?cefr= drill deep link and loads that band', async () => {
    render(
      <MemoryRouter initialEntries={['/vocabulary?cefr=B1']}>
        <VocabularyPage />
      </MemoryRouter>
    );
    const cards = await screen.findAllByTestId('vocabulary-word-card', { timeout: 15_000 });
    expect(cards.length).toBeGreaterThan(0);
    expect(
      within(cards[0]).getByText((_content, element) => element?.textContent === 'LVL-B1')
    ).toBeInTheDocument();
  }, 20_000);
});
