import AddToast from "../../../components/CustomComponents/Toast/AddToast";
import DeleteToast from "../../../components/CustomComponents/Toast/DeleteToast";
import ErrorToast from "../../../components/CustomComponents/Toast/ErrorToast";
import UpdateToast from "../../../components/CustomComponents/Toast/UpdateToast";
import { LeadItem } from "../../../dtos";
import { AppDispatch } from "../../reducer";
import { addLeadList, deleteLeadList, editLeadList } from "./reducer";


// add lead record
export const addLeadData = (newRecord: LeadItem) => async (dispatch: AppDispatch) => {
    try {
        AddToast("Lead record added successfully");
        // addLocalStorageRecord('d-crm-lead-list', newRecord);
        dispatch(addLeadList(newRecord));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Lead record addition failed.";
        ErrorToast(errorMessage);
        console.error('Error adding lead record:', error);
    }
};

// edit lead record
export const editLeadData = (question: LeadItem) => async (dispatch: AppDispatch) => {
    try {
        setTimeout(() => {
            UpdateToast("Lead record updated successfully");
        }, 2000);
        // updateLocalStorageRecord('d-crm-lead-list', question);
        dispatch(editLeadList(question));
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Lead record updation failed.";
        ErrorToast(errorMessage);
        console.error('Error adding record:', error);
    }
};

// delete lead record
export const deleteLeadData = (question: number[]) => async (dispatch: AppDispatch) => {
    try {
        const deletePromises = question.map(async (id) => {
            DeleteToast("Lead record deleted successfully");
            return id;
        });

        const deletedLeads = await Promise.all(deletePromises);
        dispatch(deleteLeadList(deletedLeads));
        // deleteLocalStorageRecord({ key: 'd-crm-lead-list', listRecord: question, multipleRecords: true });
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Lead record deletion failed.";
        ErrorToast(errorMessage);
        console.error("Error in deleting lead: ", error);
    }
};
