
import { FaPenAlt, FaPencilAlt, FaPlus, FaSave } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from "react-select";
import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import Flatpickr from "react-flatpickr";


const style = document.createElement('style');
style.innerHTML = `
  .swal2-actions button:focus {
    --swal2-action-button-outline: 0 !important;
    box-shadow: none !important;
  }
`;
document.head.appendChild(style);


const userSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Email is required").min(1, "Email is required"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    phone: z.string()
        .min(1, "Phone Number is required")
        .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
    selectedDate: z.string().min(1, "Date is required"),
    role: z.string().min(1, "Role is required"),
    status: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

// Updated to include all roles
const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
];

const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

// Enhanced custom styles with dark mode support
const getCustomStyles = (isDarkMode: boolean, hasError?: boolean) => ({
    control: (base: any, state: any) => ({
        ...base,
        padding: "0px",
        borderColor: hasError 
            ? "#ef4444" 
            : isDarkMode 
                ? "#4b5563" 
                : "#e5e7eb",
        backgroundColor: state.isDisabled
            ? isDarkMode ? "#374151" : "#f5f5f5"
            : isDarkMode ? "#1f2937" : "white",
        boxShadow: "none",
        color: isDarkMode ? "white" : "black",
        "&:hover": {
            borderColor: isDarkMode ? "#6b7280" : "#A1A1AA",
        },
        cursor: state.isDisabled ? "not-allowed" : "default",
    }),
    option: (base: any, state: any) => ({
        ...base,
        backgroundColor: state.isSelected
            ? "#228BE6"
            : state.isFocused
                ? isDarkMode ? "#374151" : "#E9F5FF"
                : isDarkMode ? "#1f2937" : "white",
        color: state.isSelected 
            ? "white" 
            : isDarkMode ? "white" : "black",
        "&:hover": {
            backgroundColor: state.isSelected
                ? "#228BE6"
                : isDarkMode ? "#374151" : "#E9F5FF",
        },
    }),
    menu: (base: any) => ({
        ...base,
        backgroundColor: isDarkMode ? "#1f2937" : "white",
        border: isDarkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
    }),
    menuList: (base: any) => ({
        ...base,
        backgroundColor: isDarkMode ? "#1f2937" : "white",
    }),
    singleValue: (base: any, state: any) => ({
        ...base,
        color: state.isDisabled
            ? isDarkMode ? "#9ca3af" : "#555555"
            : isDarkMode ? "white" : "black",
    }),
    placeholder: (base: any) => ({
        ...base,
        color: isDarkMode ? "#9ca3af" : "#6b7280",
    }),
    dropdownIndicator: (base: any, state: any) => ({
        ...base,
        color: state.isDisabled
            ? isDarkMode ? "#6b7280" : "#cccccc"
            : isDarkMode ? "#9ca3af" : base.color,
        "&:hover": {
            color: isDarkMode ? "#d1d5db" : base.color,
        },
    }),
    indicatorSeparator: (base: any) => ({
        ...base,
        backgroundColor: isDarkMode ? "#4b5563" : "#e5e7eb",
    }),
});

interface UserFormProps {
    onSubmit: (data: UserFormData) => Promise<void>;
    defaultValues?: UserFormData;
    isSubmitting: boolean;
    submitMessage: { type: string; message: string };
    isEdit?: boolean;
    showRoleField?: boolean; 
    backendErrors?: Record<string, string>; 
    isDarkMode?: boolean; 
}

export const UserForm = ({
    onSubmit,
    defaultValues,
    isSubmitting,
    submitMessage,
    isEdit = false,
    showRoleField = true, 
    backendErrors = {}, 
    isDarkMode = false, 
}: UserFormProps) => {
  

    const formResolver = zodResolver(
        userSchema.superRefine((data, ctx) => {
            // Status required for edit mode
            if (isEdit && !data.status) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Status is required for edit mode",
                    path: ["status"],
                });
            }

            // Password validation logic
            if (!isEdit) { // Create mode
                if (!data.password) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Password is required",
                        path: ["password"],
                    });
                } else if (data.password.length < 8) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Password must be at least 8 characters",
                        path: ["password"],
                    });
                }

                if (!data.confirmPassword) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Please Confirm your password",
                        path: ["confirmPassword"],
                    });
                } else if (data.password && data.confirmPassword !== data.password) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Passwords do not match",
                        path: ["confirmPassword"],
                    });
                }
            } else { // Edit mode - password change is optional
                if (data.password) { // If password is being changed
                    if (data.password.length < 8) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must be at least 8 characters", path: ["password"] });
                    }
                    if (!data.confirmPassword) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Confirm Password is required to change password", path: ["confirmPassword"] });
                    } else if (data.confirmPassword !== data.password) {
                        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords do not match", path: ["confirmPassword"] });
                    }
                } else if (data.confirmPassword && !data.password) { // If confirm password is set but password is not
                    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required if Confirm Password is set", path: ["password"] });
                }
            }
        })
    );

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        setError,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: formResolver,
        defaultValues: defaultValues || {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            selectedDate: "",
            role: "",
            status: isEdit ? "Active" : "",
        },
    });

   
    const [selectedRoleOption, setSelectedRoleOption] = useState<{ value: string; label: string } | null>(null);
    const [selectedStatusOption, setSelectedStatusOption] = useState<any>(null);


    const selectedRole = watch("role");
    const selectedStatus = watch("status");

    // Track previous role to detect changes
    const previousRole = useRef(selectedRole);

    // Set up select options based on default values
    useEffect(() => {
        if (defaultValues) {
            // Map API response fields to form fields if needed
            const mappedValues = {
                ...defaultValues,
            };

            reset(mappedValues);

      
            previousRole.current = mappedValues.role;

            // Set up role option
            if (mappedValues.role) {
                // Set the selected option to display the user's current role,
                // even if it's not in the main options list.
                const roleLabel = mappedValues.role.charAt(0).toUpperCase() + mappedValues.role.slice(1);
                setSelectedRoleOption({
                    value: mappedValues.role,
                    label: roleLabel,
                });
            }

            // Set up status option
            if (mappedValues.status) {
                const statusOption = statusOptions.find(
                    (option) => option.value === mappedValues.status
                );
                if (statusOption) {
                    setSelectedStatusOption(statusOption);
                }
            }
        }
    }, [defaultValues, reset]);


    useEffect(() => {
        if (backendErrors && Object.keys(backendErrors).length > 0) {
            // Set errors for each field with backend validation error
            Object.entries(backendErrors).forEach(([field, message]) => {
                // Handle array of messages (Laravel validation format)
                const errorMessage = Array.isArray(message)
                    ? message[0]
                    : message;

                // Map backend field names to form field names if necessary
                let formField = field;
             
                try {
                    setError(formField as any, {
                        type: "server",
                        message: errorMessage,
                    });
                } catch (err) {
                    console.error(
                        `Error setting form error for field ${formField}:`,
                        err
                    );
                }
            });
        }
    }, [backendErrors, setError]);


    useEffect(() => {
        // Update role option
        if (selectedRole) {
            // Keep the displayed value in sync with the form state.
            // This creates the { value, label } object for the Select component.
            const roleLabel = selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
            setSelectedRoleOption({
                value: selectedRole,
                label: roleLabel,
            });
        }

        if (selectedStatus) {
            const statusOption = statusOptions.find(
                (option) => option.value === selectedStatus
            );
            if (statusOption) {
                setSelectedStatusOption(statusOption);
            }
        }
    }, [
        selectedRole,
        selectedStatus,
    ]);

    const handleRoleChange = async (selected: any) => {
        const newRole = selected?.value || "";
    
    
        if (isEdit && previousRole.current && newRole !== previousRole.current) {
            const roleLabel =
                roleOptions.find((option) => option.value === newRole)?.label ||
                newRole;
    
            const result = await Swal.fire({
                title: "Are you sure?",
                text: `You are changing the role to ${roleLabel}, this has the potential to grant or revoke access to the Admin Panel. Do you want to continue?`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, Change Role",
            });
    
            if (result.isConfirmed) {
                setValue("role", newRole, { shouldValidate: true });
                previousRole.current = newRole;
            }
        } else {
            setValue("role", newRole, { shouldValidate: true });
            previousRole.current = newRole;
        }
    };

    const handleStatusChange = (selected: any) => {
        setValue("status", selected?.value || "", { shouldValidate: true });
    };

    return (
        <div className="mx-auto max-w-2xl w-full dark:border-dark-3 dark:bg-gray-900 dark:shadow-card">
            {submitMessage.message && (
                <div
                    className={`mb-4 p-3 rounded ${
                        submitMessage.type === "success"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                >
                    {submitMessage.message}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("name")}
                            placeholder="Enter Full Name"
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.name ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

   
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            {...register("email")}
                            placeholder="Enter Email Address"
                            // readOnly={isEdit} // Removed to make email always editable
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.email ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Password {!isEdit && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="password"
                            {...register("password")}
                            placeholder={isEdit ? "Enter new password (optional)" : "Enter Password"}
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.password ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Confirm Password {watch("password") || !isEdit ? <span className="text-red-500">*</span> : ""}
                        </label>
                        <input
                            type="password"
                            {...register("confirmPassword")}
                            placeholder={isEdit ? "Confirm new password" : "Confirm Password"}
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.confirmPassword ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            {...register("phone")}
                            placeholder="Enter Phone Number"
                            maxLength={10}
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.phone ? "border-red-500 dark:border-red-500" : ""
                            }`}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    {/* Date Picker Field */}
                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Select Date <span className="text-red-500">*</span>
                        </label>
                        <Flatpickr
                            options={{
                                dateFormat: "d M, Y",
                            }}
                            placeholder="Select Date"
                            className={`w-full rounded-md border px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 py-2 ${
                                errors.selectedDate ? "border-red-500 dark:border-red-500" : ""
                            }`}
                            value={watch("selectedDate")}
                            onChange={(dates) => {
                                if (dates.length > 0) {
                                    const selectedDate = dates[0];
                                    const formattedDate = selectedDate.toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    });
                                    setValue("selectedDate", formattedDate, { shouldValidate: true });
                                }
                            }}
                        />
                        {errors.selectedDate && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.selectedDate.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium dark:text-white">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={roleOptions}
                            placeholder="Select Role"
                            value={selectedRoleOption}
                            onChange={handleRoleChange}
                            className="text-sm"
                            styles={getCustomStyles(isDarkMode, !!errors.role)}
                        />
                        {errors.role && (
                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                {errors.role.message}
                            </p>
                        )}
                    </div>

                  
                    {isEdit && (
                        <div>
                            <label className="mb-2 block text-sm font-medium dark:text-white">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={statusOptions}
                                placeholder="Select Status"
                                value={selectedStatusOption}
                                onChange={handleStatusChange}
                                className="text-sm"
                                styles={getCustomStyles(isDarkMode, !!errors.status)}
                            />
                            {errors.status && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                    {errors.status.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-10">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex w-64 justify-center items-center rounded-[7px] ${
                            isEdit ? "bg-green-500" : "bg-green-500"
                        } p-[13px] font-medium text-white ${
                            isSubmitting
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-opacity-90"
                        }`}
                    >
                        {isEdit ? (
                            <FaPencilAlt className="me-3" />
                        ) : (
                            <FaPlus className="me-3" />
                        )}
                        {isSubmitting
                            ? isEdit
                                ? "Updating..."
                                : "Adding..."
                            : isEdit
                            ? "Update User"
                            : "Add User"}
                    </button>
                </div>
            </form>
        </div>
    );
};