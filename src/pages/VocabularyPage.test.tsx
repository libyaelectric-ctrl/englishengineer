import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { useState } from 'react';

import { MemoryRouter } from 'react-router-dom';

import { storage } from '@/shared/storage';

import { CEFR_LEVELS } from '@/features/level-system';
import { VocabularyMenuService, VocabularyRepository } from '@/features/vocabulary';

import VocabularyPage from './VocabularyPage';

// Keep tests independent of the (large) translation corpus bundle.
vi.mock('@/features/vocabulary/services/translation/vocabulary-translation.hook', () => ({
  useTermMeaningResolver: () => (_term: string, source: { turkishMeaning?: string }) =>
    source.turkishMeaning ?? _term,
}));

/**
 * Query cost is what makes this file slow, so the helpers below are deliberate.
 *
 * This page renders ~3.3k nodes (48 word cards, ~390 buttons, 48 labelled inputs).
 * Testing Library's text, label and role-with-name queries walk that whole DOM and compute
 * accessible names, which costs 40-600 ms per call here, and `findBy*` re-runs its query on
 * every poll — so a single `await screen.findByLabelText(...)` was measured at 5-20 s. On CI
 * (3-4x slower than a dev machine) that pushed the three heaviest tests past their 30 s and
 * 60 s caps and failed the Tests job.
 *
 * So: wait on a cheap attribute selector first (a `querySelector`, sub-millisecond however
 * many times it polls), then run the semantic query once, scoped with `within()` to the
 * smallest container that holds the element.
 *
 * The quiz test below needs a second kind of patience: typing into a controlled field is
 * only done once React has turned the change event into state, so it retries the event
 * instead of trusting a single `fireEvent.change` (see `fillControlledField`).
 */
const requireElement = <T,>(element: T | null, description: string): T => {
  if (!element) throw new Error(`${description} is not in the document`);
  return element;
};

const searchTrigger = () =>
  document.querySelector<HTMLButtonElement>('button[title="Search vocabulary"]');
const searchInput = () =>
  document.querySelector<HTMLInputElement>('input[aria-label="Search vocabulary"]');
const quizInputs = () => document.querySelectorAll<HTMLInputElement>('input[id^="learned-quiz-"]');
const addToMyVocabularyForm = () =>
  document.querySelector<HTMLFormElement>('form[aria-label="Add to My Vocabulary"]');

/**
 * Type an answer into one of the quiz fields and wait until the answer has really reached
 * React's state.
 *
 * A single `fireEvent.change` plus a value assertion is not enough. React compares a change
 * against the value it last rendered, so when the field and that value already agree — or
 * when the commit for the change lands later than the assertion — React puts the field back
 * to the committed (still empty) answer. A one-shot assertion then waits out its whole
 * budget for something that has already happened and been undone. That is the signature CI
 * reported for this file (`Received: ""`) on runs that pass locally, and it is the same
 * class of runner-speed race the store assertions below handle with their own budget
 * (TD-018).
 *
 * So: re-fire the change until the field keeps the answer, and compare the value directly —
 * a matcher inside the poll would also serialise the whole 3.3k-node document into its
 * failure message on every attempt, which a CI runner cannot afford. The field is looked up
 * again on each attempt so a remount cannot leave a stale node behind.
 */
const fillControlledField = async (fieldId: string, answer: string) => {
  await waitFor(
    () => {
      const field = requireElement(
        document.getElementById(fieldId) as HTMLInputElement | null,
        `the controlled field #${fieldId}`
      );
      fireEvent.change(field, { target: { value: answer } });
      if (field.value !== answer) {
        throw new Error(`the controlled field #${fieldId} did not keep ${JSON.stringify(answer)}`);
      }
    },
    // CI's coverage job instruments every line, and this page re-renders ~3.3k nodes per
    // commit; the 1 s default is below the jitter that introduces (TD-018).
    { timeout: 15_000 }
  );
};

describe('VocabularyPage menu', () => {
  beforeAll(async () => {
    VocabularyRepository.clearCache();
    await Promise.all(CEFR_LEVELS.map((level) => VocabularyRepository.getVocabularyByLevel(level)));
  });

  beforeEach(() => {
    localStorage.clear();
    // The menu service persists through the identity-scoped storage (Phase 3),
    // which fails closed without an activated session. Activate a test session
    // so saveState/getState round-trip like they do for a signed-in user.
    storage.activateSession({ userId: 'vocab-test-user', kind: 'local' });
    VocabularyMenuService.reset();
  });

  afterEach(() => {
    storage.deactivateSession();
  });

  const renderLoadedPage = async () => {
    render(
      <MemoryRouter>
        <VocabularyPage />
      </MemoryRouter>
    );
    // Wait on the card's test id rather than on its text: `data-testid` is a plain
    // attribute selector, so polling it costs nothing.
    await screen.findAllByTestId('vocabulary-word-card');
  };

  const startWordSet = async () => {
    await waitFor(() =>
      expect(screen.getAllByTestId('vocabulary-word-card').length).toBeGreaterThan(0)
    );
  };

  const openSearchModal = async () => {
    fireEvent.click(requireElement(searchTrigger(), 'the search trigger'));
    await waitFor(() => expect(searchInput()).not.toBeNull());

    return requireElement(searchInput(), 'the search input');
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

  it('retries a dropped change event until the answer reaches state', async () => {
    // Guards the helper the quiz test below relies on, with a field that swallows its first
    // change event. React restores a controlled field to the answer it last rendered
    // whenever a change does not end up in state, so the assertion below only sees the
    // answer if the helper keeps typing instead of reporting it once.
    const swallowed = { first: true };
    const ProbeField = () => {
      const [answer, setAnswer] = useState('');
      return (
        <>
          <input
            id="probe-answer"
            value={answer}
            onChange={(event) => {
              if (swallowed.first) {
                swallowed.first = false;
                return;
              }
              setAnswer(event.target.value);
            }}
          />
          <output id="probe-answer-state">{answer}</output>
        </>
      );
    };
    render(<ProbeField />);

    await fillControlledField('probe-answer', 'height');

    expect(document.getElementById('probe-answer-state')?.textContent).toBe('height');
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
      // Wait for the quiz inputs by id (cheap), then ask the labelled question once —
      // the label text is what "Question 1 / 10" means here. Starting the quiz awaits ten
      // term lookups, so allow the runner more than the 1 s default to mount them.
      await waitFor(() => expect(quizInputs().length).toBeGreaterThan(0), { timeout: 15_000 });
      const firstInput = screen.getByLabelText(/vocabulary\.question 1 \/ 10/) as HTMLInputElement;
      const question = firstInput.parentElement;
      const termLabel = question?.querySelector('p')?.textContent;
      const selectedTerm = requireElement(
        terms.find((term) => term.term === termLabel),
        `the A1 term named ${termLabel}`
      );

      await fillControlledField(firstInput.id, selectedTerm.turkishMeaning);
      fireEvent.click(screen.getByRole('button', { name: 'vocabulary.finishQuiz' }));

      await screen.findByText('vocabulary.quizComplete');
      // The quiz-complete UI can render a beat before the store flushes the
      // batched progress writes; retry the state assertions instead of
      // reading the store synchronously (order-dependent flake, see TD-018).
      await waitFor(
        () => {
          const statuses = Object.values(VocabularyMenuService.getState().progress);
          expect(statuses.filter((word) => word.status === 'Mastered')).toHaveLength(1);
          expect(statuses.filter((word) => word.status === 'Struggling')).toHaveLength(0);
          expect(statuses.filter((word) => word.status === 'Learned')).toHaveLength(99);
        },
        // CI runner'larinda store flush'i 1s varsayilani asabiliyor (TD-018)
        { timeout: 10000 }
      );
    } finally {
      randomSpy.mockRestore();
    }
    // Starting the quiz re-renders this page (48 cards plus the quiz section) several
    // times over, and CI's coverage job instruments every line it runs: measured 4.1 s
    // here under --coverage against 25.4 s in that job, so the cap has to clear CI's ~6x
    // instrumentation factor. The query cost that used to dominate this file is gone;
    // what is left is jsdom re-rendering word cards.
  }, 90_000);

  it('searches vocabulary via modal and finds results', async () => {
    await renderLoadedPage();
    const input = await openSearchModal();

    fireEvent.change(input, { target: { value: `y\u00fckseklik` } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findByText(/results found/i)).toBeInTheDocument();
  }, 60_000);

  it('adds an unknown term only to My Vocabulary', async () => {
    await renderLoadedPage();
    const input = await openSearchModal();
    fireEvent.change(input, {
      target: { value: 'fluxuator' },
    });
    fireEvent.keyDown(input, { key: 'Enter' });

    // The control lives in the results section, which mounts asynchronously; wait for it
    // by its text (cheap over button subtrees) instead of polling a role query.
    const addButton = await waitFor(() => {
      const button = [...document.querySelectorAll('button')].find((element) =>
        /add to my vocabulary/i.test(element.textContent ?? '')
      );
      if (!button) throw new Error('the "Add to My Vocabulary" control is not rendered yet');
      return button;
    });
    fireEvent.click(addButton);

    await waitFor(() => expect(addToMyVocabularyForm()).not.toBeNull());
    const addForm = requireElement(addToMyVocabularyForm(), 'the Add to My Vocabulary form');
    fireEvent.change(within(addForm).getByLabelText(/meaning$/i), {
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
