import React, { useState, useEffect } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { useToast } from '../context/ToastContext';

export const AccountSecurityScreen: React.FC = () => {
  const {
    userProfile,
    updateProfile,
    secureAccount,
    navigateTo,
    firebaseUser,
    isAuthReady,
    authError,
    signInWithGoogle,
    signOutUser,
  } = useMarketPulse();
  const { showToast } = useToast();

  const [silentContact, setSilentContact] = useState(
    userProfile.contact || userProfile.email || userProfile.phone || ''
  );

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [is2FAEnabled, setIs2FAEnabled] = useState(userProfile.twoFactorEnabled);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(userProfile.biometricLock);

  useEffect(() => {
    setName(userProfile.name);
    setEmail(userProfile.email);
    setPhone(userProfile.phone);
    setSilentContact(userProfile.contact || userProfile.email || userProfile.phone || '');
    setIs2FAEnabled(userProfile.twoFactorEnabled);
    setIsBiometricEnabled(userProfile.biometricLock);
  }, [userProfile]);

  const handleSilentBackupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!silentContact.trim()) return;
    secureAccount(silentContact.trim());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      contact: email || phone,
      twoFactorEnabled: is2FAEnabled,
      biometricLock: isBiometricEnabled,
    });
    showToast({
      message: 'Your details have been saved',
      tone: 'success',
    });
  };

  const avatarInitials =
    (userProfile.avatarInitials && userProfile.avatarInitials.trim()) ||
    userProfile.name
      ?.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'AO';

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-20 lg:pt-24 pb-28 lg:pb-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Clean Header (TopAppBar already handles Back navigation) */}
        <header>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            Keep Your Records Safe
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">
            Add your phone number or sign in with Google so you never lose your market records if
            you change phones.
          </p>
        </header>

        {/* Desktop 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Silent Backup + Google Cloud Sync */}
          <div className="lg:col-span-5 space-y-5">
            {/* Silent Backup Card */}
            <section className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-[#15803d] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">cloud_done</span>
                </div>
                <div>
                  <h2 className="font-display text-lg font-extrabold text-[#1d1d1f]">
                    Your data is safe
                  </h2>
                  <p className="text-xs text-[#6e6e73] mt-0.5 leading-relaxed">
                    Your market logs are saved on this phone. Add an email or phone number so you
                    can restore them anytime.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSilentBackupSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="silent-backup-contact-input"
                    className="block text-xs font-semibold text-[#6e6e73] mb-1.5"
                  >
                    Email or Phone Number
                  </label>
                  <input
                    id="silent-backup-contact-input"
                    type="text"
                    value={silentContact}
                    onChange={(e) => setSilentContact(e.target.value)}
                    placeholder="e.g. chidi@example.com or 0803..."
                    className="w-full px-3.5 py-3 rounded-xl border border-black/[0.09] bg-[#f5f5f7] text-sm font-medium text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#00567c]/20 focus:border-[#00567c] focus:bg-white transition-colors"
                  />
                </div>

                <button
                  id="secure-my-backup-btn"
                  type="submit"
                  className="w-full min-h-[46px] bg-[#00567c] hover:bg-[#003e5a] active:scale-[0.99] text-white font-semibold py-3 rounded-xl shadow-2xs transition-all text-sm"
                >
                  Save Recovery Contact
                </button>

                <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-[#6e6e73]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Private &amp; never shared
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('home')}
                    className="font-semibold text-[#3a3a3c] hover:text-[#1d1d1f]"
                  >
                    Not now
                  </button>
                </div>
              </form>
            </section>

            {/* Google Cloud Sync Card */}
            <section className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-200/70 text-[#00567c] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">
                    {firebaseUser ? 'verified_user' : 'cloud_sync'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-base text-[#1d1d1f]">
                    {firebaseUser ? 'Backed Up With Google' : 'One-Tap Google Backup'}
                  </h2>
                  <p className="text-xs text-[#6e6e73] mt-0.5 leading-relaxed">
                    {firebaseUser
                      ? `Signed in as ${firebaseUser.email} · Your records sync automatically`
                      : 'Keep your market trips and food budget synced across your phone and laptop.'}
                  </p>
                </div>
              </div>

              {isAuthReady && (
                <div>
                  {firebaseUser ? (
                    <button
                      id="account-google-signout-btn"
                      type="button"
                      onClick={signOutUser}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-black/[0.09] text-xs font-semibold text-[#3a3a3c] hover:bg-[#f2f2f7] transition-colors"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <button
                      id="account-google-signin-btn"
                      type="button"
                      onClick={signInWithGoogle}
                      className="w-full min-h-[44px] bg-[#00567c] text-white font-semibold px-5 py-2.5 rounded-xl text-xs hover:bg-[#003e5a] transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">login</span>
                      <span>Back Up With Google</span>
                    </button>
                  )}
                </div>
              )}

              {authError && (
                <div className="p-3 bg-red-50 text-[#b91c1c] rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{authError}</span>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Profile & Security Preferences */}
          <div className="lg:col-span-7 space-y-5">
            {/* Profile Form */}
            <section className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b border-black/[0.06]">
                <div className="w-14 h-14 rounded-full bg-[#00567c] text-white flex items-center justify-center text-lg font-bold tracking-wider shrink-0 overflow-hidden">
                  {firebaseUser?.photoURL ? (
                    <img
                      src={firebaseUser.photoURL}
                      alt={userProfile.name || 'Account'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{avatarInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-lg text-[#1d1d1f] truncate">
                    {userProfile.name}
                  </h2>
                  <p className="text-xs text-[#6e6e73] truncate">{userProfile.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold">
                    <span
                      className={`material-symbols-outlined text-[15px] ${
                        firebaseUser || userProfile.isSecured ? 'text-[#15803d]' : 'text-[#6e6e73]'
                      }`}
                    >
                      {firebaseUser
                        ? 'verified_user'
                        : userProfile.isSecured
                        ? 'cloud_done'
                        : 'phone_iphone'}
                    </span>
                    <span
                      className={
                        firebaseUser || userProfile.isSecured ? 'text-[#15803d]' : 'text-[#6e6e73]'
                      }
                    >
                      {firebaseUser
                        ? 'Backed up with Google'
                        : userProfile.isSecured
                        ? 'Recovery contact saved'
                        : 'Saved on this device'}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#f5f5f7] border border-black/[0.09] rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      maxLength={150}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-black/[0.09] rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6e6e73] mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      maxLength={50}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#f5f5f7] border border-black/[0.09] rounded-xl px-3.5 py-2.5 text-sm text-[#1d1d1f] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="min-h-[42px] bg-[#00567c] text-white font-semibold px-6 py-2.5 rounded-xl text-xs hover:bg-[#003e5a] transition-colors"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </section>

            {/* Security Preferences */}
            <section className="bg-white rounded-2xl p-6 border border-black/[0.06] shadow-2xs space-y-5">
              <h2 className="font-display font-bold text-base text-[#1d1d1f] pb-3 border-b border-black/[0.06]">
                App Lock &amp; Protection
              </h2>

              {/* 2FA Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#00567c] mt-0.5">shield</span>
                  <div>
                    <p className="font-semibold text-sm text-[#1d1d1f]">SMS Code on New Sign-in</p>
                    <p className="text-xs text-[#6e6e73]">
                      Send a quick SMS code to {phone} before opening on a new phone
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={is2FAEnabled}
                    onChange={(e) => setIs2FAEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e5e5ea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00567c]" />
                </label>
              </div>

              {/* Biometric Toggle */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#00567c] mt-0.5">
                    fingerprint
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-[#1d1d1f]">Fingerprint / Face Lock</p>
                    <p className="text-xs text-[#6e6e73]">
                      Use your phone&apos;s fingerprint or Face ID to unlock MarketPulse
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isBiometricEnabled}
                    onChange={(e) => setIsBiometricEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#e5e5ea] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-black/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00567c]" />
                </label>
              </div>

              {/* Recovery Link */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-black/[0.06]">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#00567c] mt-0.5">lock</span>
                  <div>
                    <p className="font-semibold text-sm text-[#1d1d1f]">Recovery Email</p>
                    <p className="text-xs text-[#6e6e73]">Send a sign-in link to {email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    showToast({
                      message: 'Recovery link sent',
                      description: `Check ${email} for your sign-in link.`,
                      tone: 'success',
                    })
                  }
                  className="text-xs font-semibold text-[#00567c] hover:underline whitespace-nowrap shrink-0"
                >
                  Send Link
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
