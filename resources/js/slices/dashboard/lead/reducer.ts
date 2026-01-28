import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { dashboardLeads } from '../../../../apidata';
import LoadingToast from '../../../components/CustomComponents/Toast/LoadingToast';
import { LeadItem } from '../../../dtos';


interface LeadState {
    lead: LeadItem[];
    isLoading: boolean;
}

const initialState: LeadState = {
    lead: dashboardLeads,
    isLoading: false,
};

const LeadSlice = createSlice({
    name: 'lead',
    initialState,
    reducers: {

        // get lead list data
        getLeadList(state, action: PayloadAction<LeadItem[]>) {
            state.lead = action.payload;
        },

        // delete lead record
        deleteLeadList(state, action: PayloadAction<number[]>) {
            if (state.lead !== null) {
                state.lead = state.lead.filter(item => !action.payload.includes(item.id));
            }
        },

        // edit lead record
        editLeadList(state, action: PayloadAction<LeadItem>) {
            const lead = action.payload;
            if (state.lead !== null) {
                const findLeadIndex = state.lead.findIndex(item => item.id === lead.id);
                const findLeadRecord = state.lead.find(item => item.id === lead.id);
                if (findLeadIndex !== -1 && findLeadRecord) {
                    state.lead[findLeadIndex] = lead;
                }
                LoadingToast();
            }
        },

        // add new lead record
        addLeadList(state, action: PayloadAction<LeadItem>) {
            const newLead = action.payload;
            if (state.lead !== null) {
                state.lead.unshift(newLead);
            } else {
                state.lead = [newLead];
              }
        }
    },
});

export const { getLeadList, addLeadList, editLeadList, deleteLeadList } = LeadSlice.actions;
export default LeadSlice.reducer;
