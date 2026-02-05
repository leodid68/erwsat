import { PlacementTest } from '@/types/placement-test';

export const SAT_PLACEMENT_TEST_01: PlacementTest = {
  test_name: "SAT_RW_Placement_Test_01",
  modules: [
    {
      module_id: 1,
      difficulty: "Medium",
      time_limit_minutes: 32,
      questions: [
        {
          id: "M1_Q1",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Charles Dickens - Great Expectations",
          passage: "In the little world in which children have their existence, whosoever brings them up, there is nothing so finely perceived and so finely felt as injustice. It may be only small injustice that the child can be exposed to; but the child is small, and its world is small, and its rocking-horse stands as many hands high, according to ______, as a big-boned Irish hunter.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "scale",
            B: "measure",
            C: "proportion",
            D: "dimension"
          },
          correct_answer: "A",
          explanation: "The passage draws an analogy between the child's perception and size. 'Scale' precisely captures the idea that things appear proportionally larger to smaller beings—the rocking-horse seems as tall to the child as a real hunter horse would to an adult."
        },
        {
          id: "M1_Q2",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Jane Austen - Pride and Prejudice",
          passage: "Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife ______ his character.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "understand",
            B: "appreciate",
            C: "tolerate",
            D: "recognize"
          },
          correct_answer: "A",
          explanation: "The context emphasizes Mrs. Bennet's inability to comprehend her husband's complex personality despite decades of marriage. 'Understand' captures this cognitive gap, while 'appreciate' implies value judgment, 'tolerate' suggests endurance, and 'recognize' implies mere identification."
        },
        {
          id: "M1_Q3",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Nathaniel Hawthorne - The Scarlet Letter",
          passage: "The founders of a new colony, whatever Utopia of human virtue and happiness they might originally project, have invariably recognized it among their earliest practical necessities to allot a portion of the virgin soil as a cemetery, and another portion as the site of a ______.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "prison",
            B: "church",
            C: "courthouse",
            D: "hospital"
          },
          correct_answer: "A",
          explanation: "Hawthorne's opening establishes a darkly ironic commentary on human nature: even utopian dreamers must immediately plan for death (cemetery) and crime (prison). This cynical pairing sets the novel's themes of sin and punishment."
        },
        {
          id: "M1_Q4",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "The Guardian - Science",
          passage: "For decades, neuroscientists assumed that adult brains were essentially fixed—that the neural pathways established in childhood remained largely unchanged throughout life. This view, known as the 'hardwired brain' hypothesis, dominated textbooks and clinical practice alike. Recent research, however, has fundamentally challenged this assumption. Studies using advanced imaging techniques have revealed that the adult brain retains remarkable plasticity, continuously forming new connections and, in some regions, even generating new neurons.",
          question_stem: "Which choice best describes the function of the underlined sentence in the text as a whole?",
          choices: {
            A: "It introduces the main topic that the rest of the passage will explore in detail.",
            B: "It presents a traditional view that the passage will subsequently challenge.",
            C: "It provides evidence supporting the claim made in the previous sentence.",
            D: "It offers a definition of a technical term used throughout the passage."
          },
          correct_answer: "B",
          explanation: "The sentence about the 'hardwired brain' hypothesis establishes the conventional wisdom that the passage then overturns with 'Recent research, however, has fundamentally challenged this assumption.'"
        },
        {
          id: "M1_Q5",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "Alexander Hamilton - The Federalist No. 1",
          passage: "After an unequivocal experience of the inefficiency of the subsisting federal government, you are called upon to deliberate on a new Constitution for the United States of America. The subject speaks its own importance; comprehending in its consequences nothing less than the existence of the UNION, the safety and welfare of the parts of which it is composed, the fate of an empire in many respects the most interesting in the world.",
          question_stem: "What is the main purpose of this passage?",
          choices: {
            A: "To criticize the existing government's handling of foreign affairs",
            B: "To establish the gravity of the constitutional decision facing the nation",
            C: "To compare the American system with European governments",
            D: "To outline the specific provisions of the proposed Constitution"
          },
          correct_answer: "B",
          explanation: "Hamilton's opening establishes stakes and urgency. He emphasizes that the decision 'comprehends' the Union's very existence, framing the constitutional debate as momentous rather than technical."
        },
        {
          id: "M1_Q6",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "Charles Dickens - A Tale of Two Cities",
          passage: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
          question_stem: "The author uses the parallel structure in this passage primarily to",
          choices: {
            A: "create a sense of confusion about the time period being described",
            B: "emphasize the contradictory nature of the era",
            C: "compare life in London with life in Paris",
            D: "suggest that the narrator is unreliable"
          },
          correct_answer: "B",
          explanation: "The systematic pairing of opposites (best/worst, wisdom/foolishness, belief/incredulity) rhetorically constructs the Revolutionary period as defined by fundamental contradictions."
        },
        {
          id: "M1_Q7",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "The Guardian - Science",
          passage: "The octopus possesses a distributed nervous system unlike any other creature studied by biologists. Two-thirds of its neurons reside not in its brain but in its arms, which can taste, touch, and make decisions ______ of the central brain. Each arm operates with a degree of autonomy that has led some researchers to describe the octopus as having nine brains.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "regardless",
            B: "independently",
            C: "exclusive",
            D: "separately"
          },
          correct_answer: "B",
          explanation: "'Independently of' is the idiomatic phrase meaning 'without reliance on' or 'autonomously from.' The passage emphasizes the arms' autonomous decision-making capacity, making 'independently' the precise choice."
        },
        {
          id: "M1_Q8",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Jane Austen - Persuasion",
          passage: "She had been forced into prudence in her youth, she learned romance as she grew older: the natural ______ of an unnatural beginning.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "sequence",
            B: "consequence",
            C: "result",
            D: "outcome"
          },
          correct_answer: "A",
          explanation: "Austen plays on the reversal of life's expected order—typically, youth is romantic and age brings prudence. 'Sequence' emphasizes this temporal inversion as the 'natural' pattern following from an 'unnatural' starting point."
        },
        {
          id: "M1_Q9",
          domain: "Information & Ideas",
          skill: "Central Ideas and Details",
          text_source: "The Guardian - Science",
          passage: "Climate scientists have long known that the Arctic is warming faster than any other region on Earth—a phenomenon called Arctic amplification. New data suggests this disparity is even more dramatic than previously measured. While global average temperatures have risen approximately 1.1°C since pre-industrial times, parts of the Arctic have warmed by more than 4°C. The primary driver is ice-albedo feedback: as reflective ice melts, it exposes darker ocean water, which absorbs more solar radiation, causing further warming and more ice loss.",
          question_stem: "According to the passage, what is the main cause of accelerated Arctic warming?",
          choices: {
            A: "Increased global carbon emissions concentrated in polar regions",
            B: "A self-reinforcing cycle involving ice loss and heat absorption",
            C: "Rising ocean temperatures carried north by changing currents",
            D: "The thinning of the ozone layer above the Arctic"
          },
          correct_answer: "B",
          explanation: "The passage explicitly identifies 'ice-albedo feedback' as the 'primary driver,' describing a cycle where melting ice → darker water → more heat absorption → more melting. This is a self-reinforcing (positive feedback) cycle."
        },
        {
          id: "M1_Q10",
          domain: "Information & Ideas",
          skill: "Central Ideas and Details",
          text_source: "Charles Dickens - Hard Times",
          passage: "'Now, what I want is, Facts. Teach these boys and girls nothing but Facts. Facts alone are wanted in life. Plant nothing else, and root out everything else. You can only form the minds of reasoning animals upon Facts: nothing else will ever be of any service to them.' The speaker, and the schoolmaster, and the third grown person present, all backed a little, and swept with their eyes the inclined plane of little vessels then and there arranged in order, ready to have imperial gallons of facts poured into them until they were full to the brim.",
          question_stem: "Based on the passage, the speaker's educational philosophy can best be described as",
          choices: {
            A: "emphasizing practical skills over theoretical knowledge",
            B: "prioritizing memorization of information over imagination",
            C: "balancing factual learning with creative expression",
            D: "encouraging students to question established truths"
          },
          correct_answer: "B",
          explanation: "The speaker demands 'Facts' exclusively, ordering that 'nothing else' be planted and 'everything else' be rooted out. The metaphor of children as 'vessels' to be filled confirms a philosophy of rote memorization that leaves no room for imagination."
        },
        {
          id: "M1_Q11",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Textual)",
          text_source: "Alexander Hamilton - The Federalist No. 10 (Madison)",
          passage: "The latent causes of faction are thus sown in the nature of man; and we see them everywhere brought into different degrees of activity, according to the different circumstances of civil society. A zeal for different opinions concerning religion, concerning government, and many other points, as well of speculation as of practice; an attachment to different leaders ambitiously contending for pre-eminence and power; or to persons of other descriptions whose fortunes have been interesting to the human passions, have, in turn, divided mankind into parties, inflamed them with mutual animosity, and rendered them much more disposed to vex and oppress each other than to co-operate for their common good.",
          question_stem: "Which choice best states the main claim of the passage?",
          choices: {
            A: "Religious differences are the primary source of political division.",
            B: "Factionalism is an inevitable result of human nature.",
            C: "Strong leaders are necessary to overcome partisan conflict.",
            D: "Democratic governments are more prone to faction than monarchies."
          },
          correct_answer: "B",
          explanation: "Madison argues that faction's causes are 'sown in the nature of man'—making them inherent and unavoidable. He lists various triggers (religion, opinion, ambition) as manifestations of this fundamental human tendency."
        },
        {
          id: "M1_Q12",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Textual)",
          text_source: "The Guardian - Science",
          passage: "A team of marine biologists studying communication patterns in sperm whales has identified what they describe as a 'phonetic alphabet' in the animals' clicking vocalizations. By analyzing thousands of recorded exchanges, researchers found that whales combine basic click patterns—called codas—into longer sequences with consistent structural rules. 'What we're seeing isn't just a collection of calls,' explained lead researcher Dr. Shane Gero. 'There's a combinatorial system here, where elements are assembled according to predictable patterns.'",
          question_stem: "Which finding, if true, would most directly support the researchers' claim about whale communication?",
          choices: {
            A: "Sperm whales in different ocean regions produce identical coda patterns.",
            B: "Whale calves gradually learn coda sequences by imitating adults.",
            C: "Novel coda combinations follow the same structural rules as familiar ones.",
            D: "Whales produce more codas during social interactions than while hunting."
          },
          correct_answer: "C",
          explanation: "The claim is that whales have a 'combinatorial system' with 'predictable patterns'—essentially grammar. If novel combinations still follow structural rules, this demonstrates productive, rule-governed combination rather than mere memorized calls."
        },
        {
          id: "M1_Q13",
          domain: "Information & Ideas",
          skill: "Central Ideas and Details",
          text_source: "Nathaniel Hawthorne - The House of the Seven Gables",
          passage: "Halfway down a by-street of one of our New England towns stands a rusty wooden house, with seven acutely peaked gables, facing towards various points of the compass, and a huge, clustered chimney in the midst. The street is Pyncheon Street; the house is the old Pyncheon House; and an elm-tree, of wide circumference, rooted before the door, is familiar to every town-born child by the title of the Pyncheon Elm. On my occasional visits to the town aforesaid, I seldom failed to turn down Pyncheon Street, for the sake of passing through the shadow of these two antiquities,—the great elm-tree and the weather-beaten edifice.",
          question_stem: "The narrator's attitude toward the house and elm tree can best be characterized as",
          choices: {
            A: "fearful apprehension",
            B: "nostalgic reverence",
            C: "detached curiosity",
            D: "critical disapproval"
          },
          correct_answer: "B",
          explanation: "The narrator 'seldom failed' to visit and describes them as 'antiquities' worth seeking out. The affectionate detail ('familiar to every town-born child') and deliberate visits suggest nostalgic attachment rather than fear, detachment, or criticism."
        },
        {
          id: "M1_Q14",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Quantitative)",
          text_source: "Scientific Study Data",
          passage: "Researchers studying sleep patterns across age groups collected data on average nightly sleep duration. Participants aged 18-25 averaged 7.2 hours, those 26-40 averaged 6.8 hours, those 41-55 averaged 6.5 hours, and those over 55 averaged 6.1 hours. The study also measured sleep efficiency (percentage of time in bed actually spent sleeping): 18-25 (92%), 26-40 (89%), 41-55 (85%), over 55 (78%).",
          question_stem: "Which statement is most directly supported by the data in the passage?",
          choices: {
            A: "Older adults require less sleep than younger adults.",
            B: "Both sleep duration and sleep efficiency decline with age.",
            C: "Poor sleep efficiency causes reduced sleep duration.",
            D: "Adults over 55 experience the most severe sleep disorders."
          },
          correct_answer: "B",
          explanation: "The data shows clear declining trends for both duration (7.2→6.1 hours) and efficiency (92%→78%) across age groups. Choice A conflates 'obtaining' with 'requiring'; C assumes causation; D makes unsupported claims about disorders."
        },
        {
          id: "M1_Q15",
          domain: "Information & Ideas",
          skill: "Inferences",
          text_source: "Jane Austen - Emma",
          passage: "Emma Woodhouse, handsome, clever, and rich, with a comfortable home and happy disposition, seemed to unite some of the best blessings of existence; and had lived nearly twenty-one years in the world with very little to distress or vex her. She was the youngest of the two daughters of a most affectionate, indulgent father; and had, in consequence of her sister's marriage, been mistress of his house from a very early period. Her mother had died too long ago for her to have more than an indistinct remembrance of her caresses.",
          question_stem: "It can reasonably be inferred from the passage that Emma's position as 'mistress of his house'",
          choices: {
            A: "was a burden she reluctantly accepted",
            B: "resulted from a combination of circumstances",
            C: "prepared her poorly for eventual marriage",
            D: "created tension with her older sister"
          },
          correct_answer: "B",
          explanation: "The passage indicates Emma became mistress 'in consequence of her sister's marriage' to an 'indulgent father' after her mother's early death—multiple circumstances combining. No evidence supports burden, poor preparation, or sibling tension."
        },
        {
          id: "M1_Q16",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing",
          passage: "The discovery of penicillin revolutionized medicine ______ before its development, even minor infections could prove fatal.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "consequently,",
            B: "in fact",
            C: "because",
            D: "moreover,"
          },
          correct_answer: "C",
          explanation: "The second clause explains WHY the discovery was revolutionary—establishing a causal relationship. 'Because' introduces this explanatory subordinate clause. 'Consequently' reverses the logic; 'in fact' and 'moreover' don't establish the needed causal connection."
        },
        {
          id: "M1_Q17",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing",
          passage: "The museum's new exhibition features artifacts from ancient ______ pottery, jewelry, and tools are displayed alongside interactive digital reconstructions.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "Rome, including",
            B: "Rome. Including",
            C: "Rome including:",
            D: "Rome; including"
          },
          correct_answer: "A",
          explanation: "The phrase 'including pottery, jewelry, and tools' is a participial phrase modifying 'artifacts from ancient Rome.' It requires only a comma, not a period, semicolon, or colon, to introduce this modifying element."
        },
        {
          id: "M1_Q18",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing",
          passage: "Neither the professor nor her teaching assistants ______ able to locate the missing research files.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "was",
            B: "were",
            C: "is",
            D: "has been"
          },
          correct_answer: "B",
          explanation: "With 'neither...nor,' the verb agrees with the nearer subject. 'Teaching assistants' is plural, requiring 'were.' The past tense matches the context of searching for something already lost."
        },
        {
          id: "M1_Q19",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing",
          passage: "The committee reviewing the proposal ______ expected to announce their decision by Friday.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "are",
            B: "is",
            C: "were",
            D: "have been"
          },
          correct_answer: "B",
          explanation: "'Committee' is a collective noun treated as singular when acting as a unit. The present tense 'is' matches the future-oriented context ('by Friday'). 'Their' later in the sentence refers to the committee members distributively."
        },
        {
          id: "M1_Q20",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing",
          passage: "Scientists have identified a new species of deep-sea ______ the creature, which lives near hydrothermal vents, has unique adaptations for surviving extreme pressure.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "fish, and",
            B: "fish",
            C: "fish;",
            D: "fish:"
          },
          correct_answer: "C",
          explanation: "Two independent clauses require either a period, semicolon, or comma + coordinating conjunction. 'Fish;' correctly uses a semicolon between the related independent clauses. Option A lacks 'and' needed after the comma."
        },
        {
          id: "M1_Q21",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing",
          passage: "Having studied the migration patterns of Arctic terns for over a decade, the researcher's conclusion that these birds travel farther than any other ______ on solid evidence.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "species rests",
            B: "species, resting",
            C: "species rest",
            D: "species. Rests"
          },
          correct_answer: "A",
          explanation: "The subject is 'conclusion' (singular), requiring 'rests.' The sentence structure is: 'the researcher's conclusion...rests on solid evidence.' 'Species' is the object of 'than any other,' not the main subject."
        },
        {
          id: "M1_Q22",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing",
          passage: "The architect who designed the new performing arts ______ an innovative approach that combines sustainable materials with cutting-edge acoustics.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "center, she employed",
            B: "center employed",
            C: "center. Employed",
            D: "center; employed"
          },
          correct_answer: "B",
          explanation: "'The architect who designed the new performing arts center' is the complete subject. 'Employed' is the main verb. No punctuation should separate subject from verb. Option A creates a comma splice; C and D create fragments."
        },
        {
          id: "M1_Q23",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "The traditional view held that dinosaurs were cold-blooded reptiles, sluggish and dependent on external heat sources. ______, fossil evidence of rapid bone growth and active predatory behavior has led many paleontologists to conclude that at least some dinosaurs were warm-blooded.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "Therefore",
            B: "Similarly",
            C: "However",
            D: "Specifically"
          },
          correct_answer: "C",
          explanation: "The passage presents a contrast between the 'traditional view' (cold-blooded, sluggish) and new evidence suggesting the opposite (warm-blooded, active). 'However' signals this contradiction."
        },
        {
          id: "M1_Q24",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "Urban planners increasingly recognize the importance of green spaces in city design. Parks and gardens improve air quality and reduce urban heat island effects. ______, they provide crucial mental health benefits, offering residents spaces for recreation and stress relief.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "Nevertheless",
            B: "In contrast",
            C: "Additionally",
            D: "Instead"
          },
          correct_answer: "C",
          explanation: "The passage lists multiple benefits of green spaces. The mental health benefits ADD to the environmental benefits already mentioned, requiring an additive transition like 'Additionally.'"
        },
        {
          id: "M1_Q25",
          domain: "Expression of Ideas",
          skill: "Rhetorical Synthesis",
          text_source: "Academic Writing",
          passage: "A student is writing a research paper about renewable energy adoption. She wants to emphasize that cost remains a significant barrier despite technological improvements.\n\nNotes:\n- Solar panel efficiency has increased by 25% over the past decade.\n- The average cost of residential solar installation is $15,000-$25,000.\n- Federal tax credits can offset 30% of installation costs.\n- Many homeowners cite upfront costs as the primary reason for not adopting solar.",
          question_stem: "Which choice most effectively uses the information to accomplish the student's goal?",
          choices: {
            A: "Solar technology has improved dramatically, with panel efficiency increasing 25% over the past decade.",
            B: "While solar panels have become more efficient, many homeowners still cite the $15,000-$25,000 installation cost as a barrier to adoption.",
            C: "Federal tax credits can offset 30% of solar installation costs, making renewable energy more accessible.",
            D: "The average residential solar installation costs between $15,000 and $25,000 before tax credits."
          },
          correct_answer: "B",
          explanation: "The goal requires acknowledging technological progress while emphasizing that cost remains a barrier. Only B accomplishes both: 'While solar panels have become more efficient' (progress) + 'many homeowners still cite...cost as a barrier' (persistent obstacle)."
        },
        {
          id: "M1_Q26",
          domain: "Expression of Ideas",
          skill: "Rhetorical Synthesis",
          text_source: "Academic Writing",
          passage: "A student is writing about the impact of social media on political engagement. She wants to present a balanced view that acknowledges both benefits and concerns.\n\nNotes:\n- Social media allows rapid dissemination of political information.\n- Studies show increased voter registration among young people who use political social media.\n- Misinformation spreads faster on social platforms than corrections.\n- Algorithm-driven content can create 'echo chambers' limiting exposure to diverse viewpoints.",
          question_stem: "Which choice most effectively uses the information to accomplish the student's goal?",
          choices: {
            A: "Social media has revolutionized political engagement by enabling rapid information sharing and increasing voter registration among young people.",
            B: "The spread of misinformation and algorithm-driven echo chambers make social media a threat to informed democratic participation.",
            C: "While social media has increased political participation among young voters, concerns about misinformation and echo chambers raise questions about the quality of that engagement.",
            D: "Studies show that young people who use political social media are more likely to register to vote."
          },
          correct_answer: "C",
          explanation: "A balanced view requires addressing both positive and negative aspects. Only C presents benefits ('increased political participation') while acknowledging concerns ('misinformation and echo chambers')."
        },
        {
          id: "M1_Q27",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "Early astronomers believed the Sun revolved around Earth, a model that seemed consistent with daily observation. ______, careful measurement of planetary movements revealed patterns that the Earth-centered model could not explain, ultimately leading to the Copernican revolution.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "In other words",
            B: "As a result",
            C: "Over time",
            D: "For example"
          },
          correct_answer: "C",
          explanation: "The passage describes a historical shift from one belief to another through accumulated evidence. 'Over time' captures this gradual process of observation leading to paradigm change."
        }
      ]
    },
    {
      module_id: 2,
      difficulty: "Hard",
      time_limit_minutes: 32,
      questions: [
        {
          id: "M2_Q1",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Charles Dickens - Bleak House",
          passage: "London. Michaelmas term lately over, and the Lord Chancellor sitting in Lincoln's Inn Hall. Implacable November weather. As much mud in the streets as if the waters had but newly retired from the face of the earth, and it would not be wonderful to meet a Megalosaurus, forty feet long or so, waddling like an elephantine lizard up Holborn Hill. Smoke lowering down from chimney-pots, making a soft black drizzle, with flakes of soot in it as big as full-grown snowflakes—gone into ______, and mourning, one might imagine, for the death of the sun.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "darkness",
            B: "mourning",
            C: "decline",
            D: "retirement"
          },
          correct_answer: "B",
          explanation: "Dickens personifies the soot flakes, suggesting they have 'gone into mourning' for the sun—wearing black (soot) as Victorians wore black for death. This creates a complex metaphor linking industrial pollution to funereal imagery. 'Darkness' is too literal; 'decline' and 'retirement' miss the personification."
        },
        {
          id: "M2_Q2",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Jane Austen - Mansfield Park",
          passage: "To the education of her daughters Lady Bertram paid not the smallest attention. She had not time for such cares. She was a woman who spent her days in sitting, nicely dressed, on a sofa, doing some long piece of needlework, of little use and no beauty, thinking more of her pug than her children, but very ______ of being incommoded by either.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "indifferent to",
            B: "fearful of",
            C: "careful about",
            D: "indulgent of"
          },
          correct_answer: "D",
          explanation: "Austen's irony operates through 'indulgent'—Lady Bertram is permissive and yielding because she wants to avoid being 'incommoded' (inconvenienced). She's not indifferent (she avoids disturbance), fearful (no anxiety shown), or careful (no active effort)."
        },
        {
          id: "M2_Q3",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "Alexander Hamilton - The Federalist No. 78",
          passage: "Whoever attentively considers the different departments of power must perceive, that, in a government in which they are separated from each other, the judiciary, from the nature of its functions, will always be the least dangerous to the political rights of the Constitution; because it will be least in a capacity to annoy or ______ them.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "injure",
            B: "challenge",
            C: "modify",
            D: "interpret"
          },
          correct_answer: "A",
          explanation: "Hamilton pairs 'annoy or _____'—both words describing harm to political rights. 'Injure' completes this parallel of damage/harm. 'Challenge' and 'interpret' are neutral judicial functions; 'modify' doesn't parallel 'annoy's' sense of harm."
        },
        {
          id: "M2_Q4",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "The Guardian - Science",
          passage: "The 'hygiene hypothesis,' first proposed in 1989, suggested that reduced childhood exposure to microbes in developed nations might explain rising allergy rates. Three decades of research have complicated this picture considerably. While early microbial exposure does shape immune development, scientists now recognize that the relationship is far more nuanced than simple 'more germs, fewer allergies.' Specific bacterial communities, timing of exposure, genetic predisposition, and environmental factors all interact in ways researchers are only beginning to map. The original hypothesis, though foundational, now appears almost quaint in its simplicity.",
          question_stem: "Which choice best describes the overall structure of the passage?",
          choices: {
            A: "A hypothesis is presented, evidence supporting it is detailed, and its implications are explored.",
            B: "A theory is introduced, its evolution through subsequent research is traced, and its current status is assessed.",
            C: "Two competing explanations are compared, their relative merits are weighed, and one is endorsed.",
            D: "A scientific controversy is described, stakeholder positions are outlined, and a compromise is proposed."
          },
          correct_answer: "B",
          explanation: "The passage moves from introducing the 1989 hypothesis → describing how 'three decades of research have complicated this picture' → assessing it as 'foundational' but 'quaint in its simplicity.' This traces evolution and current status, not simple support (A), comparison (C), or controversy resolution (D)."
        },
        {
          id: "M2_Q5",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "Nathaniel Hawthorne - Young Goodman Brown",
          passage: "Young Goodman Brown came forth at sunset into the street at Salem village; but put his head back, after crossing the threshold, to exchange a parting kiss with his young wife. And Faith, as the wife was aptly named, thrust her own pretty head into the street, letting the wind play with the pink ribbons of her cap while she called to Goodman Brown.",
          question_stem: "The detail about Faith's name being 'apt' primarily serves to",
          choices: {
            A: "establish the historical authenticity of Puritan naming conventions",
            B: "signal that the character may function symbolically in the narrative",
            C: "demonstrate the narrator's affection for the young couple",
            D: "foreshadow that Faith will remain loyal despite her husband's journey"
          },
          correct_answer: "B",
          explanation: "Hawthorne's deliberate aside—'as the wife was aptly named'—alerts readers that 'Faith' carries allegorical weight beyond mere nomenclature. This signals symbolic function. D is a 'true but misses the point' trap: while Faith may be loyal, the comment signals allegory, not prediction."
        },
        {
          id: "M2_Q6",
          domain: "Craft & Structure",
          skill: "Text Structure and Purpose",
          text_source: "Charles Dickens - David Copperfield",
          passage: "Whether I shall turn out to be the hero of my own life, or whether that station will be held by anybody else, these pages must show. To begin my life with the beginning of my life, I record that I was born (as I have been informed and believe) on a Friday, at twelve o'clock at night. It was remarked that the clock began to strike, and I began to cry, simultaneously.",
          question_stem: "The narrator's parenthetical remark '(as I have been informed and believe)' functions to",
          choices: {
            A: "cast doubt on the reliability of the account that follows",
            B: "acknowledge the limitations of autobiographical knowledge",
            C: "suggest the narrator was unwanted at birth",
            D: "establish the precise historical setting of the narrative"
          },
          correct_answer: "B",
          explanation: "The narrator cannot directly remember his own birth, so acknowledges dependence on others' testimony—a philosophical nod to how autobiography relies on secondhand information for early life. A overstates (it doesn't undermine the whole account); C and D lack textual support."
        },
        {
          id: "M2_Q7",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "The Guardian - Science",
          passage: "The concept of 'deep time'—geological time scales measured in millions and billions of years—poses profound cognitive challenges. Humans evolved to navigate immediate environments where 'long-term planning' meant storing food for winter. Our intuitions about time are calibrated to lifespans, not eras. When geologists ask us to contemplate processes unfolding over spans that ______ human existence by orders of magnitude, they are asking us to transcend the very framework our minds are built to use.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "exceed",
            B: "predate",
            C: "dwarf",
            D: "outlast"
          },
          correct_answer: "C",
          explanation: "'Dwarf' conveys that geological timescales make human existence seem insignificantly small in comparison—which fits 'by orders of magnitude.' 'Exceed' is too neutral; 'predate' (come before) and 'outlast' (survive beyond) refer to sequence, not relative scale."
        },
        {
          id: "M2_Q8",
          domain: "Craft & Structure",
          skill: "Words in Context",
          text_source: "James Madison - The Federalist No. 51",
          passage: "But what is government itself, but the greatest of all reflections on human nature? If men were angels, no government would be necessary. If angels were to govern men, neither external nor internal controls on government would be necessary. In framing a government which is to be administered by men over men, the great difficulty lies in this: you must first enable the government to control the governed; and in the next place ______ it to control itself.",
          question_stem: "Which choice completes the text with the most logical and precise word or phrase?",
          choices: {
            A: "require",
            B: "oblige",
            C: "force",
            D: "allow"
          },
          correct_answer: "B",
          explanation: "Madison's parallel structure ('first enable...in the next place _____') requires a verb of similar weight to 'enable.' 'Oblige' captures the constitutional necessity of compelling government self-restraint through structural mechanisms. 'Require' and 'force' are too coercive for government self-regulation; 'allow' is too permissive."
        },
        {
          id: "M2_Q9",
          domain: "Information & Ideas",
          skill: "Central Ideas and Details",
          text_source: "The Guardian - Science",
          passage: "Researchers studying decision-making under uncertainty have identified a consistent pattern they call 'denominator neglect.' When presented with two options—say, a 7% chance of winning versus 7 out of 100 tickets being winners—people systematically prefer the second framing, even though the probabilities are identical. The effect persists even among statistically sophisticated individuals who can calculate that the odds are the same. Brain imaging studies suggest this occurs because the mental image of '7 winning tickets' is more vivid and emotionally engaging than the abstract concept '7 percent,' activating reward-anticipation regions that override rational assessment.",
          question_stem: "Based on the passage, 'denominator neglect' can best be understood as",
          choices: {
            A: "a tendency to ignore probability information when making decisions",
            B: "a preference for concrete representations over abstract equivalents",
            C: "an inability to perform accurate mathematical calculations under stress",
            D: "a bias toward choosing options with larger total numbers"
          },
          correct_answer: "B",
          explanation: "The passage shows people prefer '7 out of 100' (concrete, imaginable) over '7%' (abstract) despite identical probability. It's not ignoring probability (A)—they process it differently. Not calculation inability (C)—'even among statistically sophisticated individuals.' D is a trap: the preference isn't for larger numbers generally but concrete framing."
        },
        {
          id: "M2_Q10",
          domain: "Information & Ideas",
          skill: "Central Ideas and Details",
          text_source: "Jane Austen - Northanger Abbey",
          passage: "The person, be it gentleman or lady, who has not pleasure in a good novel, must be intolerably stupid. I have read all Mrs. Radcliffe's works, and most of them with great pleasure. The Mysteries of Udolpho, when I had once begun it, I could not lay down again; I remember finishing it in two days—my hair standing on end the whole time. And yet, I am not naturally timid; my temperament is quite suited to the study of character in real life, which I consider infinitely superior to any character that a novelist can produce.",
          question_stem: "The speaker's attitude toward novels in this passage can best be described as",
          choices: {
            A: "consistently enthusiastic and uncritical",
            B: "dismissive despite professing enjoyment",
            C: "defensive about a pleasure considered inferior",
            D: "contradictory, valuing both novels and real-life observation"
          },
          correct_answer: "D",
          explanation: "The speaker calls those who dislike novels 'intolerably stupid' and describes intense enjoyment, yet also claims real-life character study is 'infinitely superior.' This creates genuine contradiction. A misses the criticism; B inverts the dynamic; C misses that the speaker considers novels worthy despite ranking them lower."
        },
        {
          id: "M2_Q11",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Textual)",
          text_source: "The Guardian - Science",
          passage: "The traditional model of cancer development—a linear progression from single mutation to tumor—is giving way to a more complex understanding. Tumors, researchers now recognize, are ecosystems. They contain heterogeneous populations of cells with different genetic profiles, competing and cooperating like species in an ecological niche. Some cancer cells proliferate rapidly but die when nutrients become scarce; others grow slowly but survive treatment. Chemotherapy, in this view, functions less like a targeted strike and more like a forest fire—eliminating certain populations while inadvertently selecting for resistant variants that repopulate the damaged terrain.",
          question_stem: "Which statement, if true, would most weaken the ecological model of cancer described in the passage?",
          choices: {
            A: "Most tumors contain cells with nearly identical genetic profiles throughout their development.",
            B: "Chemotherapy dosages vary significantly based on patient body weight and metabolism.",
            C: "Cancer cells in laboratory conditions behave differently than cells in living organisms.",
            D: "Some cancers develop resistance to treatment within weeks of initial chemotherapy."
          },
          correct_answer: "A",
          explanation: "The ecological model depends on 'heterogeneous populations of cells with different genetic profiles.' If tumors actually contain genetically identical cells, the ecosystem analogy collapses. D actually supports the model (selection for resistant variants); B and C are irrelevant to the heterogeneity claim."
        },
        {
          id: "M2_Q12",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Textual)",
          text_source: "Charles Dickens - Oliver Twist",
          passage: "The members of this board were very sage, deep, philosophical men; and when they came to turn their attention to the workhouse, they found out at once, what ordinary folks would never have discovered—the poor people liked it! It was a regular place of public entertainment for the poorer classes; a tavern where there was nothing to pay; a public breakfast, dinner, tea, and supper all the year round; a brick and mortar elysium, where it was all play and no work. 'Oho!' said the board, looking very knowing; 'we are the fellows to set this to rights; we'll stop it all, in no time.'",
          question_stem: "The narrator's tone in describing the board members can best be characterized as",
          choices: {
            A: "admiring their practical wisdom",
            B: "neutral in reporting their conclusions",
            C: "satirical in exposing their self-delusion",
            D: "sympathetic to their difficult responsibilities"
          },
          correct_answer: "C",
          explanation: "The narrator's irony is heavy: calling the board 'sage, deep, philosophical' while revealing absurd conclusions (the poor 'liked' the workhouse, it was 'elysium'). The sarcastic 'Oho!' and 'we are the fellows' expose pompous self-satisfaction. True but irrelevant trap: they may have 'difficult responsibilities' (D), but the passage satirizes them."
        },
        {
          id: "M2_Q13",
          domain: "Information & Ideas",
          skill: "Inferences",
          text_source: "Alexander Hamilton - The Federalist No. 84",
          passage: "I go further, and affirm that bills of rights, in the sense and to the extent in which they are contended for, are not only unnecessary in the proposed Constitution, but would even be dangerous. They would contain various exceptions to powers not granted; and, on this very account, would afford a colorable pretext to claim more than were granted. For why declare that things shall not be done which there is no power to do? Why, for instance, should it be said that the liberty of the press shall not be restrained, when no power is given by which restrictions may be imposed?",
          question_stem: "Hamilton's argument against including a bill of rights rests primarily on the assumption that",
          choices: {
            A: "the liberties in question are not important enough to warrant protection",
            B: "listing specific rights could imply that unlisted powers exist",
            C: "state constitutions already provide sufficient protection for individual rights",
            D: "the Constitution grants limited powers, making explicit prohibitions redundant"
          },
          correct_answer: "D",
          explanation: "Hamilton argues: why prohibit what the government has 'no power to do'? His logic: the Constitution grants only enumerated powers, so protecting press liberty is unnecessary when 'no power is given by which restrictions may be imposed.' B is partially right but misses Hamilton's core logic about enumerated powers."
        },
        {
          id: "M2_Q14",
          domain: "Information & Ideas",
          skill: "Command of Evidence (Quantitative)",
          text_source: "Scientific Study Data",
          passage: "Researchers examined factors influencing vaccine hesitancy across demographic groups. Survey data from 12,000 adults revealed that hesitancy correlated with education level (high school or less: 38% hesitant; some college: 27%; bachelor's degree: 19%; graduate degree: 12%), but the relationship with political affiliation was stronger. Among conservatives, hesitancy rates were 41% regardless of education level. Among liberals, rates ranged from 22% (high school) to 8% (graduate degree). Among moderates, rates closely tracked the overall education pattern.",
          question_stem: "Which conclusion is best supported by the data presented in the passage?",
          choices: {
            A: "Education is the strongest predictor of vaccine hesitancy across all groups.",
            B: "Political identity moderates the relationship between education and vaccine hesitancy.",
            C: "Conservatives with graduate degrees are more hesitant than liberals with high school education.",
            D: "Moderates show the lowest overall rates of vaccine hesitancy."
          },
          correct_answer: "B",
          explanation: "Among conservatives, education doesn't matter (41% regardless); among liberals, it matters greatly (22%→8%); among moderates, education tracks normally. Political identity thus determines whether education affects hesitancy—it 'moderates' (in statistical terms) the relationship. A is false (politics is stronger for conservatives). C compares 41% to 22%—true but misleading framing. D lacks support."
        },
        {
          id: "M2_Q15",
          domain: "Information & Ideas",
          skill: "Inferences",
          text_source: "Nathaniel Hawthorne - The Blithedale Romance",
          passage: "Speaking strictly to the point, I should be obliged to answer that I never observed any transcendental qualities in Zenobia. Her attributes were all of the flesh, and consisted in an uncommon degree of health and animal spirits, a frankness of behavior that might be considered bold in women of more prudent disposition, and an indefatigable activity in domestic affairs. Yet, for all this, I have repeatedly felt an influence coming from her such as I might suppose to emanate from a powerful feminine nature, and drawing my own spirit to a point of contact with hers.",
          question_stem: "The narrator's view of Zenobia can best be described as",
          choices: {
            A: "entirely negative, finding her unrefined and overly physical",
            B: "wholly positive, admiring her unconventional vitality",
            C: "ambivalent, acknowledging attraction despite intellectual reservations",
            D: "indifferent, observing her qualities without personal engagement"
          },
          correct_answer: "C",
          explanation: "The narrator explicitly denies 'transcendental qualities' (intellectual reservation) while acknowledging being 'drawn' to her by 'powerful feminine nature' (attraction). The 'Yet, for all this' pivot signals ambivalence. A ignores the attraction; B ignores the critique; D contradicts 'drawing my own spirit.'"
        },
        {
          id: "M2_Q16",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing - Complex Syntax",
          passage: "The phenomenon of linguistic code-switching—the practice whereby bilingual speakers alternate between languages within a single conversation or even a single ______ has long fascinated sociolinguists seeking to understand the cognitive mechanisms underlying language production.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "sentence,",
            B: "sentence—",
            C: "sentence;",
            D: "sentence"
          },
          correct_answer: "B",
          explanation: "The sentence uses an em-dash after 'code-switching' to open an explanatory interruption. This interruption must be closed with a matching em-dash before resuming the main clause ('has long fascinated...')."
        },
        {
          id: "M2_Q17",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing - Complex Syntax",
          passage: "The composer's final symphony, which many critics consider her masterpiece and which remained unperformed during her ______ only achieved widespread recognition decades after her death.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "lifetime",
            B: "lifetime,",
            C: "lifetime;",
            D: "lifetime:"
          },
          correct_answer: "B",
          explanation: "The phrase 'which many critics consider...which remained unperformed during her lifetime' is a non-restrictive relative clause modifying 'symphony.' This interruption requires commas at both ends. The comma after 'lifetime' closes the interruption before the main verb 'achieved.'"
        },
        {
          id: "M2_Q18",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing - Complex Syntax",
          passage: "The geological evidence—layers of ash, fractured bedrock, and displaced sediment—______ a catastrophic event occurred at this site approximately 65 million years ago.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "suggest",
            B: "suggests",
            C: "suggesting",
            D: "have suggested"
          },
          correct_answer: "B",
          explanation: "The subject is 'evidence' (singular), not the list within the dashes. The em-dashes set off an appositive describing what the evidence consists of. 'Suggests' agrees with the singular subject 'evidence.'"
        },
        {
          id: "M2_Q19",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing - Complex Syntax",
          passage: "The researchers, along with their international collaborators from universities in Germany, Japan, and ______ published their findings in a peer-reviewed journal last month.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "Brazil",
            B: "Brazil,",
            C: "Brazil;",
            D: "Brazil—"
          },
          correct_answer: "B",
          explanation: "'Along with their international collaborators from universities in Germany, Japan, and Brazil' is a parenthetical phrase that must be closed with a comma before the main verb 'published.' The subject is 'researchers' (plural), and the phrase is non-essential information."
        },
        {
          id: "M2_Q20",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing - Dickensian Style",
          passage: "The old house, with its creaking floorboards and drafty windows, its smell of dust and old paper, its corridors that seemed to stretch into darkness beyond the reach of any lamp—this house, I say, had seen better ______ had witnessed, in its prime, balls and banquets that brought together the finest of society.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "days, it",
            B: "days; it",
            C: "days. It",
            D: "days and"
          },
          correct_answer: "C",
          explanation: "After the elaborate subject ('The old house...this house') and predicate ('had seen better days'), a new sentence beginning with 'It' provides clearer structure than continuing with a comma splice (A) or semicolon (B, which would work but 'C' is clearer). 'Days and' (D) creates a run-on."
        },
        {
          id: "M2_Q21",
          domain: "Standard English Conventions",
          skill: "Form, Structure, and Sense",
          text_source: "Academic Writing - Complex Syntax",
          passage: "Neither the initial hypothesis proposed by the lead investigator nor the alternative explanations subsequently offered by her ______ with the experimental data collected during the third phase of the study.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "colleagues was consistent",
            B: "colleagues were consistent",
            C: "colleague's was consistent",
            D: "colleague's were consistent"
          },
          correct_answer: "B",
          explanation: "With 'neither...nor,' the verb agrees with the nearer subject: 'alternative explanations' (plural) requires 'were.' Additionally, 'colleagues' is correct (plural possessive would need apostrophe after s, but here it's just plural as object of 'by')."
        },
        {
          id: "M2_Q22",
          domain: "Standard English Conventions",
          skill: "Boundaries",
          text_source: "Academic Writing - Inverted Structure",
          passage: "So thoroughly had the floodwaters saturated the ancient ______ restoring it to its original condition would require years of painstaking conservation work.",
          question_stem: "Which choice completes the text so that it conforms to the conventions of Standard English?",
          choices: {
            A: "manuscript, that",
            B: "manuscript that",
            C: "manuscript; that",
            D: "manuscript. That"
          },
          correct_answer: "B",
          explanation: "This is a 'so...that' correlative construction in inverted form: 'So thoroughly had X happened that Y resulted.' No comma separates 'so' from 'that' in this construction. The inversion ('had the floodwaters saturated' instead of 'the floodwaters had saturated') is for emphasis."
        },
        {
          id: "M2_Q23",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "The archaeological evidence strongly suggests that this settlement was abandoned rapidly, possibly due to invasion or natural disaster. Personal belongings, including jewelry and tools, were left behind; grain stores remained full; no evidence of systematic dismantling appears in the structural remains. ______, some scholars have proposed that the departure was planned—part of a seasonal migration pattern rather than flight.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "As a result",
            B: "Nevertheless",
            C: "In other words",
            D: "Similarly"
          },
          correct_answer: "B",
          explanation: "The first part presents evidence for rapid, unplanned abandonment. The second part introduces scholars who argue for planned departure—a contrasting interpretation of the same evidence. 'Nevertheless' signals this interpretive opposition."
        },
        {
          id: "M2_Q24",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "Longitudinal studies tracking children from infancy through adolescence have consistently shown that early vocabulary size predicts later academic achievement. Children who knew more words at age two scored higher on reading comprehension tests at age twelve. ______, the relationship is not deterministic: many children with initially limited vocabularies caught up to their peers through targeted intervention programs.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "Furthermore",
            B: "Therefore",
            C: "Importantly",
            D: "For example"
          },
          correct_answer: "C",
          explanation: "The passage moves from stating a correlation to qualifying it ('not deterministic'). 'Importantly' signals that this qualification is significant and should not be overlooked—a common academic move when nuancing a generalization. 'Furthermore' would add more support; 'Therefore' implies causation; 'For example' would illustrate."
        },
        {
          id: "M2_Q25",
          domain: "Expression of Ideas",
          skill: "Rhetorical Synthesis",
          text_source: "Academic Writing",
          passage: "A student researching urban heat islands wants to argue that green infrastructure should be prioritized over reflective surfaces in city planning.\n\nNotes:\n- Green roofs reduce building temperatures by 30-40°F through evapotranspiration.\n- Reflective 'cool roofs' reduce temperatures by 10-15°F by reflecting sunlight.\n- Green roofs also absorb stormwater, reducing flooding and sewer overflow.\n- Reflective surfaces can redirect heat to neighboring buildings.\n- Green infrastructure supports biodiversity and improves air quality.",
          question_stem: "Which choice most effectively uses the information to accomplish the student's goal?",
          choices: {
            A: "While reflective surfaces reduce building temperatures by 10-15°F, green roofs achieve reductions of 30-40°F while also managing stormwater and supporting urban biodiversity.",
            B: "Green roofs reduce building temperatures by 30-40°F through evapotranspiration, a natural cooling process.",
            C: "Reflective 'cool roofs' can redirect heat to neighboring buildings, potentially creating problems for urban planners.",
            D: "Both green roofs and reflective surfaces offer solutions to urban heat, though they work through different mechanisms."
          },
          correct_answer: "A",
          explanation: "The goal is to argue for green infrastructure OVER reflective surfaces. Only A directly compares them (green > reflective) and adds green's multiple benefits. B only discusses green; C only criticizes reflective; D presents them as equal alternatives."
        },
        {
          id: "M2_Q26",
          domain: "Expression of Ideas",
          skill: "Rhetorical Synthesis",
          text_source: "Academic Writing",
          passage: "A historian is writing about the decline of the Roman Republic. She wants to emphasize that economic inequality was a more significant factor than military defeats.\n\nNotes:\n- Rome suffered major military defeat at Carrhae (53 BCE), losing 20,000 soldiers.\n- By 50 BCE, 2% of Romans controlled over 90% of land.\n- Landless veterans formed private armies loyal to generals rather than the state.\n- The Republic survived external threats from Carthage, Gaul, and Parthia.\n- Civil wars between wealthy factions ultimately destroyed Republican institutions.",
          question_stem: "Which choice most effectively uses the information to accomplish the historian's goal?",
          choices: {
            A: "The Roman Republic suffered devastating military losses, including 20,000 soldiers killed at Carrhae in 53 BCE.",
            B: "While the Republic survived external military threats from Carthage and Parthia, it could not survive the internal conflicts arising from extreme wealth concentration, which saw 2% of Romans controlling 90% of land.",
            C: "By 50 BCE, economic inequality had reached extreme levels, with 2% of Romans controlling over 90% of land.",
            D: "Landless veterans formed private armies loyal to generals rather than the state, contributing to the Republic's eventual collapse."
          },
          correct_answer: "B",
          explanation: "The goal requires comparing factors and prioritizing economic inequality. B explicitly contrasts survival of military threats with failure against internal economic conflict, directly establishing the hierarchy the historian wants. C and D discuss economics but don't compare. A emphasizes military losses—the opposite of the goal."
        },
        {
          id: "M2_Q27",
          domain: "Expression of Ideas",
          skill: "Transitions",
          text_source: "Academic Writing",
          passage: "The discovery of high-temperature superconductors in 1986 generated enormous excitement in the physics community, with predictions of revolutionary applications in power transmission and transportation. Nearly four decades later, most of these applications remain unrealized. The materials are brittle and expensive to manufacture; they still require cooling to temperatures far below ambient, making them impractical for most uses. ______, research continues, driven by recent advances in materials science and the promise of room-temperature superconductivity.",
          question_stem: "Which choice completes the text with the most logical transition?",
          choices: {
            A: "Consequently",
            B: "In contrast",
            C: "Even so",
            D: "Indeed"
          },
          correct_answer: "C",
          explanation: "The passage presents obstacles (brittle, expensive, impractical) then pivots to continued research despite these problems. 'Even so' (meaning 'despite that') captures this concessive relationship. 'Consequently' implies the obstacles caused continued research (illogical); 'In contrast' is too strong; 'Indeed' would emphasize rather than concede."
        }
      ]
    }
  ]
};

// Export list of all available placement tests
export const PLACEMENT_TESTS = [SAT_PLACEMENT_TEST_01];

export function getPlacementTest(testName: string): PlacementTest | undefined {
  return PLACEMENT_TESTS.find(t => t.test_name === testName);
}
