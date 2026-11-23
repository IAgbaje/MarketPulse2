import React from 'react';
import { useMarketPulse } from '../context/MarketPulseContext';
import { PWAInstallButton } from './PWAInstallButton';

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  showMenu?: boolean;
  showClose?: boolean;
  onCloseClick?: () => void;
  showEdit?: boolean;
  onEditClick?: () => void;
  showAvatar?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  title = 'MarketPulse',
  showBack,
  onBackClick,
  showMenu = true,
  showClose,
  onCloseClick,
  showEdit = false,
  onEditClick,
  showAvatar = true,
}) => {
  const {
    setDrawerOpen,
    setCommandPaletteOpen,
    goBack,
    navigateTo,
    currentScreen,
    regions,
    activeRegion,
    setActiveRegionId,
    firebaseUser,
    userProfile,
  } = useMarketPulse();

  if (currentScreen === 'landing') {
    return null;
  }

  const isPrimaryView =
    currentScreen === 'home' ||
    currentScreen === 'price-map' ||
    currentScreen === 'history' ||
    currentScreen === 'budget' ||
    currentScreen === 'commodity-detail' ||
    currentScreen === 'weekly-report';

  const isSubscreen =
    currentScreen === 'trip-detail' ||
    currentScreen === 'set-budget' ||
    currentScreen === 'data-management' ||
    currentScreen === 'data-mgmt' ||
    currentScreen === 'account-security' ||
    currentScreen === 'secure-account' ||
    currentScreen === 'log-choice' ||
    currentScreen === 'log-manual' ||
    currentScreen === 'log-confirm';

  const isClosingWorkflow =
    currentScreen === 'log-scan' ||
    currentScreen === 'log-pending' ||
    currentScreen === 'log-success';

  let computedTitle = title;
  let breadcrumbParent: string | null = null;
  if (title === 'MarketPulse') {
    switch (currentScreen) {
      case 'home':
        computedTitle = 'Home';
        break;
      case 'price-map':
        computedTitle = 'Price Map';
        break;
      case 'weekly-report':
        computedTitle = 'Weekly Summary';
        breadcrumbParent = 'Insights';
        break;
      case 'trip-detail':
        computedTitle = 'Market Receipt';
        breadcrumbParent = 'My Market Trips';
        break;
      case 'commodity-detail':
        computedTitle = 'Food Prices';
        break;
      case 'budget':
        computedTitle = 'Food Budget';
        break;
      case 'set-budget':
        computedTitle = 'Set Food Budget';
        breadcrumbParent = 'Food Budget';
        break;
      case 'history':
        computedTitle = 'My Market Trips';
        break;
      case 'log-choice':
      case 'log-manual':
        computedTitle = 'Record Market Run';
        breadcrumbParent = 'Market Bag';
        break;
      case 'log-scan':
        computedTitle = 'Snap Receipt';
        breadcrumbParent = 'Market Bag';
        break;
      case 'log-pending':
        computedTitle = 'Waiting for Review';
        breadcrumbParent = 'Market Bag';
        break;
      case 'log-confirm':
        computedTitle = 'Check Your Bag';
        breadcrumbParent = 'Market Bag';
        break;
      case 'log-success':
        computedTitle = 'Saved!';
        break;
      case 'data-management':
      case 'data-mgmt':
        computedTitle = 'Export & Data';
        breadcrumbParent = 'Settings';
        break;
      case 'account-security':
      case 'secure-account':
        computedTitle = 'Keep Records Safe';
        breadcrumbParent = 'Settings';
        break;
      case 'usage-analytics':
        computedTitle = 'Admin Insights';
        breadcrumbParent = 'Admin';
        break;
      default:
        computedTitle = 'MarketPulse';
        break;
    }
  }

  const effectiveShowClose = showClose !== undefined ? showClose : isClosingWorkflow;
  const effectiveShowBack = showBack !== undefined ? showBack : isSubscreen;
  const effectiveShowMenu = showMenu && !effectiveShowBack && !effectiveShowClose;
  const effectiveShowAvatar = showAvatar && isPrimaryView;

  const handleBack = () => {
    if (onBackClick) onBackClick();
    else goBack();
  };

  const handleClose = () => {
    if (onCloseClick) onCloseClick();
    else navigateTo('home');
  };

  const formatRegionShortName = (id: string, state: string) => {
    if (id === 'abuja' || state.toLowerCase().includes('federal capital')) {
      return 'Abuja';
    }
    return state.replace(' State', '');
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
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-[#f5f5f7]/90 backdrop-blur-xl border-b border-black/[0.06] flex justify-between items-center gap-1.5 sm:gap-3 px-2.5 sm:px-5 lg:px-8 h-14 lg:h-16 transition-colors">
      {/* Left Zone: Mobile Nav Control + Contextual Breadcrumb/Title */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
        {effectiveShowClose ? (
          <button
            id="top-close-btn"
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="w-10 h-10 -ml-1 rounded-full text-[#6e6e73] hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 transition-colors active:scale-95 flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[21px]">close</span>
          </button>
        ) : effectiveShowBack ? (
          <button
            id="top-back-btn"
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="w-10 h-10 -ml-1 rounded-full text-[#00567c] hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 transition-colors active:scale-95 flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[21px]">arrow_back</span>
          </button>
        ) : effectiveShowMenu ? (
          <button
            id="top-menu-btn"
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden w-10 h-10 -ml-1 rounded-full text-[#00567c] hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 transition-colors active:scale-95 flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[21px]">menu</span>
          </button>
        ) : null}

        <div className="flex items-center gap-1.5 min-w-0">
          {breadcrumbParent && (
            <>
              <span className="hidden sm:inline text-sm font-medium text-[#6e6e73] whitespace-nowrap">
                {breadcrumbParent}
              </span>
              <span className="hidden sm:inline text-[#aeaeb2] text-sm" aria-hidden="true">
                /
              </span>
            </>
          )}
          <button
            id="top-brand-title"
            type="button"
            onClick={() => navigateTo('home')}
            className="text-left font-display font-bold text-[#1d1d1f] text-[15px] sm:text-base lg:text-lg tracking-tight truncate whitespace-nowrap min-w-0 hover:text-[#00567c] focus:outline-none transition-colors"
          >
            <span className="lg:hidden">
              {currentScreen === 'home' ? 'MarketPulse' : computedTitle}
            </span>
            <span className="hidden lg:inline">{computedTitle}</span>
          </button>
        </div>
      </div>

      {/* Right Zone: Search Trigger + Region Switcher + PWA + Profile */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile/Tablet Search Icon Trigger */}
        <button
          id="top-search-btn"
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Find food or market"
          className="lg:hidden w-9 h-9 rounded-full text-[#6e6e73] hover:bg-black/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 flex items-center justify-center transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[19px]">search</span>
        </button>

        {/* Region Selector (clean icon spacing so pin never overlaps state text) */}
        {effectiveShowAvatar && (
          <div className="relative shrink-0">
            <select
              id="top-region-select"
              value={activeRegion.id}
              onChange={(e) => setActiveRegionId(e.target.value)}
              aria-label="Choose your state"
              className="appearance-none bg-white hover:bg-[#e8e8ed]/60 border border-black/[0.08] text-[#1d1d1f] text-xs font-semibold pl-7 pr-6 py-1.5 min-h-[36px] rounded-full cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/30 max-w-[108px] sm:max-w-[160px] truncate shadow-2xs"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatRegionShortName(r.id, r.state)}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-[#00567c] text-[15px] pointer-events-none">
              location_on
            </span>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#86868b] text-[15px] pointer-events-none">
              expand_more
            </span>
          </div>
        )}

        {effectiveShowAvatar && <PWAInstallButton variant="appbar" />}

        {showEdit && (
          <button
            id="top-edit-btn"
            type="button"
            aria-label="Edit"
            onClick={onEditClick}
            className="w-9 h-9 text-[#00567c] hover:bg-black/[0.05] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 transition-colors active:scale-95 flex items-center justify-center shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">edit</span>
          </button>
        )}

        {/* Profile Avatar (Google Photo or Clean Initials) */}
        {effectiveShowAvatar && (
          <button
            id="top-profile-btn"
            type="button"
            aria-label="Account and backup"
            onClick={() => navigateTo('account-security')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-black/[0.08] cursor-pointer active:scale-95 hover:ring-2 hover:ring-[#00567c]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00567c]/40 transition-all bg-[#00567c] text-white text-[11px] sm:text-xs font-bold flex items-center justify-center shrink-0"
          >
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
          </button>
        )}
      </div>
    </header>
  );
};
