export interface Question {
  id: string;
  questionText: string;
  type: string;
  choices?: string[];
}

export function QuestionField({
  question,
  index,
  answer,
  onAnswer,
}: {
  question: Question;
  index: number;
  answer: string;
  onAnswer: (id: string, value: string) => void;
}) {
  const renderInput = () => {
    if (question.type === 'multiple_choice') {
      return (
        <div className="mt-3 space-y-2">
          {question.choices?.map((choice, choiceIndex) => {
            const value = String.fromCharCode(65 + choiceIndex);
            return (
              <label
                key={choice}
                className="flex cursor-pointer gap-2.5 rounded-[4px] border border-border-soft bg-surface p-3 text-sm text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={value}
                  checked={answer === value}
                  onChange={() => onAnswer(question.id, value)}
                />
                {choice}
              </label>
            );
          })}
        </div>
      );
    }

    if (question.type === 'true_false') {
      return (
        <label className="block mt-3">
          <span className="sr-only">True or false answer</span>
          <select
            value={answer}
            onChange={(event) => onAnswer(question.id, event.target.value)}
            className="w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">Select true or false</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </label>
      );
    }

    return (
      <label className="block mt-3">
        <span className="sr-only">Short answer</span>
        <input
          value={answer}
          onChange={(event) => onAnswer(question.id, event.target.value)}
          placeholder="Complete the missing technical phrase"
          className="w-full rounded-[4px] border border-border-soft bg-surface p-3 text-sm focus:border-primary focus:outline-none font-bold"
        />
      </label>
    );
  };

  return (
    <fieldset
      key={question.id}
      className="rounded-[4px] border border-border-soft bg-surface-hover p-4 shadow-sm"
    >
      <legend className="px-2 text-sm font-bold text-foreground uppercase tracking-wider font-mono">
        {index + 1}. {question.questionText}
      </legend>
      {renderInput()}
    </fieldset>
  );
}
