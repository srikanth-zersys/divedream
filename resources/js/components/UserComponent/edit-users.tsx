import { useState, useEffect, useRef } from "react";
import { UserForm, UserFormData } from "./user-form";
import { router, usePage } from "@inertiajs/react";

interface EditUserProps {
    userId?: number;
    userData?: UserFormData;
    onSuccess?: () => void;
    roles?: { id: number; name: string }[];
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>;
    user?: any;
}

export const EditUser = ({
    userId,
    userData,
    onSuccess,
    rolesData,
}: EditUserProps) => {
    const { flash, errors, user: pageUser } = usePage().props as PageProps;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(!userData);
    const [submitMessage, setSubmitMessage] = useState({
        type: flash?.success ? "success" : flash?.error ? "error" : "",
        message: flash?.success || flash?.error || "",
    });
    const [formData, setFormData] = useState<UserFormData | undefined>(userData);
    const isRedirectingRef = useRef(false);
    const redirectTimeoutRef = useRef<number | null>(null);

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

                // Redirect to user list after a delay
                redirectTimeoutRef.current = window.setTimeout(() => {
                    // If an onSuccess prop is provided, call it. Otherwise, redirect.
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.visit(route("users.index"));
                    }
                }, 2000);
            }
        } else if (flash?.error) {
            setSubmitMessage({
                type: "error",
                message: flash.error,
            });
        }
    }, [flash, onSuccess]);

    // Initialize form data from pageUser - don't update during form lifecycle
    useEffect(() => {
        if (pageUser && !formData) {
            setFormData({
                id: pageUser.id,
                name: pageUser.name,
                email: pageUser.email,
                phone: pageUser.phone || "",
                password: "", // Always empty for edit mode
                confirmPassword: "", // Always empty for edit mode
                role: pageUser.roles && pageUser.roles.length > 0
                    ? pageUser.roles[0].name
                    : "admin", // Default to admin if no role
                status: pageUser.status || "Active",
            });
        }
    }, [pageUser, formData]);

    const getUserId = (): number | null => {
        if (userId) return userId;
        const path = window.location.pathname;
        const matches = path.match(/\/user-management\/(\d+)\/edit/);
        return matches ? parseInt(matches[1]) : null;
    };

    const currentUserId = getUserId();

    // Load user data if not provided via props or pageUser
    useEffect(() => {
        if (!userData && currentUserId && !pageUser) {
            setIsLoading(true);
            router.get(
                `/user-management/get-user/${currentUserId}`,
                {},
                {
                    onSuccess: (page) => {
                        if (page.props.user) {
                            const user = page.props.user;

                            setFormData({
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                phone: user.phone || "",
                                password: "", // Always empty for edit mode
                                confirmPassword: "", // Always empty for edit mode
                                role: user.roles && user.roles.length > 0
                                    ? user.roles[0].name
                                    : "admin",
                                status: user.status || "Active",
                            });
                        }
                        setIsLoading(false);
                    },
                    onError: () => {
                        setSubmitMessage({
                            type: "error",
                            message: "Failed to load user data",
                        });
                        setIsLoading(false);
                    },
                }
            );
        } else if (userData || pageUser) {
            setIsLoading(false);
        }
    }, [currentUserId, userData, pageUser]);

    const onSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);
        setSubmitMessage({ type: "", message: "" });

        // Update form data with submitted values immediately - key fix!
        setFormData(data);

        const payload = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            status: data.status,
        };

        // Only include password if it's being changed (not empty)
        if (data.password && data.password.trim() !== "") {
            payload.password = data.password;
            payload.password_confirmation = data.confirmPassword;
        }

        router.post(route("users.update"), payload, {
            preserveState: true,
            preserveScroll: true,
            // The onSuccess callback is removed. The success message and redirect
            // are now handled by the useEffect hook listening for flash messages
            // when the backend redirects back to this edit page.
            onError: (pageErrors) => {
                console.error("Submission Errors:", pageErrors);
                
                setSubmitMessage({
                    type: "error",
                    message:
                        pageErrors.message ||
                        "Failed to update user. Please check the form for errors.",
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading user data...</span>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                No user data available or user not found.
            </div>
        );
    }

    return (
        <UserForm
            onSubmit={onSubmit}
            defaultValues={formData}
            isSubmitting={isSubmitting}
            submitMessage={submitMessage}
            isEdit={true}
            backendErrors={errors}
            isDarkMode={false} // You can pass this as a prop or get from context
        />
    );
};