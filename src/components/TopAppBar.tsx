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
    goBack,
    navigateTo,
    currentScreen,
    regions,
    activeRegion,
    setActiveRegionId,
  } = useMarketPulse();

  if (currentScreen === 'landing') {
    return null;
  }

  const isHome = currentScreen === 'home';
  const isPriceMap = currentScreen === 'price-map';
  const isHistory = currentScreen === 'history';
  const isBudget = currentScreen === 'budget';
  const isSubscreen =
    currentScreen === 'trip-detail' ||
    currentScreen === 'commodity-detail' ||
    currentScreen === 'weekly-report' ||
    currentScreen === 'set-budget' ||
    currentScreen === 'data-management' ||
    currentScreen === 'data-mgmt' ||
    currentScreen === 'account-security' ||
    currentScreen === 'secure-account' ||
    currentScreen === 'log-choice' ||
    currentScreen === 'log-confirm';
  const isClosingWorkflow =
    currentScreen === 'log-scan' ||
    currentScreen === 'log-pending' ||
    currentScreen === 'log-success';

  let computedTitle = title;
  if (title === 'MarketPulse') {
    switch (currentScreen) {
      case 'price-map':
        computedTitle = 'Price Map';
        break;
      case 'weekly-report':
        computedTitle = 'Weekly Wrap-up';
        break;
      case 'trip-detail':
        computedTitle = 'Trip Details';
        break;
      case 'commodity-detail':
        computedTitle = 'Price Trends';
        break;
      case 'budget':
        computedTitle = 'Budget & Insights';
        break;
      case 'set-budget':
        computedTitle = 'Set Target Budget';
        break;
      case 'history':
        computedTitle = 'Trip History';
        break;
      case 'log-choice':
        computedTitle = 'Log Items';
        break;
      case 'log-scan':
        computedTitle = 'Scan Receipt';
        break;
      case 'log-pending':
        computedTitle = 'Pending Review';
        break;
      case 'log-confirm':
        computedTitle = 'Review Trip';
        break;
      case 'log-success':
        computedTitle = 'Trip Summary';
        break;
      case 'data-management':
      case 'data-mgmt':
        computedTitle = 'Data Management';
        break;
      case 'account-security':
      case 'secure-account':
        computedTitle = 'Backup & Cloud Sync';
        break;
      default:
        computedTitle = 'MarketPulse';
        break;
    }
  }

  const effectiveShowClose = showClose !== undefined ? showClose : isClosingWorkflow;
  const effectiveShowBack = showBack !== undefined ? showBack : isSubscreen;
  const effectiveShowMenu = showMenu && !effectiveShowBack && !effectiveShowClose;
  const effectiveShowAvatar = showAvatar && (isHome || isPriceMap || isHistory || isBudget);

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      goBack();
    }
  };

  const handleClose = () => {
    if (onCloseClick) {
      onCloseClick();
    } else {
      navigateTo('home');
    }
  };

  const formatRegionShortName = (id: string, state: string) => {
    if (id === 'abuja' || state.toLowerCase().includes('federal capital')) {
      return 'Abuja (FCT)';
    }
    return state.replace(' State', '');
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#f8f9fd]/95 backdrop-blur-md border-b border-[#c0c7cf]/40 flex justify-between items-center gap-2 px-3 sm:px-4 h-16 transition-colors shadow-none">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
        {effectiveShowClose ? (
          <button
            id="top-close-btn"
            aria-label="Close"
            onClick={handleClose}
            className="p-2 -ml-1.5 rounded-full text-[#40484e] hover:bg-[#e7e8ec] transition-colors active:scale-95 duration-100 flex items-center justify-center min-w-[40px] min-h-[40px] shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        ) : effectiveShowBack ? (
          <button
            id="top-back-btn"
            aria-label="Go back"
            onClick={handleBack}
            className="p-2 -ml-1.5 rounded-full text-[#00567c] hover:bg-[#e7e8ec] transition-colors active:scale-95 duration-100 flex items-center justify-center min-w-[40px] min-h-[40px] shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
        ) : effectiveShowMenu ? (
          <button
            id="top-menu-btn"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-1.5 rounded-full text-[#00567c] hover:bg-[#e7e8ec] transition-colors active:scale-95 duration-100 flex items-center justify-center min-w-[40px] min-h-[40px] shrink-0"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        ) : null}

        <button
          id="top-brand-title"
          onClick={() => navigateTo('home')}
          className="text-left font-bold text-[#00567c] text-base sm:text-xl tracking-tight font-sans transition-opacity hover:opacity-90 truncate whitespace-nowrap min-w-0"
        >
          {computedTitle}
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {effectiveShowAvatar && (
          <button
            id="top-landing-tour-btn"
            onClick={() => navigateTo('landing')}
            className="hidden md:inline-flex items-center gap-1 bg-white hover:bg-[#eceef1] border border-[#c0c7cf]/60 text-[#00567c] text-xs font-bold px-3 py-1.5 rounded-full transition-colors shrink-0"
            title="View Product Tour & Landing Page"
          >
            <span className="material-symbols-outlined text-[15px]">public</span>
            <span>Product Tour</span>
          </button>
        )}

        {effectiveShowAvatar && (
          <div className="relative shrink-0">
            <select
              id="top-region-select"
              value={activeRegion.id}
              onChange={(e) => setActiveRegionId(e.target.value)}
              aria-label="Select state / market hub"
              className="appearance-none bg-[#eceef1] hover:bg-[#e1e2e6] text-[#00567c] text-xs font-bold pl-6 pr-5 py-1.5 rounded-full cursor-pointer transition-colors focus:ring-2 focus:ring-[#00567c] outline-none max-w-[116px] sm:max-w-[150px] truncate"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {formatRegionShortName(r.id, r.state)}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute left-1.5 top-1/2 -translate-y-1/2 text-[#00567c] text-[14px] pointer-events-none">
              location_on
            </span>
            <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#71787f] text-[14px] pointer-events-none">
              expand_more
            </span>
          </div>
        )}

        {effectiveShowAvatar && <PWAInstallButton variant="appbar" />}

        {showEdit && (
          <button
            id="top-edit-btn"
            aria-label="Edit"
            onClick={onEditClick}
            className="p-2 text-[#00567c] hover:bg-[#e7e8ec] rounded-full transition-colors active:scale-95 flex items-center justify-center min-w-[40px] min-h-[40px] shrink-0"
          >
            <span className="material-symbols-outlined text-[22px]">edit</span>
          </button>
        )}

        {effectiveShowAvatar && (
          <button
            id="top-profile-btn"
            aria-label="User Profile"
            onClick={() => navigateTo('account-security')}
            className="w-8 h-8 rounded-full overflow-hidden border border-[#c0c7cf] cursor-pointer active:scale-95 duration-100 hover:ring-2 hover:ring-[#2a6f97] transition-all bg-[#e1e2e6] flex items-center justify-center shrink-0"
          >
            <img
              alt="User Profile"
              className="object-cover w-full h-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYB8Xn5h2qr5HNT1PNFM58T2NY5vqrhvOKbnr0QsWA36wWUOHbV0ORxCA-H6Vu7m8A_iI1wWcd6IFHXLP5XVAy38nWjuikpGK9m_wtitPC4VlEgwXfQ-VTLOYZxGfBM8D7HK8MkLFqIl2pVN3JTWPA_NfUaQx00z6ywKjJQcXanRToY2S2H8rC14H8cHIDM7A83rqkO1MY4XJIyBz_J4FNT3aUfSrvLR5UqVUofjtoo_h-fIEaLc8MsQ"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </button>
        )}
      </div>
    </header>
  );
};
