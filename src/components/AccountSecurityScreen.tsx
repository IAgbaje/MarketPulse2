import React, { useState, useEffect } from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';

export const AccountSecurityScreen: React.FC = () => {
  const {
    userProfile,
    updateProfile,
    secureAccount,
    goBack,
    navigateTo,
    firebaseUser,
    isAuthReady,
    authError,
    signInWithGoogle,
    signOutUser,
  } = useMarketPulse();

  const [silentContact, setSilentContact] = useState(
    userProfile.contact || userProfile.email || userProfile.phone || ''
  );
  const [silentSavedNotice, setSilentSavedNotice] = useState(false);

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [phone, setPhone] = useState(userProfile.phone);
  const [is2FAEnabled, setIs2FAEnabled] = useState(userProfile.twoFactorEnabled);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(userProfile.biometricLock);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState(false);

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
    setSilentSavedNotice(true);
    setTimeout(() => setSilentSavedNotice(false), 3500);
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
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd] pt-20 pb-32 px-4 md:px-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-sm font-medium text-[#00567c] hover:underline mb-3"
        >
          <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
          Back
        </button>
        <h2 className="text-2xl font-bold text-[#191c1f] tracking-tight mb-1">
          Backup & Cloud Sync
        </h2>
        <p className="text-[#40484e] text-sm">
          Attach your email or phone number to secure your silent device backup, or connect Google
          Cloud for real-time multi-device sync.
        </p>
      </div>

      {/* Section 1: Silent Backup Card (screen-upgrade-account) */}
      <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#c0c7cf]/40 shadow-xs mb-6">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center mb-4 shadow-xs">
            <span className="material-symbols-outlined text-3xl">cloud_done</span>
          </div>
          <h3 className="text-2xl font-extrabold text-[#191c1f] mb-1.5">Your data is safe</h3>
          <p className="text-sm text-[#40484e] max-w-md leading-relaxed">
            A silent backup already exists on this device. Attach your email or phone number so you
            can restore your history if you switch phones.
          </p>
        </div>

        <form onSubmit={handleSilentBackupSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#40484e] uppercase tracking-wider mb-2">
              Email or Phone Number
            </label>
            <input
              id="silent-backup-contact-input"
              type="text"
              value={silentContact}
              onChange={(e) => setSilentContact(e.target.value)}
              placeholder="e.g. chidi@example.com or 0803..."
              className="w-full px-4 py-3.5 rounded-xl border border-[#c0c7cf] bg-[#f8f9fd] text-sm font-medium text-[#191c1f] focus:outline-none focus:ring-2 focus:ring-[#00567c] focus:bg-white"
            />
          </div>

          <button
            id="secure-my-backup-btn"
            type="submit"
            className="w-full bg-[#00567c] hover:bg-[#003e5a] text-white font-bold py-4 rounded-xl shadow-md transition-all text-sm active:scale-98"
          >
            Secure My Backup
          </button>

          {silentSavedNotice && (
            <div className="p-3 bg-[#dcfce7] text-[#16a34a] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Silent backup linked to {silentContact}!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-[#71787f] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              We never spam or share your personal shopping logs.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-xs font-semibold text-[#71787f] hover:text-[#191c1f]"
            >
              Skip for now
            </button>
          </div>
        </form>
      </section>

      {/* Section 2: Google Authentication & Cloud Sync Card */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c0c7cf]/40 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#cbe3f7] text-[#00567c] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {firebaseUser ? 'cloud_done' : 'cloud_sync'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[#191c1f]">
                {firebaseUser ? 'Connected to Google Cloud' : 'One-Tap Google Cloud Sync'}
              </h3>
              <p className="text-xs text-[#40484e] mt-0.5">
                {firebaseUser
                  ? `Signed in as ${firebaseUser.email} • Real-time Firestore sync active`
                  : 'Sync your market trips, receipts, and household budgets across all your devices with Google.'}
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
                  className="px-4 py-2.5 rounded-xl border border-[#c0c7cf] text-xs font-bold text-[#40484e] hover:bg-[#f2f3f7] active:scale-95 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  id="account-google-signin-btn"
                  type="button"
                  onClick={signInWithGoogle}
                  className="bg-[#00567c] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#2a6f97] active:scale-95 transition-all shadow-xs flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          )}
        </div>

        {authError && (
          <div className="mt-4 p-3 bg-[#ffdad6]/50 text-[#ba1a1a] rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{authError}</span>
          </div>
        )}
      </section>

      {saveSuccess && (
        <div className="mb-4 p-3.5 bg-[#cbe3f7] text-[#00567c] rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Account details updated successfully!</span>
        </div>
      )}

      {/* Profile Info Form Card */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c0c7cf]/40 shadow-xs mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#e1e2e6]">
          <div className="w-16 h-16 rounded-full bg-[#00567c] text-white flex items-center justify-center text-xl font-bold tracking-wider shrink-0 shadow-xs overflow-hidden">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={userProfile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              userProfile.avatarInitials
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#191c1f]">{userProfile.name}</h3>
            <p className="text-xs text-[#71787f]">{userProfile.email}</p>
            <div
              className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                firebaseUser || userProfile.isSecured
                  ? 'bg-[#c4eed0]/50 text-[#006e1c]'
                  : 'bg-[#e1e2e6] text-[#40484e]'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {firebaseUser ? 'verified_user' : userProfile.isSecured ? 'cloud_done' : 'devices'}
              </span>
              <span>
                {firebaseUser
                  ? 'Verified Cloud Account'
                  : userProfile.isSecured
                  ? 'Silent Backup Secured'
                  : 'Local Device Profile'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#40484e] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f8f9fd] border border-[#c0c7cf]/60 rounded-xl p-3 text-sm text-[#191c1f] focus:bg-white focus:ring-2 focus:ring-[#00567c] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#40484e] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                maxLength={150}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-[#c0c7cf]/60 rounded-xl p-3 text-sm text-[#191c1f] focus:bg-white focus:ring-2 focus:ring-[#00567c] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#40484e] uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                maxLength={50}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-[#c0c7cf]/60 rounded-xl p-3 text-sm text-[#191c1f] focus:bg-white focus:ring-2 focus:ring-[#00567c] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#00567c] text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-[#2a6f97] active:scale-95 transition-all shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </section>

      {/* Security Preferences Card */}
      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#c0c7cf]/40 shadow-xs mb-6 space-y-5">
        <h3 className="font-bold text-base text-[#191c1f] border-b border-[#e1e2e6] pb-3">
          Security & Authentication
        </h3>

        {/* 2FA Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#00567c] mt-0.5">shield</span>
            <div>
              <p className="font-semibold text-sm text-[#191c1f]">
                Two-Factor Authentication (2FA)
              </p>
              <p className="text-xs text-[#40484e]">
                Require SMS verification code on new sign-ins to {phone}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={is2FAEnabled}
              onChange={(e) => setIs2FAEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e1e2e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00567c]"></div>
          </label>
        </div>

        {/* Biometric Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e1e2e6]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#00567c] mt-0.5">fingerprint</span>
            <div>
              <p className="font-semibold text-sm text-[#191c1f]">Biometric App Lock</p>
              <p className="text-xs text-[#40484e]">
                Use Fingerprint or Face ID when opening MarketPulse
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isBiometricEnabled}
              onChange={(e) => setIsBiometricEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#e1e2e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00567c]"></div>
          </label>
        </div>

        {/* Recovery Link */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e1e2e6]">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#00567c] mt-0.5">lock</span>
            <div>
              <p className="font-semibold text-sm text-[#191c1f]">Account Recovery</p>
              <p className="text-xs text-[#71787f]">Send verification link to {email}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setPasswordNotice(true);
              setTimeout(() => setPasswordNotice(false), 4000);
            }}
            className="text-xs font-semibold text-[#00567c] hover:underline"
          >
            Send Link
          </button>
        </div>

        {passwordNotice && (
          <div className="p-3 bg-[#cbe3f7] text-[#00567c] rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span>Recovery instructions sent to {email}.</span>
          </div>
        )}
      </section>
    </div>
  );
};
