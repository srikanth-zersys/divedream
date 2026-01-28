import React, { useState } from "react";
import mainlogo from '../../../../images/main-logo.png'
import whiteLogo from '../../../../images/logo-white.png'
import creativeauth from '../../../../images/others/auth-creative.png'
import { MoveRight } from "lucide-react";
import ErrorToast from "../../../components/CustomComponents/Toast/ErrorToast";
import { Link, usePage } from "@inertiajs/react";
import HeadTilte from "../../../components/CommonComponents/HeadTilte";
import { router } from "@inertiajs/react";

type PageProps = {
    status?: string;
    errors?: {
        email?: string;
    };
};

const ForgotPasswordCreative = () => {

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { props } = usePage<PageProps>();
    const status = props.status;
    const errors = props.errors || {};

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
            router.post(route('password.email'), { email: email }, {
                onStart: () => setIsSubmitting(true),
                onFinish: () => setIsSubmitting(false),
            });
        }

    return (
        <React.Fragment>
            <HeadTilte title="Forgot Password" />
            <div className="relative">
                <div className="grid grid-cols-12">
                    <div className="relative col-span-12 py-8 overflow-hidden bg-gray-100 dark:bg-dark-850 lg:min-h-screen lg:col-span-6 md:p-9 xl:p-12">
                        <div className="absolute bottom-0 w-32 -rotate-45 -top-64 -right-8 bg-gray-200/20 dark:bg-dark-800/20"></div>
                        <div className="p-4">
                            <Link href="/">
                                <img src={mainlogo} alt="mainlogoImg"  className="mx-auto dark:hidden inline-block" width={165} height={73} />
                                <img src={whiteLogo} alt="whiteLogoImg"  className="hidden mx-auto dark:inline-block" width={165} height={73} />
                            </Link>
                            <h1 className="max-w-lg mt-8 text-4xl font-normal leading-tight capitalize">The most straightforward way to manage your projects</h1>

                            <img src={creativeauth} alt="creativeauthImg"  className="absolute scale-110 rounded-lg shadow-lg top-[315px] left-[115px]" />
                        </div>
                    </div>
                    <div className="flex items-center min-h-screen col-span-6 py-12">
                        <div className="grid w-full grid-cols-12">
                            <div className="col-span-8 col-start-3 mx-12 mb-0 card">
                                <div className="p-10 card-body">
                                    <h4 className="mb-2 font-bold leading-relaxed text-center text-green-600 bg-clip-text">Forgot your Password?</h4>
                                    <p className="mb-5 text-center text-gray-500">Enter your email or username to reset it.</p>

                                    {/* Display success status message from backend */}
                                    {status && (
                                        <div className="mb-4 p-3 rounded-md text-sm text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300" role="alert">
                                            {status}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-12 gap-4 mt-5">
                                            <div className="col-span-12">
                                                <label htmlFor="emailInput" className="form-label">Email Address</label>
                                                <input
                                                    type="text"
                                                    id="emailInput"
                                                    className={`w-full form-input ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                                {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                                            </div>
                                            <div className="col-span-12">
                                                <button
                                                    type="submit"
                                                    className="w-full flex justify-center items-center px-4 py-2 text-white rounded-md bg-green-500 hover:bg-green-600 disabled:opacity-75"
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting && (
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    )}
                                                    {isSubmitting ? 'Sending...' : 'Reset Password'}
                                                </button>
                                                <p className="mt-3 text-center text-gray-500">Return to the <Link href="/" className="font-medium link text-green-500 hover:text-green-600"><span className="align-middle">Sign In</span> <MoveRight className="inline-block rtl:mr-1 ltr:ml-1 size-4" /> </Link></p>
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
    )
}
export default ForgotPasswordCreative
