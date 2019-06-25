import * as fromCases from '../actions/case-list.filter.action';

interface CaseIdNameDescription {
  id: string;
  name: string;
  description: string;
}

export interface CaseFilterState {
  loading: boolean;
  loaded: boolean;
    caseState: CaseIdNameDescription;
    caseType: CaseIdNameDescription;
    jurisdiction: CaseIdNameDescription;
}

const initialState: CaseFilterState = {
  loading: false,
  loaded: false,
  caseState: {
    id: '',
    name: '',
    description: ''
  },
  jurisdiction: {
    id: '',
    name: '',
    description: ''
  },
  caseType: {
    id: '',
    name: '',
    description: ''
  }
};

export function reducerCaseListFilter( state = initialState, action: fromCases.CaseListFilterAction): CaseFilterState {
  switch (action.type) {
    case fromCases.APPLYFILTER: {
      return {
          ...state,
          loading: true,
          loaded: false,
          caseState: {...action.payload.selected.caseState},
          jurisdiction: {...action.payload.selected.caseState},
          caseType: {...action.payload.selected.caseType}
      } as CaseFilterState;
    }

    case fromCases.RESETFILTER:
      return initialState;
  }
  return state;
}
