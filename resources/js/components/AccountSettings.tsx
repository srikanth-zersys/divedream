import { Bell, Gem, ListTree, LogOut, ShieldCheck, Upload, UserRound,BadgeCheck, Building2, CalendarDays, MapPin  } from 'lucide-react'
import Select from "react-select";
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { router, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

import user17 from '../../images/avatar/user-17.png'

interface PageProps {
    flash: {
        success?: string;
        error?: string;
    };
    errors: Record<string, string>; 
}

const CommonAccount = ({UserData, RolesData}) => {
 const { flash, errors } = usePage().props as PageProps;
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({
        type: flash?.success ? "success" : flash?.error ? "error" : "",
        message: flash?.success || flash?.error || "",
    });
        
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const roleOptions = RolesData.map((role: { id: number; name: string }) => ({
        value: role.name,
        label: role.name.charAt(0).toUpperCase() + role.name.slice(1) // Capitalize first letter for display
    }));

    const statusOptions = [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
    ];

    const initialRole = roleOptions.find(option => option.value === UserData.roles[0].name);

     const [formData, setFormData] = useState({
        name: UserData.name,
        role: initialRole ? initialRole.value : '',
        email: UserData.email,
        phone: UserData.phone || '', // Ensure phone is not null
        status: UserData.status
    });

    const [passwordFormData, setPasswordFormData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [currentPasswordVisible, setCurrentPasswordVisible] = useState<boolean>(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState<boolean>(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setPasswordFormData({
            ...passwordFormData,
            [name]: value,
        });
    };

    const handleRoleChange = (selectedOption: any) => {
        setFormData({
            ...formData,
            role: selectedOption ? selectedOption.value : ''
        });
    };

    const handleStatusChange = (selectedOption: any) => {
        setFormData({
            ...formData,
            status: selectedOption ? selectedOption.value : ''
        });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setIsSubmitting(true);
        setSubmitMessage({ type: "", message: "" });
        
        event.preventDefault();
        
        router.post(route("profile.update"), formData, { // Changed to PUT as profile update is typically a PUT/PATCH
            onSuccess: (success) => {
                const successMessage =
                    success.props.flash?.success || // Message from backend
                    "Profile updated successfully!"; // Default success message

                setSubmitMessage({
                    type: "success",
                    message: successMessage,
                });
            },
            onError: (errors) => {
                console.error("Form submission errors:", errors);
                // Display backend validation errors for profile form
                Object.entries(errors).forEach(([field, message]) => {
                    setSubmitMessage(prev => ({ ...prev, type: 'error', message: Array.isArray(message) ? message[0] : message }));
                    // You might want to set individual error states for each field here
                    // e.g., setNameError(errors.name), setEmailError(errors.email) etc.
                });
                if (Object.keys(errors).length === 0) {
                    setSubmitMessage({
                        type: "error",
                        message: "Failed to update profile. An unexpected error occurred.",
                    });
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleSubmitPassword = (event: React.FormEvent<HTMLFormElement>) => {
        setIsSubmitting(true);
        setSubmitMessage({ type: "", message: "" });
        
        event.preventDefault();
        
        // Ensure you are sending the correct data for password update
        router.put(route("password.update"), passwordFormData, {
            onSuccess: (success) => {
                const successMessage =
                    (success.props.flash as { success?: string })?.success ||
                    "Password updated successfully!"; // Default success message

                setSubmitMessage({
                    type: "success",
                    message: successMessage,
                });
                // Clear password fields on success
                setPasswordFormData({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
            },
            onError: (errors) => {
                console.error("Form submission errors:", errors);
                 Object.entries(errors).forEach(([field, message]) => {
                    setSubmitMessage(prev => ({ ...prev, type: 'error', message: Array.isArray(message) ? message[0] : message }));
                });
                if (Object.keys(errors).length === 0) {
                    setSubmitMessage({
                        type: "error",
                        message: "Failed to update password. An unexpected error occurred.",
                    });
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (submitMessage.message && submitMessage.type === "success") {
            timer = setTimeout(() => {
                setSubmitMessage({ type: "", message: "" });
            }, 3000); // Clear success message after 3 seconds
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [submitMessage]);

    return (
        <React.Fragment>
            <div className="relative mb-6">
                <div className="relative overflow-hidden rounded-md h-44 bg-primary-500/10">
                    <div className="border-[60px] border-t-primary-500 border-l-primary-500 absolute opacity-10 -top-2 left-0 rotate-45 size-96"></div>
                    <div className="border-[60px] border-green-500 absolute opacity-10 top-20 left-8 rotate-45 size-80"></div>
                    <div className="border-[60px] border-pink-500 absolute opacity-10 top-36 left-28 rotate-45 size-40"></div>
                </div>
                <div className="text-center">
                    <div className="relative inline-block mx-auto">
                        <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary-300 via-red-300 to-green-300 -mt-14">
                            <img src={user17} alt="user17Img"  className="mx-auto border-4 border-white rounded-full dark:border-dark-900 size-28" />
                        </div>
                        <div className="absolute border-2 border-white dark:border-dark-900 rounded-full size-4 bg-green-500 bottom-2.5 ltr:right-2.5 rtl:left-2.5"></div>
                    </div>
                    <h5 className="mt-2 mb-1"> {UserData.name} </h5>
                    <ul className="flex flex-wrap items-center justify-center gap-2 text-gray-500 dark:text-dark-500 text-14">
                        <li><Building2 className="inline-block ltr:mr-1 rtl:ml-1 size-4"></Building2> <span className="align-middle">{UserData.roles[0].name}</span></li>
                        <li><CalendarDays className="inline-block ltr:mr-1 rtl:ml-1 size-4"></CalendarDays> <span className="align-middle">{ formatDate(UserData.created_at)}</span></li>
                    </ul>
                </div>
            </div>
            {/* Display Success/Error Messages */}
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


              <div className="mt-5 card">
                                <div className="card-body">
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-12 xl:col-span-3">
                                            <h6 className="card-title">Personal Information</h6>
                                        </div>
                                        <div className="col-span-12 xl:col-span-9">
                                            <form onSubmit={handleSubmit}>
                                                <div className="grid grid-cols-12 gap-5">
                                                    <div className="col-span-12 md:col-span-6">
                                                        <label htmlFor="name" className="form-label">Name</label>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            className="form-input"
                                                            value={formData.name || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="Enter your name"
                                                        />
                                                        {errors.name && (
                                                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                                {errors.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                                        <label htmlFor="roleInput" className="form-label">Role</label>
                                                        <Select
                                                            id="roleInput"
                                                            name="role"
                                                            options={roleOptions}
                                                            value={roleOptions.find(option => option.value === formData.role)}
                                                            onChange={handleRoleChange}
                                                            className="form-input p-0"
                                                            classNamePrefix="select"
                                                            placeholder="Select your role"
                                                            styles={{ control: (base) => ({ ...base, borderColor: '#e5e7eb', boxShadow: 'none', '&:hover': { borderColor: '#d1d5db' } }) }}
                                                        />
                                                        {errors.role && (
                                                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                                {errors.role}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                                        <label htmlFor="emailInput" className="form-label">Email Address</label>
                                                        <input
                                                            type="email"
                                                            id="emailInput"
                                                            name="email"
                                                            className="form-input"
                                                            value={formData.email || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="example@zersys.com"
                                                        />
                                                        {errors.email && (
                                                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                                {errors.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                                        <label htmlFor="phoneInput" className="form-label">Phone Number</label>
                                                        <input
                                                            type="text"
                                                            id="phoneInput"
                                                            name="phone"
                                                            className="form-input"
                                                            value={formData.phone || ''}
                                                            onChange={handleInputChange}
                                                            placeholder="+(00) 00000 00000"
                                                        />
                                                        {errors.phone && (
                                                            <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                                {errors.phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-12 md:col-span-6 lg:col-span-4">
                                                         <label htmlFor="statusInput" className="form-label">Status</label>
                                                        <Select
                                                            id="statusInput"
                                                            name="status"
                                                            options={statusOptions}
                                                            value={statusOptions.find(option => option.value === formData.status)}
                                                            onChange={handleStatusChange}
                                                            className="form-input p-0"
                                                            classNamePrefix="select"
                                                            placeholder="Select your Status"
                                                            styles={{ control: (base) => ({ ...base, borderColor: '#e5e7eb', boxShadow: 'none', '&:hover': { borderColor: '#d1d5db' } }) }}
                                                        />
                                                         {errors.status && (
                                                             <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                                 {errors.status}
                                                             </p>
                                                         )}
                                                     </div>
                                                    <div className="col-span-12 text-right">
                                                        <button 
                                                            type="submit" 
                                                            className="btn bg-green-500 hover:bg-green-600 text-white rounded-md"
                                                            disabled={isSubmitting}
                                                        >
                                                            {isSubmitting ? 'Updating...' : 'Update Profile'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
               <div className="card">
                                <div className="card-header">
                                    <h6 className="card-title">Update Password</h6>
                                </div>
                                <div className="card-body">
                                    <p className="mb-3 text-gray-500 dark:text-dark-500">
                                        To change your password, please enter your current password.
                                    </p>
                                    <form onSubmit={handleSubmitPassword}>
                                        <div className="mb-5">
                                            <label htmlFor="currentPasswordInput" className="form-label">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={currentPasswordVisible ? 'text' : 'password'}
                                                    id="currentPasswordInput"
                                                    name="current_password"
                                                    className="ltr:pr-8 rtl:pl-8 form-input"
                                                    autoComplete="off"
                                                    placeholder="Enter current password"
                                                    value={passwordFormData.current_password}
                                                    onChange={handlePasswordInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
                                                    className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-none"
                                                >
                                                    {currentPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                            {errors.current_password && (
                                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                    {errors.current_password}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="newPasswordInput" className="form-label">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={newPasswordVisible ? 'text' : 'password'}
                                                    id="newPasswordInput"
                                                    name="password"
                                                    className="ltr:pr-8 rtl:pl-8 form-input"
                                                    autoComplete="off"
                                                    placeholder="New password"
                                                    value={passwordFormData.password}
                                                    onChange={handlePasswordInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                                                    className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-none"
                                                >
                                                    {newPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mb-5">
                                            <label htmlFor="confirmPasswordInput" className="form-label">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={confirmPasswordVisible ? 'text' : 'password'}
                                                    id="confirmPasswordInput"
                                                    name="password_confirmation"
                                                    className="ltr:pr-8 rtl:pl-8 form-input"
                                                    autoComplete="off"
                                                    placeholder="Confirm password"
                                                    value={passwordFormData.password_confirmation}
                                                    onChange={handlePasswordInputChange}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                                    className="absolute inset-y-0 flex items-center text-gray-500 dark:text-dark-500 ltr:right-3 rtl:left-3 focus:outline-none"
                                                >
                                                    {confirmPasswordVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                                    {errors.password_confirmation}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                type="submit" 
                                                className="btn bg-green-500 hover:bg-green-600 text-white rounded-md"
                                                disabled={isSubmitting}
                                                >
                                                {isSubmitting ? 'Updating Password...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
        </React.Fragment>
    )
}

export default CommonAccount
