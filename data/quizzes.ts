// data/quizzes.ts
export type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export const quizData: Record<
  string,
  Record<"easy" | "medium" | "advanced", QuizQuestion[]>
> = {
  math: {
    easy: [
      {
        question: "What is 1 + 1?",
        options: ["1", "2", "3", "4"],
        answer: "2",
      },
      {
        question: "What is 10 - 4?",
        options: ["5", "6", "7", "8"],
        answer: "6",
      },
      {
        question: "What is 3 x 3?",
        options: ["6", "7", "8", "9"],
        answer: "9",
      },
      {
        question: "What is 8 ÷ 2?",
        options: ["2", "3", "4", "5"],
        answer: "4",
      },
      {
        question: "What is the value of 5 + 7?",
        options: ["11", "12", "13", "14"],
        answer: "12",
      },
      {
        question: "What is 6 x 2?",
        options: ["10", "11", "12", "13"],
        answer: "12",
      },
      {
        question: "What is 9 - 5?",
        options: ["3", "4", "5", "6"],
        answer: "4",
      },
      {
        question: "What is 4 + 4?",
        options: ["6", "7", "8", "9"],
        answer: "8",
      },
      {
        question: "What is 7 ÷ 1?",
        options: ["6", "7", "8", "9"],
        answer: "7",
      },
      {
        question: "What is 2 x 5?",
        options: ["8", "9", "10", "11"],
        answer: "10",
      },
      {
        question: "What is 3 + 6?",
        options: ["8", "9", "10", "11"],
        answer: "9",
      },
      {
        question: "What is 12 - 7?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "What is 0 + 9?",
        options: ["8", "9", "10", "11"],
        answer: "9",
      },
      {
        question: "What is 6 ÷ 3?",
        options: ["1", "2", "3", "4"],
        answer: "2",
      },
      {
        question: "What is 5 x 1?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "What is 2 + 6?",
        options: ["7", "8", "9", "10"],
        answer: "8",
      },
      {
        question: "What is 10 ÷ 5?",
        options: ["1", "2", "3", "4"],
        answer: "2",
      },
      {
        question: "What is 7 - 2?",
        options: ["4", "5", "6", "7"],
        answer: "5",
      },
      {
        question: "What is 4 x 2?",
        options: ["6", "7", "8", "9"],
        answer: "8",
      },
      {
        question: "What is 3 + 4?",
        options: ["6", "7", "8", "9"],
        answer: "7",
      },
    ],

    medium: [
      {
        question: "What is the value of 3² + 4²?",
        options: ["25", "12", "7", "5"],
        answer: "25",
      },
      {
        question: "Simplify: 2(x + 3) + 4",
        options: ["2x + 6", "2x + 10", "x + 10", "2x + 7"],
        answer: "2x + 10",
      },
      {
        question: "What is the area of a triangle with base 10 and height 5?",
        options: ["25", "50", "30", "20"],
        answer: "25",
      },
      {
        question: "Solve for x: 5x - 10 = 20",
        options: ["4", "5", "6", "7"],
        answer: "6",
      },
      {
        question: "What is the value of √81?",
        options: ["7", "8", "9", "10"],
        answer: "9",
      },
      {
        question: "What is the perimeter of a square with side length 6?",
        options: ["24", "12", "18", "36"],
        answer: "24",
      },
      {
        question: "What is the value of 2³?",
        options: ["6", "8", "9", "12"],
        answer: "8",
      },
      {
        question: "What is the solution to x² = 49?",
        options: ["7", "-7", "±7", "0"],
        answer: "±7",
      },
      {
        question: "What is the value of 15% of 200?",
        options: ["25", "30", "35", "40"],
        answer: "30",
      },
      {
        question: "What is the volume of a cube with side length 4?",
        options: ["64", "16", "32", "48"],
        answer: "64",
      },
      {
        question: "What is the slope of the line y = 3x + 2?",
        options: ["2", "3", "1", "0"],
        answer: "3",
      },
      {
        question: "What is the value of 7²?",
        options: ["49", "42", "56", "36"],
        answer: "49",
      },
      {
        question: "What is the next prime number after 7?",
        options: ["8", "9", "10", "11"],
        answer: "11",
      },
      {
        question: "What is the mean of 4, 8, 12, 16?",
        options: ["10", "12", "8", "14"],
        answer: "10",
      },
      {
        question: "What is the value of x in 2x + 3 = 11?",
        options: ["3", "4", "5", "6"],
        answer: "4",
      },
      {
        question: "What is the value of 100 ÷ 4?",
        options: ["20", "25", "30", "40"],
        answer: "25",
      },
      {
        question: "What is the area of a circle with radius 3? (Use π ≈ 3.14)",
        options: ["28.26", "18.84", "9.42", "12.56"],
        answer: "28.26",
      },
      {
        question: "What is the value of 6! (6 factorial)?",
        options: ["720", "120", "36", "240"],
        answer: "720",
      },
      {
        question: "What is the value of 0.25 x 4?",
        options: ["1", "2", "3", "4"],
        answer: "1",
      },
      {
        question: "What is the solution to 3x = 27?",
        options: ["7", "8", "9", "10"],
        answer: "9",
      },
    ],
    advanced: [
      {
        question: "What is the derivative of sin(x)?",
        options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"],
        answer: "cos(x)",
      },
      {
        question: "Evaluate the limit: lim(x→0) (sin(x)/x)",
        options: ["0", "1", "∞", "Undefined"],
        answer: "1",
      },
      {
        question: "What is the integral of 2x?",
        options: ["x²", "2x²", "x² + C", "2x² + C"],
        answer: "x² + C",
      },
      {
        question: "Solve: ln(e³)",
        options: ["3", "e", "ln(3)", "1"],
        answer: "3",
      },
      {
        question: "What is the determinant of a 2x2 matrix [[a, b], [c, d]]?",
        options: ["ab + cd", "ad - bc", "ac - bd", "a² + d²"],
        answer: "ad - bc",
      },
      {
        question: "What is the solution to the equation x² - 4x + 4 = 0?",
        options: ["x = 2", "x = -2", "x = 4", "x = 0"],
        answer: "x = 2",
      },
      {
        question: "What is the value of the expression: ∑(i=1 to 5) i?",
        options: ["10", "15", "20", "25"],
        answer: "15",
      },
      {
        question: "What is the inverse of the function f(x) = 2x + 3?",
        options: [
          "f⁻¹(x) = x/2 - 3",
          "f⁻¹(x) = (x - 3)/2",
          "f⁻¹(x) = 2x - 3",
          "f⁻¹(x) = x - 3",
        ],
        answer: "f⁻¹(x) = (x - 3)/2",
      },
      {
        question: "What is the solution to the inequality: 2x - 5 > 9?",
        options: ["x > 7", "x < 7", "x > 2", "x < 2"],
        answer: "x > 7",
      },
      {
        question: "What is the derivative of ln(x)?",
        options: ["1/x", "x", "ln(x)", "x ln(x)"],
        answer: "1/x",
      },
      {
        question: "What is the value of cos(π)?",
        options: ["-1", "0", "1", "Undefined"],
        answer: "-1",
      },
      {
        question: "What is the solution to the equation e^x = 5?",
        options: ["x = ln(5)", "x = 5", "x = e/5", "x = 1/5"],
        answer: "x = ln(5)",
      },
      {
        question: "What is the integral of 1/x?",
        options: ["ln(x)", "1/x²", "x", "x²"],
        answer: "ln(x)",
      },
      {
        question: "What is the value of the binomial coefficient C(5, 2)?",
        options: ["10", "5", "15", "20"],
        answer: "10",
      },
      {
        question: "What is the solution to the system: x + y = 5, x - y = 1?",
        options: [
          "x = 3, y = 2",
          "x = 2, y = 3",
          "x = 4, y = 1",
          "x = 1, y = 4",
        ],
        answer: "x = 3, y = 2",
      },
      {
        question: "What is the value of the expression: (x² - 9)/(x - 3)?",
        options: ["x + 3", "x - 3", "x² - 3", "x² + 3"],
        answer: "x + 3",
      },
      {
        question: "What is the domain of the function f(x) = √(x - 2)?",
        options: ["x ≥ 2", "x > 2", "x ≤ 2", "All real numbers"],
        answer: "x ≥ 2",
      },
      {
        question:
          "What is the solution to the quadratic equation x² + 6x + 9 = 0?",
        options: ["x = -3", "x = 3", "x = -6", "x = 0"],
        answer: "x = -3",
      },
      {
        question: "What is the value of tan(π/4)?",
        options: ["1", "0", "-1", "∞"],
        answer: "1",
      },
      {
        question: "What is the range of the function f(x) = x²?",
        options: ["x ≥ 0", "x ≤ 0", "All real numbers", "x ≠ 0"],
        answer: "x ≥ 0",
      },
    ],
  },
  english: {
    easy: [
      {
        question: "Which word is a verb?",
        options: ["Run", "Table", "Blue", "Quickly"],
        answer: "Run",
      },
      {
        question: "Which word is a noun?",
        options: ["Happy", "Table", "Quickly", "Bright"],
        answer: "Table",
      },
      {
        question: "Choose the correct article: ___ apple",
        options: ["A", "An", "The", "No article"],
        answer: "An",
      },
      {
        question: "What is the opposite of 'Hot'?",
        options: ["Warm", "Cold", "Cool", "Heat"],
        answer: "Cold",
      },
      {
        question: "Which word is an adjective?",
        options: ["Jump", "Beautiful", "Slowly", "Tree"],
        answer: "Beautiful",
      },
      {
        question: "Which word is a pronoun?",
        options: ["He", "Run", "Blue", "Quick"],
        answer: "He",
      },
      {
        question: "Choose the correct spelling:",
        options: ["Recieve", "Receive", "Receeve", "Receve"],
        answer: "Receive",
      },
      {
        question: "What is the plural of 'Child'?",
        options: ["Childs", "Children", "Childes", "Childer"],
        answer: "Children",
      },
      {
        question: "Which word means the same as 'Happy'?",
        options: ["Sad", "Joyful", "Angry", "Tired"],
        answer: "Joyful",
      },
      {
        question: "Which word is a preposition?",
        options: ["Under", "Run", "Blue", "Quickly"],
        answer: "Under",
      },
      {
        question: "What is the past tense of 'Go'?",
        options: ["Goes", "Gone", "Went", "Going"],
        answer: "Went",
      },
      {
        question: "Which sentence is correct?",
        options: [
          "She go to school",
          "She goes to school",
          "She going to school",
          "She gone to school",
        ],
        answer: "She goes to school",
      },
      {
        question: "Which word is a conjunction?",
        options: ["And", "Run", "Blue", "Quick"],
        answer: "And",
      },
      {
        question: "Which word is an adverb?",
        options: ["Quickly", "Quick", "Run", "Table"],
        answer: "Quickly",
      },
      {
        question: "Choose the correct word: I ___ a book.",
        options: ["Read", "Reads", "Reading", "Red"],
        answer: "Read",
      },
      {
        question: "Which word rhymes with 'Cat'?",
        options: ["Dog", "Hat", "Cup", "Pen"],
        answer: "Hat",
      },
      {
        question: "Which word is a color?",
        options: ["Blue", "Run", "Quick", "Table"],
        answer: "Blue",
      },
      {
        question: "Which word is used to ask a question?",
        options: ["Why", "Run", "Blue", "Quick"],
        answer: "Why",
      },
      {
        question: "What is the opposite of 'Big'?",
        options: ["Large", "Huge", "Small", "Tall"],
        answer: "Small",
      },
      {
        question: "Which word is a synonym of 'Fast'?",
        options: ["Quick", "Slow", "Lazy", "Late"],
        answer: "Quick",
      },
    ],
    medium: [
      {
        question: "Choose the synonym of 'Happy'",
        options: ["Sad", "Joyful", "Angry", "Tired"],
        answer: "Joyful",
      },
      {
        question: "Choose the antonym of 'Generous'",
        options: ["Kind", "Selfish", "Helpful", "Friendly"],
        answer: "Selfish",
      },
      {
        question: "Choose the synonym of 'Quick'",
        options: ["Slow", "Rapid", "Lazy", "Calm"],
        answer: "Rapid",
      },
      {
        question: "Choose the antonym of 'Ancient'",
        options: ["Old", "Historic", "Modern", "Antique"],
        answer: "Modern",
      },
      {
        question: "Choose the synonym of 'Brave'",
        options: ["Cowardly", "Fearful", "Courageous", "Timid"],
        answer: "Courageous",
      },
      {
        question: "Choose the antonym of 'Polite'",
        options: ["Rude", "Kind", "Gentle", "Respectful"],
        answer: "Rude",
      },
      {
        question: "Choose the synonym of 'Silent'",
        options: ["Noisy", "Quiet", "Loud", "Talkative"],
        answer: "Quiet",
      },
      {
        question: "Choose the antonym of 'Victory'",
        options: ["Win", "Success", "Triumph", "Defeat"],
        answer: "Defeat",
      },
      {
        question: "Choose the synonym of 'Begin'",
        options: ["Start", "End", "Finish", "Close"],
        answer: "Start",
      },
      {
        question: "Choose the antonym of 'Flexible'",
        options: ["Rigid", "Soft", "Bendable", "Elastic"],
        answer: "Rigid",
      },
      {
        question: "Choose the synonym of 'Intelligent'",
        options: ["Smart", "Dull", "Slow", "Foolish"],
        answer: "Smart",
      },
      {
        question: "Choose the antonym of 'Permanent'",
        options: ["Lasting", "Eternal", "Temporary", "Stable"],
        answer: "Temporary",
      },
      {
        question: "Choose the synonym of 'Laugh'",
        options: ["Cry", "Smile", "Giggle", "Frown"],
        answer: "Giggle",
      },
      {
        question: "Choose the antonym of 'Expand'",
        options: ["Grow", "Enlarge", "Contract", "Increase"],
        answer: "Contract",
      },
      {
        question: "Choose the synonym of 'Neat'",
        options: ["Messy", "Tidy", "Dirty", "Cluttered"],
        answer: "Tidy",
      },
      {
        question: "Choose the antonym of 'Courage'",
        options: ["Bravery", "Fear", "Boldness", "Confidence"],
        answer: "Fear",
      },
      {
        question: "Choose the synonym of 'Friendly'",
        options: ["Hostile", "Kind", "Mean", "Angry"],
        answer: "Kind",
      },
      {
        question: "Choose the antonym of 'Increase'",
        options: ["Grow", "Expand", "Reduce", "Multiply"],
        answer: "Reduce",
      },
      {
        question: "Choose the synonym of 'Fast'",
        options: ["Quick", "Slow", "Lazy", "Heavy"],
        answer: "Quick",
      },
      {
        question: "Choose the antonym of 'Bright'",
        options: ["Shiny", "Dim", "Radiant", "Clear"],
        answer: "Dim",
      },
    ],
    advanced: [
      {
        question: "What is the antonym of 'Obscure'?",
        options: ["Hidden", "Clear", "Dark", "Dull"],
        answer: "Clear",
      },
      {
        question: "Choose the synonym of 'Ubiquitous'",
        options: ["Rare", "Universal", "Hidden", "Temporary"],
        answer: "Universal",
      },
      {
        question: "What is the antonym of 'Meticulous'?",
        options: ["Careless", "Precise", "Thorough", "Detailed"],
        answer: "Careless",
      },
      {
        question: "Choose the synonym of 'Ephemeral'",
        options: ["Eternal", "Brief", "Lasting", "Permanent"],
        answer: "Brief",
      },
      {
        question: "What is the antonym of 'Candid'?",
        options: ["Honest", "Frank", "Deceitful", "Transparent"],
        answer: "Deceitful",
      },
      {
        question: "Choose the synonym of 'Ambiguous'",
        options: ["Clear", "Vague", "Obvious", "Explicit"],
        answer: "Vague",
      },
      {
        question: "What is the antonym of 'Resilient'?",
        options: ["Flexible", "Fragile", "Strong", "Durable"],
        answer: "Fragile",
      },
      {
        question: "Choose the synonym of 'Conundrum'",
        options: ["Solution", "Puzzle", "Answer", "Explanation"],
        answer: "Puzzle",
      },
      {
        question: "What is the antonym of 'Lucid'?",
        options: ["Clear", "Coherent", "Confusing", "Logical"],
        answer: "Confusing",
      },
      {
        question: "Choose the synonym of 'Voracious'",
        options: ["Hungry", "Satisfied", "Indifferent", "Passive"],
        answer: "Hungry",
      },
      {
        question: "What is the antonym of 'Altruistic'?",
        options: ["Selfless", "Generous", "Selfish", "Kind"],
        answer: "Selfish",
      },
      {
        question: "Choose the synonym of 'Tenacious'",
        options: ["Weak", "Persistent", "Lazy", "Forgetful"],
        answer: "Persistent",
      },
      {
        question: "What is the antonym of 'Serene'?",
        options: ["Calm", "Peaceful", "Agitated", "Tranquil"],
        answer: "Agitated",
      },
      {
        question: "Choose the synonym of 'Eloquent'",
        options: ["Mute", "Articulate", "Silent", "Unclear"],
        answer: "Articulate",
      },
      {
        question: "What is the antonym of 'Innovative'?",
        options: ["Creative", "Inventive", "Conventional", "Original"],
        answer: "Conventional",
      },
      {
        question: "Choose the synonym of 'Scrutinize'",
        options: ["Ignore", "Examine", "Overlook", "Glance"],
        answer: "Examine",
      },
      {
        question: "What is the antonym of 'Profound'?",
        options: ["Deep", "Insightful", "Shallow", "Meaningful"],
        answer: "Shallow",
      },
      {
        question: "Choose the synonym of 'Reverence'",
        options: ["Disrespect", "Admiration", "Contempt", "Neglect"],
        answer: "Admiration",
      },
      {
        question: "What is the antonym of 'Exuberant'?",
        options: ["Joyful", "Lively", "Depressed", "Energetic"],
        answer: "Depressed",
      },
      {
        question: "Choose the synonym of 'Obsolete'",
        options: ["Modern", "Outdated", "Current", "New"],
        answer: "Outdated",
      },
    ],
  },
  history: {
    easy: [
      {
        question: "Who was the first President of the USA?",
        options: [
          "Abraham Lincoln",
          "George Washington",
          "John Adams",
          "Jefferson",
        ],
        answer: "George Washington",
      },
      {
        question: "In which year did World War II end?",
        options: ["1945", "1939", "1918", "1950"],
        answer: "1945",
      },
      {
        question: "Who discovered America in 1492?",
        options: [
          "Marco Polo",
          "Christopher Columbus",
          "Vasco da Gama",
          "Ferdinand Magellan",
        ],
        answer: "Christopher Columbus",
      },
      {
        question: "Which country built the Great Wall?",
        options: ["India", "China", "Japan", "Egypt"],
        answer: "China",
      },
      {
        question: "Who was the first Prime Minister of India?",
        options: [
          "Mahatma Gandhi",
          "Jawaharlal Nehru",
          "Sardar Patel",
          "Rajendra Prasad",
        ],
        answer: "Jawaharlal Nehru",
      },
      {
        question: "Which ancient civilization built pyramids?",
        options: ["Greek", "Roman", "Egyptian", "Mayan"],
        answer: "Egyptian",
      },
      {
        question: "Who wrote the Declaration of Independence?",
        options: [
          "George Washington",
          "Thomas Jefferson",
          "Benjamin Franklin",
          "John Adams",
        ],
        answer: "Thomas Jefferson",
      },
      {
        question:
          "Which war was fought between the North and South regions of the USA?",
        options: [
          "World War I",
          "Civil War",
          "Revolutionary War",
          "Vietnam War",
        ],
        answer: "Civil War",
      },
      {
        question: "Who was known as the Iron Lady?",
        options: [
          "Angela Merkel",
          "Margaret Thatcher",
          "Indira Gandhi",
          "Hillary Clinton",
        ],
        answer: "Margaret Thatcher",
      },
      {
        question: "Which empire was ruled by Julius Caesar?",
        options: ["Greek", "Roman", "Ottoman", "Persian"],
        answer: "Roman",
      },
      {
        question: "What was the name of the ship that sank in 1912?",
        options: ["Titanic", "Olympic", "Britannic", "Lusitania"],
        answer: "Titanic",
      },
      {
        question: "Who was the leader of Nazi Germany?",
        options: [
          "Joseph Stalin",
          "Adolf Hitler",
          "Winston Churchill",
          "Benito Mussolini",
        ],
        answer: "Adolf Hitler",
      },
      {
        question: "Which country was divided by the Berlin Wall?",
        options: ["France", "Germany", "Italy", "Russia"],
        answer: "Germany",
      },
      {
        question: "Who was the famous civil rights leader in the USA?",
        options: [
          "Nelson Mandela",
          "Martin Luther King Jr.",
          "Barack Obama",
          "Malcolm X",
        ],
        answer: "Martin Luther King Jr.",
      },
      {
        question: "Which Indian leader led the Salt March?",
        options: [
          "Subhas Chandra Bose",
          "Bhagat Singh",
          "Mahatma Gandhi",
          "Jawaharlal Nehru",
        ],
        answer: "Mahatma Gandhi",
      },
      {
        question: "What was the name of the first man to walk on the moon?",
        options: [
          "Buzz Aldrin",
          "Yuri Gagarin",
          "Neil Armstrong",
          "Michael Collins",
        ],
        answer: "Neil Armstrong",
      },
      {
        question: "Which country gifted the Statue of Liberty to the USA?",
        options: ["Germany", "France", "Italy", "Spain"],
        answer: "France",
      },
      {
        question: "Who was the first female Prime Minister of India?",
        options: [
          "Sonia Gandhi",
          "Indira Gandhi",
          "Pratibha Patil",
          "Mayawati",
        ],
        answer: "Indira Gandhi",
      },
      {
        question: "Which ancient city was buried by a volcanic eruption?",
        options: ["Athens", "Pompeii", "Babylon", "Carthage"],
        answer: "Pompeii",
      },
      {
        question: "Who was the first President of independent India?",
        options: [
          "Jawaharlal Nehru",
          "Rajendra Prasad",
          "B.R. Ambedkar",
          "Sardar Patel",
        ],
        answer: "Rajendra Prasad",
      },
    ],
    medium: [
      {
        question: "World War II ended in what year?",
        options: ["1940", "1945", "1950", "1939"],
        answer: "1945",
      },
      {
        question:
          "Who was the British Prime Minister during most of World War II?",
        options: [
          "Winston Churchill",
          "Neville Chamberlain",
          "Tony Blair",
          "Margaret Thatcher",
        ],
        answer: "Winston Churchill",
      },
      {
        question: "The Cold War was primarily between which two countries?",
        options: [
          "USA and Germany",
          "USA and USSR",
          "China and Japan",
          "UK and France",
        ],
        answer: "USA and USSR",
      },
      {
        question: "Which empire was ruled by Genghis Khan?",
        options: ["Roman", "Ottoman", "Mongol", "Persian"],
        answer: "Mongol",
      },
      {
        question: "The Renaissance began in which country?",
        options: ["France", "Germany", "Italy", "Spain"],
        answer: "Italy",
      },
      {
        question: "Who was the first Emperor of Rome?",
        options: ["Julius Caesar", "Augustus", "Nero", "Caligula"],
        answer: "Augustus",
      },
      {
        question: "Which ancient civilization used cuneiform writing?",
        options: ["Egyptians", "Greeks", "Mesopotamians", "Romans"],
        answer: "Mesopotamians",
      },
      {
        question: "The Berlin Wall fell in which year?",
        options: ["1989", "1991", "1980", "1975"],
        answer: "1989",
      },
      {
        question: "Who was the leader of the Soviet Union during World War II?",
        options: [
          "Vladimir Lenin",
          "Joseph Stalin",
          "Mikhail Gorbachev",
          "Leon Trotsky",
        ],
        answer: "Joseph Stalin",
      },
      {
        question: "Which war was fought between the Allies and Axis powers?",
        options: ["World War I", "World War II", "Vietnam War", "Korean War"],
        answer: "World War II",
      },
      {
        question:
          "Who was assassinated in Sarajevo in 1914, sparking World War I?",
        options: [
          "Archduke Franz Ferdinand",
          "Kaiser Wilhelm",
          "Tsar Nicholas II",
          "Woodrow Wilson",
        ],
        answer: "Archduke Franz Ferdinand",
      },
      {
        question: "Which country was formerly known as Persia?",
        options: ["Iraq", "Iran", "Turkey", "Syria"],
        answer: "Iran",
      },
      {
        question: "The Magna Carta was signed in which year?",
        options: ["1215", "1066", "1492", "1776"],
        answer: "1215",
      },
      {
        question: "Who was the famous queen of ancient Egypt?",
        options: ["Cleopatra", "Nefertiti", "Hatshepsut", "Isis"],
        answer: "Cleopatra",
      },
      {
        question: "Which revolution began in 1789?",
        options: [
          "American Revolution",
          "French Revolution",
          "Russian Revolution",
          "Industrial Revolution",
        ],
        answer: "French Revolution",
      },
      {
        question: "Who was the first President of independent Kenya?",
        options: [
          "Jomo Kenyatta",
          "Nelson Mandela",
          "Kwame Nkrumah",
          "Haile Selassie",
        ],
        answer: "Jomo Kenyatta",
      },
      {
        question: "Which treaty ended World War I?",
        options: [
          "Treaty of Paris",
          "Treaty of Versailles",
          "Treaty of Tordesillas",
          "Treaty of Ghent",
        ],
        answer: "Treaty of Versailles",
      },
      {
        question: "Who led the Bolshevik Revolution in Russia?",
        options: [
          "Joseph Stalin",
          "Leon Trotsky",
          "Vladimir Lenin",
          "Nicholas II",
        ],
        answer: "Vladimir Lenin",
      },
      {
        question: "Which explorer is credited with circumnavigating the globe?",
        options: [
          "Christopher Columbus",
          "Ferdinand Magellan",
          "James Cook",
          "Marco Polo",
        ],
        answer: "Ferdinand Magellan",
      },
      {
        question: "The United Nations was founded in which year?",
        options: ["1919", "1945", "1939", "1950"],
        answer: "1945",
      },
    ],
    advanced: [
      {
        question:
          "Who was the architect of the Reformation in 16th-century Europe?",
        options: ["John Calvin", "Martin Luther", "Henry VIII", "Thomas More"],
        answer: "Martin Luther",
      },
      {
        question: "Which treaty marked the end of the Thirty Years' War?",
        options: [
          "Treaty of Versailles",
          "Treaty of Westphalia",
          "Treaty of Utrecht",
          "Treaty of Tordesillas",
        ],
        answer: "Treaty of Westphalia",
      },
      {
        question: "Who led the Haitian Revolution?",
        options: [
          "Toussaint Louverture",
          "Simon Bolivar",
          "Jean-Jacques Dessalines",
          "Napoleon Bonaparte",
        ],
        answer: "Toussaint Louverture",
      },
      {
        question: "Which dynasty built the Forbidden City in China?",
        options: ["Tang", "Ming", "Qing", "Song"],
        answer: "Ming",
      },
      {
        question: "What was the main cause of the Opium Wars?",
        options: [
          "Territorial disputes",
          "Trade imbalance",
          "Drug trafficking",
          "Religious conflict",
        ],
        answer: "Drug trafficking",
      },
      {
        question:
          "Who was the longest-reigning monarch in British history before Queen Elizabeth II?",
        options: ["George III", "Victoria", "Henry VIII", "Edward VII"],
        answer: "Victoria",
      },
      {
        question: "Which Indian leader coined the term 'Quit India'?",
        options: [
          "Subhas Chandra Bose",
          "Jawaharlal Nehru",
          "Mahatma Gandhi",
          "Bal Gangadhar Tilak",
        ],
        answer: "Mahatma Gandhi",
      },
      {
        question:
          "Which empire was known for its road system and quipu record-keeping?",
        options: ["Aztec", "Inca", "Mayan", "Olmec"],
        answer: "Inca",
      },
      {
        question: "Who was the first female pharaoh of Egypt?",
        options: ["Cleopatra", "Nefertiti", "Hatshepsut", "Sobekneferu"],
        answer: "Hatshepsut",
      },
      {
        question: "Which battle marked the end of Napoleon’s rule?",
        options: [
          "Battle of Austerlitz",
          "Battle of Leipzig",
          "Battle of Trafalgar",
          "Battle of Waterloo",
        ],
        answer: "Battle of Waterloo",
      },
      {
        question: "Which civilization developed the concept of zero?",
        options: ["Greek", "Babylonian", "Indian", "Chinese"],
        answer: "Indian",
      },
      {
        question:
          "Who was the first President of South Africa after apartheid?",
        options: [
          "Thabo Mbeki",
          "Nelson Mandela",
          "F.W. de Klerk",
          "Jacob Zuma",
        ],
        answer: "Nelson Mandela",
      },
      {
        question:
          "Which ancient city was the center of the Minoan civilization?",
        options: ["Athens", "Knossos", "Sparta", "Delphi"],
        answer: "Knossos",
      },
      {
        question: "Which leader initiated the Meiji Restoration in Japan?",
        options: [
          "Tokugawa Ieyasu",
          "Emperor Meiji",
          "Hideki Tojo",
          "Oda Nobunaga",
        ],
        answer: "Emperor Meiji",
      },
      {
        question:
          "Which document limited the power of the English monarchy in 1689?",
        options: [
          "Magna Carta",
          "Bill of Rights",
          "Act of Settlement",
          "Petition of Right",
        ],
        answer: "Bill of Rights",
      },
      {
        question: "Who was the founder of the Maurya Empire?",
        options: ["Ashoka", "Chandragupta Maurya", "Bindusara", "Harsha"],
        answer: "Chandragupta Maurya",
      },
      {
        question:
          "Which war was triggered by the assassination of Archduke Franz Ferdinand?",
        options: ["World War I", "World War II", "Crimean War", "Boer War"],
        answer: "World War I",
      },
      {
        question: "Which civilization built Machu Picchu?",
        options: ["Aztec", "Inca", "Maya", "Olmec"],
        answer: "Inca",
      },
      {
        question: "Who was the last Tsar of Russia?",
        options: [
          "Peter the Great",
          "Nicholas II",
          "Alexander III",
          "Ivan the Terrible",
        ],
        answer: "Nicholas II",
      },
      {
        question: "Which revolution led to the rise of Napoleon Bonaparte?",
        options: [
          "Russian Revolution",
          "American Revolution",
          "French Revolution",
          "Industrial Revolution",
        ],
        answer: "French Revolution",
      },
    ],
  },
};
