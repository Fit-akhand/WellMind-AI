/**
 * Crisis contacts checked against official publishers:
 * - United States: 988 Suicide & Crisis Lifeline (988lifeline.org)
 * - United Kingdom: Samaritans 116 123 (samaritans.org); 999 for immediate danger; NHS 111 is urgent medical advice, not a suicide line
 * - India: Tele-MANAS 14416 and 1-800-891-4416 (Ministry of Health and Family Welfare / PIB); KIRAN 1800-599-0019 (DEPwD)
 * Location is not inferred. Numbers apply only in the regions named.
 */
export const SUPPORT_LIMITATION =
  'WellMind AI is a wellness support tool. It is not a medical device, a diagnosis, or a substitute for a qualified professional or emergency services.';

export const CRISIS_GUIDANCE = [
  'If you are in immediate danger, contact local emergency services or a trusted person. Emergency numbers differ by country (for example 911 in the US, 999 in the UK, and 112 in many countries including India).',
  'United States: call or text 988 (988 Suicide & Crisis Lifeline), or visit https://988lifeline.org.',
  'United Kingdom and Republic of Ireland: Samaritans at 116 123 (https://www.samaritans.org). For urgent medical advice in the UK, NHS 111 is separate from emergency services.',
  'India: Tele-MANAS at 14416 or 1-800-891-4416 (Ministry of Health and Family Welfare). KIRAN mental health rehabilitation helpline: 1800-599-0019 (Department of Empowerment of Persons with Disabilities).',
  'International directory: https://www.iasp.info/suicidalthoughts/',
].join(' ');
