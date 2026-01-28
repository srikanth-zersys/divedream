import { useState, useEffect, useRef } from "react";
import { UserForm, UserFormData } from "./user-form";
import { router, usePage } from "@inertiajs/react";
import { useSelector } from 'react-redux';
import { RootState } from '../../slices/reducer';
import { LAYOUT_MODE_TYPES } from '../Constants/layout'; 



interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>; 
}

interface AddUsersProps {
    regionsData: Array<{ id: number; name: string }>;
    circlesData: Array<{ id: number; name: string }>;
}

const AddUsers: React.FC<AddUsersProps> = () => {
    const { flash, errors } = usePage().props as PageProps;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({
        type: flash?.success ? "success" : flash?.error ? "error" : "",
        message: flash?.success || flash?.error || "",
    });
    const isRedirectingRef = useRef(false);
    const redirectTimeoutRef = useRef<number | null>(null);

    const { layoutMode } = useSelector((state: RootState) => state.Layout);
    const isDarkMode = layoutMode === LAYOUT_MODE_TYPES.DARK;

    useEffect(() => {
        if (flash?.success) {
            setSubmitMessage({
                type: "success",
                message: flash.success,
            });

            if (!isRedirectingRef.current) {
                isRedirectingRef.current = true;

                if (redirectTimeoutRef.current !== null) {
                    clearTimeout(redirectTimeoutRef.current);
                }

                redirectTimeoutRef.current = window.setTimeout(() => {
                    router.visit(route("users.index"), {
                        only: ["users"],
                        preserveScroll: true,
                        preserveState: true,
                    });
                }, 2000);
            }
        } else if (flash?.error) {
            setSubmitMessage({
                type: "error",
                message: flash.error,
            });
        }
    }, [flash]);

    const onSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);
        setSubmitMessage({ type: "", message: "" });

        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            password_confirmation: data.confirmPassword, // For Laravel's 'confirmed' rule
            selectedDate: data.selectedDate,
            role: data.role,
            // status: "Active", // 'status' is not part of the backend store validation/logic
        };
        
        router.post(route("users.store"), payload, {
            // preserveState and preserveScroll are good for maintaining form state and scroll position
            // especially useful if there are validation errors and the backend redirects back to the same page.
            preserveState: true,
            preserveScroll: true,
            // The onSuccess callback is not needed here for displaying the message
            // because the useEffect will handle the flash message when the page reloads
            // (due to the backend redirect back to this page).
            // The useEffect also handles the subsequent redirect to the user list.
            onError: (pageErrors) => {
                console.error("Form submission errors:", pageErrors);
                // Display a generic error message if no specific field errors are present,
                // or if the submission failed for other reasons.
                const errorMessage = pageErrors.message || "Failed to create user. Please try again.";
                setSubmitMessage({ type: "error", message: errorMessage });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
   
        <UserForm
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            submitMessage={submitMessage}
            isEdit={false}
            showRoleField={true} 
            backendErrors={errors} 
            isDarkMode={isDarkMode}
        />
    );
};

export default AddUsers;
