// Speech-bubble copy for the EngMascot component, per interface language.
// Several states have multiple message variants so the "tap for a random
// tip" interaction doesn't repeat the same line every time.

export interface MascotStateCopy {
  idle: string[];
  celebrate: string[];
  concerned: string[];
  thinking: string;
  point: string[];
  streak: (days: number) => string;
  levelUp: (level: number | string) => string;
  streakDanger: (hoursLeft: number) => string;
  empty: string;
  farewell: string[];
  sleeping: string;
  wake: string;
  ariaGreeting: string;
}

export const MASCOT_COPY: Record<string, MascotStateCopy> = {
  en: {
    idle: [
      'Hi there! Ready to sharpen your engineering English today?',
      "Pick up where you left off — you're doing great.",
      'Need a quick win? Try a 5-minute vocabulary round.',
    ],
    celebrate: [
      'Nice work! That was spot on.',
      "You're on fire today!",
      'Exactly right — well done.',
    ],
    concerned: [
      "Not quite — let's try that one again.",
      'Close! Take another look.',
      'No worries, mistakes help you learn.',
    ],
    thinking: 'Getting things ready for you…',
    point: ['Take a look over here 👉', 'This might be useful.', 'Worth checking out.'],
    streak: (days) => `${days}-day streak! You're on a roll.`,
    levelUp: (level) => `Level up! You just reached ${level}.`,
    streakDanger: (hoursLeft) =>
      `Your streak ends in ${hoursLeft}h — one quick lesson keeps it alive!`,
    empty: 'Nothing here yet — want to start your first lesson?',
    farewell: [
      'See you next time!',
      'Come back soon — your streak is waiting.',
      'Nice session — take a break!',
    ],
    sleeping: 'Zzz… tap me if you need anything.',
    wake: 'Oh, hey! I was just resting my eyes.',
    ariaGreeting: 'EngVox assistant',
  },
  tr: {
    idle: [
      'Merhaba! Bugün mühendislik İngilizceni geliştirmeye hazır mısın?',
      'Kaldığın yerden devam edelim — gayet iyi gidiyorsun.',
      'Hızlı bir kazanç ister misin? 5 dakikalık kelime turuna ne dersin?',
    ],
    celebrate: ['Aferin, tam isabet!', 'Bugün harika gidiyorsun!', 'Birebir doğru — helal olsun.'],
    concerned: [
      'Olmadı, bir daha deneyelim.',
      'Çok yakındın! Bir daha bak.',
      'Sorun değil, hatalar öğretir.',
    ],
    thinking: 'Senin için hazırlanıyor…',
    point: ['Şuraya bir göz at 👉', 'Bu işine yarayabilir.', 'Bakmaya değer.'],
    streak: (days) => `${days} günlük seri! Harika gidiyorsun.`,
    levelUp: (level) => `Seviye atladın! Artık ${level} seviyesindesin.`,
    streakDanger: (hoursLeft) => `Serin ${hoursLeft} saat içinde bitiyor — kısa bir ders yeter!`,
    empty: 'Burada henüz bir şey yok — ilk dersine başlamak ister misin?',
    farewell: [
      'Görüşürüz!',
      'Yakında dön — serin seni bekliyor.',
      'Güzel bir seans oldu, biraz mola ver!',
    ],
    sleeping: 'Zzz… bir şey lazımsa dokun bana.',
    wake: 'Aa, merhaba! Gözlerimi dinlendiriyordum.',
    ariaGreeting: 'EngVox asistanı',
  },
  ar: {
    idle: [
      'مرحبًا! هل أنت مستعد لتطوير لغتك الإنجليزية الهندسية اليوم؟',
      'أكمل من حيث توقفت — أنت تبلي بلاءً حسنًا.',
      'تريد إنجازًا سريعًا؟ جرّب جولة مفردات لمدة 5 دقائق.',
    ],
    celebrate: ['أحسنت! إجابة دقيقة.', 'أداؤك رائع اليوم!', 'صحيح تمامًا — عمل ممتاز.'],
    concerned: [
      'ليست صحيحة تمامًا، لنحاول مرة أخرى.',
      'قريب جدًا! ألق نظرة أخرى.',
      'لا بأس، الأخطاء تساعدك على التعلم.',
    ],
    thinking: 'جارٍ التحضير لك…',
    point: ['ألقِ نظرة هنا 👉', 'قد يكون هذا مفيدًا.', 'يستحق الاطلاع عليه.'],
    streak: (days) => `سلسلة ${days} أيام! أنت في تقدم رائع.`,
    levelUp: (level) => `ترقية مستوى! وصلت الآن إلى ${level}.`,
    streakDanger: (hoursLeft) => `تنتهي سلسلتك خلال ${hoursLeft} ساعة — درس سريع يحافظ عليها!`,
    empty: 'لا يوجد شيء هنا بعد — هل تريد بدء درسك الأول؟',
    farewell: [
      'أراك في المرة القادمة!',
      'عد قريبًا — سلسلتك في انتظارك.',
      'جلسة رائعة — خذ قسطًا من الراحة!',
    ],
    sleeping: 'زzz… المس هنا إذا احتجت أي شيء.',
    wake: 'أوه، مرحبًا! كنت أرتاح قليلًا فقط.',
    ariaGreeting: 'مساعد EngVox',
  },
  de: {
    idle: [
      'Hallo! Bereit, dein technisches Englisch heute zu verbessern?',
      'Mach da weiter, wo du aufgehört hast — du machst das gut.',
      'Lust auf einen schnellen Erfolg? Probier eine 5-Minuten-Vokabelrunde.',
    ],
    celebrate: [
      'Gut gemacht! Genau richtig.',
      'Du bist heute richtig gut drauf!',
      'Exakt richtig — sehr gut.',
    ],
    concerned: [
      'Nicht ganz — versuchen wir es nochmal.',
      'Fast! Schau nochmal genau hin.',
      'Kein Problem, Fehler helfen beim Lernen.',
    ],
    thinking: 'Ich bereite alles für dich vor…',
    point: ['Schau mal hier 👉', 'Das könnte nützlich sein.', 'Lohnt sich anzuschauen.'],
    streak: (days) => `${days}-Tage-Serie! Du bist super dabei.`,
    levelUp: (level) => `Level-up! Du hast gerade ${level} erreicht.`,
    streakDanger: (hoursLeft) =>
      `Deine Serie endet in ${hoursLeft} Std. — eine kurze Lektion reicht!`,
    empty: 'Hier ist noch nichts — möchtest du mit deiner ersten Lektion starten?',
    farewell: [
      'Bis zum nächsten Mal!',
      'Komm bald wieder — deine Serie wartet.',
      'Gute Session — mach eine Pause!',
    ],
    sleeping: 'Zzz… tipp mich an, falls du etwas brauchst.',
    wake: 'Oh, hallo! Ich habe nur kurz die Augen ausgeruht.',
    ariaGreeting: 'EngVox-Assistent',
  },
  es: {
    idle: [
      '¡Hola! ¿Listo para mejorar tu inglés técnico hoy?',
      'Sigue donde lo dejaste — lo estás haciendo genial.',
      '¿Quieres un logro rápido? Prueba una ronda de vocabulario de 5 minutos.',
    ],
    celebrate: ['¡Bien hecho! Exactamente.', '¡Estás que ardes hoy!', 'Justo correcto — muy bien.'],
    concerned: [
      'No del todo — intentémoslo de nuevo.',
      '¡Casi! Échale otro vistazo.',
      'No pasa nada, los errores ayudan a aprender.',
    ],
    thinking: 'Preparando todo para ti…',
    point: ['Echa un vistazo aquí 👉', 'Esto podría ser útil.', 'Vale la pena revisarlo.'],
    streak: (days) => `¡Racha de ${days} días! Vas muy bien.`,
    levelUp: (level) => `¡Subiste de nivel! Ahora estás en ${level}.`,
    streakDanger: (hoursLeft) =>
      `Tu racha termina en ${hoursLeft}h — ¡una lección rápida la mantiene viva!`,
    empty: 'Todavía no hay nada aquí — ¿quieres empezar tu primera lección?',
    farewell: [
      '¡Nos vemos pronto!',
      'Vuelve pronto — tu racha te espera.',
      '¡Buena sesión, tómate un descanso!',
    ],
    sleeping: 'Zzz… tócame si necesitas algo.',
    wake: '¡Ah, hola! Solo estaba descansando la vista.',
    ariaGreeting: 'Asistente de EngVox',
  },
  pt: {
    idle: [
      'Olá! Pronto para aprimorar seu inglês técnico hoje?',
      'Continue de onde parou — você está indo muito bem.',
      'Quer uma vitória rápida? Experimente uma rodada de vocabulário de 5 minutos.',
    ],
    celebrate: [
      'Muito bem! Certinho.',
      'Você está arrasando hoje!',
      'Exatamente certo — parabéns.',
    ],
    concerned: [
      'Quase — vamos tentar de novo.',
      'Perto! Dê outra olhada.',
      'Sem problemas, os erros ajudam a aprender.',
    ],
    thinking: 'Preparando tudo para você…',
    point: ['Dê uma olhada aqui 👉', 'Isso pode ser útil.', 'Vale a pena conferir.'],
    streak: (days) => `Sequência de ${days} dias! Você está indo muito bem.`,
    levelUp: (level) => `Subiu de nível! Você chegou a ${level}.`,
    streakDanger: (hoursLeft) =>
      `Sua sequência termina em ${hoursLeft}h — uma lição rápida a mantém viva!`,
    empty: 'Ainda não há nada aqui — quer começar sua primeira lição?',
    farewell: [
      'Até a próxima!',
      'Volte logo — sua sequência está esperando.',
      'Boa sessão — faça uma pausa!',
    ],
    sleeping: 'Zzz… toque em mim se precisar de algo.',
    wake: 'Ah, oi! Só estava descansando os olhos.',
    ariaGreeting: 'Assistente EngVox',
  },
  fr: {
    idle: [
      "Salut ! Prêt à perfectionner ton anglais technique aujourd'hui ?",
      'Reprends là où tu t’étais arrêté — tu te débrouilles très bien.',
      "Envie d'une victoire rapide ? Essaie une session de vocabulaire de 5 minutes.",
    ],
    celebrate: [
      'Bien joué ! Exactement ça.',
      "Tu es en feu aujourd'hui !",
      'Parfaitement juste — bravo.',
    ],
    concerned: [
      'Pas tout à fait — on réessaie.',
      'Presque ! Regarde encore.',
      'Pas grave, les erreurs aident à apprendre.',
    ],
    thinking: 'Je prépare tout pour toi…',
    point: ['Regarde par ici 👉', 'Ça pourrait être utile.', 'Ça vaut le coup d’œil.'],
    streak: (days) => `Série de ${days} jours ! Tu es lancé.`,
    levelUp: (level) => `Niveau supérieur ! Tu viens d'atteindre ${level}.`,
    streakDanger: (hoursLeft) =>
      `Ta série se termine dans ${hoursLeft}h — une leçon rapide la maintient !`,
    empty: "Il n'y a encore rien ici — tu veux commencer ta première leçon ?",
    farewell: [
      'À bientôt !',
      'Reviens vite — ta série t’attend.',
      'Bonne session — fais une pause !',
    ],
    sleeping: 'Zzz… touche-moi si tu as besoin de quelque chose.',
    wake: 'Oh, salut ! Je reposais juste mes yeux.',
    ariaGreeting: 'Assistant EngVox',
  },
  ru: {
    idle: [
      'Привет! Готов сегодня прокачать свой технический английский?',
      'Продолжи с того места, где остановился — у тебя отлично получается.',
      'Хочешь быструю победу? Попробуй 5-минутный раунд слов.',
    ],
    celebrate: ['Отлично! В самую точку.', 'Сегодня ты в ударе!', 'Абсолютно верно — молодец.'],
    concerned: [
      'Не совсем — давай попробуем ещё раз.',
      'Почти! Взгляни ещё раз.',
      'Ничего страшного, ошибки помогают учиться.',
    ],
    thinking: 'Готовлю всё для тебя…',
    point: ['Посмотри сюда 👉', 'Это может быть полезно.', 'Стоит посмотреть.'],
    streak: (days) => `Серия из ${days} дней! Ты на волне.`,
    levelUp: (level) => `Новый уровень! Ты достиг ${level}.`,
    streakDanger: (hoursLeft) =>
      `Твоя серия закончится через ${hoursLeft}ч — короткий урок спасёт её!`,
    empty: 'Здесь пока ничего нет — начнём первый урок?',
    farewell: [
      'До скорого!',
      'Возвращайся скорее — твоя серия ждёт.',
      'Хорошая сессия — сделай перерыв!',
    ],
    sleeping: 'Zzz… нажми на меня, если что-то понадобится.',
    wake: 'О, привет! Я просто давал глазам отдохнуть.',
    ariaGreeting: 'Ассистент EngVox',
  },
  zh: {
    idle: [
      '你好！今天准备好提升你的工程英语了吗？',
      '从上次停下的地方继续吧——你做得很好。',
      '想要一个小成就？试试5分钟的词汇练习。',
    ],
    celebrate: ['做得好！完全正确。', '你今天状态很棒！', '完全正确——真棒。'],
    concerned: ['不太对——我们再试一次。', '很接近了！再看看。', '没关系，犯错能帮助你学习。'],
    thinking: '正在为你准备…',
    point: ['看看这里 👉', '这个可能有用。', '值得看看。'],
    streak: (days) => `连续${days}天！你势头正好。`,
    levelUp: (level) => `升级了！你刚刚达到了${level}。`,
    streakDanger: (hoursLeft) => `你的连续记录将在${hoursLeft}小时后中断——一堂快速课程就能保住！`,
    empty: '这里还没有内容——要开始你的第一堂课吗？',
    farewell: ['下次见！', '快点回来——你的连续记录在等你。', '很棒的学习——休息一下吧！'],
    sleeping: 'Zzz……需要什么就点我一下。',
    wake: '哦，你好！我刚才只是闭目养神。',
    ariaGreeting: 'EngVox 助手',
  },
  ja: {
    idle: [
      'こんにちは！今日はエンジニア英語を磨く準備はできてる？',
      '前回の続きから始めよう——順調に進んでいるよ。',
      '手軽な達成感が欲しい？5分の単語ラウンドを試してみて。',
    ],
    celebrate: ['よくできました！ぴったり正解。', '今日は絶好調だね！', 'まさに正解——お見事。'],
    concerned: [
      '惜しい——もう一度試してみよう。',
      'あと少し！もう一度見てみて。',
      '大丈夫、間違いは学びにつながるよ。',
    ],
    thinking: '準備しているところ…',
    point: ['ここを見てみて 👉', 'これは役に立つかも。', 'チェックする価値あり。'],
    streak: (days) => `${days}日連続！絶好調だね。`,
    levelUp: (level) => `レベルアップ！${level}に到達したよ。`,
    streakDanger: (hoursLeft) =>
      `連続記録があと${hoursLeft}時間で終わってしまう——短いレッスンで継続できるよ！`,
    empty: 'まだ何もないみたい——最初のレッスンを始めてみる？',
    farewell: [
      'またね！',
      'また戻ってきてね——連続記録が待ってるよ。',
      'いいセッションだったね——休憩しよう！',
    ],
    sleeping: 'Zzz……何か必要なら私をタップしてね。',
    wake: 'あ、こんにちは！ちょっと目を休めていただけだよ。',
    ariaGreeting: 'EngVoxアシスタント',
  },
  it: {
    idle: [
      'Ciao! Pronto a migliorare il tuo inglese tecnico oggi?',
      'Riprendi da dove avevi lasciato — stai andando alla grande.',
      'Vuoi una vittoria veloce? Prova un round di vocabolario di 5 minuti.',
    ],
    celebrate: [
      'Ben fatto! Perfetto.',
      'Oggi sei in forma smagliante!',
      'Esattamente giusto — bravissimo.',
    ],
    concerned: [
      'Non proprio — riproviamo.',
      'Vicino! Dai un’altra occhiata.',
      'Nessun problema, gli errori aiutano a imparare.',
    ],
    thinking: 'Sto preparando tutto per te…',
    point: ['Dai un’occhiata qui 👉', 'Potrebbe essere utile.', 'Vale la pena controllare.'],
    streak: (days) => `Serie di ${days} giorni! Stai andando alla grande.`,
    levelUp: (level) => `Livello superiore! Hai appena raggiunto ${level}.`,
    streakDanger: (hoursLeft) =>
      `La tua serie finisce tra ${hoursLeft}h — una lezione veloce la mantiene viva!`,
    empty: 'Qui non c’è ancora nulla — vuoi iniziare la tua prima lezione?',
    farewell: [
      'Alla prossima!',
      'Torna presto — la tua serie ti aspetta.',
      'Bella sessione — fai una pausa!',
    ],
    sleeping: 'Zzz… toccami se hai bisogno di qualcosa.',
    wake: 'Oh, ciao! Stavo solo riposando gli occhi.',
    ariaGreeting: 'Assistente EngVox',
  },
  vi: {
    idle: [
      'Xin chào! Sẵn sàng nâng cao tiếng Anh kỹ thuật hôm nay chưa?',
      'Tiếp tục từ nơi bạn đã dừng lại — bạn đang làm rất tốt.',
      'Muốn một chiến thắng nhanh? Hãy thử vòng từ vựng 5 phút.',
    ],
    celebrate: [
      'Làm tốt lắm! Chính xác.',
      'Hôm nay bạn thật xuất sắc!',
      'Hoàn toàn chính xác — làm tốt lắm.',
    ],
    concerned: [
      'Chưa đúng hẳn — thử lại nhé.',
      'Gần đúng rồi! Xem lại lần nữa.',
      'Không sao, sai lầm giúp bạn học hỏi.',
    ],
    thinking: 'Đang chuẩn bị cho bạn…',
    point: ['Nhìn vào đây nhé 👉', 'Cái này có thể hữu ích.', 'Đáng để xem qua.'],
    streak: (days) => `Chuỗi ${days} ngày! Bạn đang rất tốt.`,
    levelUp: (level) => `Lên cấp! Bạn vừa đạt ${level}.`,
    streakDanger: (hoursLeft) =>
      `Chuỗi của bạn sẽ kết thúc sau ${hoursLeft}h — một bài học nhanh sẽ giữ nó!`,
    empty: 'Chưa có gì ở đây — bạn muốn bắt đầu bài học đầu tiên chứ?',
    farewell: [
      'Hẹn gặp lại!',
      'Quay lại sớm nhé — chuỗi của bạn đang chờ.',
      'Buổi học tốt đấy — nghỉ ngơi một chút!',
    ],
    sleeping: 'Zzz… chạm vào tôi nếu bạn cần gì.',
    wake: 'Ồ, chào! Tôi chỉ đang nghỉ mắt thôi.',
    ariaGreeting: 'Trợ lý EngVox',
  },
  pl: {
    idle: [
      'Cześć! Gotowy dziś poprawić swój techniczny angielski?',
      'Kontynuuj tam, gdzie skończyłeś — idzie ci świetnie.',
      'Chcesz szybki sukces? Spróbuj 5-minutowej rundy słownictwa.',
    ],
    celebrate: ['Dobra robota! W punkt.', 'Dziś naprawdę ci idzie!', 'Dokładnie tak — brawo.'],
    concerned: [
      'Niezupełnie — spróbujmy jeszcze raz.',
      'Blisko! Spójrz jeszcze raz.',
      'Nic straconego, błędy pomagają się uczyć.',
    ],
    thinking: 'Przygotowuję wszystko dla ciebie…',
    point: ['Spójrz tutaj 👉', 'To może się przydać.', 'Warto to sprawdzić.'],
    streak: (days) => `Seria ${days} dni! Świetnie ci idzie.`,
    levelUp: (level) => `Awans! Właśnie osiągnąłeś ${level}.`,
    streakDanger: (hoursLeft) =>
      `Twoja seria kończy się za ${hoursLeft}h — krótka lekcja ją utrzyma!`,
    empty: 'Nic tu jeszcze nie ma — chcesz zacząć swoją pierwszą lekcję?',
    farewell: [
      'Do zobaczenia następnym razem!',
      'Wróć wkrótce — twoja seria czeka.',
      'Dobra sesja — zrób sobie przerwę!',
    ],
    sleeping: 'Zzz… dotknij mnie, jeśli czegoś potrzebujesz.',
    wake: 'Och, cześć! Właśnie odpoczywałem oczami.',
    ariaGreeting: 'Asystent EngVox',
  },
  id: {
    idle: [
      'Hai! Siap mengasah bahasa Inggris teknikmu hari ini?',
      'Lanjutkan dari tempat kamu berhenti — kamu melakukannya dengan baik.',
      'Mau kemenangan cepat? Coba babak kosakata 5 menit.',
    ],
    celebrate: [
      'Kerja bagus! Tepat sekali.',
      'Hari ini kamu keren banget!',
      'Benar sekali — bagus sekali.',
    ],
    concerned: [
      'Belum tepat — ayo coba lagi.',
      'Hampir benar! Lihat lagi.',
      'Tidak apa-apa, kesalahan membantu kamu belajar.',
    ],
    thinking: 'Sedang menyiapkan semuanya untukmu…',
    point: ['Lihat di sini 👉', 'Ini mungkin berguna.', 'Layak untuk dicek.'],
    streak: (days) => `Rentetan ${days} hari! Kamu sedang on fire.`,
    levelUp: (level) => `Naik level! Kamu baru saja mencapai ${level}.`,
    streakDanger: (hoursLeft) =>
      `Rentetanmu berakhir dalam ${hoursLeft} jam — satu pelajaran singkat menjaganya tetap hidup!`,
    empty: 'Belum ada apa-apa di sini — mau mulai pelajaran pertamamu?',
    farewell: [
      'Sampai jumpa lagi!',
      'Kembali lagi segera — rentetanmu menunggu.',
      'Sesi yang bagus — istirahatlah!',
    ],
    sleeping: 'Zzz… sentuh aku kalau butuh sesuatu.',
    wake: 'Oh, hai! Aku cuma sedang mengistirahatkan mata.',
    ariaGreeting: 'Asisten EngVox',
  },
  nl: {
    idle: [
      'Hoi! Klaar om je technisch Engels vandaag aan te scherpen?',
      'Ga verder waar je gebleven was — je doet het geweldig.',
      'Zin in een snelle overwinning? Probeer een woordenschatronde van 5 minuten.',
    ],
    celebrate: [
      'Goed gedaan! Precies goed.',
      'Je bent vandaag op dreef!',
      'Helemaal juist — goed zo.',
    ],
    concerned: [
      'Niet helemaal — laten we het nog eens proberen.',
      'Bijna! Kijk nog eens goed.',
      'Geen zorgen, fouten helpen je leren.',
    ],
    thinking: 'Ik maak alles voor je klaar…',
    point: ['Kijk hier eens 👉', 'Dit kan handig zijn.', 'De moeite waard om te bekijken.'],
    streak: (days) => `${days}-daagse reeks! Je zit goed op dreef.`,
    levelUp: (level) => `Level omhoog! Je hebt net ${level} bereikt.`,
    streakDanger: (hoursLeft) =>
      `Je reeks eindigt over ${hoursLeft}u — één korte les houdt hem in leven!`,
    empty: 'Hier is nog niets — wil je je eerste les beginnen?',
    farewell: [
      'Tot de volgende keer!',
      'Kom snel terug — je reeks wacht op je.',
      'Goede sessie — neem een pauze!',
    ],
    sleeping: 'Zzz… tik op me als je iets nodig hebt.',
    wake: 'Oh, hoi! Ik liet net mijn ogen even rusten.',
    ariaGreeting: 'EngVox-assistent',
  },
};
