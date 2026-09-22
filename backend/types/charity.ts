import { Charity, CharityEvent, CharitySelection } from './database';

export interface CharityWithSelection extends Charity {
  isSelected?: boolean;
  userContributionPercentage?: number;
}

export interface CharitySelectionInput {
  charityId: string;
  contributionPercentage: number; // must be >= 10
}
