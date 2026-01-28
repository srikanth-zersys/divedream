import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { router } from "@inertiajs/react";
import HeadTilte from '../../../components/CommonComponents/HeadTilte';
import mainlogo from '../../../../images/main-logo.png'
import whiteLogo from '../../../../images/logo-white.png'
import auth from '../../../../images/others/auth-creative.png'
import google from '../../../../images/others/google.png'

type AlertType = 'bg-red-100 text-red-500' | 'bg-green-100 text-green-500';

interface FormData {
    emailOrUsername: string;
    password: string;
}

interface PageProps {
    status?: string;
    errors: Record<string, string>;
}

const SigninCreative: React.FC = () => {
    const { props } = usePage<PageProps>(); 
    const { status, errors } = props;
    const [show, setShow] = useState(false);

    const handleToggle = () => setShow((prev) => !prev);
    const [formData, setFormData] = useState<FormData>({
        emailOrUsername: '',
        password: ''
    });
    const [alert, setAlert] = useState<{ isVisible: boolean; message: string; type: AlertType }>({
        isVisible: false,
        message: '',
        type: 'bg-red-100 text-red-500'
    });

    useEffect(() => {
        if (status) {
            showAlert(status, 'bg-green-100 text-green-500');
        }
    }, [status]);

    const validateForm = (e: React.FormEvent) => {
        e.preventDefault();
        setAlert({ ...alert, isVisible: false, message: '' });

        // Prepare the data for submission
        const postData = {
            email: formData.emailOrUsername,
            password: formData.password,
        };

        // Use Inertia's router to post the data
        router.post(route('login'), postData, {
            onSuccess: (page) => {

                   showAlert(`You've successfully logged in!`, 'bg-green-100 text-green-500');
                    setTimeout(() => {
                        router.visit('/sites'); 
                    }, 1000); 
            },
            onError: (pageErrors) => {
                if (pageErrors.message) {
                    showAlert(pageErrors.message, 'bg-red-100 text-red-500');
                }
            },
        });

     
       
    };

    const showAlert = (message: string, type: AlertType) => {
        setAlert({ isVisible: true, message, type });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    return (
        <React.Fragment>
            <HeadTilte title='sign In' />
            <div className="relative">
                <div className="grid grid-cols-12 min-h-screen">
                    <div className="relative col-span-12 py-8 overflow-hidden bg-gray-100 dark:bg-dark-850 lg:min-h-screen lg:col-span-6 md:p-9 xl:p-12">
                        <div className="absolute bottom-0 w-32 -rotate-45 -top-64 -right-8 bg-gray-200/20 dark:bg-dark-800/20"></div>
                        <div className="p-4 flex flex-col h-full">
                            <div className="flex-shrink-0">
                                <Link href="#!">
                                    <img src={mainlogo} alt="mainlogoImg" width={165} height={73} className="dark:hidden" />
                                    <img src={whiteLogo} alt="whiteLogoImg" width={165} height={73} className="hidden dark:inline-block" />
                                </Link>
                                <h1 className="max-w-lg mt-8 text-2xl font-normal leading-tight capitalize md:leading-tight md:text-4xl">
                                    The most straightforward way to monitor your projects
                                </h1>
                            </div>
                            
                            {/* Responsive image container */}
                            <div className="flex-1 flex items-center justify-center mt-6 xl:mt-8 px-4">
                                <img 
                                    src={auth} 
                                    alt="authImg" 
                                    className="
                                        w-full 
                                        max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl
                                        h-auto 
                                        rounded-lg shadow-lg 
                                        object-contain
                                        transition-all duration-300
                                        bg-white
                                    " 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center lg:min-h-screen col-span-12 lg:col-span-6 py-9 md:py-12">
                        <div className="grid w-full grid-cols-12">
                            <div className="col-span-12 2xl:col-span-8 2xl:col-start-3 mx-4 md:mx-12 mb-0 card">
                                <div className="md:p-10 card-body">
                                    <h4 className="mb-2 font-bold leading-relaxed text-center text-green-600 bg-clip-text">Login</h4>
                                    
                                    {alert.isVisible && (
                                        <div className={`relative py-3 text-sm rounded-md ltr:pl-5 rtl:pr-5 ltr:pr-7 rtl:pl-7 ${alert.type}`}>
                                            <span>{alert.message}</span>
                                            <button onClick={() => setAlert({ ...alert, isVisible: false })} className="absolute text-lg transition duration-200 ease-linear ltr:right-5 rtl:left-5 top-2">
                                                <i className="ri-close-fill"></i>
                                            </button>
                                        </div>
                                    )}
                                    <form onSubmit={validateForm}>
                                        <div className="grid grid-cols-12 gap-5 mt-5">
                                            <div className="col-span-12">
                                                <label htmlFor="emailOrUsername" className="form-label">Email</label>
                                                <input
                                                    type="text"
                                                    id="emailOrUsername"
                                                    value={formData.emailOrUsername}
                                                    onChange={handleInputChange}
                                                    className={`w-full form-input ${errors.email ? 'border-red-500 dark:border-red-500' : ''}`}
                                                    placeholder="Enter your email"
                                                />
                                                {errors.email && <div className="mt-1 text-sm text-red-500">{errors.email}</div>}
                                            </div>
                                            <div className="col-span-12">
                                                <div>
                                                    <label htmlFor="password" className="block mb-2 text-sm">Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={show ? 'text' : 'password'}
                                                            id="password"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                            className={`w-full ltr:pr-8 rtl:pl-8 form-input ${errors.password ? 'border-red-500 dark:border-red-500' : ''}`}
                                                            placeholder="Enter your password"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleToggle}
                                                            className="absolute inset-y-0 flex items-center text-gray-500 ltr:right-3 rtl:left-3 focus:outline-none dark:text-dark-500"
                                                        >
                                                            {show ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                                                        </button>
                                                    </div>
                                                    {errors.password && <div className="mt-1 text-sm text-red-500">{errors.password}</div>}
                                                </div>
                                            </div>
                                            <div className="col-span-12">
                                                <div className="flex items-center">
                                                    <div className="input-check-group grow">
                                                        <input id="checkboxBasic1" className="input-check input-check-primary" type="checkbox" />
                                                        <label htmlFor="checkboxBasic1" className="input-check-label">Remember me</label>
                                                    </div>
                                                    <Link href={route('password.request')} className="block text-sm font-medium text-right transition duration-300 ease-linear shrink-0 text-green-500 hover:text-green-600">Forgot Password?</Link>
                                                </div>
                                            </div>
                                            <div className="col-span-12">
                                                <button type="submit" className="w-full btn bg-green-500 text-white hover:bg-green-600">Sign In</button>
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

export default SigninCreative;
