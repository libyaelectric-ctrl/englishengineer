import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  VocabularyMenuService,
  VocabularyRepository,
} from '@/features/vocabulary';
import { CEFR_LEVELS } from '@/features/level-system';
import VocabularyPage from './VocabularyPage';

describe('VocabularyPage menu', () => {
  beforeAll(async () => {
    VocabularyRepository.clearCache();
    await Promise.all(
      CEFR_LEVELS.map((level) =>
        VocabularyRepository.getVocabularyByLevel(level)
      )
    );
  });

  beforeEach(() => {
    localStorage.clear();
    VocabularyMenuService.reset();
  });

  const renderLoadedPage = async () => {
    render(<VocabularyPage />);
    await screen.findByText('height', {}, { timeout: 10_000 });
  };

  const startTenWordSet = async () => {
    await waitFor(() =>
      expect(screen.getAllByTestId('vocabulary-word-card')).toHaveLength(9)
    );
  };

  const openSearchModal = async () => {
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    await screen.findByLabelText('Search vocabulary');
  };

  it('opens on New tab with cards visible', async () => {
    await renderLoadedPage();
    expect(screen.getByRole('tab', { name: 'New' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    expect(within(firstCard).getByText('height')).toBeInTheDocument();
    expect(within(firstCard).getByText('A1')).toBeInTheDocument();
  }, 10_000);

  it('moves a new word to Learned with 1 click', async () => {
    await renderLoadedPage();
    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(
      within(firstCard).getByRole('button', { name: /I Know This|Biliyorum/i })
    );
    expect(
      Object.values(VocabularyMenuService.getState().progress)[0]?.status
    ).toBe('Learned');
  }, 10_000);

  it('moves a new word directly to Learned and shows in Learned tab', async () => {
    await renderLoadedPage();
    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(
      within(firstCard).getByRole('button', { name: /I Know This|Biliyorum/i })
    );
    expect(
      Object.values(VocabularyMenuService.getState().progress)[0]
    ).toMatchObject({ status: 'Learned', correctReviews: 0 });
    fireEvent.click(screen.getByRole('tab', { name: 'Learned' }));
    expect(screen.getAllByText('height').length).toBeGreaterThan(0);
  }, 10_000);

  it('keeps the Learned Quiz locked until 100 words are learned', async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByRole('tab', { name: 'Learned' }));

    expect(screen.getByRole('button', { name: 'Start Quiz' })).toBeDisabled();
    expect(
      screen.getByText('Learn at least 100 words to unlock the quiz.')
    ).toBeInTheDocument();
  }, 10_000);

  it('moves quiz answers through the learned pools in one completed quiz', async () => {
    const terms = await VocabularyRepository.getVocabularyByLevel('A1');
    terms.slice(0, 100).forEach((term) =>
      VocabularyMenuService.startLearning(term.id)
    );
    render(<VocabularyPage />);
    fireEvent.click(screen.getByRole('tab', { name: 'Learned' }));

    fireEvent.click(screen.getByRole('button', { name: 'Start Quiz' }));
    const firstInput = await screen.findByLabelText('Question 1 / 10');
    const question = firstInput.parentElement;
    const termLabel = question?.querySelector('p')?.textContent;
    const selectedTerm = terms.find((term) => term.term === termLabel);
    expect(selectedTerm).toBeDefined();

    fireEvent.change(firstInput, {
      target: { value: selectedTerm?.turkishMeaning },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Finish Quiz' }));

    await screen.findByText('Quiz Complete');
    const statuses = Object.values(VocabularyMenuService.getState().progress);
    expect(statuses.filter((word) => word.status === 'Mastered')).toHaveLength(
      1
    );
    expect(statuses.filter((word) => word.status === 'Struggling')).toHaveLength(
      0
    );
    expect(statuses.filter((word) => word.status === 'Learned')).toHaveLength(
      99
    );
  }, 10_000);

  it('searches vocabulary via modal and finds results', async () => {
    await renderLoadedPage();
    await openSearchModal();
    const input = screen.getByLabelText('Search vocabulary');

    fireEvent.change(input, { target: { value: `y\u00fckseklik` } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(
      await screen.findByText(/results found/i)
    ).toBeInTheDocument();
  }, 10_000);

  it('adds an unknown term only to My Vocabulary', async () => {
    await renderLoadedPage();
    await openSearchModal();
    const input = screen.getByLabelText('Search vocabulary');
    fireEvent.change(input, {
      target: { value: 'fluxuator' },
    });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(
      await screen.findByRole(
        'button',
        { name: /add to my vocabulary/i },
        { timeout: 10_000 }
      )
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
    fireEvent.click(
      within(addForm).getByRole('button', { name: /save to my vocabulary/i })
    );

    expect(VocabularyMenuService.getState().myVocabulary).toHaveLength(1);
    expect(VocabularyMenuService.getState().myVocabulary[0].term).toBe(
      'fluxuator'
    );
  }, 10_000);
});
