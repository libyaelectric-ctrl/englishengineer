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
import VocabularyPage from './VocabularyPage';

describe('VocabularyPage menu', () => {
  beforeAll(async () => {
    VocabularyRepository.clearCache();
    await VocabularyRepository.getVocabularyByLevel('A1');
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
      expect(screen.getAllByTestId('vocabulary-word-card')).toHaveLength(10)
    );
  };

  it('opens on New with Due Today visible and honest empty totals', async () => {
    await renderLoadedPage();
    expect(
      within(screen.getByTestId('metric-total')).getByText('5000')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-new')).getByText('5000')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-learning')).getByText('0')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-mastered')).getByText('0')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-forgotten')).getByText('0')
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'New' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByText('Review Due Today')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-total')).getByText('5000')
    ).toHaveClass('whitespace-nowrap');

    await startTenWordSet();
    expect(
      within(screen.getByTestId('metric-new')).getByText('5000')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-learning')).getByText('0')
    ).toBeInTheDocument();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    expect(within(firstCard).getByText('height')).toBeInTheDocument();
    expect(within(firstCard).getByText('A1')).toBeInTheDocument();
    expect(
      within(firstCard).getByText(/domain: architecture/i)
    ).toBeInTheDocument();
    fireEvent.change(within(firstCard).getByLabelText('Turkish meaning'), {
      target: { value: `y\u00fckseklik` },
    });
    fireEvent.click(
      within(firstCard).getByRole('button', { name: 'Check answer' })
    );
    expect(
      within(screen.getByTestId('metric-new')).getByText('4999')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-learning')).getByText('1')
    ).toBeInTheDocument();
    expect(within(firstCard).getByText(`y\u00fckseklik`)).toBeInTheDocument();
    expect(
      within(firstCard).getByText(/confirm the ceiling height/i)
    ).toBeInTheDocument();
    expect(
      within(firstCard).getByRole('button', { name: 'Word details' })
    ).toBeInTheDocument();
  }, 10_000);

  it('moves a new word directly to Learned without a visible review counter', async () => {
    await renderLoadedPage();
    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(
      within(firstCard).getByRole('button', { name: 'Learn this word' })
    );
    expect(
      Object.values(VocabularyMenuService.getState().progress)[0]
    ).toMatchObject({ status: 'Learning', correctReviews: 0 });
    expect(screen.queryByText(/correct reviews/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Learned' }));
    expect(screen.getAllByText('height').length).toBeGreaterThan(0);
  }, 10_000);

  it('sends a wrong answer to Weak, Mistake Log, and Due Today', async () => {
    await renderLoadedPage();
    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.change(within(firstCard).getByLabelText('Turkish meaning'), {
      target: { value: 'yanlis' },
    });
    fireEvent.click(
      within(firstCard).getByRole('button', { name: 'Check answer' })
    );

    expect(
      within(screen.getByTestId('metric-learning')).getByText('1')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-weak')).getByText('1')
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-due')).getByText('1')
    ).toBeInTheDocument();
    expect(screen.getAllByText('Weak').length).toBeGreaterThan(0);
  }, 10_000);

  it('requires the mini quiz after I Know This before moving to Learning', async () => {
    await renderLoadedPage();
    await startTenWordSet();
    const firstCard = screen.getAllByTestId('vocabulary-word-card')[0];
    fireEvent.click(
      within(firstCard).getByRole('button', { name: /I Know This/i })
    );
    expect(
      within(firstCard).getByText(/check recall before saving/i)
    ).toBeVisible();
    expect(VocabularyMenuService.getState().progress).toEqual({});
    fireEvent.change(within(firstCard).getByLabelText('Turkish meaning'), {
      target: { value: 'yükseklik' },
    });
    fireEvent.click(
      within(firstCard).getByRole('button', { name: 'Check answer' })
    );
    expect(
      Object.values(VocabularyMenuService.getState().progress)[0]?.status
    ).toBe('Learning');
  }, 10_000);

  it('searches canonical fields and supports advanced filters', async () => {
    await renderLoadedPage();
    const input = screen.getByLabelText('Search vocabulary');
    const search = screen.getByRole('button', { name: /^Search$/ });

    fireEvent.change(input, { target: { value: `y\u00fckseklik` } });
    fireEvent.click(search);
    expect(
      await screen.findByText(/showing 1 of 1 matches/i)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /save to learned/i }));
    expect(
      Object.values(VocabularyMenuService.getState().progress)[0]?.status
    ).toBe('Learning');

    fireEvent.click(screen.getByRole('button', { name: /Filters/i }));
    fireEvent.change(screen.getByLabelText('Filter by Part of speech'), {
      target: { value: 'noun' },
    });
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(search);
    expect(await screen.findByText(/matches/i)).toBeInTheDocument();
  }, 10_000);

  it('adds an unknown term only to My Vocabulary', async () => {
    await renderLoadedPage();
    fireEvent.change(screen.getByLabelText('Search vocabulary'), {
      target: { value: 'fluxuator' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^Search$/ }));
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

    expect(screen.getByText('fluxuator')).toBeInTheDocument();
    expect(screen.getByText(/AI Assist Coming Soon/)).toBeInTheDocument();
    expect(
      within(screen.getByTestId('metric-total')).getByText('5000')
    ).toBeInTheDocument();
    expect(VocabularyMenuService.getState().myVocabulary).toHaveLength(1);
    expect(VocabularyMenuService.getState().progress).toEqual({});
  }, 10_000);
});
