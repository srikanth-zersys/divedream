import React, { useState } from 'react';
import mainlogo from '../../../../images/main-logo.png'
import whiteLogo from '../../../../images/logo-white.png'
import creativeauth from '../../../../images/others/auth-creative.png'
import { Eye, EyeOff, MoveRight } from 'lucide-react';
import ErrorToast from '../../../components/CustomComponents/Toast/ErrorToast';
import { Link } from '@inertiajs/react';
import HeadTitle from '../../../components/CommonComponents/HeadTilte'; // Corrected typo: HeadTilte -> HeadTitle
import { router, usePage } from "@inertiajs/react";

interface ResetPasswordCreativeProps {
    email: string;
    token: string;
    errors?: Record<string, string>; // To handle potential errors passed by Inertia
}

const ResetPasswordCreative: React.FC<ResetPasswordCreativeProps> = ({ email, token }) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    // Access errors from Inertia page props for displaying backend validation messages
    const { errors: pageErrors } = usePage().props as { errors: Record<string, string> };

   

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        router.post(route('password.store'), { // Assuming 'password.store' is your named route
            email: email,
            token: token,
            password: password,
            password_confirmation: confirmPassword,
        }, {
            // Errors are now displayed inline using pageErrors from usePage().props
        });
    };

    return (
        <React.Fragment>
            <HeadTitle title='Reset password' />
            <div className="relative">
                <div className="grid grid-cols-12">
                    <div className="relative col-span-12 py-8 overflow-hidden bg-gray-100 dark:bg-dark-850 lg:min-h-screen lg:col-span-6 md:p-9 xl:p-12">
                        <div className="absolute bottom-0 w-32 -rotate-45 -top-64 -right-8 bg-gray-200/20 dark:bg-dark-800/20"></div>
                        <div className="p-4">
                            <Link href="/">
                                <img src={mainlogo} alt="mainlogoImg"  className=" mx-auto dark:hidden inline-block" width={176} height={32} />
                                <img src={whiteLogo} alt="whiteLogoImg"  className="hidden  mx-auto dark:inline-block" width={176} height={32} />
                            </Link>
                            <h1 className="max-w-lg mt-8 text-2xl  font-normal leading-tight capitalize md:leading-tight md:text-4xl">
                                Set your new password with ease.
                            </h1>
                            <img src={creativeauth}
                                alt="creativeauthImg" 
                                className="mt-9 xl:mt-0 relative xl:absolute xl:scale-110 rounded-lg shadow-lg xl:top-[315px] xl:left-[115px]"
                            />
                        </div>
                    </div>
                    <div className="flex items-center lg:min-h-screen col-span-12 lg:col-span-6 py-9 md:py-12">
                        <div className="grid w-full grid-cols-12">
                            <div className="col-span-12 2xl:col-span-8 2xl:col-start-3 mx-4 md:mx-12 mb-0 card">
                                <div className="md:p-10 card-body">
                                    <h4 className="mb-2 font-bold text-green-600 leading-relaxed text-center   bg-clip-text">
                                        Set your new password
                                    </h4>
                                    <p className="mb-5 text-center text-gray-500">
                                        Ensure that your new password is different from any passwords you've previously used.
                                    </p>

                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-12 gap-4 mt-5">
                                            <div className="col-span-12">
                                                <label htmlFor="passwordInput" className="form-label">
                                                    Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        id="passwordInput"
                                                        className={`ltr:pr-8 rtl:pl-8 form-input ${pageErrors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                                                        placeholder="Enter your password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword((prev) => !prev)}
                                                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none"
                                                    >
                                                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                    </button>
                                                </div>
                                                {pageErrors.password && <div className="mt-1 text-sm text-red-500">{pageErrors.password}</div>}
                                            </div>
                                            <div className="col-span-12">
                                                <label htmlFor="confirmPasswordInput" className="form-label">
                                                    Confirm Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        id="confirmPasswordInput"
                                                        className={`ltr:pr-8 rtl:pl-8 form-input ${pageErrors.password_confirmation ? 'border-red-500 dark:border-red-500' : ''}`}
                                                        placeholder="Enter your confirm password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                        className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none"
                                                    >
                                                        {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                                    </button>
                                                </div>
                                                {pageErrors.password_confirmation && <div className="mt-1 text-sm text-red-500">{pageErrors.password_confirmation}</div>}
                                            </div>
                                            <div className="col-span-12">
                                                <button
                                                    type="submit"
                                                    className="w-full px-4 py-2 text-white rounded-md bg-green-500 hover:bg-green-600"
                                                >
                                                    Set Password
                                                </button>
                                                <p className="mt-3 text-center text-gray-500">Return to the <Link href="/" className="font-medium link link-primary"><span className=" text-green-500">Sign In</span>
                                                    <MoveRight className="inline-block ml-1 size-4" /></Link></p>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default ResetPasswordCreative;
