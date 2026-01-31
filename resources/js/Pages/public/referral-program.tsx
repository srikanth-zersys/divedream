import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  Gift,
  Users,
  Share2,
  Copy,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
} from 'lucide-react';

interface Referral {
  id: number;
  referred_name: string;
  status: 'pending' | 'converted' | 'expired';
  reward_amount: number;
  created_at: string;
  converted_at: string | null;
}

interface Props {
  referralCode: string;
  referralUrl: string;
  stats: {
    total_referrals: number;
    successful_referrals: number;
    total_earned: number;
    pending_rewards: number;
  };
  referrals: Referral[];
  rewardAmount: number;
  discountPercent: number;
  tenant: {
    name: string;
    logo_url?: string;
  };
}

const ReferralProgram: React.FC<Props> = ({
  referralCode,
  referralUrl,
  stats,
  referrals,
  rewardAmount,
  discountPercent,
  tenant,
}) => {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(referralUrl);
  const shareText = encodeURIComponent(
    `Join me at ${tenant.name}! Use my referral code ${referralCode} to get ${discountPercent}% off your first booking.`
  );

  const socialLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
      color: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      url: `https://wa.me/?text=${shareText}%20${shareUrl}`,
      color: 'bg-green-500 hover:bg-green-600',
    },
  ];

  const handleEmailShare = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Join me at ${tenant.name}!`);
    const body = encodeURIComponent(
      `Hey!\n\nI've been having a great time at ${tenant.name} and thought you might enjoy it too!\n\nUse my referral code: ${referralCode}\n\nOr click this link: ${referralUrl}\n\nYou'll get ${discountPercent}% off your first booking!`
    );
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    setShowEmailModal(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      converted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return styles[status] || styles.pending;
  };

  return (
    <>
      <Head title="Referral Program" />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8" />
              ) : (
                <span className="text-xl font-bold text-blue-600">{tenant.name}</span>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Refer Friends, Earn Rewards</h1>
                <p className="text-blue-100 mt-1">
                  Share the adventure and earn ${rewardAmount} for each friend who books
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">1. Share Your Code</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Send your unique referral code to friends
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">2. Friends Book</h3>
                <p className="text-sm text-blue-100 mt-1">
                  They get {discountPercent}% off their first booking
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">3. You Earn</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Get ${rewardAmount} credit for each successful referral
                </p>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <code className="text-2xl font-bold text-blue-600 tracking-wider flex-1">
                    {referralCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(referralCode)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(referralUrl)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Share2 className="w-5 h-5" />
                Copy Link
              </button>
            </div>

            {/* Social Share */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">Share on social media</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg ${social.color}`}
                  >
                    <social.icon className="w-4 h-4" />
                    {social.name}
                  </a>
                ))}
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{stats.total_referrals}</p>
              <p className="text-sm text-gray-500">Total Referrals</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.successful_referrals}</p>
              <p className="text-sm text-gray-500">Successful</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">${stats.total_earned}</p>
              <p className="text-sm text-gray-500">Total Earned</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">${stats.pending_rewards}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>

          {/* Referral History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Referral History</h2>
            </div>
            {referrals.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <div key={referral.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{referral.referred_name}</p>
                      <p className="text-sm text-gray-500">
                        Referred on {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(referral.status)}`}>
                        {referral.status}
                      </span>
                      {referral.status === 'converted' && (
                        <p className="text-sm text-green-600 mt-1">
                          +${referral.reward_amount}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No referrals yet</h3>
                <p className="text-gray-500">Share your code to start earning rewards!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Referral via Email</h3>
            <form onSubmit={handleEmailShare}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="friend@example.com"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferralProgram;
