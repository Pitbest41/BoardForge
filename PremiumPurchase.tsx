import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, CreditCard, ChevronRight, CheckCircle, Smartphone, Copy } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function PremiumPurchase() {
    const navigate = useNavigate();
    const { user, updateUserProfile } = useStore();
    
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [smsCode, setSmsCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const TARGET_SMS_CODE = '5577';

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phoneNumber.length < 10) {
            alert('لطفا شماره موبایل معتبر وارد کنید');
            return;
        }
        setStep(3); // Go to card info
    };

    const handlePaid = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep(4); // Go to SMS verification
            alert(`دوست عزیز درود\nکد ورود و تایید اکانت پرمیوم شما: ${TARGET_SMS_CODE}`);
        }, 2000);
    };

    const handleVerifySms = (e: React.FormEvent) => {
        e.preventDefault();
        if (smsCode === TARGET_SMS_CODE) {
            setStep(5);
            setTimeout(() => {
                if (user) {
                    updateUserProfile({ isPremium: true });
                }
                navigate('/lobby');
            }, 3000);
        } else {
            alert('کد وارد شده اشتباه است.');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('شماره کارت کپی شد.');
    };

    // Step 2: Ask for Phone Number
    if (step === 2) {
        return (
            <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col font-sans text-white items-center justify-center p-6" dir="rtl">
                <div className="max-w-md w-full bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    <Smartphone className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">شماره موبایل</h2>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        برای ادامه فرآیند خرید، لطفا شماره موبایل خود را وارد کنید.
                    </p>
                    <form onSubmit={handlePhoneSubmit} className="space-y-6">
                        <input 
                            type="tel" 
                            dir="ltr"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 11))}
                            placeholder="09123456789"
                            className="w-full bg-[#050505] border-2 border-white/10 rounded-xl py-4 px-4 text-center font-mono text-2xl tracking-widest text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        />
                        <button 
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-colors"
                        >
                            تایید و ادامه
                        </button>
                        <button 
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-gray-500 hover:text-white font-bold py-2 transition-colors"
                        >
                            بازگشت
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    // Step 3: Show Card Details
    if (step === 3) {
        return (
            <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col font-sans text-white items-center justify-center p-6" dir="rtl">
                <div className="max-w-md w-full bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    <CreditCard className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">پرداخت کارت به کارت</h2>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        لطفا مبلغ ۲۰,۰۰۰ ریال را به شماره کارت زیر واریز نمایید و سپس روی دکمه "پرداخت کردم" کلیک کنید.
                    </p>
                    
                    <div className="bg-[#050505] border border-white/10 rounded-xl p-6 mb-6">
                        <div className="text-sm text-gray-500 mb-2">شماره کارت مقصد:</div>
                        <div className="flex items-center justify-center gap-3">
                            <span className="font-mono text-xl tracking-widest font-bold">5859 4710 1072 8060</span>
                            <button onClick={() => copyToClipboard('5859471010728060')} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <Copy className="w-5 h-5 text-yellow-500" />
                            </button>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">نام صاحب حساب: بورد فورج</div>
                    </div>

                    <button 
                        onClick={handlePaid}
                        disabled={isProcessing}
                        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                        {isProcessing ? 'در حال بررسی...' : 'پرداخت کردم'}
                    </button>
                    <button 
                        onClick={() => setStep(2)}
                        disabled={isProcessing}
                        className="w-full text-gray-500 hover:text-white font-bold py-2 transition-colors disabled:opacity-50"
                    >
                        بازگشت
                    </button>
                </div>
            </div>
        );
    }
    
    // Step 4: SMS Verification
    if (step === 4) {
        return (
            <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col font-sans text-white items-center justify-center p-6" dir="rtl">
                <div className="max-w-md w-full bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    <Smartphone className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">تایید شماره موبایل</h2>
                    <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                        کد تایید پیامک شده به شماره ثبت شده خود را وارد کنید.
                    </p>
                    <form onSubmit={handleVerifySms} className="space-y-6">
                        <input 
                            type="text" 
                            dir="ltr"
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').substring(0, 4))}
                            placeholder="----"
                            className="w-full bg-[#050505] border-2 border-white/10 rounded-xl py-4 px-4 text-center font-mono text-3xl tracking-[1em] text-white focus:border-yellow-500 focus:outline-none transition-colors"
                        />
                        <button 
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-colors"
                        >
                            تایید کد
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Step 5: Success
    if (step === 5) {
        return (
            <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col font-sans text-white items-center justify-center p-6" dir="rtl">
                <div className="max-w-md w-full bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-2">عملیات موفق</h2>
                    <p className="text-gray-400 mb-4">اکانت پرمیوم شما با موفقیت فعال شد.</p>
                    <div className="mt-6 text-sm text-yellow-500 animate-pulse">در حال انتقال به برنامه...</div>
                </div>
            </div>
        );
    }

    // Step 1: Pre-Gateway UI (The dark theme app side)
    return (
        <div className="flex-1 flex items-center justify-center bg-[#050505] p-6 text-white font-sans">
            <div className="max-w-md w-full bg-[#111] p-8 rounded-3xl border border-white/10 shadow-2xl text-center">
                <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-3xl font-black mb-2">اکانت پرمیوم</h1>
                <p className="text-gray-400 mb-8">برای دسترسی به تمام مینی‌گیم‌ها مانند پوکر، حکم و مافیا در حالت چندنفره، اشتراک پرمیوم را تهیه کنید.</p>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400 font-bold">طرح ۱ ماهه</span>
                        <span className="font-bold text-xl text-yellow-500">۲۰,۰۰۰ ریال</span>
                    </div>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> دسترسی به همه بازی‌ها</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> بازی با دوستان</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> بدون تبلیغات</li>
                    </ul>
                </div>

                <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
                >
                    خرید اشتراک <ChevronRight className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => navigate('/lobby')}
                    className="w-full text-gray-500 hover:text-white font-bold py-3 transition-colors"
                >
                    انصراف
                </button>
            </div>
        </div>
    );
}

