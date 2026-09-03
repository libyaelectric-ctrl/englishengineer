import type { ReadingMission } from '@/shared/types/reading.types';

export const SOFTWARE_READING_MISSIONS: ReadingMission[] = [
  {
    id: 'software_a2_bug_report',
    title: 'Reading a Bug Report',
    description:
      'Read a simple bug report and understand what a software bug is and how it is described.',
    discipline: 'Software Engineering',
    cefrLevel: 'A2',
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    passageText:
      'Bug Report #1042\n\nTitle: Login button does not work on mobile\n\nStatus: Open\nPriority: High\nReported by: Sarah\nDate: 2024-03-10\n\nDescription:\nThe login button does not respond when users tap it on a mobile phone. The problem happens on Android and iOS. Users cannot enter the app. This bug is very important because many users use the app on their phones.\n\nSteps to reproduce:\n1. Open the app on a mobile phone.\n2. Enter your email and password.\n3. Tap the login button.\n4. Nothing happens.\n\nExpected result: The user should go to the home screen.\nActual result: The button does not work.\n\nAttachment: screenshot.png',
    vocabulary: [
      {
        term: 'bug',
        definition: 'An error or problem in a software program',
        context: 'The login button does not respond when users tap it on a mobile phone.',
        turkishTranslation: 'hata',
      },
      {
        term: 'priority',
        definition: 'How important or urgent something is',
        context: 'Priority: High',
        turkishTranslation: 'oncelik',
      },
      {
        term: 'reproduce',
        definition: 'To make something happen again in the same way',
        context: 'Steps to reproduce:',
        turkishTranslation: 'yeniden olusturmak',
      },
      {
        term: 'attachment',
        definition: 'A file sent together with a report or message',
        context: 'Attachment: screenshot.png',
        turkishTranslation: 'ek dosya',
      },
      {
        term: 'respond',
        definition: 'To react or do something when touched or clicked',
        context: 'The login button does not respond when users tap it on a mobile phone.',
        turkishTranslation: 'yanit vermek',
      },
    ],
    questions: [
      {
        id: 'software_a2_bug_report_q1',
        type: 'multiple_choice',
        questionText: 'What is the problem described in this bug report?',
        choices: [
          'A) The app crashes when it starts.',
          'B) The login button does not work on mobile phones.',
          'C) Users cannot type their password.',
          'D) The home screen does not load.',
        ],
        correctAnswer: 'B',
        explanation:
          'The report says the login button does not respond when users tap it on a mobile phone.',
      },
      {
        id: 'software_a2_bug_report_q2',
        type: 'true_false',
        questionText: 'The bug only happens on Android phones.',
        correctAnswer: 'false',
        explanation: 'The report states the problem happens on both Android and iOS.',
      },
      {
        id: 'software_a2_bug_report_q3',
        type: 'keyword_answer',
        questionText:
          'What should happen after the user taps the login button, according to the expected result?',
        keywords: ['home screen', 'home'],
        correctAnswer: 'The user should go to the home screen.',
        explanation: 'The Expected result section states: The user should go to the home screen.',
      },
    ],
    xpReward: 40,
    coinReward: 15,
    eloReward: 12,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'software_b1_pull_request',
    title: 'Understanding a Pull Request Description',
    description:
      'Read a pull request description and understand the changes a developer is proposing to a codebase.',
    discipline: 'Software Engineering',
    cefrLevel: 'B1',
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    passageText:
      'Pull Request #287 - Add email validation to registration form\n\nAuthor: dev_martinez\nBranch: feature/email-validation to main\nStatus: Ready for review\n\nSummary:\nThis pull request adds client-side email validation to the user registration form. Previously, users could submit the form with an invalid email address, which caused errors on the server side. Now, the form checks the email format before the data is sent to the server.\n\nChanges made:\n- Added a regular expression to check the email format.\n- Displayed an error message if the email is not valid.\n- Added unit tests for the new validation function.\n- Updated the registration form documentation.\n\nTesting:\nAll existing tests pass. New unit tests cover the main cases: empty email, missing at symbol, and missing domain. Manual testing was done on Chrome and Firefox.\n\nReviewers, please check the error message wording and confirm the regex pattern covers edge cases.\n\nRelated issue: #201',
    vocabulary: [
      {
        term: 'validation',
        definition: 'The process of checking that data is correct and complete',
        context:
          'This pull request adds client-side email validation to the user registration form.',
        turkishTranslation: 'dogrulama',
      },
      {
        term: 'client-side',
        definition: 'Processing that happens in the user browser, not on the server',
        context:
          'This pull request adds client-side email validation to the user registration form.',
        turkishTranslation: 'istemci tarafi',
      },
      {
        term: 'regular expression',
        definition: 'A pattern used to match or check text, often used in programming',
        context: 'Added a regular expression to check the email format.',
        turkishTranslation: 'duzenli ifade',
      },
      {
        term: 'unit test',
        definition: 'A small test that checks one specific part of the code',
        context: 'Added unit tests for the new validation function.',
        turkishTranslation: 'birim testi',
      },
      {
        term: 'edge case',
        definition: 'An unusual or extreme situation that a program must also handle correctly',
        context:
          'Reviewers, please check the error message wording and confirm the regex pattern covers edge cases.',
        turkishTranslation: 'uc durum',
      },
    ],
    questions: [
      {
        id: 'software_b1_pull_request_q1',
        type: 'multiple_choice',
        questionText: 'What problem did this pull request fix?',
        choices: [
          'A) Users could not log in after registering.',
          'B) The server was sending emails to wrong addresses.',
          'C) Users could submit the registration form with an invalid email address.',
          'D) The registration form was not loading on Firefox.',
        ],
        correctAnswer: 'C',
        explanation:
          'The summary states that users could submit the form with an invalid email address, which caused errors on the server side.',
      },
      {
        id: 'software_b1_pull_request_q2',
        type: 'true_false',
        questionText: 'The developer tested the changes manually on Chrome and Firefox.',
        correctAnswer: 'true',
        explanation: 'The testing section says manual testing was done on Chrome and Firefox.',
      },
      {
        id: 'software_b1_pull_request_q3',
        type: 'keyword_answer',
        questionText: 'What three cases do the new unit tests cover?',
        keywords: ['empty email', 'missing', 'domain'],
        correctAnswer: 'Empty email, missing at symbol, and missing domain.',
        explanation:
          'The testing section lists: empty email, missing at symbol, and missing domain.',
      },
    ],
    xpReward: 45,
    coinReward: 18,
    eloReward: 13,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'software_b2_api_documentation',
    title: 'Reading API Documentation',
    description:
      'Read an excerpt from REST API documentation and understand how to use an endpoint, its parameters, and its response format.',
    discipline: 'Software Engineering',
    cefrLevel: 'B2',
    difficulty: 'Intermediate',
    estimatedMinutes: 11,
    passageText:
      'API Reference - User Service v2.1\n\nEndpoint: GET /api/v2/users/{userId}\n\nDescription:\nRetrieves detailed information about a single user account. Authentication is required. The requesting client must hold a valid bearer token issued by the OAuth 2.0 authorization server. If the token has expired or is missing, the server will return a 401 Unauthorized response.\n\nPath Parameters:\n- userId (string, required): The unique identifier of the user. Must be a valid UUID.\n\nQuery Parameters:\n- fields (string, optional): A comma-separated list of fields to include in the response. If omitted, all fields are returned by default.\n- includeDeleted (boolean, optional, default: false): When set to true, the endpoint will also return accounts that have been soft-deleted.\n\nResponse 200 OK:\n{ id: uuid, email: user@example.com, displayName: string, createdAt: ISO 8601 timestamp, status: active or suspended or deleted }\n\nError Codes:\n- 400 Bad Request: The userId is not a valid UUID.\n- 401 Unauthorized: Bearer token is missing or invalid.\n- 403 Forbidden: The caller does not have permission to view this user.\n- 404 Not Found: No user with the given userId exists.\n\nRate Limiting: This endpoint is limited to 100 requests per minute per API key. Requests exceeding this limit will receive a 429 Too Many Requests response.',
    vocabulary: [
      {
        term: 'bearer token',
        definition:
          'A security credential that grants access to an API; whoever holds it can use it',
        context:
          'The requesting client must hold a valid bearer token issued by the OAuth 2.0 authorization server.',
        turkishTranslation: 'tasiyici token',
      },
      {
        term: 'endpoint',
        definition: 'A specific URL in an API that performs a particular operation',
        context: 'Retrieves detailed information about a single user account.',
        turkishTranslation: 'uc nokta',
      },
      {
        term: 'soft-deleted',
        definition: 'Marked as deleted in the database but not permanently removed',
        context:
          'When set to true, the endpoint will also return accounts that have been soft-deleted.',
        turkishTranslation: 'yumusak silme',
      },
      {
        term: 'rate limiting',
        definition: 'A restriction on how many API requests can be made in a given time period',
        context: 'This endpoint is limited to 100 requests per minute per API key.',
        turkishTranslation: 'istek sinirlamasi',
      },
      {
        term: 'UUID',
        definition: 'A universally unique identifier - a standardized format for unique IDs',
        context: 'The userId is not a valid UUID.',
        turkishTranslation: 'evrensel benzersiz tanimlayici',
      },
    ],
    questions: [
      {
        id: 'software_b2_api_documentation_q1',
        type: 'multiple_choice',
        questionText:
          'Which HTTP status code will the server return if the bearer token is missing?',
        choices: [
          'A) 400 Bad Request',
          'B) 403 Forbidden',
          'C) 404 Not Found',
          'D) 401 Unauthorized',
        ],
        correctAnswer: 'D',
        explanation:
          'The error codes section states: 401 Unauthorized - Bearer token is missing or invalid.',
      },
      {
        id: 'software_b2_api_documentation_q2',
        type: 'true_false',
        questionText:
          'By default, the includeDeleted parameter is set to true, so soft-deleted accounts are always returned.',
        correctAnswer: 'false',
        explanation: 'The documentation specifies includeDeleted default is false.',
      },
      {
        id: 'software_b2_api_documentation_q3',
        type: 'keyword_answer',
        questionText:
          'What happens when a client exceeds the rate limit of 100 requests per minute?',
        keywords: ['429', 'Too Many Requests'],
        correctAnswer: 'The client receives a 429 Too Many Requests response.',
        explanation:
          'The rate limiting section states: Requests exceeding this limit will receive a 429 Too Many Requests response.',
      },
    ],
    xpReward: 50,
    coinReward: 20,
    eloReward: 14,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
  {
    id: 'software_c1_sla_specification',
    title: 'Analysing a Service Level Agreement',
    description:
      'Read a formal SLA specification excerpt and interpret contractual obligations, uptime guarantees, and penalty clauses in technical English.',
    discipline: 'Software Engineering',
    cefrLevel: 'C1',
    difficulty: 'Advanced',
    estimatedMinutes: 13,
    passageText:
      'Service Level Agreement - DataStream Analytics Platform\nSection 4: Service Availability and Performance Commitments\n\n4.1 Availability Commitment\nThe Provider warrants that the DataStream Analytics Platform (hereinafter the Service) shall maintain a monthly uptime of no less than 99.9% (the Availability Target), calculated as follows: Uptime % = ((Total Minutes in Month minus Downtime Minutes) divided by Total Minutes in Month) times 100. Scheduled maintenance windows, provided that at least 72 hours prior written notice is given to the Customer, shall be excluded from the downtime calculation.\n\n4.2 Performance Benchmarks\nUnder normal operating conditions, the Service shall process API requests with a p95 latency not exceeding 250 milliseconds and a p99 latency not exceeding 800 milliseconds. Should the Provider fail to meet these benchmarks for three or more consecutive days within any calendar month, the Customer shall be entitled to request a formal performance review.\n\n4.3 Service Credits\nIn the event that the actual monthly uptime falls below the Availability Target, the Customer shall be eligible for service credits calculated on a tiered basis:\n- Uptime between 99.0% and 99.9%: 10% credit of the monthly fee.\n- Uptime between 95.0% and 98.99%: 25% credit of the monthly fee.\n- Uptime below 95.0%: 50% credit of the monthly fee.\nService credits are the Customer sole remedy for availability failures and shall not be construed as a waiver of any other rights under this Agreement.\n\n4.4 Exclusions\nThe Provider shall bear no liability for downtime directly attributable to: (a) acts of the Customer or third-party integrations not operated by the Provider; (b) force majeure events; or (c) the Customer failure to apply security patches within the timeframe specified in the Provider advisory notices.',
    vocabulary: [
      {
        term: 'warrants',
        definition: 'Formally guarantees or promises that something is true or will be done',
        context:
          'The Provider warrants that the DataStream Analytics Platform shall maintain a monthly uptime of no less than 99.9%.',
        turkishTranslation: 'garanti etmek',
      },
      {
        term: 'p95 latency',
        definition:
          'The response time below which 95% of all API requests are completed; a performance measurement percentile',
        context:
          'The Service shall process API requests with a p95 latency not exceeding 250 milliseconds.',
        turkishTranslation: '95. yuzdelik gecikme',
      },
      {
        term: 'service credits',
        definition:
          'Compensation given to a customer as a discount on future fees when a provider fails to meet agreed performance levels',
        context: 'The Customer shall be eligible for service credits calculated on a tiered basis.',
        turkishTranslation: 'hizmet kredisi',
      },
      {
        term: 'force majeure',
        definition:
          'Unforeseeable circumstances such as natural disasters or war that prevent a party from fulfilling a contract',
        context:
          'The Provider shall bear no liability for downtime directly attributable to: (b) force majeure events.',
        turkishTranslation: 'mucbir sebep',
      },
      {
        term: 'sole remedy',
        definition:
          'The only form of compensation or recourse available to a party under the agreement',
        context: 'Service credits are the Customer sole remedy for availability failures.',
        turkishTranslation: 'tek basvuru yolu',
      },
    ],
    questions: [
      {
        id: 'software_c1_sla_specification_q1',
        type: 'multiple_choice',
        questionText:
          'According to Section 4.3, what percentage credit is a customer entitled to if the monthly uptime is 97.5%?',
        choices: [
          'A) 10% of the monthly fee',
          'B) 25% of the monthly fee',
          'C) 50% of the monthly fee',
          'D) 100% of the monthly fee',
        ],
        correctAnswer: 'B',
        explanation:
          '97.5% falls within the range between 95.0% and 98.99%, which entitles the customer to a 25% credit.',
      },
      {
        id: 'software_c1_sla_specification_q2',
        type: 'true_false',
        questionText:
          'Scheduled maintenance downtime is included in the monthly downtime calculation, regardless of how much notice is given.',
        correctAnswer: 'false',
        explanation:
          'Section 4.1 states that scheduled maintenance windows are excluded from the downtime calculation, provided at least 72 hours prior written notice is given.',
      },
      {
        id: 'software_c1_sla_specification_q3',
        type: 'keyword_answer',
        questionText:
          'Under what condition is the customer entitled to request a formal performance review related to API latency?',
        keywords: ['three', 'consecutive', 'days', 'calendar month'],
        correctAnswer:
          'If the provider fails to meet the latency benchmarks for three or more consecutive days within any calendar month.',
        explanation:
          'Section 4.2 states: Should the Provider fail to meet these benchmarks for three or more consecutive days within any calendar month, the Customer shall be entitled to request a formal performance review.',
      },
    ],
    xpReward: 55,
    coinReward: 22,
    eloReward: 15,
    sourceMetadata: {
      origin: 'EngVox original',
      author: 'AI Content Generation',
      schemaVersion: 1,
    },
  },
];
