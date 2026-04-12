import { AILAWS_A } from './AILAWS_A';
import { AILAWS_B } from './AILAWS_B';
import { AILAWS_C } from './AILAWS_C';
import { AILAWS_D } from './AILAWS_D';
import { AILAWS_E } from './AILAWS_E';
import { AILAWS_START } from './AILAWS_START';

export const AI_LAW_CASES_DB: Record<string, { ai_judgment_win: string; ai_judgment_lose: string }> = {
  ...AILAWS_A,
  ...AILAWS_B,
  ...AILAWS_C,
  ...AILAWS_D,
  ...AILAWS_E,
  ...AILAWS_START,
};
