export const SURVEY_CATALOG = [
  {
    slug: "phq9",
    title: "PHQ-9 Depression Screening",
    description:
      "A widely used self-report questionnaire about the last two weeks. This is informational only and is not a diagnosis.",
    questions: [
      { id: "phq9-1", text: "Little interest or pleasure in doing things", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-2", text: "Feeling down, depressed, or hopeless", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-3", text: "Trouble falling or staying asleep, or sleeping too much", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-4", text: "Feeling tired or having little energy", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-5", text: "Poor appetite or overeating", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-7", text: "Trouble concentrating on things, such as reading the newspaper or watching television", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-8", text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "phq9-9", text: "Thoughts that you would be better off dead, or of hurting yourself in some way", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
    ],
  },
  {
    slug: "gad7",
    title: "GAD-7 Anxiety Screening",
    description:
      "A widely used self-report questionnaire about the last two weeks. This is informational only and is not a diagnosis.",
    questions: [
      { id: "gad7-1", text: "Feeling nervous, anxious, or on edge", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-2", text: "Not being able to stop or control worrying", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-3", text: "Worrying too much about different things", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-4", text: "Trouble relaxing", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-5", text: "Being so restless that it is hard to sit still", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-6", text: "Becoming easily annoyed or irritable", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
      { id: "gad7-7", text: "Feeling afraid as if something awful might happen", type: "scale", minLabel: "Not at all", maxLabel: "Nearly every day" },
    ],
  },
];
