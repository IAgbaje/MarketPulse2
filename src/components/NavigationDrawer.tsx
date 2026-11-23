import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PWAInstallButton } from './PWAInstallButton';

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setDrawerOpen,
    navigateTo,
    currentScreen,
    userProfile,
    firebaseUser,
    signInWithGoogle,
    setActivePriceMapTab,
  } = useMarketPulse();

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
    <AnimatePresence>
      {isDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-[3px]"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Spring Drawer Panel */}
          <motion.nav
            id="main-navigation-drawer"
            aria-label="Main Navigation"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 38 }}
            className="relative z-10 flex flex-col h-full w-80 max-w-[84vw] bg-[#f5f5f7] shadow-2xl border-r border-black/[0.08]"
          >
            {/* Header Profile */}
            <div className="p-5 border-b border-black/[0.06] bg-white">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-display font-bold text-base text-[#00567c]">MarketPulse</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="min-w-[40px] min-h-[40px] -mr-2 rounded-full flex items-center justify-center text-[#6e6e73] hover:bg-[#f2f2f7]"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-black/[0.08] bg-[#00567c] text-white flex items-center justify-center font-bold shrink-0 text-sm">
                  {firebaseUser?.photoURL ? (
                    <img
                      alt={userProfile.name || 'Account'}
                      className="object-cover w-full h-full"
                      src={firebaseUser.photoURL}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{avatarInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-base text-[#1d1d1f] truncate">
                    {userProfile.household || 'My Home'}
                  </h2>
                  <p className="text-xs text-[#6e6e73] truncate">{userProfile.location}</p>
                </div>
              </div>

              {firebaseUser ? (
                <div className="flex items-center gap-1.5 text-xs text-[#15803d] mt-3 font-medium">
                  <span className="material-symbols-outlined text-[15px]">cloud_done</span>
                  <span>Backed up with Google</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-1.5 text-xs text-[#003852] mt-3 bg-[#d4e8f7] hover:bg-[#00567c] hover:text-white transition-colors py-2 px-3.5 rounded-xl w-fit font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  <span>Back Up With Google</span>
                </button>
              )}
            </div>

            {/* Links List */}
            <div className="flex-1 py-3 overflow-y-auto no-scrollbar px-2.5 space-y-0.5">
              {[
                { id: 'drawer-link-home', label: 'Home', icon: 'home', screen: 'home' as const },
                {
                  id: 'drawer-link-price-map',
                  label: 'Check Market Prices',
                  icon: 'map',
                  screen: 'price-map' as const,
                  action: () => {
                    setActivePriceMapTab('map');
                    navigateTo('price-map', { tab: 'map' });
                  },
                },
                { id: 'drawer-link-weekly-report', label: 'Weekly Summary', icon: 'insights', screen: 'weekly-report' as const },
                { id: 'drawer-link-history', label: 'My Market Trips', icon: 'receipt_long', screen: 'history' as const },
                { id: 'drawer-link-budget', label: 'Food Budget', icon: 'account_balance_wallet', screen: 'budget' as const },
                { id: 'drawer-link-commodity', label: 'Food Price Trends', icon: 'trending_up', screen: 'commodity-detail' as const },
              ].map((link) => {
                const active = currentScreen === link.screen;
                return (
                  <button
                    key={link.id}
                    id={link.id}
                    type="button"
                    onClick={() => (link.action ? link.action() : navigateTo(link.screen))}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left min-h-[44px] ${
                      active
                        ? 'bg-white text-[#003852] font-semibold shadow-2xs border border-black/[0.05]'
                        : 'text-[#1d1d1f] hover:bg-black/[0.04] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${active ? 'filled text-[#00567c]' : 'text-[#6e6e73]'}`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </button>
                );
              })}

              <div className="my-2.5 border-t border-black/[0.06]" />

              {[
                { id: 'drawer-link-landing', label: 'About MarketPulse', icon: 'public', screen: 'landing' as const },
                { id: 'drawer-link-account-sync', label: 'Keep Records Safe', icon: 'cloud_sync', screen: 'account-security' as const },
                { id: 'drawer-link-data-mgmt', label: 'Export & Data', icon: 'database', screen: 'data-management' as const },
                { id: 'drawer-link-set-budget', label: 'Set Food Budget', icon: 'tune', screen: 'set-budget' as const },
              ].map((link) => {
                const active = currentScreen === link.screen;
                return (
                  <button
                    key={link.id}
                    id={link.id}
                    type="button"
                    onClick={() => navigateTo(link.screen)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-sm text-left min-h-[44px] ${
                      active
                        ? 'bg-white text-[#003852] font-semibold shadow-2xs border border-black/[0.05]'
                        : 'text-[#3a3a3c] hover:bg-black/[0.04] font-medium'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${active ? 'filled text-[#00567c]' : 'text-[#6e6e73]'}`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </button>
                );
              })}

              <div className="pt-2 px-1">
                <PWAInstallButton variant="drawer" />
              </div>
            </div>

            {/* Clean Footer */}
            <div className="px-5 py-3.5 border-t border-black/[0.06] bg-white text-xs text-[#6e6e73] flex items-center justify-between pb-safe">
              <span>MarketPulse</span>
              <span>Works offline</span>
            </div>
          </motion.nav>
        </div>
      )}
    </AnimatePresence>
  );
};
